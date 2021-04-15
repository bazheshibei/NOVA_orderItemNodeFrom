
import Tool from './tool.js'
import { MessageBox } from 'element-ui'

/**
 * 本地开发代码
 * @ [调用本地数据]
 * @ [不请求接口]
 */
const Dev = {}

/**
 * [请求：初始数据]
 */
Dev.A_submitDividingGanttSummary = function (state, commit) {
  const res = JSON.parse(localStorage.getItem('提报工厂甘特表'))
  console.log('初始数据 ----- ', res.data)
  //
  const { ganttTemplate, itemSummaryItemData, itemSummaryDataList, nodeData, startEndDateMap, divdingData, p_item_gantt_id } = res.data
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

/**
 * [请求：模板明细]
 */
Dev.A_getNodeTempleteDetail = function (state, commit) {
  const res = JSON.parse(localStorage.getItem('模板明细'))
  //
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

/**
 * [请求：提报]
 */
Dev.A_savePlantMterialGanttNode = function (state, getters, audit_status) {
  const { activeTemplateId, startEndDateMap, p_item_gantt_id } = state
  const { tableList } = getters
  const { dataList, errorArr } = Tool.returnSubmitData(tableList, startEndDateMap, audit_status, p_item_gantt_id)
  const { ganttType = 3, item_id = '2c915e107466aec50174674e8fb20000' } = JSON.parse(localStorage.getItem('NOVA_orderItemNodeFrom') || '{}')
  console.log('提报 ----- dataList', dataList)
  if (errorArr.length) {
    MessageBox.alert(`${errorArr.join('')}`, '请完善后再提交', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    })
  } else {
    /* 发起请求 */
    console.log('提报 ----- item_id', item_id)
    console.log('提报 ----- node_template_id', activeTemplateId)
    console.log('提报 ----- ganttType', ganttType)
    console.log('提报 ----- dataList', dataList)
  }
}

export default Dev
