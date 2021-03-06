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
    region: ['郑州市'],
    cityIndex: 1,
    cityList: ["全部", "郑州市", "洛阳市", "开封市", "平顶山市", "开封市", "安阳市",
      "鹤壁市", "新乡市", "焦作市", "濮阳市", "许昌市", "漯河市", "三门峡市", "南阳市", "商丘市", "信阳市", "周口市", "驻马店市"
    ],
    pageIndex: 0, //分页加载index
    pageSize: 4, //分页加载size
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
    this.data.currentPlayPos = clickPos;
    this.data.productionId = this.data.commitItems[this.data.currentPlayPos].production_id;
    this.requestIsVoted(this.data.productionId, true);
  },

  refreshPage: function(production_id) { //刷新界面
    wx.showLoading({
      title: '刷新播放界面',
      mask: false,
    })
    var that = this;
    var requestUrl = app.globalData.requestProductionUrl + "/" + production_id;
    console.log("refreshPage " + requestUrl);
    wx.request({
      url: requestUrl,
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
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

  requestIsVoted: function(productId, isRefresh) { //查询是否已投票
    wx.showLoading({
      title: '请求投票信息',
      mask: false,
    })
    var that = this;
    var requestUrl = app.globalData.requestIsVoted + "?production-id=" + productId + "&wechat-id=" + that.data.wechatId;
    console.log("requestIsVoted = " + requestUrl);
    wx.request({
      url: requestUrl,
      success: function(res) {
        wx.hideLoading();
        console.log("查询是否投票:");
        console.log(res.data);
        var result = JSON.stringify(res.data);
        console.log(result);
        if (JSON.stringify(res.data) == "true") {
          that.data.currentVoteState = false;
        } else if (res.data["error-code"] == 400){
          wx.showModal({
            title: '当前视频不存在哦',
            content: '当前视频不存在 ' + productId,
          })
        } else {
          that.data.currentVoteState = true;
        }
        console.log("currentVoteState = " + that.data.currentVoteState)
        that.setData({
          currentVoteState: that.data.currentVoteState,
        });
        if (isRefresh) that.refreshPage(that.data.productionId);
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
        that.requestIsVoted(that.data.commitItems[that.data.currentPlayPos].production_id, false);
        if (res.data["error-code"] == 200) {
          // that.data.currentVoteState = true;
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
            title: '已经投过票了',
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

  requestListDetail: function(isLoadMore) { //请求整个列表的方法
    wx.showLoading({
      title: isLoadMore ? "加载更多信息..." : '请求视频信息...',
      mask: false,
    })
    var that = this;
    if (!isLoadMore) { //不是加载更多清空数据
      that.data.commitItems = [];
    }
    var requestUrl = app.globalData.requestListUrl + "?status=" + that.data.status + "&start=" + that.data.pageIndex + "&count=" + that.data.pageSize + "&wechat-id=" + that.data.wechatId +
      "&sort=" + that.data.sort;
    if (that.data.cityIndex > 0) {
      var cityName = that.data.cityList[that.data.cityIndex];
      requestUrl += "&address=" + cityName.substring(0, cityName.length - 1);
      console.log("市区 = " + that.data.cityList[that.data.cityIndex].substring(0, cityName.length - 1));
    }
    if (that.data.activityId == "" || that.data.activityId == null) {

    } else {
      requestUrl += "&activity-id=" + that.data.activityId;
    }
    console.log("requestListDetail = " + requestUrl);
    wx.request({
      url: requestUrl,
      success: function(res) {
        wx.hideLoading();
        console.log(res.data);
        var commitArray = res.data;
        if (!isLoadMore) {
          that.data.commitItems = [];
        }
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
        if (isLoadMore) return false;
        if (that.data.productionId == null || that.data.productionId == undefined ||
          that.data.productionId == "") {
          if (that.data.commitItems.length != 0) {
            that.data.productionId = that.data.commitItems[0].production_id;
            console.log("productionId1 = " + that.data.productionId);
            that.requestIsVoted(that.data.productionId, true);
          } else {
            that.videoContext.pause();
          }
        } else {
          console.log("productionId2 = " + that.data.productionId);
          var pos = -1;
          for (var i = 0; i < that.data.commitItems.length; i++) {
            if (that.data.productionId == that.data.commitItems[i].production_id) {
              pos = i;
              break;
            }
          }
          that.data.currentPlayPos = pos;
          that.setData({
            currentPlayPos: that.data.currentPlayPos,
          });
          that.requestIsVoted(that.data.productionId, true);
        }
      },
      error: function() {
        wx.hideLoading();
        console.log("error");
      }
    })
  },

  commitScrollBottom: function(e) {
    var that = this;
    that.data.pageIndex += that.data.pageSize;
    that.requestListDetail(true);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    try {
      var id = options.productionId;
      if (id != null && id != undefined) {
        that.data.productionId = id;
        console.log("id" + id);
      }
    } catch (e) {

    }
    try {
      if (options.scene != null && options.scene != undefined && options.scene != "") {
        var scene = decodeURIComponent(options.scene)

        var arr = scene.split("&");
        console.log(arr);
        var temp_arr1 = arr[0].split("=");
        var temp_arr2 = arr[1].split("=");
        console.log("aid = " + temp_arr1[1] + " pid = " + temp_arr2[1]);
        that.data.activityId = temp_arr1[1];
        that.data.productionId = temp_arr2[1];
      }
    } catch (e) {

    }
    //TODO
    // that.data.productionId = "1234567";
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
    var openId = wx.getStorageSync("openid");
    if (openId == null || openId == undefined || openId == "") {
      console.log("openId == null request server to request openId");
      this.getOpenId();
    } else {
      console.log("openId != null and openId = " + openId);
      that.data.wechatId = openId;
      that.requestListDetail(false);
    }
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
    console.log("bindRegionChange() = " + e.detail.value);
    that.data.cityIndex = e.detail.value;
    that.data.currentPlayPos = 0;
    this.setData({
      cityIndex: that.data.cityIndex
    })
    this.requestListDetail(false);

  },

  getOpenId: function() {
    var that = this;
    wx.showLoading({
      title: '请求登录信息...',
      mask: false,
    })
    wx.login({
      success: res => {
        wx.hideLoading();
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
              wx.setStorageSync('openid', that.data.wechatId);
              that.requestListDetail(false);
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