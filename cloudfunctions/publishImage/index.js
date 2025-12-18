// Cloud function to publish an image
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * Downloads an image from a URL
 * @param {string} imageUrl - The URL of the image to download
 * @returns {Promise<Buffer>} - A promise that resolves to the image buffer
 */
async function downloadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Image download failed');
  }
}

/**
 * Function to publish a user's generated image
 * @param {Object} event - The event object
 * @param {string} event.imageUrl - The URL of the generated image
 * @param {string} event.promptText - The prompt text used to generate the image
 * @param {string} event.negativePrompt - The negative prompt used (optional)
 * @param {Object} context - The cloud function context
 * @returns {Promise<Object>} - A promise that resolves to the result
 */
exports.main = async (event, context) => {
  // Get user's OpenID
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  if (!openid) {
    return {
      success: false,
      message: '用户未登录'
    };
  }
  
  const { imageUrl, promptText, negativePrompt } = event;
  
  if (!imageUrl) {
    return {
      success: false,
      message: '图片URL不能为空'
    };
  }
  
  if (!promptText) {
    return {
      success: false,
      message: '提示词不能为空'
    };
  }
  
  try {
    // 1. Download the image
    console.log('Downloading image from URL:', imageUrl);
    const imageBuffer = await downloadImage(imageUrl);
    
    // 2. Generate a unique filename for the image
    const fileExtension = 'png'; // Assuming images are PNG
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const cloudPath = `images/${openid}_${timestamp}_${randomStr}.${fileExtension}`;
    
    // 3. Upload the image to cloud storage
    console.log('Uploading image to cloud storage:', cloudPath);
    const uploadResult = await cloud.uploadFile({
      cloudPath,
      fileContent: imageBuffer
    });
    
    const fileID = uploadResult.fileID;
    
    // 4. Save the image record to database
    console.log('Saving image record to database');
    const addResult = await db.collection('images').add({
      data: {
        _openid: openid,
        fileID: fileID,
        promptText: promptText,
        negativePrompt: negativePrompt || '',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });
    
    // 5. Return success response
    return {
      success: true,
      message: '图片发布成功',
      data: {
        _id: addResult._id,
        fileID: fileID
      }
    };
    
  } catch (error) {
    console.error('Error publishing image:', error);
    
    return {
      success: false,
      message: '发布失败: ' + error.message,
      error: error
    };
  }
}; 