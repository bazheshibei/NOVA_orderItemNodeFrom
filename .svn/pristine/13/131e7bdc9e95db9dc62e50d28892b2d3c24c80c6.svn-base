
/**
 * [歌曲模块]
 */

import Vue from 'vue'
import Api from '@/config/api'
import wx from 'weixin-js-sdk'
// import OrderDataType from '@/assets/js/dataType/order'

const music = {
  namespaced: true,
  state: {
    musicDetail: {}, //    歌曲详情
    /* 歌曲列表 */
    musicPageNum: 0, //    分页数：歌曲列表
    isMusic: true, //      是否还能请求列表
    isResetMusic: true, // 是否重置歌曲列表
    musicObj: {}, //       歌曲列表对象
    /* 排行 */
    rankPageNum: 0, //    分页数：歌曲排行
    isRank: true, //      是否还能请求排行
    isResetRank: true, // 是否重置歌曲排行
    rankObj: {} //       歌曲排行对象
  },
  /** 方法 **/
  mutations: {},
  /** 异步操作 **/
  actions: {
    /**
     * [请求：歌曲列表]
     */
    A_songlist({ state, rootState, dispatch }, data = {}) {
      const { pageSize: { musicList: pageSize } } = rootState
      const { isMusic, isResetMusic, musicPageNum } = state
      const { page = '1', that } = data // 页码
      if (isMusic) {
        /* 请求接口 */
        const name = '歌曲列表'
        const obj = { page, page_size: pageSize }
        const suc = function (res) {
          /* 请求回的列表数量，小于本次最大请求数：禁止之后的请求 */
          if (!res.list.length) {
            Vue.set(state, 'isMusic', false)
          }
          if (res.list.length) {
            let list = []
            if (!isResetMusic) {
              list = state.musicObj.list
            }
            res.list = list.concat(res.list)
            Vue.set(state, 'musicPageNum', musicPageNum + 1)
            Vue.set(state, 'musicObj', res)
            Vue.set(state, 'isResetMusic', false)
          }
          that.isShowLoading = false
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：歌曲排行]
     */
    A_songrank({ state, rootState, dispatch }, data = {}) {
      const { pageSize: { musicList: pageSize } } = rootState
      const { isRank, isResetRank, rankPageNum } = state
      const { page = '1', that } = data // 页码
      if (isRank) {
        /* 请求接口 */
        const name = '歌曲排行'
        const obj = { page, page_size: pageSize }
        const suc = function (res) {
          /* 请求回的列表数量，小于本次最大请求数：禁止之后的请求 */
          if (!res.list.length) {
            Vue.set(state, 'isRank', false)
          }
          if (res.list.length) {
            let list = []
            if (!isResetRank) {
              list = state.rankObj.list
            }
            res.list = list.concat(res.list)
            Vue.set(state, 'rankPageNum', rankPageNum + 1)
            Vue.set(state, 'rankObj', res)
            Vue.set(state, 'isResetRank', false)
          }
          that.isShowLoading = false
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：歌曲详情]
     */
    A_songdetail({ state, rootState, dispatch }, song_id) {
      const name = '歌曲详情'
      const obj = { song_id }
      const suc = function (res) {
        Vue.set(state, 'musicDetail', res)
        dispatch('A_getjssdk')/** 请求：获取jssdk配置 **/
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：获取jssdk配置]
     */
    A_getjssdk({ state, rootState, dispatch }) {
      /* 发起请求 */
      const name = '获取jssdk配置'
      const obj = { url: window.location.href.split('#')[0] }
      const suc = function (res) {
        const config = Object.assign({}, res.config, { debug: false, jsApiList: ['updateTimelineShareData'] })
        wx.config(config)
        wx.ready(function () {
          /* IOS 自动加载 */
          document.getElementById('audio').load()
          /* 自定义分享朋友圈 */
          const { musicDetail: { song_name, platform_uid: { platform_photo: imgUrl, platform_name } } } = state
          wx.updateTimelineShareData({
            title: `${platform_name}唱的${song_name}分享给你`, // 分享标题
            link: window.location.href, // 分享链接
            imgUrl, // 分享图标
            success: function () {},
            cancel: function () {}
          })
          // wx.error(function (res) {
          //   // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
          //   alert('errorMSG_____' + JSON.stringify(res))
          // })
        })
      }
      Api({ name, obj, suc })
    }
  }
}

export default music
