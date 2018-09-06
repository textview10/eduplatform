//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          console.log("登陆成功" + res.code);
          // wx.request({
          //   url: 'http://127.0.0.1:8081/swagger-ui-master/dist/#/evaluation/delete_productions_votes__vote_id_',
          //   data: {
          //     code: res.code
          //   }
          // })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    // https://zxjy.hneducloud.cn/LeoEduCloud/productions/09bc10c6-5d32-438b-9efe-d30eb028402f

    requestListUrl: "https://zxjy.hneducloud.cn/LeoEduCloud/productions",  //请求整个列表的url
    requestProductionUrl: "https://zxjy.hneducloud.cn/LeoEduCloud/productions", //请求某个视频详情的url
    requestVoteUrl: "https://zxjy.hneducloud.cn/LeoEduCloud/productions/votes",  //请求投票
    requestVoteDetail: "https://zxjy.hneducloud.cn/LeoEduCloud/productions?wechat-id=",//请求某个id的投票情况
  }

})