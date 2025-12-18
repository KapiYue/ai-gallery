// Home page controller
Page({
  data: {
    images: [
      {
        id: 1,
        imageUrl: 'https://picsum.photos/id/237/600/600',
        promptText: '梦幻城堡，幻彩色调，水彩风格，童话感'
      },
      {
        id: 2,
        imageUrl: 'https://picsum.photos/id/238/600/600',
        promptText: '太空漫步，宇航员，星空背景，写实风格'
      },
      {
        id: 3,
        imageUrl: 'https://picsum.photos/id/239/600/600',
        promptText: '湖边小屋，日落，树木剪影，橙色天空'
      },
      {
        id: 4,
        imageUrl: 'https://picsum.photos/id/240/600/600',
        promptText: '未来城市，赛博朋克，霓虹灯，电影感'
      },
      {
        id: 5,
        imageUrl: 'https://picsum.photos/id/241/600/600',
        promptText: '海洋生物，深海探索，蓝色调，梦幻风格'
      },
      {
        id: 6,
        imageUrl: 'https://picsum.photos/id/242/600/600',
        promptText: '古代东方，山水画，水墨风，意境悠远'
      }
    ],
    loading: false,
    hasReachedEnd: false,
    pageIndex: 1,
    pageSize: 6
  },

  onLoad() {
    // Initialize the page
    this.loadInitialData();
  },

  onReachBottom() {
    // Load more data when scrolling to bottom
    this.loadMoreData();
  },

  onPullDownRefresh() {
    // Refresh data when user pulls down
    this.refreshData();
  },

  loadInitialData() {
    // In a real app, this would be an API call to load the first page of images
    // For now, we're using the mock data already set in our data
    wx.stopPullDownRefresh();
  },

  loadMoreData() {
    if (this.data.loading || this.data.hasReachedEnd) return;
    
    this.setData({
      loading: true
    });
    
    // Simulate loading more data
    setTimeout(() => {
      // If we have 3 or more pages of data, show "no more data"
      if (this.data.pageIndex >= 3) {
        this.setData({
          loading: false,
          hasReachedEnd: true
        });
        return;
      }
      
      // Otherwise, add more mock data
      const newImages = [
        {
          id: 7 + (this.data.pageIndex - 1) * 6,
          imageUrl: 'https://picsum.photos/id/243/600/600',
          promptText: '魔法森林，神秘光芒，梦幻色彩，童话风格'
        },
        {
          id: 8 + (this.data.pageIndex - 1) * 6,
          imageUrl: 'https://picsum.photos/id/244/600/600',
          promptText: '沙漠绿洲，金色沙丘，棕榈树，水池倒影'
        },
        {
          id: 9 + (this.data.pageIndex - 1) * 6,
          imageUrl: 'https://picsum.photos/id/247/600/600',
          promptText: '猫咪探险家，宇宙背景，太空服，动漫风格'
        },
        {
          id: 10 + (this.data.pageIndex - 1) * 6,
          imageUrl: 'https://picsum.photos/id/248/600/600',
          promptText: '冬季雪景，松树林，小木屋，炊烟袅袅'
        },
        {
          id: 11 + (this.data.pageIndex - 1) * 6,
          imageUrl: 'https://picsum.photos/id/249/600/600',
          promptText: '城市夜景，雨天，霓虹灯倒影，写实风格'
        },
        {
          id: 12 + (this.data.pageIndex - 1) * 6,
          imageUrl: 'https://picsum.photos/id/250/600/600',
          promptText: '森林中的小路，阳光穿透树叶，光影效果'
        }
      ];
      
      this.setData({
        images: [...this.data.images, ...newImages],
        loading: false,
        pageIndex: this.data.pageIndex + 1
      });
    }, 1000);
  },

  refreshData() {
    // Reset to initial state and reload data
    this.setData({
      images: [],
      loading: true,
      hasReachedEnd: false,
      pageIndex: 1
    });
    
    // Simulate loading time
    setTimeout(() => {
      this.setData({
        images: this.data.images.length === 0 ? this.data.images : this.data.images.slice(0, 6),
        loading: false
      });
      wx.stopPullDownRefresh();
    }, 1000);
  },

  navigateToCreate() {
    // Navigate to the create image page
    wx.navigateTo({
      url: '/pages/create/index'
    });
  }
}); 