
/**
 * [点餐模块]
 */

import Vue from 'vue'
import Api from '@/config/api'
import Store from '@/store'
import { MathUtils } from '@/assets/js/mathUtils.js'
import Show from '@/config/show'

const Menu = {
  namespaced: true,
  state: {
    activeCate: 0, //       激活的分类
    cateGoods: [], //       分类及下属菜品
    cateIndex: 0, //        当前索引：分类
    dishIndex: 0, //        当前索引：菜品
    moreIndex: 0, //        当前索引：购物车
    isDetail: false, //     是否显示：详情
    isAdditional: false, // 是否显示：规格
    isMore: false, //       是否显示：更多
    dish: {}, // 选中的菜品
    shoppingCart: {}, // 购物车数据 { 分类索引_菜品索引_购物车索引: 菜品对象 }
    shoppingList: [] //  购物车数组
  },
  /* 方法 */
  mutations: {
    /**
     * [切换门店]
     */
    toggleShop(state) {
      Vue.set(state, 'cateGoods', [])
      localStorage.removeItem('BWY_shoppingCart')
    },
    /**
     * [显示详情]
     */
    showDetail(state, data) {
      const { isDetail, dish } = data
      Vue.set(state, 'isDetail', isDetail)
      Vue.set(state, 'dish', dish)
    },
    /**
     * [隐藏详情]
     */
    hiddenDetail(state) {
      Vue.set(state, 'isDetail', false)
    },
    /**
     * [显示规格]
     */
    showAdditional(state, data) {
      const { isAdditional, dish } = data
      Vue.set(state, 'isAdditional', isAdditional)
      Vue.set(state, 'dish', dish)
    },
    /**
     * [隐藏规格]
     */
    hiddenAdditional(state, text) {
      Vue.set(state, 'isAdditional', false)
      if (text === 'add') {
        Vue.set(state, 'isDetail', false)
      }
    },
    /**
     * [显示更多]
     */
    showMore(state, data) {
      const { isMore, dish, moreIndex } = data
      Vue.set(state, 'isMore', isMore)
      Vue.set(state, 'dish', dish)
      Vue.set(state, 'moreIndex', moreIndex)
    },
    /**
     * [隐藏更多]
     */
    hiddenMore(state) {
      Vue.set(state, 'isMore', false)
    },
    /**
     * [更新购物车数据]
     */
    f5(state) {
      const local = JSON.parse(localStorage.getItem('BWY_shoppingCart')) || {}
      if (!local.time || local.fsShopGUID !== Store.state.fsShopGUID) {
        Vue.set(state, 'shoppingCart', {})
        Vue.set(state, 'shoppingList', [])
        localStorage.removeItem('BWY_shoppingCart')
      } else {
        Vue.set(state, 'shoppingCart', local.data)
        const arr = []
        for (const x in local.data) {
          arr.push(local.data[x])
        }
        Vue.set(state, 'shoppingList', arr)
        // 验证购物车过期时间
        // console.log(new Date().valueOf())
      }
    },
    /**
     * [将购物车数据保存到 localStorage]
     */
    submitToSave(state) {
      let local = JSON.parse(localStorage.getItem('BWY_shoppingCart')) || {}
      if (!local.time) {
        local = {
          time: new Date().valueOf(),
          data: {},
          fsShopGUID: Store.state.fsShopGUID
        }
      }
      local.data = state.shoppingCart
      localStorage.setItem('BWY_shoppingCart', JSON.stringify(local))
    },
    /**
     * [改变当前激活的分类]
     * @param {[Int]} index 分类索引
     */
    changeActiveCate(state, index) {
      Vue.set(state, 'activeCate', index)
    },
    /**
     * [添加到购物车]
     * @param {[Object]} obj 点选后的菜品对象
     */
    addToShoppingCart(state, data) {
      /** 购物车数据 **/
      let local = JSON.parse(localStorage.getItem('BWY_shoppingCart')) || {}
      if (!local.time) {
        local = { time: new Date().valueOf(), data: {}, fsShopGUID: Store.state.fsShopGUID }
      }
      /** 购物车操作 **/
      const { obj, cartIndex } = data
      let index = ''
      if (cartIndex) {
        /* 修改 */
        index = cartIndex
        local.data[index] = obj
      } else {
        const { _cateIndex, _dishIndex } = obj
        /* 添加 -- 没规格 */
        let forIndex = ''
        for (const x in local.data) {
          if (obj.fsItemId === local.data[x].fsItemId) {
            forIndex = x
          }
        }
        if (forIndex && !obj._showText.operation) {
          local.data[forIndex]._showText.number += 1
        } else {
          /* 添加 -- 有规格 */
          const { cateGoods } = state
          // 计算：购物车索引（属性名）
          const length = Object.keys(state.shoppingCart).length
          index = `${_cateIndex}_${_dishIndex}_${length}`
          // 给菜品添加分类名称
          obj.fsMenuClsName = cateGoods[_cateIndex].fsMenuClsName
          local.data[index] = obj
        }
      }
      /** 保存购物车 **/
      localStorage.setItem('BWY_shoppingCart', JSON.stringify(local))
    },
    /**
     * [清空购物车]
     */
    clearShoppingCart(state) {
      localStorage.removeItem('BWY_shoppingCart')
    },
    /**
     * [对购物车指定属性名的菜品数量 进行操作]
     * @param {[String]} index 属性名
     * @param {[Int]}    num   1 或 -1
     * @param {[Object]} that  组件的 this
     */
    shoppingCartIndexAct(state, obj) {
      const { index, num, that } = obj
      let number = state.shoppingCart[index]._showText.number
      number += num
      if (number === 0) {
        /* 删除购物车中指定的索引（删除指定菜品） */
        that.deleteShoppingCartIndex()
      } else {
        const { price, addPrice } = state.shoppingCart[index]._showText
        const total = MathUtils.accAdd(MathUtils.accMul(price, number), MathUtils.accMul(addPrice, number))
        state.shoppingCart[index]._showText.number = number
        state.shoppingCart[index]._showText.total = total
        // 保存
        const local = JSON.parse(localStorage.getItem('BWY_shoppingCart'))
        local.data = state.shoppingCart
        localStorage.setItem('BWY_shoppingCart', JSON.stringify(local))
      }
    },
    /**
     * [删除购物车中指定的索引（删除指定菜品）]
     * @param {[String]} index 属性名
     */
    deleteShoppingCartIndex(state, data) {
      const { index } = data
      const local = JSON.parse(localStorage.getItem('BWY_shoppingCart'))
      delete local.data[index]
      localStorage.setItem('BWY_shoppingCart', JSON.stringify(local))
    }
  },
  /* 计算属性 */
  getters: {
    count: state => {
      const { shoppingCart: data } = state
      let num = 0 //   购物车：菜品总数
      const cate = {}
      for (const x in data) {
        const [index, key] = x.split('_') // 分类索引，菜品索引
        num = MathUtils.accAdd(num, data[x]._showText.number)
        // 检查：分类索引是否存在
        cate[index] = cate[index] ? cate[index] : { num: 0, dishs: {} }
        // 检查：菜品索引是否存在
        cate[index].dishs[key] = cate[index].dishs[key] ? cate[index].dishs[key] : { num: 0 }
        // 累计当前菜品数量
        cate[index].dishs[key].num += data[x]._showText.number
        /* 统计分类数量 */
        for (const y in cate) {
          let n = 0
          for (const z in cate[y].dishs) {
            n += cate[y].dishs[z].num
          }
          cate[y].num = n
        }
      }
      return { num, cate }
    }
  },
  /* 异步操作 */
  actions: {
    /**
     * [请求：菜品列表]
     */
    A_menulist({ state, rootState, dispatch }) {
      const name = '菜品list'
      const obj = { fsShopGUID: rootState.fsShopGUID }
      const suc = function (res) {
        /* 筛选出：有下属菜品的分类 */
        const arr = []
        for (let i = 0; i < res.length; i++) {
          if (res[i].menuItemList.length) {
            /* 菜品分类名称，只显示指定长度 */
            res[i].cateName = res[i].fsMenuClsName.substr(0, Show.cateNameLength)
            arr.push(res[i])
          }
        }
        Vue.set(state, 'cateGoods', arr)
      }
      Api({ name, obj, suc })
    }
  }
}

export default Menu
