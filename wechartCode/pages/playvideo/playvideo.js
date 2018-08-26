// pages/playvideo/playvideo.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    currentTab: 0, // tab切换
    videoUrl: "", //当前的url
    videoTitle: "", //当前的标题
    hasVote: false,

    commitItems: [{ //假数据
      img: "http://ookzqad11.bkt.clouddn.com/avatar.png",
      name: "李老师",
      vote: 0,
      desc: "蚯蚓在外界刺激下的反应",
    }, {
      img: "http://ookzqad11.bkt.clouddn.com/avatar.png",
      name: "王老师",
      vote: 1,
      desc: "此地别燕丹,壮士发冲冠,按时间发噶K发G开放港口DFLAKDHFIUERws",
    }, {
      img: "http://ookzqad11.bkt.clouddn.com/avatar.png",
      name: "张教授",
      vote: 0,
      desc: "风一程,雨一程,身向榆关那畔行...",
    }, {
      img: "http://ookzqad11.bkt.clouddn.com/avatar.png",
      name: "羊角兽",
      vote: 1,
      desc: "故园无此声",
    }, {
      img: "http://ookzqad11.bkt.clouddn.com/avatar.png",
      name: "马教授",
      vote: 0,
      desc: "蚯蚓在外界刺激下的反应",
    }]
  },
  /**
   * 滑动切换tab
   */
  bindChange: function(e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });

  },
  /**
   * 点击tab切换
   */
  swichNav: function(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  calcularHeight: function(e) {

  },

  commitScrollBottom: function(e) {
    var that = this;
    var tempData = { //假数据
      img: "http://ookzqad11.bkt.clouddn.com/avatar.png",
      name: "新增马教授",
      vote: 0,
      desc: that.data.commitItems.length + "  蚯蚓在外界刺激下的反应",
    };
    that.setData({
      commitItems: that.data.commitItems.concat(tempData),
      // console.log("size = " + that.data.commitItems.length);
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winHeight: (res.windowHeight) / 2,
        });
      }

    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    console.log("onReady");
    this.videoContext = wx.createVideoContext('myVideo')
    that.data.videoUrl = "http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400";
    that.data.videoTitle = "小红花幼儿园开课了"
    that.setData({
      videoUrl: that.data.videoUrl,
    });
    console.log("setUrl");
    wx.setNavigationBarTitle({
      title: that.data.videoTitle,
    })
    setTimeout(function () { that.videoContext.play()}, 1500);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  videoErrorCallback: function(e) {
    console.log('视频错误信息:' + e.detail.errMsg)
    wx.showToast({
      title: '视频错误信息:' + e.detail.errMsg,
      icon: 'success',
      duration: 2000
    });
  },

  bindPlay: function() {
    console.log("bindplay");
    this.videoContext.play()
  },
  bindPause: function() {
    console.log("bindpause");
    this.videoContext.pause()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    wx.showToast({
      title: '成功',
      icon: 'success',
      duration: 2000
    });
    return {
      title: this.data.videoTitle,
      path: 'pages/playvideo/playvideo',
      imageUrl: "https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1535199239&di=d99340fc2d74173e4a2dbc4f70c2a500&src=http://tupian.qqjay.com/u/2013/1030/25_84154_3.jpg"
    }
  }
})