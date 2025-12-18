// Cloud function for image generation using Alibaba Cloud's image generation API
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// Base URL for Alibaba Cloud's image generation API
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

/**
 * Cloud function that handles text-to-image generation
 * @param {Object} event - The event parameter contains information about the triggering event
 * @param {string} event.action - The action to perform: 'createTask' or 'getTaskResult'
 * @param {string} [event.prompt] - The prompt text for image generation (required for createTask)
 * @param {string} [event.negativePrompt] - Optional negative prompt for createTask
 * @param {string} [event.taskId] - Task ID for getTaskResult
 * @param {Object} context - The context parameter contains information about the function
 * @returns {Promise<Object>} - Promise resolving to result data
 */
exports.main = async (event, context) => {
  const { action, prompt, negativePrompt, taskId } = event;
  const API_KEY = process.env.DASHSCOPE_API_KEY;

  if (!API_KEY) {
    return {
      success: false,
      error: 'API key not configured'
    };
  }

  // Common headers for all requests
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    switch (action) {
      case 'createTask':
        // Validate required parameters
        if (!prompt) {
          return {
            success: false,
            error: 'Prompt is required'
          };
        }

        // Prepare request data
        const requestData = {
          model: 'wanx2.1-t2i-plus',
          input: {
            prompt: prompt
          },
          parameters: {
            size: '1024*1024',
            n: 1
          }
        };

        // Add negative prompt if provided
        if (negativePrompt) {
          requestData.input.negative_prompt = negativePrompt;
        }

        // Make API request to create task
        const createResponse = await axios.post(
          `${BASE_URL}/services/aigc/text2image/image-synthesis`,
          requestData,
          {
            headers: {
              ...headers,
              'X-DashScope-Async': 'enable'
            }
          }
        );

        return {
          success: true,
          data: createResponse.data
        };

      case 'getTaskResult':
        // Validate required parameters
        if (!taskId) {
          return {
            success: false,
            error: 'Task ID is required'
          };
        }

        // Make API request to get task result
        const resultResponse = await axios.get(
          `${BASE_URL}/tasks/${taskId}`,
          { headers }
        );

        return {
          success: true,
          data: resultResponse.data
        };

      default:
        return {
          success: false,
          error: `Unknown action: ${action}`
        };
    }
  } catch (error) {
    console.error('Error calling Alibaba Cloud API:', error);
    
    // Return a structured error response
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status,
      details: error.response?.data
    };
  }
}; 