// 组装模块并导出 store

import Vue from 'vue'
import Vuex from 'vuex'
import Tool from './tool.js' // 工具方法
import Dev from './dev.js' //   本地开发代码
import Prod from './prod.js' // 生产环境代码
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {},

  state: {
    nowCodeType: 'Prod', //     当前代码类型
    codeObj: { Dev, Prod }, // 代码类型 { Dev: '开发', Prod: '生产' }
    /**/
    isHaveNewData: true, // true 底部按钮可用， false 禁用
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
    p_item_gantt_id: '', //        接口：主线甘特表id
    copyNewData: {}, //            复制：新模板数据 { 节点ID: { 节点信息 } }
    /* 整合后的基础数据（更新新模板 || 不更新） */
    tableData: [],
    /* 计算依据 */
    isToggle: false, //            是否：切换新模板
    activeTemplateId: '', //       当前模板ID
    isComputed: false, //          触发：计算属性
    changeIndexId: '' //           修改的数据索引及节点ID '4_2c9xadw244'
  },

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
      const [list, isHaveNewData] = Tool.returnTableData(state)
      // console.log('返回：表格数据 ----- ', list)
      state.tableData = list
      /* 触发：计算属性 */
      state.isComputed = true
      /* true 底部按钮可用， false 禁用 */
      state.isHaveNewData = isHaveNewData
    }
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
      state.codeObj[state.nowCodeType].A_submitDividingGanttSummary(state, commit)
    },
    /**
     * [请求：模板明细]
     */
    A_getNodeTempleteDetail({ state, commit }) {
      state.codeObj[state.nowCodeType].A_getNodeTempleteDetail(state, commit)
    },
    /**
     * [请求：提报]
     */
    A_savePlantMterialGanttNode({ state, getters }, { audit_status }) {
      state.codeObj[state.nowCodeType].A_savePlantMterialGanttNode(state, getters, audit_status)
    }
    //
  }

})

export default store
