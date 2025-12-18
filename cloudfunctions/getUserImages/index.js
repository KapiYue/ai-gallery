// Cloud function to get a user's images
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const MAX_LIMIT = 10 // Maximum items per page

exports.main = async (event, context) => {
  // Get pagination parameters from event
  const page = event.page || 1
  const pageSize = event.pageSize || MAX_LIMIT
  const skip = event.skip || (page - 1) * pageSize
  
  // Get the user's OpenID from context
  const openid = cloud.getWXContext().OPENID
  
  // If no OpenID is provided, return error
  if (!openid) {
    return {
      success: false,
      message: "未登录",
      data: []
    }
  }

  try {
    // Query for images created by this user
    // Sort by creation time in descending order (newest first)
    const imagesResult = await db.collection('images')
      .where({
        _openid: openid
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
    
    return {
      success: true,
      message: "获取成功",
      data: imagesResult.data,
      page: page,
      pageSize: pageSize,
      total: imagesResult.data.length // In a real app, we would get the total count
    }
  } catch (error) {
    console.error("获取用户图片失败：", error)
    return {
      success: false,
      message: "获取用户图片失败",
      data: [],
      error: error
    }
  }
} 