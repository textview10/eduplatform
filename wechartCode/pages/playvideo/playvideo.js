// pages/playvideo/playvideo.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    currentMode: 0,
    currentTab: 0, // tab切换
    currentPlayPos: 0, //当前选中条目的位置
    currentVoteNum: 0,

    videoUrl: "", //当前的url
    videoTitle: "", //当前的标题
    hasVote: false,
    pageDetail: { //页面详情对象,
      name: "",
      url: "",
      groupName: "",
      author: "",
      schoolName: "",
      detail: "",
    },
    commitItems: [],
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

  clickForItem: function(e) {
    this.videoContext.stop();
    var clickPos = parseInt(e.currentTarget.dataset.index);
    console.log("pos = " + this.data.currentPlayPos);
    if (clickPos == this.data.currentPlayPos) {
      this.data.currentPlayPos = clickPos;
      wx.showToast({
        title: '已经选中当前条目了哦',
        icon: "none",
      })
      return false;
    }
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    this.data.currentPlayPos = clickPos;
    var productionId = this.data.commitItems[this.data.currentPlayPos].production_id;
    this.refreshPage(productionId);
  },

  refreshPage: function(production_id) {
    var that = this;
    var requestUrl = "http://123.207.155.126:8885/LeoEduCloud/productions" + "/" + production_id;
    wx.request({
      url: requestUrl, //仅为示例，并非真实的接口地址
      success: function(res) {
        that.data.pageDetail.name = res.data.name;
        that.data.pageDetail.groupName = res.data["group-name"];
        that.data.pageDetail.author = res.data["user-name"];
        that.data.pageDetail.detail = res.data.brief;
        var obj = res.data.resources[0].files[0];
        try {
          if (obj.path == undefined || obj.name == undefined) {
            wx.hideLoading();
            wx.showModal({
              title: '播放视频失败',
              content: '地址格式不正确' + obj.path + "/" + obj.name,
            });
            return false;
          }
        } catch (err) {
          console.log("hide loading");
          wx.hideLoading();
          wx.showModal({
            title: '播放视频失败',
            content: '地址格式不正确',
          });
          return false;
        }
        that.data.pageDetail.url = obj.path + "/" + obj.name;
        that.data.videoUrl = that.data.pageDetail.url;
        that.data.currentVoteNum = that.data.commitItems[that.data.currentPlayPos].vote_number;
        console.log("currentPlayPos" + that.data.currentPlayPos + "currentVoteNum = " + that.data.currentVoteNum);
        that.setData({
          pageDetail: that.data.pageDetail,
          videoUrl: that.data.videoUrl,
          currentVoteNum: that.data.currentVoteNum,
        });
        that.data.videoTitle = that.data.pageDetail.name;
        wx.setNavigationBarTitle({
          title: that.data.videoTitle,
        })
        setTimeout(function() {
          wx.hideLoading();
          that.videoContext.play()
        }, 1000);

      },
      error: function() {
        wx.hideLoading();
        console.log("error");
      }
    })
  },

  sendToVote: function(e) {
    var that = this;
    console.log("send to vote id = " + that.data.commitItems[that.data.currentPlayPos].production_id);
    wx.request({
      url: "http://123.207.155.126:8885/LeoEduCloud/productions/votes", //仅为示例，并非真实的接口地址
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        "wechat-id": '111',
        "production-id": that.data.commitItems[that.data.currentPlayPos].production_id,
      },
      success: function(res) {
        var result = JSON.stringify(res.data);
        console.log("投票" + result);
        if (res.data.errorCode == 200) {
          wx.showToast({
            title: '投票成功',
          })
        } else if (res.data.errorCode == 400) {
          wx.showToast({
            title: '已经投过票了,不能重复投票哦',
          })
        } else {
          wx.showToast({
            title: '投票失败',
          })
        }

      },
      error: function(res) {
        console.log("投票失败" + res.data);
        wx.showToast({
          title: '投票失败',
        })
      }
    });
  },

  requestListDetail: function() { //请求列表的方法
    var that = this;
    var requestUrl = "http://123.207.155.126:8885/LeoEduCloud/productions";
    wx.request({
      url: requestUrl,
      success: function(res) {
        var commitArray = res.data;
        for (var i = 0; i < commitArray.length; i++) {
          var commitItem = {};
          commitItem.img = "http://ookzqad11.bkt.clouddn.com/avatar.png";
          commitItem.vote = commitArray[i].status;
          commitItem.name = commitArray[i]["user-name"];
          commitItem.desc = commitArray[i].brief;
          commitItem.production_id = commitArray[i]["production-id"];
          commitItem.vote_number = commitArray[i]["vote-number"];
          console.log("vote_number = " + commitItem.vote_number);
          that.data.commitItems.push(commitItem);
        }
        that.setData({
          commitItems: that.data.commitItems,
        });
        console.log("data = " + that.data.commitItems[0].production_id);
        that.refreshPage(that.data.commitItems[0].production_id);
      },
      error: function() {
        console.log("error");
      }
    })
  },

  commitScrollBottom: function(e) {
    if (true) return;
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
    // that.data.videoUrl = "http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400";
    that.data.videoTitle = "加载中..."
    // console.log("setUrl");
    wx.setNavigationBarTitle({
      title: that.data.videoTitle,
    })
    that.requestListDetail();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  videoErrorCallback: function(e) {
    var that = this;
    console.log("video error call back");
    wx.hideLoading();
    console.log('视频错误信息:' + e.detail.errMsg);
    wx.showModal({
      title: '视频播放错误',
      content: "位置 " + that.data.currentPlayPos + ' 信息:' + e.detail.errMsg,
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