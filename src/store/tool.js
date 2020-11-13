
// import { Message } from 'element-ui'

const Tool = {}

/**
 * [description]
 * @param  {[Object]} data          顶部数据
 * @return {[Object]} returnTopData 整理后的顶部数据
 * @return {[String]} order_time    下单时间
 * @return {[String]} deliver_date  交货日期
 * @return {[Array]}  qcArr         QC岗位人员信息
 */
Tool.returnTopData = function (data = {}) {
  /* 面料 */
  const { styleBom = [] } = data
  const styleBomArr = []
  styleBom.forEach(function (item) {
    const { short_name, type_name } = item
    styleBomArr.push(`${short_name} -- ${type_name}`)
  })
  data.mianliao = styleBomArr.join('，')
  /* 工厂 */
  const { plantOrder = [] } = data
  const plantOrderArr = []
  plantOrder.forEach(function (item) {
    const arr = []
    const { short_name, employeename } = item
    arr.push(short_name)
    if (employeename && employeename !== null) {
      arr.push(employeename)
    }
    plantOrderArr.push(arr.join(' -- '))
  })
  data.gongchang = plantOrderArr.join('，')
  /* 岗位信息 */
  const { itemTeam = [] } = data
  const gangwei = []
  itemTeam.forEach(function (item) {
    const { post_name, employeename } = item
    gangwei.push(`${post_name}：${employeename}`)
  })
  data.gangwei = gangwei
  /* ----- 下单时间 ----- */
  const { order_time = '' } = data
  /* ----- 交货日期 ----- */
  const { deliver_date = '' } = data
  /* ----- QC岗位人员信息 ----- */
  const { qcPostData = {} } = data
  const qcArr = []
  for (const x in qcPostData) {
    const item = qcPostData[x]
    qcArr.push({ label: item, value: x })
  }
  /* 返回 */
  return { returnTopData: data, order_time, deliver_date, qcArr }
}

/**
 * [新数据：添加属性]
 * @param {[Object]} divdingData 新属性
 */
Tool.newDataAddAttr = function (nodeTempleteDetail = []) {
  const arr = []
  nodeTempleteDetail.forEach(function (item) {
    const obj = {
      is_delete: 1, //            是否删除1不删，0删除
      item_node_abnormal: '', //  异常记录主键id
      verification_remark: '', // 异常原因
      change_plan_time: '', //    调整后时间
      change_remaark: '', //      异常时间
      first_plant_enddate: '', // 预计完成时间
      frist_plan_time: '', //     首次提报时间
      is_change: 0, //            是否调整
      is_complete: 0, //          完成状态0未完成1正常完成2超期完成
      max_plant_enddate: '', //   最大完成时间
      min_plant_enddate: '', //   最小完成时间
      node_audit_status: 0, //    节点完成审核状态，0未完成，1完成待审核，2审核通过，3审核驳回，审核通过后节点完成质量为合格，驳回后为不合格（新增）4无审核，直接完成,5撤销审核
      time: ''
    }
    arr.push(Object.assign({}, obj, item))
  })
  return arr
}

/**
 * [复制：新模板数据]
 * @patam {[Array]} nodeTempleteDetail 新节点数据
 * @return {[Object]} copyNewData      复制的新数据   { 节点ID: { 节点信息 } }
 * @return {[Object]} templateIdObj    涉及到的模板ID { 模板ID: true }
 */
Tool.copyNewTemplateData = function (nodeTempleteDetail = []) {
  const copyNewData = {} //   复制的新数据
  nodeTempleteDetail.forEach(function (item) {
    copyNewData[item.node_id] = Object.assign({}, item)
  })
  return copyNewData
}

/**
 * [合并：表头信息]
 * @param  {[Object]} nodeData 表头信息：初始化
 * @param  {[Array]}  list     表头信息：模板明细
 * @return {[Object]} nodeObj  合并后的表头信息
 */
