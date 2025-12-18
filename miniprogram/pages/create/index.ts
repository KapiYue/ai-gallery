// Create image page controller
Page({
  data: {
    promptText: '',
    negativePrompt: '',
    isGenerating: false,
    promptTags: [
      { text: '写实' },
      { text: '动漫' },
      { text: '电影感' },
      { text: '梦幻' },
      { text: '水彩' },
      { text: '赛博朋克' }
    ]
  },

  onLoad() {
    // Page initialization
  },

  onPromptChange(e: any) {
    this.setData({
      promptText: e.detail.value
    });
  },

  onNegativePromptChange(e: any) {
    this.setData({
      negativePrompt: e.detail.value
    });
  },

  onTagTap(e: any) {
    const tag = e.currentTarget.dataset.tag;
    let currentPrompt = this.data.promptText;
    
    // Add tag to prompt text with a comma if there's already content
    if (currentPrompt && !currentPrompt.endsWith('，') && !currentPrompt.endsWith(',')) {
      currentPrompt += '，';
    }
    
    currentPrompt += tag;
    
    this.setData({
      promptText: currentPrompt
    });
  },

  generateImage() {
    if (!this.data.promptText.trim()) {
      // Show toast using the component selector
      wx.showToast({
        title: '请输入图片描述',
        icon: 'error'
      });
      return;
    }

    // Set loading state
    this.setData({
      isGenerating: true
    });

    // In a real app, we would call an API to generate the image
    // For this prototype, we'll just simulate a delay and then navigate to the result page
    
    setTimeout(() => {
      // Mock successful image generation
      
      // Navigate to the generated image page with prompt data
      wx.navigateTo({
        url: `/pages/generated/index?prompt=${encodeURIComponent(this.data.promptText)}&negative=${encodeURIComponent(this.data.negativePrompt)}`
      });
      
      // Reset loading state
      this.setData({
        isGenerating: false
      });
    }, 2000);
  }
}); 