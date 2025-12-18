// Profile page controller
interface UserImage {
  id: number;
  imageUrl: string;
  promptText: string;
}

interface UserInfo {
  avatarUrl: string;
  nickName: string;
  userId: string;
  openId?: string;
}

// Environment ID for cloud development
const envId = 'cloud-tutoral-0g12hvqmfddb2712';

Page({
  data: {
    isLoading: true,
    isLoggedIn: false,
    userInfo: {
      avatarUrl: '',
      nickName: '',
      userId: ''
    } as UserInfo,
    userImages: [] as UserImage[]
  },

  onLoad() {
    // Initialize cloud environment
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      this.setData({ isLoading: false });
    } else {
      wx.cloud.init({
        env: envId,
        traceUser: true
      });
      
      // Check if user is logged in
      this.checkLoginStatus();
    }
  },

  onShow() {
    // Refresh user data when page is shown
    if (this.data.isLoggedIn) {
      this.getUserImages();
    }
  },

  checkLoginStatus() {
    // First check local storage for cached user info
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo,
        isLoading: false
      });
      this.getUserImages();
      return;
    }

    // If no cached user, check cloud login status
    wx.cloud.callFunction({
      name: 'checkUserAuth',
      data: {},
      success: (res: any) => {
        const { openId, isRegistered } = res.result;
        console.log('User auth check:', res.result);
        
        if (isRegistered) {
          // User is already registered, get their info
          this.getUserInfoFromCloud(openId);
        } else {
          // No user found, stop loading
          this.setData({ isLoading: false });
        }
      },
      fail: (err: any) => {
        console.error('Check login status failed', err);
        this.setData({ isLoading: false });
      }
    });
  },

  getUserInfoFromCloud(openId: string) {
    // Get user info from cloud database
    const db = wx.cloud.database();
    db.collection('users')
      .where({
        _openid: openId
      })
      .get()
      .then((res: any) => {
        if (res.data && res.data.length > 0) {
          const user = res.data[0];
          const userInfo: UserInfo = {
            avatarUrl: user.avatarUrl,
            nickName: user.nickName,
            userId: user._id,
            openId: user._openid
          };
          
          // Save to local storage for quicker access next time
          wx.setStorageSync('userInfo', userInfo);
          
          // Update UI
          this.setData({
            isLoggedIn: true,
            userInfo: userInfo,
            isLoading: false
          });
          
          // Load user's images
          this.getUserImages();
        } else {
          // No user found
          this.setData({ isLoading: false });
        }
      })
      .catch((err: any) => {
        console.error('Failed to get user info from cloud', err);
        this.setData({ isLoading: false });
      });
  },

  handleLogin() {
    // Show loading indicator
    this.setData({ isLoading: true });
    wx.showLoading({
      title: '登录中...',
    });

    // Get user profile information
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        const userProfile = profileRes.userInfo;
        
        // Call cloud function to get openId and register user
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: (loginRes: any) => {
            const openId = loginRes.result.openid;
            
            // Save user to database if they're new
            this.saveUserToDatabase(openId, userProfile);
          },
          fail: (err: any) => {
            console.error('Login failed', err);
            wx.hideLoading();
            this.setData({ isLoading: false });
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'error'
            });
          }
        });
      },
      fail: (err) => {
        console.error('Get user profile failed', err);
        wx.hideLoading();
        this.setData({ isLoading: false });
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'error'
        });
      }
    });
  },

  saveUserToDatabase(openId: string, userProfile: any) {
    const db = wx.cloud.database();
    
    // Check if user already exists
    db.collection('users')
      .where({
        _openid: openId
      })
      .get()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // User exists, update their profile and return ID
          const userId = res.data[0]._id;
          
          if (!userId) {
            throw new Error('User ID is undefined');
          }
          
          return db.collection('users')
            .doc(userId)
            .update({
              data: {
                avatarUrl: userProfile.avatarUrl,
                nickName: userProfile.nickName,
                updateTime: db.serverDate()
              }
            })
            .then(() => userId);
        } else {
          // New user, create record
          return db.collection('users')
            .add({
              data: {
                avatarUrl: userProfile.avatarUrl,
                nickName: userProfile.nickName,
                createTime: db.serverDate(),
                updateTime: db.serverDate()
              }
            })
            .then((addRes) => {
              if (!addRes._id) {
                throw new Error('Failed to get new user ID');
              }
              return addRes._id;
            });
        }
      })
      .then((userId) => {
        // Convert userId to string (it could be a number or string depending on the database)
        const userIdStr = userId.toString();
        
        // Create UserInfo object with the returned userId
        const userInfo: UserInfo = {
          avatarUrl: userProfile.avatarUrl,
          nickName: userProfile.nickName,
          userId: userIdStr,
          openId: openId
        };
        
        // Save to local storage
        wx.setStorageSync('userInfo', userInfo);
        
        // Update page state
        this.setData({
          isLoggedIn: true,
          userInfo: userInfo,
          isLoading: false
        });
        
        // Hide loading
        wx.hideLoading();
        
        // Get user's images
        this.getUserImages();
        
        // Show success message
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      })
      .catch((err) => {
        console.error('Save user to database failed', err);
        wx.hideLoading();
        this.setData({ isLoading: false });
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'error'
        });
      });
  },

  getUserImages() {
    // Show loading
    wx.showLoading({
      title: '加载中...'
    });
    
    // Call the getUserImages cloud function with pagination
    wx.cloud.callFunction({
      name: 'getUserImages',
      data: {
        page: 1,
        pageSize: 10
      },
      success: (res: any) => {
        if (res.result && res.result.success && res.result.data.length > 0) {
          // Transform cloud data to our app format
          const userImages: UserImage[] = res.result.data.map((item: any, index: number) => ({
            id: index + 1,
            imageUrl: item.fileID,
            promptText: item.promptText
          }));
          
          this.setData({
            userImages: userImages
          });
        } else {
          // No images found or error occurred
          this.setData({
            userImages: []
          });
          
          // Show error message if there was one
          if (res.result && !res.result.success) {
            wx.showToast({
              title: res.result.message || '获取图片失败',
              icon: 'error'
            });
          }
        }
        
        wx.hideLoading();
      },
      fail: (err) => {
        console.error('Get user images failed', err);
        wx.hideLoading();
        wx.showToast({
          title: '获取图片失败',
          icon: 'error'
        });
        
        this.setData({
          userImages: []
        });
      }
    });
  },

  navigateToCreate() {
    // Navigate to the create image page
    wx.navigateTo({
      url: '/pages/create/index'
    });
  },

  // 处理头像编辑
  handleEditAvatar() {
    // 显示加载中
    wx.showLoading({ title: '准备更新头像...' });

    // 获取用户ID
    const userId = this.data.userInfo.userId;
    if (!userId) {
      wx.hideLoading();
      wx.showToast({
        title: '用户ID不存在',
        icon: 'error'
      });
      return;
    }

    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.uploadAvatar(tempFilePath, userId);
      },
      fail: () => {
        wx.hideLoading();
      }
    });
  },

  // 上传头像到云存储
  uploadAvatar(filePath: string, userId: string) {
    // 确保cloud已初始化
    if (!wx.cloud) {
      wx.hideLoading();
      wx.showToast({
        title: '云开发未初始化',
        icon: 'error'
      });
      return;
    }

    // 更改提示信息
    wx.showLoading({ title: '上传头像中...' });

    // 上传到avatars文件夹，使用用户ID作为文件名
    const avatarName = `${userId}_${Date.now()}.jpg`;
    const cloudPath = `avatars/${avatarName}`;

    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: (res) => {
        // 上传成功，更新用户记录
        this.updateUserAvatar(res.fileID);
      },
      fail: (err) => {
        console.error('上传头像失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '上传头像失败',
          icon: 'error'
        });
      }
    });
  },

  // 更新用户头像URL
  updateUserAvatar(fileID: string) {
    // 更新提示
    wx.showLoading({ title: '更新资料中...' });

    const db = wx.cloud.database();
    const userId = this.data.userInfo.userId;

    db.collection('users')
      .doc(userId)
      .update({
        data: {
          avatarUrl: fileID,
          updateTime: db.serverDate()
        }
      })
      .then(() => {
        // 更新本地数据
        const userInfo = this.data.userInfo;
        userInfo.avatarUrl = fileID;
        
        // 更新本地存储
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新页面数据
        this.setData({
          userInfo: userInfo
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '头像已更新',
          icon: 'success'
        });
      })
      .catch((err) => {
        console.error('更新用户头像失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '更新资料失败',
          icon: 'error'
        });
      });
  },

  // 处理资料编辑
  handleEditProfile() {
    wx.showActionSheet({
      itemList: ['修改昵称'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.editNickname();
        }
      }
    });
  },

  // 编辑昵称
  editNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      content: this.data.userInfo.nickName,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          // 更新昵称
          this.updateUserNickname(res.content.trim());
        }
      }
    });
  },

  // 更新用户昵称
  updateUserNickname(newNickname: string) {
    wx.showLoading({ title: '更新昵称中...' });

    const db = wx.cloud.database();
    const userId = this.data.userInfo.userId;

    db.collection('users')
      .doc(userId)
      .update({
        data: {
          nickName: newNickname,
          updateTime: db.serverDate()
        }
      })
      .then(() => {
        // 更新本地数据
        const userInfo = this.data.userInfo;
        userInfo.nickName = newNickname;
        
        // 更新本地存储
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新页面数据
        this.setData({
          userInfo: userInfo
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '昵称已更新',
          icon: 'success'
        });
      })
      .catch((err) => {
        console.error('更新用户昵称失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '更新昵称失败',
          icon: 'error'
        });
      });
  },

  // Handle logout
  handleLogout() {
    // Show confirmation dialog
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#e34d59',
      success: (res) => {
        if (res.confirm) {
          // Clear user data
          wx.removeStorageSync('userInfo');
          
          // Reset page state
          this.setData({
            isLoggedIn: false,
            userInfo: {
              avatarUrl: '',
              nickName: '',
              userId: ''
            } as UserInfo,
            userImages: []
          });
          
          // Show success toast
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
}); 