Tool.concatNodeData = function (nodeData = {}, list = []) {
  const nodeObj = {}
  for (const x in nodeData) {
    nodeObj[x] = nodeData[x]
  }
  list.forEach(function (item) {
    for (const x in item) {
      nodeObj[x] = item[x]
    }
  })
  return nodeObj
}

/**
 * [返回：表格数据]
 */
Tool.returnTableData = function (state) {
  const that = this
  const {
    isToggle = false, //         是否：切换新模板
    itemSummaryDataList = [], // 接口：旧数据
    divdingData = {}, //         接口：新数据
    copyNewData = {}, //         复制：新模板数据 { 节点ID: { 节点信息 } }
    startEndDateMap = {}, //     接口：基础节点日期
    order_time = '', //          接口：下单时间
    deliver_date = '', //        接口：交货日期
    activeTemplateId = '' //     当前模板ID
  } = state
  /* ----- 切换新模板：提取新节点 ----- */
  const newNodes = {} // 新模板内的节点
  if (isToggle) {
    for (const x in copyNewData) {
      newNodes[x] = copyNewData[x]
      const { node_code = '', first_plant_enddate = '' } = copyNewData[x]
      if (node_code && first_plant_enddate) {
        startEndDateMap['${' + node_code + '}'] = first_plant_enddate
      }
    }
  }
  /* ----- 提取：旧数据 { 主线, 非草稿状态的分线, 草稿分线 } */
  const arr_1 = []
  const arr_2 = []
  const arr_3 = []
  itemSummaryDataList.forEach(function (data) {
    /* 提取：公共变量日期 */
    const nodeCodeObj = JSON.parse(data.jzz_data || '{}')
    for (const x in nodeCodeObj) {
      startEndDateMap[x] = nodeCodeObj[x]
    }
    if (activeTemplateId && isToggle && !data.isShow) { // 选了模板 && 切换模板 && 可编辑
      /* ----- 更新模板 ----- */
      data.submit_type = 3
      const otherData = { is_change_template: 1, node_template_id: activeTemplateId } // 是否更新模板，新模板ID
      data.itemNodeData.forEach(function (node) {
        /* 可以更新的节点审核状态：未完成 || 审核驳回 || 撤销审核 */
        if (node.node_audit_status === 0 || node.node_audit_status === 4 || node.node_audit_status === 6) {
          if (newNodes[node.node_id]) {
            // /* 合并__ 模板有，原始有：根据模板公式重新计算 */
            // data[node.node_id] = Object.assign({}, node, newNodes[node.node_id], otherData, { nodesumbit_type: 2 })
            // delete newNodes[node.node_id]
            if (String(node.is_complete) === '1') {
              /* 合并__ 节点已完成，不做修改 */
              data[node.node_id] = Object.assign({}, node)
              delete newNodes[node.node_id]
            } else {
              /* 合并__ 模板有，原始有：根据模板公式重新计算，保留输入值（time） */
              const newNodeData = {} // 模板数据
              for (const x in newNodes[node.node_id]) {
                const item = newNodes[node.node_id][x]
                if (item !== null && item !== '') {
                  newNodeData[x] = item
                }
              }
              const { time, change_plan_time, change_remaark, is_change, text } = node //    当前输入值
              data[node.node_id] = Object.assign({}, node, newNodeData, otherData, { time, change_plan_time, change_remaark, is_change, text, nodesumbit_type: 2 })
              delete newNodes[node.node_id]
            }
          } else {
            /* 删除__ 模板没有，原始有：标记删除 */
            node.is_delete = 0 // 删除标记
            node.nodesumbit_type = 3
            data[node.node_id] = Object.assign({}, node, otherData)
          }
        }
      })
      /* 新增__ 模板有，原始没有：新增 */
      for (const x in newNodes) {
        data[x] = Object.assign({}, newNodes[x], otherData, { nodesumbit_type: 1 })
      }
      /* 提取：变量日期 */
      for (const x in data) {
        const node = data[x]
        if (node instanceof Object && node.node_id) {
          startEndDateMap['${' + node.node_code + '}'] = node.first_plant_enddate
        }
      }
      /* 计算 */
      for (const x in data) {
        const node = data[x]
        if (node instanceof Object && node.node_id) {
          const { sys_clac_formula, max_section_value, min_section_value, submit_type } = node
          const now = node.time ? node.time : that._returnTime(sys_clac_formula, startEndDateMap)
          const max = that._returnTime(max_section_value, startEndDateMap)
          const min = that._returnTime(min_section_value, startEndDateMap)
          const { status, maxMinText } = that._isError(max, min, now, order_time, deliver_date)
          node.max_plant_enddate = max
          node.min_plant_enddate = min
          node.change_plan_time = node.change_plan_time || ''
          node.error = now === '/' ? false : status
          node.maxMinText = maxMinText
          node.first_plant_enddate = now
          node.time = now
          node.is_delete = 1
          node.change_remaark = node.change_remaark || ''
          node.text = node.change_remaark
          if (now === '' && String(submit_type) === '1') { // 时间 === '' && 系统计算
            node.otherType = 1
          } else {
            node.otherType = 0
          }
          data[node.node_id] = Object.assign({}, node)
        }
      }
    } else {
      /* ----- 初始化 || 不切换新模板 ----- */
      data.itemNodeData.forEach(function (node) {
        const otherData = { is_change_template: 0, node_template_id: '' } // 是否更新模板，新模板ID
        const { sys_clac_formula, max_section_value, min_section_value, submit_type } = node
        const first_plant_enddate = node.first_plant_enddate ? node.first_plant_enddate : that._returnTime(sys_clac_formula, startEndDateMap)
        const now = node.time ? node.time : first_plant_enddate
        const max = that._returnTime(max_section_value, startEndDateMap)
        const min = that._returnTime(min_section_value, startEndDateMap)
        const { status, maxMinText } = that._isError(max, min, now, order_time, deliver_date)
        node.first_plant_enddate = first_plant_enddate
        node.error = now === '/' ? false : status
        node.maxMinText = maxMinText
        node.time = now
        node.is_delete = 1
        node.nodesumbit_type = 0
        node.change_remaark = node.change_remaark || ''
        node.text = node.change_remaark
        if (now === '' && String(submit_type) === '1') { // 时间 === '' && 系统计算
          node.otherType = 1
        } else {
          node.otherType = 0
        }
        data[node.node_id] = Object.assign({}, node, otherData)
      })
    }
    data.dataType = 'old'
    /* 暂存数据 */
    data.isShow = true
    data.rowType = 1
    data.count = 1
    if (data.is_thread === 1) {
      arr_1.push(data) //                                              主线
    } else if (data.is_thread !== 1 && data.audit_status !== 1) {
      arr_2.push(data) //                                              非草稿状态的分线
    } else {
      data.isShow = false
      if (!data.submit_type) {
        data.submit_type = 2
      }
      arr_3.push(Object.assign({}, data, { count: 2, rowType: 1 })) // 草稿分线
      arr_3.push(Object.assign({}, data, { count: 0, rowType: 2 })) // 草稿分线
    }
  })
  /* ----- 提取：新数据 ----- */
  const { nodeTempleteDetail = [], addGanttObj = [] } = divdingData
  const newNodesObj = {}
  const newNodesArr = []
  nodeTempleteDetail.forEach(function (node) {
    let otherData = {}
    if (arr_1.length) {
      /* ----- 有主线：主线数据覆盖计算数据 ----- */
      const data_1 = arr_1[0][node.node_id] || {}
      node = Object.assign({}, node, data_1) // 将主线数值 赋值给 分线
    } else {
      /* ----- 没主线：补充属性 ----- */
      otherData = { is_change_template: 0, node_template_id: '' } // 是否更新模板，新模板ID
    }
    const { sys_clac_formula, max_plant_enddate, max_section_value, min_plant_enddate, min_section_value, submit_type } = node
    const now = node.time ? node.time : that._returnTime(sys_clac_formula, startEndDateMap)
    const max = arr_1.length ? max_plant_enddate : that._returnTime(max_section_value, startEndDateMap)
    const min = arr_1.length ? min_plant_enddate : that._returnTime(min_section_value, startEndDateMap)
    const { status, maxMinText } = that._isError(max, min, now, order_time, deliver_date)
    if (arr_1.length) {
      node.error = now === '/' ? false : status
    } else {
      node.error = now === '/' || !sys_clac_formula ? false : status
    }
    node.maxMinText = maxMinText
    node.max_plant_enddate = max
    node.min_plant_enddate = min
    node.time = now
    node.first_plant_enddate = now
    node.change_remaark = node.change_remaark || ''
    node.text = node.change_remaark
    if (now === '' && String(submit_type) === '1') { // 时间 === '' && 系统计算
      node.otherType = 1
    } else {
      node.otherType = 0
    }
    newNodesObj[node.node_id] = Object.assign({}, node, otherData)
  })
  addGanttObj.forEach(function (item) {
    for (const x in newNodesObj) {
      item[x] = Object.assign({}, newNodesObj[x], { plant_order_id: item.plant_order_id })
      item.isShow = false
      item.dataType = 'new'
      item.submit_type = 1
    }
    newNodesArr.push(Object.assign({}, item, { count: 2, rowType: 1 }))
    newNodesArr.push(Object.assign({}, item, { rowType: 2 }))
  })
  /* ----- 返回 ----- */
  const arr = [].concat(arr_1, arr_2, arr_3, newNodesArr)
  return [arr, Boolean(arr_3.length + newNodesArr.length)]
}

