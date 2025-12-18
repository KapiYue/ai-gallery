// Home page controller
Page({
  data: {
    images: [] as Array<{
      id: string;
      imageUrl: string;
      promptText: string;
      userInfo: {
        nickName: string;
        avatarUrl: string;
      };
    }>,
    loading: true,
    hasReachedEnd: false,
    pageIndex: 1,
    pageSize: 10,
    lastVisitTime: 0 // Track last visit time
  },

  onLoad() {
    // Initialize cloud if needed
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      wx.showToast({
        title: '云开发未初始化',
        icon: 'error'
      });
    } else {
      wx.cloud.init({
        env: 'cloud1-5goptsb3c91be001',
        traceUser: true
      });
    }
    
    // Load initial data
    this.loadInitialData();
    
    // Record initial load time
    this.setData({
      lastVisitTime: Date.now()
    });
  },
  
  onShow() {
    // When returning to the page, check if we need to refresh data
    // Only refresh if returning after a certain time (to avoid double loading)
    const currentTime = Date.now();
    const timeDiff = currentTime - this.data.lastVisitTime;
    
    // If more than 3 seconds have passed since last visit, refresh the data
    // This helps avoid unnecessary refreshes when quickly switching tabs
    if (timeDiff > 3000) {
      console.log('Refreshing data on page show after publishing');
      this.refreshData();
    }
    
    // Update last visit time
    this.setData({
      lastVisitTime: currentTime
    });
  },

  onReachBottom() {
    // Load more data when scrolling to bottom
    this.loadMoreData();
  },

  onPullDownRefresh() {
    // Refresh data when user pulls down
    this.refreshData();
  },

  // Format the avatar URL to ensure it's properly displayed
  formatAvatarUrl(url: string): string {
    if (!url) return '';
    
    // Check if it's already a valid http(s) URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a cloud file ID, ensure it's properly formatted
    // Cloud file IDs typically start with 'cloud://'
    if (url.startsWith('cloud://')) {
      // For development/testing, we can directly return the fileID
      // The component should handle cloud file IDs correctly
      return url;
    }
    
    // Default placeholder if none of the above
    return '';
  },

  loadInitialData() {
    this.setData({
      loading: true
    });
    
    // Call cloud function to get recommended images
    wx.cloud.callFunction({
      name: 'getRecommendedImages',
      data: {
        page: 1,
        pageSize: this.data.pageSize
      },
      success: (res: any) => {
        if (res.result && res.result.success) {
          // Transform the data to match our UI format
          const images = res.result.data.map((item: any) => ({
            id: item._id,
            imageUrl: item.fileID,
            promptText: item.promptText,
            userInfo: {
              nickName: item.userInfo?.nickName || '匿名用户',
              avatarUrl: this.formatAvatarUrl(item.userInfo?.avatarUrl)
            }
          }));
          
          this.setData({
            images: images,
            loading: false,
            pageIndex: 2, // Next page will be 2
            hasReachedEnd: images.length < this.data.pageSize
          });
        } else {
          // Handle error or empty result
          this.setData({
            loading: false,
            hasReachedEnd: true
          });
          
          // Show error message if there was one
          if (res.result && !res.result.success) {
            wx.showToast({
              title: res.result.message || '获取数据失败',
              icon: 'error'
            });
          }
        }
      },
      fail: (err) => {
        console.error('Failed to get recommended images:', err);
        this.setData({
          loading: false
        });
        wx.showToast({
          title: '获取数据失败',
          icon: 'error'
        });
      },
      complete: () => {
        wx.stopPullDownRefresh();
      }
    });
  },

  loadMoreData() {
    if (this.data.loading || this.data.hasReachedEnd) return;
    
    this.setData({
      loading: true
    });
    
    // Call cloud function to get next page of images
    wx.cloud.callFunction({
      name: 'getRecommendedImages',
      data: {
        page: this.data.pageIndex,
        pageSize: this.data.pageSize,
        skip: (this.data.pageIndex - 1) * this.data.pageSize
      },
      success: (res: any) => {
        if (res.result && res.result.success && res.result.data.length > 0) {
          // Transform the data to match our UI format
          const newImages = res.result.data.map((item: any) => ({
            id: item._id,
            imageUrl: item.fileID,
            promptText: item.promptText,
            userInfo: {
              nickName: item.userInfo?.nickName || '匿名用户',
              avatarUrl: this.formatAvatarUrl(item.userInfo?.avatarUrl)
            }
          }));
          
          this.setData({
            images: [...this.data.images, ...newImages],
            loading: false,
            pageIndex: this.data.pageIndex + 1,
            hasReachedEnd: newImages.length < this.data.pageSize
          });
        } else {
          // No more data
          this.setData({
            loading: false,
            hasReachedEnd: true
          });
        }
      },
      fail: (err) => {
        console.error('Failed to load more images:', err);
        this.setData({
          loading: false
        });
        wx.showToast({
          title: '加载更多失败',
          icon: 'error'
        });
      }
    });
  },

  refreshData() {
    // Reset to initial state and reload data
    this.setData({
      images: [],
      loading: true,
      hasReachedEnd: false,
      pageIndex: 1
    });
    
    // Reload first page of data
    this.loadInitialData();
  },

  navigateToCreate() {
    // Navigate to the create image page
    wx.navigateTo({
      url: '/pages/create/index'
    });
  },
  
  // Preview image in full screen
  previewImage(e: any) {
    const index = e.currentTarget.dataset.index;
    const image = this.data.images[index];
    if (image) {
      wx.previewImage({
        current: image.imageUrl,
        urls: this.data.images.map(img => img.imageUrl)
      });
    }
  }
}); 