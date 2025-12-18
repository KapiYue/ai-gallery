// Generated image page controller
Page({
  data: {
    isLoading: true,
    isPublishing: false,
    promptText: '',
    negativePrompt: '',
    generatedImage: 'https://picsum.photos/id/249/800/800' // Mock image for prototype
  },

  onLoad(options: any) {
    // Get prompt parameters from URL
    if (options.prompt) {
      this.setData({
        promptText: decodeURIComponent(options.prompt),
        negativePrompt: options.negative ? decodeURIComponent(options.negative) : ''
      });
    }
    
    // Simulate image generation loading
    setTimeout(() => {
      this.setData({
        isLoading: false
      });
    }, 1500);
  },

  // Preview image in full screen
  previewImage() {
    wx.previewImage({
      current: this.data.generatedImage,
      urls: [this.data.generatedImage]
    });
  },

  // Handle retry button - go back to create page
  handleRetry() {
    wx.navigateBack();
  },

  // Handle publish button - save image and return to home
  handlePublish() {
    this.setData({
      isPublishing: true
    });

    // Simulate publishing delay
    setTimeout(() => {
      // In a real app, we would upload the image to a server here
      
      // Show success message
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000
      });

      // Reset publishing state
      this.setData({
        isPublishing: false
      });

      // After successful publish, navigate back to home page
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/index'
        });
      }, 1000);
    }, 1500);
  }
}); 