/**
 * [返回：计算后的表格数据]
 */
Tool.returnTableList = function (state) {
  const that = this
  const {
    tableData = [], //       合并后的表格数据
    isComputed = false, //   是否可以重新计算
    changeIndexId = '', //   修改的数据索引及节点ID '4_2c9xadw244'
    startEndDateMap = {}, // 接口：基础节点日期
    order_time = '', //      接口：下单时间
    deliver_date = '' //     接口：交货日期
  } = state
  if (isComputed) {
    /* ----- 处理当前节点 ----- */
    const [dataIndex, nodeId, nodeName] = changeIndexId.split('_')
    tableData.map(function (item, index) {
      if (index === parseInt(dataIndex)) { // 需要计算的行
        /* 提取：节点时间 */
        for (const x in item) {
          const node = item[x]
          if (node instanceof Object && (node.node_id || node.node_code)) {
            const { first_plant_enddate, node_code } = node
            if (first_plant_enddate && first_plant_enddate !== '/') {
              startEndDateMap['${' + node_code + '}'] = first_plant_enddate
            }
          }
        }
        /* 提取：节点时间（添加基准值） */
        const nodeCodeObj = JSON.parse(item.jzz_data || '{}')
        for (const x in nodeCodeObj) {
          startEndDateMap[x] = nodeCodeObj[x]
        }
        /* 计算 */
        const { node_code, isComputedOther } = item[nodeId] // 改变的：code,是否根据当前节点的时间去计算其他节点
        if (isComputedOther) {
          /* ----- 计算：根据当前节点计算其他节点 ----- */
          for (const x in item) {
            const node = item[x]
            if (node instanceof Object && (node.node_id || node.node_code) && x === nodeId) { // 自身节点
              /* 自身：验证是否报错 */
              const { node_code, time, max_plant_enddate, min_plant_enddate } = node
              const { status, maxMinText } = that._isError(max_plant_enddate, min_plant_enddate, time, order_time, deliver_date)
              node.change_remaark = status ? node.change_remaark : ''
              node.error = time === '/' ? false : status
              node.maxMinText = maxMinText
              startEndDateMap['${' + node_code + '}'] = time
            }
          }
          for (const x in item) {
            const node = item[x]
            if (node instanceof Object && (node.node_id || node.node_code) && x !== nodeId) { // 其他节点
              /* 引用到此节点的其他节点：重新计算 */
              const { sys_clac_formula, max_section_value, min_section_value, submit_type } = node
              if (sys_clac_formula.indexOf('${' + node_code + '}') > -1) { // 引用了此节点
                const now = that._returnTime(sys_clac_formula, startEndDateMap)
                const max = that._returnTime(max_section_value, startEndDateMap)
                const min = that._returnTime(min_section_value, startEndDateMap)
                const { status, maxMinText } = that._isError(max, min, now, order_time, deliver_date)
                node.time = now
                node.change_plan_time = now
                node.change_remaark = status ? `${nodeName} 节点变更后，重新计算` : ''
                node.max_plant_enddate = max
                node.min_plant_enddate = min
                node.error = now === '/' ? false : status
                node.maxMinText = maxMinText
                if (now === '' && String(submit_type) === '1') { // 时间 === '' && 系统计算
                  node.otherType = 1
                } else {
                  node.otherType = 0
                }
              }
            }
          }
        } else {
          /* ----- 还原：根据当前节点计算其他节点 ----- */
          for (const x in item) {
            const node = item[x]
            if (node instanceof Object && (node.node_id || node.node_code) && x !== nodeId) { // 其他节点
              const { first_plant_enddate, sys_clac_formula, max_section_value, min_section_value, submit_type } = node
              if (sys_clac_formula.indexOf('${' + node_code + '}') > -1) { // 引用了此节点
                const now = first_plant_enddate
                const max = that._returnTime(max_section_value, startEndDateMap)
                const min = that._returnTime(min_section_value, startEndDateMap)
                const { status, maxMinText } = that._isError(max, min, now, order_time, deliver_date)
                node.time = now
                node.change_plan_time = ''
                node.change_remaark = ''
                node.max_plant_enddate = max
                node.min_plant_enddate = min
                node.error = now === '/' ? false : status
                node.maxMinText = maxMinText
                if (now === '' && String(submit_type) === '1') { // 时间 === '' && 系统计算
                  node.otherType = 1
                } else {
                  node.otherType = 0
                }
              }
            }
          }
        }
      }
    })
  }
  return tableData
}

