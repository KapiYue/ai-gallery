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

  onLoad(options: any) {
    // Initialize cloud if not already initialized
    if (!wx.cloud) {
      console.error('Cloud is not initialized');
      return;
    }

    // Get prompt parameters from URL if they exist
    if (options.prompt) {
      this.setData({
        promptText: decodeURIComponent(options.prompt),
        negativePrompt: options.negative ? decodeURIComponent(options.negative) : ''
      });
    }
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

    // Call the cloud function to create an image generation task
    wx.cloud.callFunction({
      name: 'imageGeneration',
      data: {
        action: 'createTask',
        prompt: this.data.promptText,
        negativePrompt: this.data.negativePrompt
      }
    })
      .then((res: any) => {
        const result = res.result;
        
        if (result.success && result.data.output && result.data.output.task_id) {
          const taskId = result.data.output.task_id;
          console.log('Image generation task created:', taskId);
          
          // Navigate to the generated image page with task ID and prompt data
          wx.navigateTo({
            url: `/pages/generated/index?taskId=${taskId}&prompt=${encodeURIComponent(this.data.promptText)}&negative=${encodeURIComponent(this.data.negativePrompt)}`
          });
        } else {
          console.error('Failed to create image generation task:', result);
          wx.showToast({
            title: result.error || '创建任务失败',
            icon: 'error'
          });
          
          // Reset loading state
          this.setData({
            isGenerating: false
          });
        }
      })
      .catch((error: any) => {
        console.error('Error creating image generation task:', error);
        wx.showToast({
          title: '创建任务失败',
          icon: 'error'
        });
        
        // Reset loading state
        this.setData({
          isGenerating: false
        });
      });
  }
}); 