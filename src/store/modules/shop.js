
/**
 * [门店模块]
 */

import Vue from 'vue'
import Router from '@/config/router'
import Api from '@/config/api'
import { MessageBox } from 'element-ui'
import { MathUtils } from '@/assets/js/mathUtils.js'
import wx from 'weixin-js-sdk'

const Shop = {
  namespaced: true,
  state: {
    latLng: { fsLat: '', fsLng: '' }, // 坐标
    param: {},
    shopList: [], //     附近门店列表
    bannerList: [], //   banner 列表
    rechargelist: [], // 储值方案列表
    buycardlist: [] //   购卡列表
  },
  /* 方法 */
  mutations: {
    /**
     * [是否强制注册]
     */
    is518(state) {
      const { param } = state
      if (param[518] && param[518].fsParamValue === '1') {
        MessageBox.confirm('', '请先注册！', {
          confirmButtonText: '去注册',
          center: true,
          showClose: false, //         是否显示：右上角 ×
          showCancelButton: false, //  是否显示：取消按钮
          closeOnClickModal: false, // 是否可以：通过点击遮罩关闭
          closeOnPressEscape: false // 是否可以：通过 ESC 关闭
        }).then(() => {
          Router.replace({ name: '注册' })
        }).catch(() => {})
      }
    }
  },
  /* 异步操作 */
  actions: {
    /**
     * [微信定位]
     */
    A_getjssdk({ state, rootState, dispatch }, params = {}) {
      const href = window.location.href
      let url = href
      const index1 = href.lastIndexOf('/')
      const index2 = href.indexOf('?') === -1 ? href.length : href.indexOf('?')
      if (href.substring(index1 + 1, index2) === 'index') {
        const leftStr = href.substring(0, index1 + 1)
        const rightStr = index2 > -1 ? href.substring(index2) : ''
        url = `${leftStr}shopChooseShop${rightStr}`
      }
      url = encodeURIComponent(location.href.split('#')[0])
      // alert('定位' + url)
      /* 发起请求 */
      const name = '获取jssdk配置'
      const obj = { url }
      const suc = function (res) {
        const config = Object.assign({}, res.config, { debug: false, jsApiList: ['getLocation'] })
        wx.config(config)
        wx.ready(function () {
          /* 定位 */
          const { latLng } = state
          wx.getLocation({
            type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function (res) {
              latLng.fsLat = res.latitude
              latLng.fsLng = res.longitude
              Vue.set(state, 'latLng', latLng)
              /* 请求 */
              params.fsLat = res.latitude
              params.fsLng = res.longitude
              dispatch('A_shoplist', params) /** 请求：门店列表 **/
            },
            error: function (e) {
              dispatch('A_shoplist', latLng) /** 请求：门店列表 **/
            },
            fail: function (e) {
              dispatch('A_shoplist', latLng) /** 请求：门店列表 **/
            },
            cancel: function (e) {
              dispatch('A_shoplist', latLng) /** 请求：门店列表 **/
            }
          })
        })
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：获取配置参数]
     */
    A_getparams({ state, rootState, commit }) {
      const fsShopGUID = rootState.fsShopGUID || localStorage.getItem('BWY_fsShopGUID')
      const name = '获取配置参数'
      const obj = { fsShopGUID }
      const suc = function (res) {
        // console.log(res.param[519])
        // 519：0不用选用餐人数。1必须选
        // 603：0，余额、充值、购卡 都不出现。1，余额、充值出现。2，余额不出现、购卡出现。
        // 703：会员权益 > 权益说明
        Vue.set(state, 'param', res.param)
        commit('is518') /** 是否强制注册 **/
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：门店列表]
     */
    A_shoplist({ state, rootState, dispatch }, params = { fsLat: '', fsLng: '', type: '' }) {
      const { fsShopGUID } = rootState
      let data = {}
      if (params.type) {
        data = params
      } else {
        const { fsLat, fsLng } = params
        data = { fsLat, fsLng }
      }
      /* 请求接口 */
      const name = '门店列表'
      const obj = data
      const suc = function (res) {
        /* 门店列表 */
        Vue.set(state, 'shopList', res)
        /* 设置本店信息 */
        if (fsShopGUID) {
          for (let i = 0; i < res.length; i++) {
            if (res[i].fsShopGUID === fsShopGUID) {
              Vue.set(rootState, 'shopObj', res[i])
            }
          }
        }
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：轮播广告]
     */
    A_bannerlist({ state, rootState, dispatch }) {
      const { fsShopGUID, UserInfo: { fsOpenId = '' } } = rootState
      /* 请求接口 */
      const name = '轮播广告'
      const obj = { fsShopGUID, fsOpenId }
      const suc = function (res) {
        Vue.set(state, 'bannerList', res)
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：储值方案]
     */
    A_rechargelist({ state, rootState, dispatch }) {
      const { UserInfo: { fsOpenId } } = rootState
      /* 请求接口 */
      const name = '储值方案'
      const obj = { fsOpenId }
      const suc = function (res) {
        Vue.set(state, 'rechargelist', res)
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：创建充值订单]
     */
    A_createrecharge({ state, rootState, dispatch }, data) {
      const { fsShopGUID } = rootState
      const { fiId, ...map } = data
      /* 请求接口 */
      const name = '创建充值订单'
      const obj = { fsShopGUID, fiId }
      const suc = function (res) {
        map.fsShopGUID = fsShopGUID
        map.pay_order = res.fsOrderNum
        map.pay_price = MathUtils.accMul(res.fdDealMoney, 100)
        // map.pay_price = 1
        dispatch('A_recharge', map) /** 充值支付 **/
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：充值支付]
     */
    A_recharge({ state, rootState, dispatch }, obj) {
      /* 请求接口 */
      const name = '充值支付'
      const suc = function (res) {
        // eslint-disable-next-line
        WeixinJSBridge.invoke('getBrandWCPayRequest', res, function (re) {
          if (re.err_msg === 'get_brand_wcpay_request:ok' ) {
            dispatch('UserInfo/A_homepage', null, { root: true }) /** 请求：我的会员页面 **/
            const money = MathUtils.accDiv(obj.pay_price, 100)
            Router.push({ name: '充值成功', query: { money } })
          }
        })
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：购卡列表接口]
     */
    A_buycardlist({ state, rootState, dispatch }) {
      const { UserInfo: { fsOpenId } } = rootState
      /* 请求接口 */
      const name = '购卡列表接口'
      const obj = { fsOpenId }
      const suc = function (res) {
        Vue.set(state, 'buycardlist', res)
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：创建购卡订单]
     */
    A_createbuycard({ state, rootState, dispatch }, data) {
      const { UserInfo: { fsOpenId }, fsShopGUID } = rootState
      const { fiId, ...map } = data
      /* 请求接口 */
      const name = '创建购卡订单'
      const obj = { fsOpenId, fsShopGUID, fiId }
      const suc = function (res) {
        map.fsShopGUID = fsShopGUID
        map.pay_order = res.fsOrderNum
        map.pay_price = MathUtils.accMul(res.fdDealMoney, 100) || 1
        dispatch('A_recharge', map) /** 充值支付 **/
      }
      Api({ name, obj, suc })
    }
  }
}

export default Shop