/**
 * [返回：提交用的数据]
 * @param  {[Array]}  tableList       表格数据
 * @param  {[Object]} startEndDateMap 新数据的 jzz_data
 * @param  {[Int]}    audit_status    审核状态1暂存2提交审核6无审核直接通过
 * @param  {[String]} p_item_gantt_id 主线甘特表id
 * @return {[Array]}  dataList        整理好的数据
 * @return {[Array]}  errorArr        报错信息
 */
Tool.returnSubmitData = function (tableList, startEndDateMap, audit_status, p_item_gantt_id) {
  const dataList = []
  let errorArr = []
  let haveBlankNode = false // 是否存在空节点
  tableList.forEach(function (item, index) {
    if (item.count && !item.isShow) {
      /* 报错：此工厂没选QC */
      if (!item.node_charge_person) {
        errorArr.push(`<p>${item.short_name}：需要选择QC负责人</p>`)
      }
      /* ----- 提取：提报的甘特表数据（dataList） ----- */
      const { node_charge_person, submit_type, is_change_template, node_template_id, item_gantt_id, material_id, color_id, jzz_data = startEndDateMap, plant_order_id, ...map } = item
      const data = {
        node_charge_person, //
        p_item_gantt_id, //                    主线甘特表id
        is_change_template, //                 是否更新模板
        node_template_id, //                   新模板ID
        item_gantt_id, //                      项目甘特表主键id
        material_id, //                        面料id
        color_id, //                           颜色id
        audit_status, //                       审核状态1暂存2提交审核6无审核直接通过
        jzz_data: JSON.stringify(jzz_data), // 提报甘特表时的基准值
        plant_order_id, //                     委外单id
        nodeDataList: [], //                   提报的节点信息
        submit_type //                         提交类型1新增，2修改，3更新模板
      }
      /* ----- 提取：提报的节点信息（nodeDataList） ----- */
      for (const x in map) {
        const node = map[x]
        if (node instanceof Object && (node.node_id || node.node_code)) {
          const { nodesumbit_type, node_id, business_post_id, item_node_id, first_plant_enddate, time, min_plant_enddate, max_plant_enddate, node_template_detail_id, node_name } = node
          const val = {
            node_id, //                                          节点id
            item_team_id: business_post_id, //                   负责岗位
            item_node_id, //                                     项目节点id
            first_plant_enddate: first_plant_enddate || time, // 节点计划完成时间
            min_plant_enddate, //                                最小完成时间
            max_plant_enddate, //                                最大完成时间
            node_template_detail_id, //                          模板明细id
            nodesumbit_type, //                                  提交类型1新增，2修改，3更新模板
            item_node_change: {} //                              异常记录
          }
          /* ----- 提取：异常记录（item_node_change） ----- */
          const { is_delete = 1, item_node_abnormal, frist_plan_time, abnormal_reason, is_change, change_plan_time, change_remaark } = node
          const node_child = {
            is_delete, //                                  是否删除1不删，0删除
            item_node_abnormal, //                         异常记录主键id
            frist_plan_time, //                            首次提报时间
            abnormal_reason, //                            异常原因
            is_change, //                                  是否调整时间
            change_plan_time: time || change_plan_time, // 调整后的时间
            change_remaark //                              调整/异常说明
          }
          val.item_node_change = node_child
          /* ----- 验证 ----- */
          const { error, text, otherType = 0 } = node
          const before = first_plant_enddate
          const submit_1 = before !== time && ((change_remaark && error) || !error) // 提交：时间有变化 && ((有现在异常原因 && 报错) || 不报错))
          const submit_2 = before === time && error && change_remaark !== text //      提交：时间没变 && 报错 && 异常原因变了
          const submit_3 = otherType === 1 && change_remaark //                        提交：计算为空的系统计算节点 && 有异常原因
          const err_1 = before !== time && error && !change_remaark //                 报错：时间有变化 && 报错 && 没有异常原因
          const err_2 = otherType === 1 && !change_remaark //                          报错：计算为空的系统计算节点 && 没有异常原因
          if (!time) { /* 报错：时间为空 */
            haveBlankNode = true
            break
          }
          if (submit_1 || submit_2 || submit_3) { /* 提交 */
            val.is_adjustment = 1
            if (val.nodesumbit_type !== 3) {
              if (submit_type === 1) {
                val.nodesumbit_type = 1
                val.item_node_id = null
              } else {
                val.nodesumbit_type = 2
              }
            }
            data.nodeDataList.push(val)
          } else if (err_1 || err_2) { /* 报错 */
            errorArr.push(`<p>${item.short_name} -- ${node_name} 节点：需要填写异常原因</p>`)
          }
        }
      }
      if (data.nodeDataList.length) {
        dataList.push(data)
      }
    }
  })
  if (haveBlankNode) {
    errorArr.push('<p>请完善全部节点后再提交</p>')
  }
  if (!dataList.length && !errorArr.length) {
    errorArr = ['<p>节点时间未变更，请修改时间后再提交</p>']
  }
  return { dataList, errorArr }
}

