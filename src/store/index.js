// 组装模块并导出 store

import Vue from 'vue'
import Vuex from 'vuex'
import Api from '@/config/api'
import Tool from './tool.js'
import { MessageBox } from 'element-ui'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {},

  mutations: {
    /**
     * [保存数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    saveData(state, params) {
      const { name, obj } = params
      state[name] = obj
    },
    /**
     * [添加数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    assignData(state, params) {
      const { name, obj } = params
      const data = state[name] || {}
      state[name] = Object.assign({}, data, obj)
    },
    /**
     * [添加数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    pushData(state, params) {
      const { name, obj } = params
      obj.forEach(function (item) {
        state[name].push(item)
      })
    },
    /**
     * [返回：表格数据]
     */
    returnTableData(state) {
      const list = Tool.returnTableData(state)
      // console.log('返回：表格数据 ----- ', list)
      state.tableData = list
      /* 触发：计算属性 */
      state.isComputed = true
    }
  },

  state: {
    /* 初始化数据 */
    itemSummaryItemData: {}, //    接口：顶部数据
    ganttTemplate: [], //          接口：模板信息
    nodeData: [], //               接口：表头信息 [{ "8a8a8062647e434601647e53e270000b": "一批到厂" }]
    startEndDateMap: {}, //        接口：基础节点日期
    itemSummaryDataList: [], //    接口：旧数据
    divdingData: {}, //            接口：新数据
    order_time: '', //             接口：下单时间
    deliver_date: '', //           接口：交货日期
    qcArr: [], //                  接口：QC岗位人员信息
    copyNewData: {}, //            复制：新模板数据 { 节点ID: { 节点信息 } }
    /* 整合后的基础数据（更新新模板 || 不更新） */
    tableData: [],
    /* 计算依据 */
    isToggle: false, //            是否：切换新模板
    activeTemplateId: '', //       当前模板ID
    isComputed: false, //          触发：计算属性
    changeIndexId: '' //           修改的数据索引及节点ID '4_2c9xadw244'
  },

  getters: {
    /**
     * [计算后的表格数据]
     */
    tableList(state) {
      const list = Tool.returnTableList(state)
      state.isComputed = false
      // console.log('计算后的表格数据 ----- ', list)
      return list
    },
    /**
     * [是否显示：切换新模板]
     */
    isShowToggle(state) {
      const { activeTemplateId = '', itemSummaryDataList = [] } = state
      let status = false
      itemSummaryDataList.forEach(function (item) {
        if (item.is_thread !== 1 && item.audit_status === 1 && activeTemplateId && item.node_template_id !== activeTemplateId) {
          // 不是主线 && 草稿状态 && 选了模板 && 当前数据的模板ID !== 选的模板ID
          status = true
        }
      })
      return status
    }
  },

  actions: {
    /**
     * [请求：初始数据]
     */
    A_submitDividingGanttSummary({ state, commit }) {
      // const res = JSON.parse(localStorage.getItem('提报工厂甘特表'))
      // // console.log('初始数据 ----- ', res.data)
      // //
      // const { ganttTemplate, itemSummaryItemData, itemSummaryDataList, nodeData, startEndDateMap, divdingData } = res.data
      // const { returnTopData, order_time, deliver_date, qcArr } = Tool.returnTopData(itemSummaryItemData)
      // state.ganttTemplate = ganttTemplate || [] //                模板信息
      // state.itemSummaryItemData = returnTopData //                顶部数据
      // state.order_time = order_time //                            下单时间
      // state.deliver_date = deliver_date //                        交货日期
      // state.nodeData = Tool.concatNodeData({}, nodeData) || {} // 表头信息
      // state.startEndDateMap = startEndDateMap || {} //            基础节点日期
      // state.itemSummaryDataList = itemSummaryDataList || [] //    旧数据
      // state.divdingData = divdingData //                          新数据
      // state.qcArr = qcArr //                                      QC岗位人员信息
      // //
      // /** 复制：新模板数据 **/
      // state.copyNewData = Tool.copyNewTemplateData(divdingData.nodeTempleteDetail)
      // /** 返回：表格数据 **/
      // commit('returnTableData')

      const { item_id, plant_order_id } = JSON.parse(localStorage.getItem('NOVA_orderItemNodeFrom') || '{}')
      const name = '初始数据'
      // const obj = { item_id: '40289281737e3a9b01737ead59b90035', type: 3, plant_order_id: '4028928173a272410173a3ac9ad30000' }
      const obj = { item_id, type: 3, plant_order_id }
      const suc = function (res) {
        const { data, msg, status } = res
        if (String(status) === '0') {
          // eslint-disable-next-line
          MessageBox({ title: '数据异常', message: msg, type: 'warning', closeOnClickModal: false, closeOnPressEscape: false, callback() { dg.close() } })
        } else {
          // console.log('初始数据 ----- ', res)
          // localStorage.setItem('提报工厂甘特表', JSON.stringify(res))
          //
          const { ganttTemplate, itemSummaryItemData, itemSummaryDataList, nodeData, startEndDateMap, divdingData } = data
          const { returnTopData, order_time, deliver_date, qcArr } = Tool.returnTopData(itemSummaryItemData)
          state.ganttTemplate = ganttTemplate || [] //                模板信息
          state.itemSummaryItemData = returnTopData //                顶部数据
          state.order_time = order_time //                            下单时间
          state.deliver_date = deliver_date //                        交货日期
          state.nodeData = Tool.concatNodeData({}, nodeData) || {} // 表头信息
          state.startEndDateMap = startEndDateMap || {} //            基础节点日期
          state.itemSummaryDataList = itemSummaryDataList || [] //    旧数据
          state.divdingData = divdingData //                          新数据
          state.qcArr = qcArr //                                      QC岗位人员信息
          //
          /** 复制：新模板数据 **/
          state.copyNewData = Tool.copyNewTemplateData(divdingData.nodeTempleteDetail)
          /** 返回：表格数据 **/
          commit('returnTableData')
        }
      }
      const err = function () {
        // eslint-disable-next-line
        MessageBox({ title: '加载失败，请重试', message: '', type: 'warning', closeOnClickModal: false, closeOnPressEscape: false, callback() { dg.close() } })
      }
      const loading = '数据加载中...'
      Api({ name, obj, suc, err, loading })
    },
    /**
     * [请求：模板明细]
     */
    A_getNodeTempleteDetail({ state, commit }) {
      // const res = JSON.parse(localStorage.getItem('模板明细'))
      // //
      // const { nodeData } = state
      // /** 合并：表头信息 **/
      // state.nodeData = Tool.concatNodeData(nodeData, res.nodeData)
      // /** 覆盖：新数据 **/
      // state.divdingData.nodeTempleteDetail = Tool.newDataAddAttr(res.nodeTempleteDetailList)
      // /** 复制：新模板数据 **/
      // state.copyNewData = Tool.copyNewTemplateData(res.nodeTempleteDetailList)
      // /** 返回：表格数据 **/
      // commit('returnTableData')

      const { activeTemplateId } = state
      /* 发起请求 */
      const name = '模板明细'
      const obj = { node_template_id: activeTemplateId }
      const suc = function (res) {
        const { nodeData } = state
        /** 合并：表头信息 **/
        state.nodeData = Tool.concatNodeData(nodeData, res.nodeData)
        /** 覆盖：新数据 **/
        state.divdingData.nodeTempleteDetail = Tool.newDataAddAttr(res.nodeTempleteDetailList)
        /** 复制：新模板数据 **/
        state.copyNewData = Tool.copyNewTemplateData(res.nodeTempleteDetailList)
        /** 返回：表格数据 **/
        commit('returnTableData')
      }
      const err = function () {
        MessageBox({ title: '加载失败，请重试', message: '', type: 'warning', closeOnClickModal: false, closeOnPressEscape: false })
      }
      const loading = '加载模板中...'
      Api({ name, obj, suc, err, loading })
    },
    /**
     * [请求：提报]
     */
    A_savePlantMterialGanttNode({ state, getters }, { audit_status }) {
      const { activeTemplateId, startEndDateMap } = state
      const { tableList } = getters
      const { dataList, errorArr } = Tool.returnSubmitData(tableList, startEndDateMap, audit_status)
      const { ganttType = 3, item_id } = JSON.parse(localStorage.getItem('NOVA_orderItemNodeFrom') || '{}')
      if (errorArr.length) {
        MessageBox.alert(`${errorArr.join('')}`, '请完善后再提交', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        })
      } else {
        /* 发起请求 */
        const name = '提报'
        const obj = { item_id, node_template_id: activeTemplateId, ganttType, dataList: JSON.stringify(dataList) }
        const suc = function (res) {
          // console.log('提报结果')
          // eslint-disable-next-line
          dg.close()
        }
        const err = function () {
          MessageBox({ title: '提交失败，请重试', message: '', type: 'warning', closeOnClickModal: false, closeOnPressEscape: false })
        }
        const loading = '提交中...'
        Api({ name, obj, suc, err, loading })
        // console.log('提交时的节点数据 ----- ', dataList, name, obj, suc)
      }
    }
  }

})

export default store
