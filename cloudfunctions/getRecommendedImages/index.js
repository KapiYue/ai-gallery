// Cloud function to get recommended images for the home page
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const MAX_LIMIT = 10 // Maximum items per page
const _ = db.command

exports.main = async (event, context) => {
  // Get pagination parameters from event
  const page = event.page || 1
  const pageSize = event.pageSize || MAX_LIMIT
  const skip = event.skip || (page - 1) * pageSize
  
  try {
    // Get the latest images from the database with pagination
    const imagesResult = await db.collection('images')
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
    
    // Get user information for each image
    const imageData = imagesResult.data
    const userOpenIds = [...new Set(imageData.map(item => item._openid))]
    
    // If there are no images, return empty result
    if (userOpenIds.length === 0) {
      return {
        success: true,
        message: "获取成功",
        data: [],
        page: page,
        pageSize: pageSize,
        total: 0
      }
    }
    
    // Get user information for all unique openids in one query
    const usersResult = await db.collection('users')
      .where({
        _openid: _.in(userOpenIds)
      })
      .get()
    
    // Create a map of openid to user info for faster lookups
    const userMap = {}
    usersResult.data.forEach(user => {
      userMap[user._openid] = {
        nickName: user.nickName || '匿名用户',
        avatarUrl: user.avatarUrl || ''
      }
    })
    
    // Combine image data with user information
    const enrichedImageData = imageData.map(image => {
      // Get user info or provide defaults if user not found
      const userInfo = userMap[image._openid] || {
        nickName: '匿名用户',
        avatarUrl: ''
      }
      
      return {
        ...image,
        userInfo: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }
    })
    
    return {
      success: true,
      message: "获取成功",
      data: enrichedImageData,
      page: page,
      pageSize: pageSize,
      total: enrichedImageData.length
    }
  } catch (error) {
    console.error("获取推荐图片失败：", error)
    return {
      success: false,
      message: "获取推荐图片失败",
      data: [],
      error: error
    }
  }
} 