// Generated image page controller
Page({
  data: {
    isLoading: true,
    isPublishing: false,
    promptText: '',
    negativePrompt: '',
    taskId: '',
    taskStatus: 'PENDING', // PENDING, RUNNING, SUCCEEDED, FAILED
    generatedImage: '', // Will be filled with the generated image URL
    retryCount: 0,
    maxRetries: 30,
    hasError: false,
    errorMessage: ''
  },

  onLoad(options: any) {
    // Initialize cloud if not already initialized
    if (!wx.cloud) {
      console.error('Cloud is not initialized');
      this.setData({ 
        isLoading: false,
        hasError: true,
        errorMessage: '云服务未初始化'
      });
      return;
    }
    
    // Get parameters from URL
    if (options.taskId) {
      this.setData({
        taskId: options.taskId,
        promptText: options.prompt ? decodeURIComponent(options.prompt) : '',
        negativePrompt: options.negative ? decodeURIComponent(options.negative) : ''
      });
      
      // Start polling for the task result
      this.pollTaskResult();
    } else {
      // No task ID provided
      this.setData({
        isLoading: false,
        hasError: true,
        errorMessage: '任务ID缺失'
      });
    }
  },

  // Poll for task result with exponential backoff
  pollTaskResult() {
    if (this.data.retryCount >= this.data.maxRetries) {
      this.setData({
        isLoading: false,
        hasError: true,
        errorMessage: '生成超时，请重试'
      });
      return;
    }

    // Call the cloud function to get the task result
    wx.cloud.callFunction({
      name: 'imageGeneration',
      data: {
        action: 'getTaskResult',
        taskId: this.data.taskId
      }
    })
      .then((res: any) => {
        const result = res.result;
        
        if (result.success) {
          const taskData = result.data.output;
          const taskStatus = taskData.task_status;
          
          // Update task status
          this.setData({
            taskStatus: taskStatus
          });
          
          if (taskStatus === 'SUCCEEDED') {
            // Task completed successfully
            if (taskData.results && taskData.results.length > 0 && taskData.results[0].url) {
              // Set the generated image URL
              this.setData({
                generatedImage: taskData.results[0].url,
                isLoading: false
              });
            } else {
              // No image URL in the response
              this.setData({
                isLoading: false,
                hasError: true,
                errorMessage: '生成的图片链接无效'
              });
            }
          } else if (taskStatus === 'FAILED') {
            // Task failed
            this.setData({
              isLoading: false,
              hasError: true,
              errorMessage: '图片生成失败'
            });
          } else if (taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
            // Task is still in progress, continue polling
            const nextRetryCount = this.data.retryCount + 1;
            this.setData({
              retryCount: nextRetryCount
            });
            
            // Calculate delay with exponential backoff (1s, 2s, 4s, etc., max 10s)
            const delay = Math.min(1000 * Math.pow(1.5, nextRetryCount - 1), 10000);
            
            setTimeout(() => {
              this.pollTaskResult();
            }, delay);
          } else {
            // Unknown status
            this.setData({
              isLoading: false,
              hasError: true,
              errorMessage: `未知任务状态: ${taskStatus}`
            });
          }
        } else {
          // API call failed
          this.setData({
            isLoading: false,
            hasError: true,
            errorMessage: result.error || '获取任务结果失败'
          });
        }
      })
      .catch((error: any) => {
        console.error('Error getting task result:', error);
        
        // Retry on network error
        const nextRetryCount = this.data.retryCount + 1;
        this.setData({
          retryCount: nextRetryCount
        });
        
        if (nextRetryCount < this.data.maxRetries) {
          // Retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, nextRetryCount - 1), 10000);
          
          setTimeout(() => {
            this.pollTaskResult();
          }, delay);
        } else {
          // Max retries reached
          this.setData({
            isLoading: false,
            hasError: true,
            errorMessage: '获取任务结果失败，请重试'
          });
        }
      });
  },

  // Preview image in full screen
  previewImage() {
    if (this.data.generatedImage) {
      wx.previewImage({
        current: this.data.generatedImage,
        urls: [this.data.generatedImage]
      });
    }
  },

  // Handle retry button - regenerate the image
  handleRetry() {
    // Navigate back to the create page with the prompt parameters
    wx.redirectTo({
      url: `/pages/create/index?prompt=${encodeURIComponent(this.data.promptText)}&negative=${encodeURIComponent(this.data.negativePrompt)}`
    });
  },

  // Handle publish button - save image and return to home
  handlePublish() {
    this.setData({
      isPublishing: true
    });

    // Check if cloud is initialized
    if (!wx.cloud) {
      wx.showToast({
        title: '云开发未初始化',
        icon: 'error'
      });
      this.setData({ isPublishing: false });
      return;
    }

    // Check if user is logged in
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      });
      this.setData({ isPublishing: false });
      
      // Navigate to profile page for login
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/profile/index'
        });
      }, 1500);
      return;
    }

    // Call the cloud function to publish the image
    wx.cloud.callFunction({
      name: 'publishImage',
      data: {
        imageUrl: this.data.generatedImage,
        promptText: this.data.promptText,
        negativePrompt: this.data.negativePrompt
      }
    })
      .then((res: any) => {
        const result = res.result;
        
        if (result.success) {
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
        } else {
          // Show error message
          console.error('Publishing failed:', result.message);
          this.setData({ isPublishing: false });
          wx.showToast({
            title: result.message || '发布失败',
            icon: 'error'
          });
        }
      })
      .catch((err: any) => {
        console.error('Publishing failed:', err);
        this.setData({ isPublishing: false });
        wx.showToast({
          title: '发布失败',
          icon: 'error'
        });
      });
  }
}); 