// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const userCollection = db.collection('users')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  if (!openId) {
    return {
      success: false,
      message: '无法获取用户OpenID',
      openId: null,
      isRegistered: false
    }
  }
  
  try {
    // 查询用户是否已注册
    const userResult = await userCollection.where({
      _openid: openId
    }).get()
    
    const isRegistered = userResult.data && userResult.data.length > 0
    
    return {
      success: true,
      openId: openId,
      isRegistered: isRegistered,
      userData: isRegistered ? userResult.data[0] : null
    }
  } catch (error) {
    console.error('Check user auth error:', error)
    return {
      success: false,
      message: '检查用户状态失败',
      openId: openId,
      isRegistered: false,
      error: error
    }
  }
} 