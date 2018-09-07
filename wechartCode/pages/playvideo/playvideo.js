// pages/playvideo/playvideo.js
var app = getApp()
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
    currentVoteNum: 0, //当前页投票数目
    currentVoteState: false, //当前页是否投票
    wechatId: "111",

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
    var that = this;
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
    that.setData({
      currentPlayPos: that.data.currentPlayPos,
    });
    var productionId = this.data.commitItems[this.data.currentPlayPos].production_id;
    this.refreshPage(productionId);
  },

  refreshPage: function(production_id) {
    var that = this;
    var requestUrl = app.globalData.requestProductionUrl + "/" + production_id;
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
            that.videoContext.stop();
            wx.showModal({
              title: '播放视频失败',
              content: '地址格式不正确' + obj.path + "/" + obj.name,
            });
            return false;
          }
        } catch (err) {
          console.log("hide loading");
          wx.hideLoading();
          that.videoContext.stop();
          wx.showModal({
            title: '播放视频失败',
            content: '地址格式不正确',
          });
          return false;
        }
        that.data.pageDetail.url = obj.path + "/" + obj.name;
        that.data.videoUrl = that.data.pageDetail.url;
        that.data.currentVoteNum = that.data.commitItems[that.data.currentPlayPos].vote_number;
        console.log("currentPlayPos" + that.data.currentPlayPos + "currentVoteNum = " + that.data.currentVoteNum +
          "has_vote =  " + that.data.commitItems[that.data.currentPlayPos].has_vote);
        that.setData({
          pageDetail: that.data.pageDetail,
          videoUrl: that.data.videoUrl,
          currentPlayPos: that.data.currentPlayPos,
          currentVoteNum: that.data.currentVoteNum,
          currentVoteState: that.data.commitItems[that.data.currentPlayPos].has_vote,
          commitItems: that.data.commitItems,
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

  sendToVote: function(e) { //请求投票
    var that = this;
    console.log("send to vote id = " + that.data.commitItems[that.data.currentPlayPos].production_id);
    wx.request({
      url: app.globalData.requestVoteUrl, //仅为示例，并非真实的接口地址
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        "wechat-id": that.data.wechatId,
        "production-id": that.data.commitItems[that.data.currentPlayPos].production_id,
      },
      success: function(res) {
        var result = JSON.stringify(res.data);
        console.log("投票" + result);
        if (res.data.errorCode == 200) {
          that.data.currentVoteState = true;
          that.data.currentVoteNum++;
          that.data.commitItems[that.data.currentPlayPos].has_vote = true;
          wx.showToast({
            title: '投票成功',
          })
          that.setData({
            currentVoteState: that.data.currentVoteState,
            currentVoteNum: that.data.currentVoteNum,
            commitItems: that.data.commitItems,
          });
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

  requestVotedItems: function(wechatId) {
    var that = this;
    var requestUrl = app.globalData.requestVoteDetail + wechatId;
    console.log("requestVotedItems");
    wx.request({
      url: requestUrl,
      success: function(res) {
        console.log("voted list = " );
        console.log(res.data);
        for (var j = 0; j < that.data.commitItems.length; j++) {
          that.data.commitItems[j].has_vote = false;
        }
        for (var i = 0; i < res.data.length; i++) {
          var productionId = res.data[i]["production-id"];
          for (var j = 0; j < that.data.commitItems.length; j++) {
            if (that.data.commitItems[j].production_id == productionId) {
              that.data.commitItems[j].has_vote = true;
              console.log("set has vote = " + that.data.commitItems[j].has_vote);
              break;
            }
          }

        }
        that.setData({
          commitItems: that.data.commitItems,
          currentVoteState: that.data.commitItems[that.data.currentPlayPos],
        });
        console.log("commitItem hasVoted =  " + that.data.commitItems[that.data.currentPlayPos].has_vote);
        that.refreshPage(that.data.commitItems[that.data.currentPlayPos].production_id);
      }
    })
  },

  requestListDetail: function() { //请求整个列表的方法
    var that = this;
    var requestUrl = app.globalData.requestListUrl;
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
          commitItem.has_vote = false;
          that.data.commitItems.push(commitItem);
        }
        that.setData({
          commitItems: that.data.commitItems,
        });
        console.log("data = " + that.data.commitItems[0].production_id);
        that.requestVotedItems(that.data.wechatId);
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
    that.data.videoTitle = "加载中..."
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