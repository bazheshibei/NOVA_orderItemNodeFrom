
/**
 * [用户模块]
 */

import Vue from 'vue'
import Router from '@/config/router'
import Api from '@/config/api'
import DataType from '@/assets/js/dataType/userInfo'
import { Message } from 'element-ui'
// import Show from '@/config/show'

const UserInfo = {
  namespaced: true,
  state: {
    isShowRegister: false, // 是否显示：首页注册弹出层
    fsOpenId: '', //          openId /* omhaQvzpZeoRoz66yqUFvYf4rpQc */
    userInfo: {}, //          会员信息
    /* 优惠券 */
    isCoupon: true, //        是否还能请求：优惠券
    isResetCoupon: true, //   是否重置：优惠券列表
    couponObj: {}, //         优惠券对象
    /* 积分 */
    isPoints1: true, //       是否还能请求：积分新增记录
    isResetPoints1: true, //  是否重置：积分新增列表
    points1Obj: {}, //        积分新增记录对象
    isPoints2: true, //       是否还能请求：积分扣减记录
    isResetPoints2: true, //  是否重置：积分扣减列表
    points2Obj: {} //         积分扣减记录对象
  },
  /* 方法 */
  mutations: {
    /**
     * [设置：是否显示首页注册弹出层]
     */
    setRegister(state, data) {
      Vue.set(state, 'isShowRegister', data)
    },
    /**
     * [重置分页数]
     */
    resetPageNum(state) {
      Vue.set(state.couponObj, 'pageNum', 0)
      Vue.set(state.points1Obj, 'pageNum', 0)
      Vue.set(state.points2Obj, 'pageNum', 0)
      Vue.set(state, 'isCoupon', true)
      Vue.set(state, 'isResetCoupon', true)
      Vue.set(state, 'isPoints1', true)
      Vue.set(state, 'isResetPoints1', true)
      Vue.set(state, 'isPoints2', true)
      Vue.set(state, 'isResetPoints2', true)
    }
  },
  /* 异步操作 */
  actions: {
    /**
     * [请求：扫码登录授权]
     */
    A_login({ state, rootState, dispatch }) {
      const { fsShopGUID, fsHostId, fsCompanyGUID, fiBillSource, Table: { fsMTableId } } = rootState
      /** 请求接口 **/
      const name = '扫码登录授权'
      const obj = { fsShopGUID, fsHostId, fsCompanyGUID, fiBillSource, fsMTableId }
      const method = 'get'
      Api({ name, obj, method })
    },
    /**
     * [请求：我的会员页面]
     */
    A_homepage({ state, rootState, dispatch }) {
      // const { fsShopGUID, fsCompanyGUID } = rootState
      // const { fsOpenId } = state
      /** 请求接口 **/
      const name = '我的会员页面'
      // const obj = { fsShopGUID, fsCompanyGUID, fsOpenId }
      const obj = {}
      const suc = function (res) {
        // console.log('会员信息', res)
        Vue.set(state, 'userInfo', res)
        // if (document.title !== Show.documentTitle[res.fiBillSource]) {
        //   document.title = Show.documentTitle[res.fiBillSource]
        // }
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：完善资料]
     */
    A_perfectinformation({ state, rootState, dispatch }, data) {
      const { fsOpenId } = state
      const { fsSex, fsBirthday, email: fsMail, name: fsMemberName, that } = data
      /* 请求接口 */
      const name = '完善资料'
      const obj = { fsOpenId, fsBirthday, fsMail, fsMemberName, fsSex }
      const suc = function (res) {
        that.$message({
          message: '保存成功！',
          type: 'success',
          duration: 1000,
          onClose() { that.$router.go(-1) }
        })
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：发验证码]
     */
    A_sendsms({ state, rootState, dispatch }, fsPhone) {
      /* 请求接口 */
      const name = '发验证码'
      const obj = { fsPhone }
      const suc = function (res) {
        // console.log(res)
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：注册]
     */
    A_registered({ state, commit, dispatch }, data) {
      const { fsOpenId } = state
      const { fsPhone, code, query, that } = data
      /* 请求接口 */
      const name = '注册'
      const obj = { fsOpenId, fsPhone, code }
      const suc = function (res) {
        that.isRegistered = false
        Message({
          message: '注册成功！',
          type: 'success',
          duration: 1000,
          onClose() {
            if (query.fsCallBack) {
              window.location.href = query.fsCallBack
            } else if (query.goTo) {
              if (query.goTo === '-1') {
                Router.go(-1)
              }
            } else {
              Router.replace({ name: '首页' })
            }
          }
        })
      }
      Api({ name, obj, suc })
    },
    /**
     * [请求：优惠券列表]
     */
    A_couponlist({ state, rootState, dispatch }, data = {}) {
      const { fsShopGUID, pageSize: { couponlist: pageSize } } = rootState // { 门店 GUID， openID， 分页条数 }
      const { isCoupon, fsOpenId = '', isResetCoupon } = state
      const { pageNum = '1', that } = data // 页码
      if (isCoupon) {
        /* 请求接口 */
        const name = '优惠券列表'
        const obj = { fsShopGUID, fsOpenId, pageNum, pageSize }
        const suc = function (res) {
          /* 请求回的订单数量，小于本次最大请求数：禁止之后的请求 */
          if (res.list.length !== parseInt(res.pageSize)) {
            Vue.set(state, 'isCoupon', false)
          }
          if (res.list.length) {
            let list = []
            if (!isResetCoupon) {
              list = state.couponObj.list
            }
            for (let i = 0; i < res.list.length; i++) {
              res.list[i]._begin = res.list[i].fsBeginValidTime.split(' ')[0]
              res.list[i]._end = res.list[i].fsEndValidTime.split(' ')[0]
            }
            res.list = list.concat(res.list)
            Vue.set(state, 'couponObj', res)
            Vue.set(state, 'isResetCoupon', false)
          }
          if (that) {
            that.showLoading = false
          }
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：积分新增记录]
     */
    A_creditaddlist({ state, rootState, dispath }, data = {}) {
      const { fsShopGUID, pageSize: { pointslist1: pageSize } } = rootState
      const { isPoints1, fsOpenId = '', isResetPoints1 } = state
      const { pageNum = '1', that } = data // 页码
      if (isPoints1) {
        /* 请求接口 */
        const name = '积分新增记录'
        const obj = { fsShopGUID, fsOpenId, pageNum, pageSize }
        const suc = function (res) {
          /* 请求回的订单数量，小于本次最大请求数：禁止之后的请求 */
          if (res.list.length !== parseInt(res.pageSize)) {
            Vue.set(state, 'isPoints1', false)
          }
          if (res.list.length) {
            let list = {}
            if (!isResetPoints1) {
              list = state.points1Obj.list
            }
            res.list = DataType.arrToObj(list, res.list)
            Vue.set(state, 'points1Obj', res)
            Vue.set(state, 'isResetPoints1', false)
          }
          that.showLoading = false
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：积分扣减记录]
     */
    A_creditreducelist({ state, rootState, dispath }, data) {
      const { fsShopGUID, pageSize: { pointslist2: pageSize } } = rootState
      const { isPoints2, fsOpenId = '', isResetPoints2 } = state
      const { pageNum = '1', that } = data // 页码
      if (isPoints2) {
        /* 请求接口 */
        const name = '积分扣减记录'
        const obj = { fsShopGUID, fsOpenId, pageNum, pageSize }
        const suc = function (res) {
          /* 请求回的订单数量，小于本次最大请求数：禁止之后的请求 */
          if (res.list.length !== parseInt(res.pageSize)) {
            Vue.set(state, 'isPoints2', false)
          }
          if (res.list.length) {
            let list = {}
            if (!isResetPoints2) {
              list = state.points2Obj.list
            }
            res.list = DataType.arrToObj(list, res.list)
            Vue.set(state, 'points2Obj', res)
            Vue.set(state, 'isResetPoints2', false)
          }
          that.showLoading = false
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：获取支付码]
     */
    A_getpaycode({ state, rootState, dispatch }, that) {
      const name = '获取支付码'
      const obj = {}
      const suc = function (res) {
        that.code = res
      }
      Api({ name, obj, suc })
    }
  }
}

export default UserInfo
