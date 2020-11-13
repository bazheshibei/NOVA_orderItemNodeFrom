
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
      <div>
        <el-button type="primary" size="mini" :disabled="!isHaveNewData" plain @click="submit(1)">暂存草稿</el-button>
        <el-button type="primary" size="mini" :disabled="!isHaveNewData" @click="submit(2)">提交审核</el-button>
      </div>
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
import ComTop from './components/top.vue' //     顶部
import ComTable from './components/table.vue' // 表格
export default {
  components: { ComTop, ComTable },
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
    ...mapState(['activeTemplateId', 'isHaveNewData']),
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
  /* border-top: 1px solid #EBEEF5; */
  display: flex;
  justify-content: flex-end;
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>
