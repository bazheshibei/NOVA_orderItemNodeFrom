
/**
 * [预订单]
 */

import Vue from 'vue'
import Router from '@/config/router'
import Api from '@/config/api'
import { MathUtils } from '@/assets/js/mathUtils.js'

const Beforehand = {
  namespaced: true,
  state: {
    booklist: [] // 预订列表
  },
  /* 方法 */
  mutations: {},
  /* 异步操作 */
  actions: {
    /**
     * [请求：预订list接口]
     */
    A_booklist({ state, rootState, dispatch }, fsBookingDate) {
      const { fsShopGUID } = rootState
      /* 请求接口 */
      const name = '预订list接口'
      const obj = { fsShopGUID, fsBookingDate }
      const suc = function (res) {
        Vue.set(state, 'booklist', res)
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：创建预订订单接口]
     */
    A_createorder({ state, rootState, dispatch }, obj) {
      const name = '创建预订订单接口'
      const suc = function (res) {
        console.log('创建预订订单接口', res)
        const data = {
          fsShopGUID: obj.fsShopGUID,
          pay_order: res.fsOrderNum,
          pay_name: '微信支付',
          pay_class: '1',
          pay_price: MathUtils.accMul(res.fdReceMoney, 100) || 1
        }
        // data.pay_price = 1
        dispatch('A_bookpay', data) /** 请求：支付接口 **/
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：支付接口]
     */
    A_bookpay({ state, rootState, dispatch }, obj) {
      /* 请求接口 */
      const name = '预订支付'
      const suc = function (res) {
        // eslint-disable-next-line
        WeixinJSBridge.invoke('getBrandWCPayRequest', res, function (re) {
          if (re.err_msg === 'get_brand_wcpay_request:ok' ) {
            const query = { fsSellGUID: obj.pay_order, fiType: 4, name: '预订单详情' }
            Router.push({ name: '预订支付成功', query })
          }
        })
      }
      Api({ name, obj, suc })
    }
  }
}

export default Beforehand
