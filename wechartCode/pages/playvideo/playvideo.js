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
    productionId: "", //当前课的id
    sort: "created", //排序类型

    currentVoteState: false, //当前页是否投票
    wechatId: "111111",
    region: ['河南省', '', ''],
    pageIndex: 0, //分页加载index
    pageSize: 8, //分页加载size
    status: 1, //状态
    activityId: "1",

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
      mask: false,
    })
    this.data.currentPlayPos = clickPos;
    this.data.productionId = this.data.commitItems[this.data.currentPlayPos].production_id;
    this.requestIsVoted(this.data.productionId);
  },

  refreshPage: function(production_id) { //刷新界面
    var that = this;
    var requestUrl = app.globalData.requestProductionUrl + "/" + production_id;
    wx.request({
      url: requestUrl,
      success: function(res) {
        that.data.pageDetail.name = res.data.name;
        that.data.pageDetail.groupName = res.data["group-name"];
        that.data.pageDetail.author = res.data["user-name"];
        that.data.pageDetail.schoolName = res.data["school-name"];
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
          currentPlayPos: that.data.currentPlayPos,
          currentVoteNum: that.data.currentVoteNum,
        });
        that.data.videoTitle = that.data.pageDetail.name;
        wx.setNavigationBarTitle({
          title: that.data.videoTitle,
        })
        setTimeout(function() {
          wx.hideLoading();
          that.videoContext.play()
        }, 800);

      },
      error: function() {
        wx.hideLoading();
        console.log("error");
      }
    })
  },

  requestIsVoted: function(productId) { //查询是否已投票
    var that = this;
    var requestUrl = app.globalData.requestIsVoted + "?production-id=" + productId;
    console.log("requestUrl = " + requestUrl);
    wx.request({
      url: requestUrl,
      success: function(res) {
        console.log("requestIsVoted");
        console.log(res.data);
        if (JSON.stringify(res.data) == "true") {
          that.data.currentVoteState = false;
        } else {
          that.data.currentVoteState = true;
        }
        console.log("currentVoteState = " + that.data.currentVoteState)
        that.setData({
          currentVoteState: that.data.currentVoteState,
        });
        that.data.productionId = that.data.commitItems[that.data.currentPlayPos].production_id;
        that.refreshPage(that.data.productionId);
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
        if (res.data["error-code"] == 200) {
          that.data.currentVoteState = true;
          that.data.currentVoteNum += 1;
          that.data.commitItems[that.data.currentPlayPos].has_vote = true;
          wx.showToast({
            title: '投票成功',
          })
          that.setData({
            currentVoteState: that.data.currentVoteState,
            currentVoteNum: that.data.currentVoteNum,
            commitItems: that.data.commitItems,
          });
        } else if (res.data["error-code"] == 400) {
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

  requestListDetail: function() { //请求整个列表的方法
    wx.showLoading({
      title: '加载中',
      mask: false,
    })
    var that = this;
    var requestUrl = app.globalData.requestListUrl + "?status=" + that.data.status + "&start=" + that.data.pageIndex + "&count=" + that.data.pageSize + "&wechat-id=" + that.data.wechatId +
      "&sort=" + that.data.sort;
    if (that.data.region[1] == "省直辖县级行政区划" || that.data.region[1] == null ||
      that.data.region[1] == "") {

    } else {
      requestUrl += "&address=" + that.data.region[1].split(0, that.data.region[1].length - 1);
    }
    if (that.data.activityId == "" || that.data.activityId == null) {

    } else {
      requestUrl += "&activity-id=" + that.data.activityId;
    }
    console.log("requestUrl = " + requestUrl);
    wx.request({
      url: requestUrl,
      success: function(res) {
        wx.hideLoading();
        console.log(res.data);
        var commitArray = res.data;
        that.data.commitItems = [];
        for (var i = 0; i < commitArray.length; i++) {
          var commitItem = {};
          commitItem.img = "http://ookzqad11.bkt.clouddn.com/avatar.png";
          commitItem.img = undefined;
          commitItem.vote = commitArray[i].status;
          commitItem.name = commitArray[i]["user-name"];
          commitItem.desc = commitArray[i].brief;
          commitItem.production_id = commitArray[i]["production-id"];
          commitItem.vote_number = commitArray[i]["vote-number"];
          commitItem.has_vote = commitArray[i]["vote-status"] == 0 ? false : true;
          that.data.commitItems.push(commitItem);
        }
        that.setData({
          commitItems: that.data.commitItems,
        });

        if (that.data.productionId == null || that.data.productionId == undefined ||
          that.data.productionId == "") {
          if (that.data.commitItems.length != 0) {
            that.data.productionId = that.data.commitItems[0].production_id;
            console.log("productionId1 = " + that.data.productionId);
            that.requestIsVoted(that.data.productionId);
          } else {
            that.videoContext.pause();
          }
        } else {
          console.log("productionId2 = " + that.data.productionId);
          for (var i = 0; i < that.data.commitItems.length; i++) {
            if (that.data.productionId == that.data.commitItems[i].production_id) {
              that.data.currentPlayPos = i;
              that.setData({
                currentPlayPos: that.data.currentPlayPos,
              });
            }
          }
          that.requestIsVoted(that.data.productionId);
        }
      },
      error: function() {
        wx.hideLoading();
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
    try {
      var id = options.productionId;
      if (id != null && id != undefined) {
        wx.showModal({
          title: '111',
          content: 'id= ' + id,
        })
        console.log("id" + id);
      }
    } catch (e) {

    }

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
    this.videoContext = wx.createVideoContext('myVideo')
    that.data.videoTitle = "加载中..."
    wx.setNavigationBarTitle({
      title: that.data.videoTitle,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {
    var that = this;
    console.log("onShow()");
    try {
      if (options.scene != null && options.scene != undefined) {
        wx.showLoading({
          title: "scene = " + options.scene,
        })
      }
    } catch (e) {

    }
    try {
      if (options.productionId != null && options.productionId != undefined) {
        console.log("producationId = " + options.productionId);
        that.data.productionId = options.productionId;
        console.log("producationId = " + that.data.productionId);
        wx.showLoading({
          title: "productionId = " + options.productionId,
        })
      }
    } catch (e) {
      console.log("producationId");
      console.log(e);
    }
    this.getOpenId();
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

  bindRegionChange: function(e) {
    var that = this;
    if (e.detail.value[1] == "省直辖县级行政区划") {
      that.data.region = ['河南省', '', ''];
    } else {
      that.data.region = e.detail.value;
    }
    this.requestListDetail();
    this.setData({
      region: that.data.region
    })
  },

  getOpenId: function() {
    var that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          var url = app.globalData.requestWechatOpenId + res.code;
          console.log("登陆... " + url);
          // return false;
          wx.request({
            url: url,
            success: function(res) {
              console.log("登陆成功");
              console.log(res.data.openid);
              that.data.wechatId = res.data.openid;
              that.requestListDetail();
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })

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
    var that = this;
    wx.showToast({
      title: '成功',
      icon: 'success',
      duration: 2000
    });
    var finalPath;
    if (that.data.commitItems.length == 0) {
      finalPath = "pages/playvideo/playvideo";
    } else if (that.data.commitItems[that.data.currentPlayPos] == null ||
      that.data.commitItems[that.data.currentPlayPos] == undefined) {
      finalPath = "pages/playvideo/playvideo";
    } else {
      finalPath = 'pages/playvideo/playvideo?productionId=' +
        that.data.commitItems[that.data.currentPlayPos].production_id;
    }
    console.log("share = " + finalPath);
    return {
      title: this.data.videoTitle,
      path: finalPath,
    }
  }
})