/** --------------------------- 工具方法 --------------------------- **/

/**
 * [公式 转 时间]
 * @param {[String]} str         公式
 * @param {[Object]} nodeCodeObj 当前项目的节点值 { ${变量}: 自身时间 }
 */
Tool._returnTime = function (str = '', nodeCodeObj = {}) {
  const asd = str.replace(/\$\{[\w-_:/]+\}/g, function (name) {
    return nodeCodeObj[name] ? new Date(nodeCodeObj[name]).getTime() : 0
  })
  const numStr = asd.replace(/[0-9]+/g, function (num, index) {
    if (num.length < 13) {
      let isChange = true
      let beforeStr = ''
      let afterStr = ''
      let numStr = 0
      if (index !== 0) {
        beforeStr = asd[index - 1]
      }
      if (index + num.length !== asd.length) {
        afterStr = asd[index + num.length]
      }
      if (beforeStr === '*' || beforeStr === '/' || afterStr === '*' || afterStr === '/') {
        isChange = false
      }
      numStr = num
      if (isChange) {
        numStr = parseInt(numStr) * 60 * 60 * 24 * 1000
      }
      return `${numStr}`
    } else {
      return num
    }
  })
  /* 毫秒数 转 时间 */
  // eslint-disable-next-line
  const timeStr = eval(numStr)
  if (isNaN(timeStr)) {
    return ''
  } else if (new Date(timeStr).getTime() < new Date('2000-01-01').getTime()) {
    return ''
  } else {
    const d = new Date(timeStr)
    const year = d.getFullYear()
    const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
    const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
    return `${year}-${month}-${day}`
  }
}
/**
 * [转换：处理时间格式]
 * @param {[String]} time 时间
 */
