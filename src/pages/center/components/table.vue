
<!-- 模块：表格 -->

<template>
  <div class="comTableBox">

    <el-table class="comTable" :data="tableList" size="mini" border :span-method="objectSpanMethod">
      <!-- 服装加工厂 -->
      <el-table-column label="服装加工厂" width="200" fixed>
        <template slot-scope="scope">
          <p v-if="scope.row.is_thread === 1" style="color: #E6A23C;">加工厂总线计划</p>
          <div v-else>
            <!-- 面料 -->
            <p v-if="scope.row.material_id">{{scope.row.material_name}}  {{scope.row.color_name}}</p>
            <!-- 工厂 -->
            <p v-else>{{scope.row.short_name}}</p>
            <span style="color: #E6A23C;">(分线计划)</span>
          </div>
        </template>
      </el-table-column>
      <!-- QC负责人 -->
      <el-table-column label="QC负责人" width="130" fixed>
        <template slot-scope="scope">
          <el-select v-if="scope.row.dataType === 'new'" class="tableSelect" v-model="scope.row.node_charge_person" size="mini" :multiple="false">
            <el-option class="comSelectOptions" v-for="(item, index) in qcArr" :key="'qc_' + index" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <p v-else>{{scope.row.employeename}}</p>
        </template>
      </el-table-column>
      <!-- 计划完成 || 本次调整 -->
      <el-table-column label="" width="100" fixed>
        <template slot-scope="scope">
          <p v-if="scope.row.rowType === 1">计划完成</p>
          <p v-if="scope.row.rowType === 2">本次调整</p>
        </template>
      </el-table-column>

      <!-- 循环节点 -->
      <el-table-column v-for="(item, index) in nodeData" :key="'node_' + index" :label="item" :column-key="index" width="140">
        <template slot-scope="scope">
          <div v-if="scope.row[index]">
            <span v-if="scope.row[index].is_delete === 0">/</span>
            <div v-else-if="scope.row.rowType === 1">
              <!-- 计划完成：展示 -->
              <div v-if="scope.row.isShow">
                {{scope.row[index].time}}
              </div>
              <!-- 计划完成：修改 -->
              <div v-else>
                <el-popover popper-class="comPopover" :visible-arrow="false" placement="top" trigger="hover" :content="scope.row[index].maxMinText">
                  <div slot="reference" v-if="scope.row[index].submit_type === 2">
                    <el-input class="comTimeInput" size="mini" placeholder="请输入日期" maxlength="10"
                      :class="scope.row[index].error ? 'errorInput' : ''" v-model="scope.row[index].time"
                      @blur="blur_table(scope.$index, index, item, $event)"
                    ></el-input>
                  </div>
                  <span v-else class="hover" slot="reference" @click="edit(scope.$index, index, item)">
                    <span :class="scope.row[index].error ? 'red' : ''">{{scope.row[index].time}}</span>
                    <i class="el-icon-warning warningIcon" v-if="scope.row[index].error"></i>
                  </span>
                </el-popover>
              </div>
            </div>
            <!-- 本次调整 -->
            <div v-else-if="scope.row.rowType === 2">
              <div v-if="scope.row[index].submit_type === 2 && scope.row[index].error">
                <el-input class="comTimeInput" :class="scope.row[index].error ? 'errorInput' : ''" placeholder="请输入异常原因" type="textarea"
                  v-model="scope.row[index].change_remaark" size="mini"></el-input>
              </div>
              <div style="text-align: left;" v-if="scope.row[index].submit_type !== 2">
                <p v-if="scope.row[index].change_remaark">调整后：{{scope.row[index].change_plan_time || '未调整'}}</p>
                <p v-if="scope.row[index].change_remaark">原因：{{scope.row[index].change_remaark}}</p>
              </div>
            </div>
          </div>
          <span v-else></span>
        </template>
      </el-table-column>

    </el-table>

    <!-- 弹出层 -->
    <el-dialog class="comDialog" :title="d_data.title" :visible.sync="dialogVisible" width="80%" :close-on-click-modal="false" :close-on-press-escape="false">
      <!-- 弹出层：表单 -->
      <div class="lineBox">
        <div class="lineLabel">当前节点：</div>
        <div class="lineText">{{d_data.node_name}}</div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">系统计算日期：</div>
        <div class="lineText">{{d_data.first_plant_enddate}}</div>
        <div class="lineLabel">节点完成说明：</div>
        <div class="lineText">{{d_data.verification_remark}}</div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">是否调整日期：</div>
        <div class="lineText">
          <el-radio v-model="d_data.is_change" :label="1" @change="isChangeTime">是</el-radio>
          <el-radio v-model="d_data.is_change" :label="0" @change="isChangeTime">否</el-radio>
        </div>
        <div class="lineLabel">调整后日期：</div>
        <div class="lineText">
          <el-input class="comTimeInput" :class="d_data.error && d_data.is_change === 1 ? 'errorInput' : ''" slot="reference" size="mini" placeholder="请输入日期" maxlength="10"
            :disabled="d_data.is_change === 0 ? true : false"
            v-model="d_data.change_plan_time" @blur="blur_dialog('change_plan_time')"
          ></el-input>
        </div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">日期最小值：</div>
        <div class="lineText">
          {{d_data.min_plant_enddate}}
        </div>
        <div class="lineLabel">日期最大值：</div>
        <div class="lineText">
          {{d_data.max_plant_enddate}}
        </div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">
          <span class="red" v-if="d_data.error">*</span>
          调整/异常原因：</div>
        <div class="lineText">
          <el-input class="comInput2" v-model="d_data.change_remaark" size="mini" placeholder="请填写调整/异常原因"></el-input>
        </div>
      </div>
      <div class="lineBox" v-if="d_data.is_change === 1">
        <div class="lineLabel" style="width: auto;">&nbsp;&nbsp;&nbsp;是否根据当前节点的时间去计算其他节点：</div>
        <div class="lineText">
          <el-radio v-model="d_data.isComputedOther" :label="true">是</el-radio>
          <el-radio v-model="d_data.isComputedOther" :label="false">否</el-radio>
        </div>
      </div>
      <!-- 弹出层：按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="submit">保 存</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import Tool from '../../../store/tool.js'
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['listIndex', 'listType'], // 表格索引, 表格type
  data() {
    return {
      isShowAllNodes: false, // 是否显示：全部节点
      /* 审核 */
      shenheObj: {},
      /* 弹出层 */
      dialogVisible: false, // 弹出层：是否显示
      d_data: {} //            弹出层：数据
    }
  },
  created() {},
  computed: {
    ...mapState(['nodeData', 'itemSummaryDataList', 'qcArr', 'order_time', 'deliver_date']),
    ...mapGetters(['tableList'])
  },
  methods: {
    /**
     * [失焦：表格input]
     * @param {[Int]}    index    表格行索引
     * @param {[String]} nodeId   节点ID
     * @param {[String]} nodeName 节点名称
     * @param {[Object]} event    时间对象
     */
    blur_table(index, nodeId, nodeName, event) {
      let value = Tool._toggleTime(event.target.value)
      const node = this.tableList[index][nodeId]
      const { is_quote, first_plant_enddate } = node
      if (is_quote === 1 && (!value || value === '/')) {
        /* 报错还原：被引用 && （'' || '/'） */
        this.$message.error('此节点被其他节点引用，不可为空或/')
        value = ''
      }
      const is_change = first_plant_enddate !== value ? 1 : 0
      node.is_change = is_change
      node.time = value
      node.change_plan_time = is_change === 1 ? value : ''
      node.isComputedOther = true
      this.$store.commit('saveData', { name: 'changeIndexId', obj: `${index}_${nodeId}_${nodeName}` })
      this.$store.commit('saveData', { name: 'isComputed', obj: true })
    },
    /**
     * [弹出层：修改]
     * @param {[Int]}    index    行索引
     * @param {[String]} nodeId   节点ID
     * @param {[String]} nodeName 节点名称
     */
    edit(index, nodeId, nodeName) {
      // console.log(nodeName, this.tableList[index])
      const { order_time, deliver_date } = this
      const row = this.tableList[index]
      const { short_name } = row
      const { error, first_plant_enddate, time, change_remaark, is_change, change_plan_time, verification_remark, max_plant_enddate, min_plant_enddate, is_quote, isComputedOther = false } = row[nodeId]
      const node_name = short_name ? [short_name, nodeName].join(' > ') : nodeName
      /* 赋值 */
      const d_data = {
        index, //               行索引
        order_time, //          下单日期
        deliver_date, //        客人交期
        title: '节点调整', //    弹出层标题
        nodeId, //              节点ID
        error, //               是否报错
        node_name, //           当前异常节点
        nodeName, //            节点名称
        first_plant_enddate, // 系统计算日期
        time, //                当前时间
        verification_remark, // 异常原因
        max_plant_enddate, //   日期最大值
        min_plant_enddate, //   日期最小值
        is_change, //           是否调整日期
        isComputedOther, //     是否根据当前节点的时间去计算其他节点
        is_quote, //            是否被其他节点引用进行计算1是0否
        change_plan_time, //    调整后日期
        change_remaark //       调整/异常原因
      }
      this.d_data = d_data
      this.dialogVisible = true
    },
    /**
     * [弹出层：是否调整日期]
     */
    isChangeTime(event) {
      if (event === 0) {
        this.d_data.isComputedOther = false
        this.blur_dialog('first_plant_enddate')
      }
    },
    /**
     * [失焦：弹出层日期]
     * @param {[String]} name 属性名 { change_plan_time: '调整，日期失焦', first_plant_enddate: '不调整，日期还原' }
     */
    blur_dialog(name) {
      const { d_data } = this
      const { max_plant_enddate, min_plant_enddate, order_time, deliver_date, is_quote } = d_data
      const time = Tool._toggleTime(d_data[name])
      const { status } = Tool._isError(max_plant_enddate, min_plant_enddate, time, order_time, deliver_date)
      this.d_data.time = time
      this.d_data.error = (is_quote === 1 && time === '/') ? true : status
      this.d_data.change_plan_time = name === 'change_plan_time' ? time : ''
    },
    /**
     * [弹出层：保存]
     */
    submit() {
      const { d_data, tableList } = this
      const { index, nodeId, nodeName, error, time, change_plan_time, change_remaark, is_change, first_plant_enddate, is_quote, isComputedOther } = d_data
      /* 报错：报错 && 没写'调整/异常原因' */
      if (error && !change_remaark) {
        this.$message({ showClose: true, message: '请填写 调整/异常原因 后再保存', type: 'warning' })
        return false
      }
      /* 报错：变更 && 被引用 && （时间 === '' || 时间 === '/'） */
      if (is_change === 1 && is_quote === 1 && (change_plan_time === '' || change_plan_time === '/')) {
        this.$message({ showClose: true, message: '此节点被其他节点引用，不能为空或/', type: 'warning' })
        return false
      }
      /* 报错：变更 && （没写时间 || 系统计算时间 === 当前时间） */
      if (is_change === 1 && (!change_plan_time || first_plant_enddate === change_plan_time)) {
        this.$message({ showClose: true, message: '请修改 调整日期 后再保存', type: 'warning' })
        return false
      }
      /* ----- 保存 ----- */
      const node = tableList[index][nodeId]
      node.time = change_plan_time
      node.change_plan_time = change_plan_time
      node.is_change = is_change
      node.change_remaark = change_remaark
      node.isComputedOther = isComputedOther
      node.error = error
      if (is_change === 0) {
        node.time = time
        node.change_plan_time = ''
      }
      this.$store.commit('saveData', { name: 'changeIndexId', obj: `${index}_${nodeId}_${nodeName}` })
      this.$store.commit('saveData', { name: 'isComputed', obj: true })
      this.dialogVisible = false
    },
    /**
     * [表格：合并行]
     */
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex < 2) {
        const { count } = row
        if (count > 1) {
          return { rowspan: count, colspan: 1 }
        } else if (count === 1) {
          return { rowspan: 1, colspan: 1 }
        } else {
          return { rowspan: 0, colspan: 0 }
        }
      }
    },
    _getTime() {
      const d = new Date()
      const year = d.getFullYear()
      const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
      const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped>
.comTableBox {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.comTable {
  border-top: 0;
}

/*** 表格容器 ***/
.tableSelect {
  width: 100px;
}
</style>
