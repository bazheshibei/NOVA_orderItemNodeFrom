
/**
 * [订单模块]
 */

import Vue from 'vue'
import Router from '@/config/router'
import Store from '@/store'
import Api from '@/config/api'
import { MathUtils } from '@/assets/js/mathUtils.js'
import OrderDataType from '@/assets/js/dataType/order'
import { MessageBox } from 'element-ui'

const order = {
  namespaced: true,
  state: {
    activity: {}, //        优惠活动
    getNum: 0, //           请求取餐号计数器
    moneyAndMenu: false, // 代金券跟菜品券是否可以同时选择
    moneyCoupon: [], //     代金券列表
    menuCoupon: [], //      菜品券列表
    orderData: {
      fdBoxAmt: '', //       餐盒数量
      fdCashPrice: '', //    代金券金额
      fdDiscountAmt: '0', // 优惠
      fdExpAmt: '0', //      实付
      fdRealAmt: '', //      抛去优惠券后的实付
      /* 下单接口 */
      fsPayGUID: '', //
      fsSellGUID: '', //     订单 GUID
      fsSellNo: '', //       订单号
      /* 订单结算接口 */
      fdSaleAmt: '0', //     总价
      itemlist: [] //        菜品数组
    },
    menuList: [], //         确认订单页面：菜品列表
    isOrder: true, //        是否还能请求订单列表
    isResetOrder: true, //   是否重置订单列表
    orderObj: {}, //         消费订单对象
    orderDetail: {} //       订单详情
  },
  /* 方法 */
  mutations: {
    /**
     * [设置：确认订单页面，菜品列表]
     */
    setMenuList(state, data) {
      Vue.set(state, 'menuList', data)
    },
    /**
     * [选择菜品券]
     */
    chooseMenuCoupon(state, data) {
      const { menuList } = state
      const { index, dishIndex } = data
      const menuMunber = menuList[dishIndex]._showText.number
      if (state.menuCoupon[index]._menuIndex === dishIndex) {
        /* 重置 */
        state.menuCoupon[index]._menuIndex = -1
        Vue.set(state, 'menuCoupon', state.menuCoupon)
        Store.dispatch('Order/A_settlement', menuList) /** 请求：订单结算接口 **/
      } else if (state.menuCoupon[index]._menuIndex === -1) {
        /* 菜品券单选 */
        let num = 0
        for (let i = 0; i < state.menuCoupon.length; i++) {
          if (state.menuCoupon[i]._menuIndex === dishIndex) {
            num++
          }
        }
        if (num < menuMunber) {
          /* 选中 */
          state.menuCoupon[index]._menuIndex = dishIndex
          Vue.set(state, 'menuCoupon', state.menuCoupon)
          Store.dispatch('Order/A_settlement', menuList) /** 请求：订单结算接口 **/
        }
      }
    },
    /**
     * [选择代金券]
     */
    chooseMoneyCoupon(state, data) {
      const { index } = data
      for (let i = 0; i < state.moneyCoupon.length; i++) {
        if (i === index) {
          if (state.moneyCoupon[i]._menuIndex === -1) {
            state.moneyCoupon[i]._menuIndex = 1 // 选中
          } else {
            state.moneyCoupon[i]._menuIndex = -1 // 取消
          }
        } else {
          state.moneyCoupon[i]._menuIndex = -1 // 重置其他项
        }
      }
    },
    /**
     * [重置优惠券]
     */
    resetCoupon(state) {
      const { menuCoupon, moneyCoupon } = state
      for (let i = 0; i < menuCoupon.length; i++) {
        menuCoupon[i]._menuIndex = -1
      }
      for (let i = 0; i < moneyCoupon.length; i++) {
        moneyCoupon[i]._menuIndex = -1
      }
      Vue.set(state, 'menuCoupon', menuCoupon)
      Vue.set(state, 'moneyCoupon', moneyCoupon)
    },
    /**
     * [设置 orderData]
     */
    setOrderData(state) {
      const obj = JSON.parse(localStorage.getItem('BWY_orderData')) || {}
      const { moneyCoupon = [], menuCoupon = [] } = JSON.parse(localStorage.getItem('BWY_orderCoupon')) || {}
      Vue.set(state, 'orderData', obj)
      Vue.set(state, 'moneyCoupon', moneyCoupon)
      Vue.set(state, 'menuCoupon', menuCoupon)
    },
    /**
     * [重置分页数]
     */
    resetPageNum(state) {
      Vue.set(state.orderObj, 'pageNum', 0)
      Vue.set(state, 'isOrder', true)
      Vue.set(state, 'isResetOrder', true)
    }
  },
  /* 计算属性 */
  getters: {
    /**
     * [优惠券使用类型]
     */
    couponType: state => {
      if (state.moneyAndMenu) { // 菜品券、代金券随便选
        return { money: true, menu: true }
      } else { // 菜品券跟代金券互斥
        const obj = { money: true, menu: true }
        /* 是否能选：代金券 */
        const menu = state.menuCoupon
        for (let i = 0; i < menu.length; i++) {
          if (menu[i]._menuIndex !== -1) {
            obj.money = false
          }
        }
        /* 是否能选：菜品券 */
        const money = state.moneyCoupon
        for (let i = 0; i < money.length; i++) {
          if (money[i]._menuIndex === 1) {
            obj.menu = false
          }
        }
        return obj
      }
    }
  },
  /* 异步操作 */
  actions: {
    /**
     * [请求：订单结算接口]
     */
    A_settlement({ state, rootState, dispatch }, list) {
      if (list.length) {
        const { fsHostId, fsShopGUID, UserInfo: { fsOpenId } } = rootState // { 站点，店铺 GUID，openID }
        const { moneyCoupon, menuCoupon } = state //                          { 代金券数组， 菜品券数组 }
        const cashCoupon = OrderDataType.orderMoneyCoupon(moneyCoupon) //     代金券对象
        const itemCoupon = OrderDataType.orderMenuCoupon(list, menuCoupon) // 菜品券数组
        const itemList = OrderDataType.orderItemList(list) //                 菜品数组
        /* 请求接口 */
        const name = '订单结算接口'
        const obj = { fsHostId, fsShopGUID, fsOpenId, itemCoupon, cashCoupon, itemList } // { 站点，门店 GUID，openID，菜品券数组，代金券数组，菜品数组 }
        const suc = function (res) {
          Vue.set(state, 'activity', res.activity)
          Vue.set(state, 'orderData', res)
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：可使用优惠券列表]
     */
    A_getusecoupon({ state, rootState, dispatch }, list) {
      if (list.length) {
        const { fsShopGUID, UserInfo: { fsOpenId } } = rootState // 店铺 GUID， openID
        const itemList = OrderDataType.orderItemList(list) // 菜品数组
        /* 请求接口 */
        const name = '可使用优惠券列表'
        const obj = { fsShopGUID, fsOpenId, itemList }
        const suc = function (res) {
          const money = []
          const menu = []
          for (let i = 0; i < res.length; i++) {
            const item = res[i]
            item._menuIndex = -1 // 初始化菜品索引
            if (item.fiCouponKind === '701') {
              menu.push(item)
            } else if (item.fiCouponKind === '702') {
              money.push(item)
            }
          }
          Vue.set(state, 'moneyCoupon', money) // 代金券
          Vue.set(state, 'menuCoupon', menu) //   菜品券
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：下单接口]
     */
    A_createorder({ state, rootState, dispatch }, data) {
      const { fsHostId, fsShopGUID, UserInfo: { fsOpenId }, Table: { fsMTableId } } = rootState
      const { fdExpAmt, fdSaleAmt, fdDiscountAmt, fdCashPrice } = state.orderData
      const { that, createorder } = data
      const { fiCustSum, fsNote, fiBillKind, list } = createorder
      const { moneyCoupon, menuCoupon } = state // { 代金券数组， 菜品券数组 }
      const cashCoupon = OrderDataType.orderMoneyCoupon(moneyCoupon) //     代金券对象
      const itemCoupon = OrderDataType.orderMenuCoupon(list, menuCoupon) // 菜品券数组
      const itemList = OrderDataType.orderItemList(list) //                 菜品数组
      /* 请求接口 */
      if (list.length) {
        const name = '下单接口'
        const obj = { fsShopGUID, fsOpenId, fsHostId, fiCustSum, fsMTableId, fdExpAmt, fdSaleAmt, fdDiscountAmt, fdCashPrice, fsNote, fiBillKind, itemCoupon, cashCoupon, itemList }
        // { 店铺 GUID，openID，站点，用餐人数，餐桌 ID，总价，实付，优惠，代金券金额，备注，就餐方式('1'堂食，'8'外带)，菜品券数组，代金券，菜品数组 }
        const suc = function (res) {
          const re = Object.assign({}, state.orderData, obj, res)
          Vue.set(state, 'orderData', re)
          /* 支付 */
          that._pay()
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：支付接口]
     */
    A_pay({ state, rootState, dispatch }, data) {
      const { UserInfo: { fsOpenId: openid }, fsShopGUID } = rootState
      const { orderData } = state
      const { pay_name, pay_class } = data
      const { fsPayGUID: pay_order, fsSellNo, fsSellGUID, fdRealAmt, pay_channel = '' } = orderData
      const pay_price = MathUtils.accMul(fdRealAmt, 100)
      // pay_price = 1
      const payData = { pay_order, fsSellNo, fsSellGUID, pay_price, pay_channel, pay_name, pay_class }
      if (pay_price) {
        /* 请求接口 */
        const name = '支付接口'
        const obj = Object.assign({}, payData, { openid, fsShopGUID })
        const suc = function (res) {
          // eslint-disable-next-line
          WeixinJSBridge.invoke('getBrandWCPayRequest', res, function (re) {
            if (re.err_msg === 'get_brand_wcpay_request:ok' ) {
              localStorage.removeItem('BWY_shoppingCart')
              localStorage.removeItem('BWY_orderData')
              localStorage.removeItem('BWY_createorder')
              Router.push({ name: '订单完成', query: { fsSellGUID: obj.fsSellGUID } })
            }
          })
        }
        Api({ name, obj, suc })
      } else {
        MessageBox.confirm('暂不支持 0 元支付！', '', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {}).catch(() => {})
      }
    },
    /**
     * [请求：获取取餐号接口]
     */
    A_getmealnum({ state, rootState, dispatch }, data) {
      const { UserInfo: { fsOpenId } } = rootState
      const { fsSellGUID, that } = data
      /* 请求接口 */
      const name = '获取取餐号接口'
      const obj = { fsSellGUID, fsOpenId }
      const suc = function (res) {
        if (res.fsMealNumber) {
          that.numberFont1 = '您的桌号/取餐号'
          that.numberFont2 = res.fsMealNumber
          that.numberText = res.fsMealNumber
        } else {
          const { setTimeout: { getmealnum: { num, time } } } = rootState // { 最多请求几次， 每次间隔时间 }
          if (state.getNum < num) {
            setTimeout(function () {
              dispatch('A_getmealnum', data) // 请求自身
            }, time)
          }
        }
        state.getNum++
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：订单列表]
     */
    A_orderlist({ state, rootState, dispatch }, data = {}) {
      const { fsShopGUID, fsCompanyGUID, UserInfo: { fsOpenId }, pageSize: { orderlist1: pageSize } } = rootState
      const { isOrder, isResetOrder } = state
      const { pageNum = '1', orderType, that } = data // 页码
      if (isOrder) {
        /* 请求接口 */
        const name = '订单列表'
        const obj = { fsShopGUID, fsCompanyGUID, fsOpenId, pageNum, pageSize }
        const suc = function (res) {
          /* 请求回的订单数量，小于本次最大请求数：禁止之后的请求 */
          if (res.list.length !== parseInt(res.pageSize)) {
            Vue.set(state, 'isOrder', false)
          }
          if (res.list.length) {
            let list = {}
            if (!isResetOrder) {
              list = state.orderObj.list
            }
            const chooseList = OrderDataType.orderType(res.list, orderType) // 筛选出的订单
            res.list = OrderDataType.arrToObj(list, chooseList)
            Vue.set(state, 'orderObj', res)
            Vue.set(state, 'isResetOrder', false)
          }
          that.isShowLoading = false
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：订单详情]
     */
    A_orderdetail({ state, rootState, dispatch }, data) {
      const { fsShopGUID, UserInfo: { fsOpenId } } = rootState
      const { fsSellGUID, fiType, name: routerName } = data
      /* 请求接口 */
      const name = '订单详情'
      const obj = { fsShopGUID, fsOpenId, fsSellGUID, fiType }
      const suc = function (res) {
        Vue.set(state, 'orderDetail', Object.assign({}, res))
        if (routerName) {
          // 由'订单列表'请求此接口，成功后从此处跳详情页面
          Router.push({ name: routerName, query: data })
        }
      }
      Api({ name, obj, suc })
    }
  }
}

export default order
