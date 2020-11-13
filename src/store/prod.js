
import Api from '@/config/api'
import Tool from './tool.js'
import { Loading, MessageBox } from 'element-ui'

/**
 * 生产环境代码
 */
const Prod = {}

/**
 * [请求：初始数据]
 */
Prod.A_submitDividingGanttSummary = function (state, commit) {
  const { item_id = '2c9f10b6759ba20901759cbc71f10028', plant_order_id = '8a8a806275ba4f4b0175ba5efd0e0000' } = JSON.parse(localStorage.getItem('NOVA_orderItemNodeFrom') || '{}')
  const name = '初始数据'
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
      const { ganttTemplate, itemSummaryItemData, itemSummaryDataList, nodeData, startEndDateMap, divdingData, p_item_gantt_id } = data
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
      state.p_item_gantt_id = p_item_gantt_id //                  主线甘特表id
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
  Api({ name, obj, suc, err, loading: '数据加载中...' })
}

/**
 * [请求：模板明细]
 */
Prod.A_getNodeTempleteDetail = function (state, commit) {
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
  Api({ name, obj, suc, err, loading: '加载模板中...' })
}

/**
 * [请求：提报]
 */
Prod.A_savePlantMterialGanttNode = function (state, getters, audit_status) {
  const { activeTemplateId, startEndDateMap, p_item_gantt_id } = state
  const { tableList } = getters
  const { dataList, errorArr } = Tool.returnSubmitData(tableList, startEndDateMap, audit_status, p_item_gantt_id)
  const { ganttType = 3, item_id = '2c915e107466aec50174674e8fb20000' } = JSON.parse(localStorage.getItem('NOVA_orderItemNodeFrom') || '{}')
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
      const loading = Loading.service({ text: String(audit_status) === '1' ? '暂存成功' : '提交成功', spinner: 'el-icon-circle-check' })
      setTimeout(() => {
        loading.close()
        // eslint-disable-next-line
        dg.close()
      }, 1000)
    }
    const err = function () {
      MessageBox({ title: '提交失败，请重试', message: '', type: 'warning', closeOnClickModal: false, closeOnPressEscape: false })
    }
    Api({ name, obj, suc, err, loading: '提交中...' })
  }
}

export default Prod