Tool._toggleTime = function (time) {
  if (time === '/') {
    return time
  } if (time) {
    const [three, two, one] = time.split(/[-//.]/g).reverse()
    /* 处理：年 */
    let year = parseInt(new Date().getFullYear()) // 年 {[Int]}
    if (!isNaN(parseInt(one))) {
      const str = String(one).trim()
      year = parseInt(String(year).slice(0, -1 * str.length) + str)
    }
    /* 处理：月 */
    let addYear = 0 // 增加的年份 {[Int]}
    let month = (isNaN(parseInt(two)) || two === '0') ? 1 : parseInt(two) // 月 {[Int]}
    for (let i = 0; ; i++) {
      if (month > 12) {
        addYear++
        month -= 12
      } else {
        break
      }
    }
    year = year + addYear
    /* 处理：日 */
    let year_2 = month < 12 ? year : year + 1
    let month_2 = month < 12 ? month + 1 : month + 1 - 12
    let day = (isNaN(parseInt(three)) || three === '0') ? 1 : parseInt(three) // 日 {[Int]}
    for (let i = 0; ; i++) {
      const maxDay = new Date(new Date(`${year_2}-${month_2}`).getTime() - 1000 * 60 * 60 * 24).getDate()
      if (day > maxDay) {
        day -= maxDay
        month++
        month_2++
        if (month > 12) {
          month -= 12
          year += 1
          year_2 += 1
        }
        if (month_2 > 12) {
          month_2 -= 12
        }
      } else {
        break
      }
    }
    /* 整合 */
    return `${year}-${'00'.slice(0, -1 * String(month).length) + month}-${'00'.slice(0, -1 * String(day).length) + day}`
  } else {
    return ''
  }
}
/**
 * [验证：计划事件是否在区间内]
 * @param {[String]} maxVal       最大值
 * @param {[String]} minVal       最小值
 * @param {[String]} plantVal     计划时间
 * @param {[String]} order_time   下单日期
 * @param {[String]} deliver_date 客人交期
 */
Tool._isError = function (maxVal = '', minVal = '', plantVal = '', order_time = '', deliver_date = '') {
  const max = isNaN(new Date(maxVal).getTime()) ? 0 : new Date(maxVal).getTime() //       最大值
  const min = isNaN(new Date(minVal).getTime()) ? 0 : new Date(minVal).getTime() //       最小值
  const plant = isNaN(new Date(plantVal).getTime()) ? 0 : new Date(plantVal).getTime() // 计划时间
  const order = new Date(order_time).getTime() //                                         下单日期
  const deliver = new Date(deliver_date).getTime() //                                     客人交期
  const countMax = max || deliver
  const countMin = min || order
  const time_1 = this._returnYearMonthDay(countMin)
  const time_2 = this._returnYearMonthDay(countMax)
  const maxMinText = `最早：${time_1 === '1970-01-01' ? '未知' : time_1}，最晚：${time_2 === '1970-01-01' ? '未知' : time_2}` // 提示文字
  /* 返回 */
  if (countMin && countMax && (countMin <= plant && plant <= countMax)) {
    return { status: false, maxMinText }
  } else {
    return { status: true, maxMinText }
  }
}
/**
 * [提取：年月日]
 */
Tool._returnYearMonthDay = function (strOrNum) {
  const d = new Date(strOrNum)
  const year = d.getFullYear()
  const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
  return `${year}-${month}-${day}`
}

export default Tool
