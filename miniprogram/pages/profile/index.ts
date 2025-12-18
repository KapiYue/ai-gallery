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
}

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      avatarUrl: '',
      nickName: '',
      userId: ''
    } as UserInfo,
    userImages: [] as UserImage[]
  },

  onLoad() {
    // Check if user is logged in
    this.checkLoginStatus();
  },

  onShow() {
    // Refresh user data when page is shown
    if (this.data.isLoggedIn) {
      this.getUserImages();
    }
  },

  checkLoginStatus() {
    // In a real app, this would check the login status from storage
    // For this prototype, we'll just use a mock check
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      });
      this.getUserImages();
    }
  },

  handleLogin() {
    // In a real app, this would initiate the WeChat login flow
    // For this prototype, we'll just simulate a successful login
    wx.showLoading({
      title: '登录中...',
    });

    setTimeout(() => {
      // Mock user data after successful login
      const mockUserInfo: UserInfo = {
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        nickName: '张三',
        userId: '1234567'
      };

      // Save to storage
      wx.setStorageSync('userInfo', mockUserInfo);

      // Update page state
      this.setData({
        isLoggedIn: true,
        userInfo: mockUserInfo
      });

      // Get user's images
      this.getUserImages();

      wx.hideLoading();
    }, 1000);
  },

  getUserImages() {
    // In a real app, this would fetch the user's images from an API
    // For this prototype, we'll use mock data
    setTimeout(() => {
      // Mock image data
      const mockUserImages: UserImage[] = [
        {
          id: 1,
          imageUrl: 'https://picsum.photos/id/243/600/600',
          promptText: '魔法森林，神秘光芒，梦幻色彩，童话风格'
        },
        {
          id: 2,
          imageUrl: 'https://picsum.photos/id/244/600/600',
          promptText: '海边日落，沙滩，椰子树，橙红色天空'
        },
        {
          id: 3,
          imageUrl: 'https://picsum.photos/id/247/600/600',
          promptText: '猫咪探险家，宇宙背景，太空服，动漫风格'
        }
      ];

      this.setData({
        userImages: mockUserImages
      });
    }, 500);
  },

  navigateToCreate() {
    // Navigate to the create image page
    wx.navigateTo({
      url: '/pages/create/index'
    });
  }
}); 