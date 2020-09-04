
<!-- 审核列表 -->

<template>
  <div class="pageBox">

    <div class="pageTopBox">
      <!-- 顶部 -->
      <com-top></com-top>
      <!-- 表格 -->
      <com-table></com-table>
    </div>

    <!-- 下一步 -->
    <div class="bottomBox">
      <el-button type="primary" size="mini" plain @click="submit(1)">暂存草稿</el-button>
      <el-button type="primary" size="mini" @click="submit(2)">提交审核</el-button>
    </div>

    <!-- 选择模板 -->
    <el-dialog class="comDialog" title="请选择模板" :visible.sync="choiceTemplate" width="50%" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="margin-bottom: 10px;" v-for="item in ganttTemplate" :key="item.node_template_id">
        <el-radio v-model="templateId" :label="item.node_template_id" border size="mini">
          {{item.template_name}}
        </el-radio>
      </div>
      <el-button slot="footer" size="mini" type="primary" :disabled="!templateId" @click="choice">确定</el-button>
    </el-dialog>

    <span style="display: none;">{{tableList}}</span>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ComTop from './components/top.vue' //       顶部
import ComTable from './components/table.vue' //   表格
import ComRecord from './components/record.vue' // 历史审核记录
export default {
  components: { ComTop, ComTable, ComRecord },
  data() {
    return {
      choiceTemplate: false, // 是否选择模板
      ganttTemplate: [],
      templateId: ''
    }
  },
  created() {
    /** 请求：初始数据 **/
    this.$store.dispatch('A_submitDividingGanttSummary')

    try {
      /* 平台方法 */
      // eslint-disable-next-line
      dg.removeBtn('cancel')
      // eslint-disable-next-line
      dg.removeBtn('saveAndAdd')
      // eslint-disable-next-line
      dg.removeBtn('saveAndClose')
      // eslint-disable-next-line
      dg.removeBtn('saveNoClose')
    } catch (err) {
      //
    }
  },
  watch: {
    '$store.state.ganttTemplate'() {
      const { ganttTemplate } = this.$store.state
      if (ganttTemplate.length === 1) {
        this.$store.commit('saveData', { name: 'activeTemplateId', obj: ganttTemplate[0].node_template_id })
      } else if (ganttTemplate.length > 1) {
        this.choiceTemplate = true // 选择模板
      }
      this.ganttTemplate = ganttTemplate
    }
  },
  computed: {
    ...mapState(['activeTemplateId']),
    ...mapGetters(['tableList'])
  },

  methods: {
    /**
     * [选中模板]
     */
    choice() {
      const { templateId } = this
      if (templateId) {
        this.$store.commit('saveData', { name: 'activeTemplateId', obj: templateId })
        this.choiceTemplate = false
        /** 请求：模板明细 **/
        this.$store.dispatch('A_getNodeTempleteDetail')
      }
    },
    /**
     * [提交]
     * @param {[Int]} audit_status 审核状态1暂存2提交审核6无审核直接通过
     */
    submit(audit_status) {
      /** 请求：提报 **/
      this.$store.dispatch('A_savePlantMterialGanttNode', { audit_status })
    },
    /**
     * [关闭]
     */
    clickClose() {
      // eslint-disable-next-line
      dg.close()
    }
  }
}
</script>

<style scoped>
.pageBox {
  width: 100%;
  height: 100%;
  font-size: 12px;
  background: #ffffff;
  overflow-y: hidden;
}

.pageTopBox {
  width: 100%;
  height: calc(100% - 40px);
  margin-bottom: 40px;
  overflow-y: auto;
}

/*** 底部 ***/
.bottomBox {
  width: calc(100% - 30px);
  padding: 6px 15px;
  border-top: 1px solid #EBEEF5;
  display: flex;
  justify-content: flex-end;
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>

<style>
/*** 模块刷新 ***/
.f5 {
  color: #909399;
  cursor: pointer;
  padding: 0 6px;
}

/*** 表格字体 ***/
.el-table {
  font-size: 12px !important;
}
/*** 重置表头单元格 ***/
.el-table > div th, .el-table > div th > .cell {
  padding: 0 !important;
}
.el-table > div th > .cell .thText {
  padding: 5px 10px;
}
th > .cell, th > .cell .thText {
  text-align: center;
}
/*** 表头输入内容 ***/
.thActive {
  color: #000000 !important;
  /* color: #ffffff;
  background: #409EFF; */
}
/*** 单元格 ***/
td {
  padding: 0 !important;
}
.cell p {
  line-height: 16px !important;
  margin: 4px 0 !important;
}
td > .cell {
  text-align: center;
}

/*** 分页 ***/
.comPagination {
  padding: 0;
}
.comPagination > .el-pagination__sizes { /* 总条数 */
  margin: 0 0 0 30px;
}
.comPagination > .el-pagination__sizes > .el-select > .el-input--suffix { /* 总条数 */
  margin-right: 0;
}

/*** 悬浮框 ***/
.el-popover {
  padding: 6px;
}
.el-popover > div > input {
  height: 26px;
  font-size: 12px !important;
  display: flex;
  align-items: center;
}
.el-popover > div > .el-input__suffix { /* input 中删除按钮 */
  margin-top: -6px;
}
.comPopover {
  color: #409EFF;
  font-size: 12px !important;
  background: #ecf5ff;
  border-color: #b3d8ff;
}

/*** 单选 ***/
.el-radio {
  margin-right: 20px !important;
}
.el-radio > .el-radio__label {
  font-size: 12px;
  margin-right: 0 !important;
}

/*** 下拉框 ***/
.comSelectOptions { /* 下拉框：单个选项 */
  height: 25px !important;
  font-size: 12px !important;
  line-height: 25px !important;
  padding: 0 10px !important;
}
.comSelectInput > .el-input__inner { /* input */
  height: 28px !important;
  text-align: center;
}
.comSelectInputLeft > .el-input__inner { /* input */
  height: 28px !important;
  text-align: left;
}

/*** 弹出层 ***/
.comDialog > .el-dialog > .el-dialog__body {
  padding: 10px 20px !important;
}
</style>
