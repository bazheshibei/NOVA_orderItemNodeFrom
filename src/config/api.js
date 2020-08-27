// 接口

import Axios from '@/config/axios'

/**
 * [服务器地址]
 */
const host = '/api/'
// const host = window.location.origin + '/nova/'

/**
 * [接口地址]
 */
const url = {
  '初始数据': 'itemGanttSummaryShowAction.ndo?action=submitDividingGanttSummary',
  '模板明细': 'itemGanttSummaryShowAction.ndo?action=getNodeTempleteDetail',
  '提报': 'itemGanttSummarySaveAction.ndo?action=savePlantMterialGanttNode'
}

const request = function (param) {
  param.path = host + url[param.name]
  Axios(param)
}

export default request
