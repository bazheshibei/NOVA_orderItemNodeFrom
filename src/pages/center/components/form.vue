
<!-- 表单 -->

<template>
  <div class="">

    <div class="formLine">
      <!-- 业务类型 -->
      <div class="formLabel">业务类型：</div>
      <div class="formTextBox">
        <div class="formText">面料项目</div>
      </div>
      <!-- 项目信息 -->
      <div class="formLabel">项目信息：</div>
      <div class="formTextBox">
        <div class="formText">【面料项目】 -> 【ml001】 -> 【SZ-ML-0025】青年布</div>
      </div>
    </div>

    <div class="formLine">
      <!-- 变更原因 -->
      <div class="formLabel"><span class="red">*</span>变更原因：</div>
      <div class="formTextBox">
        <div class="formText">
          <el-select class="comFormSelect" v-model="asd_1" size="mini">
            <el-option class="comSelectOptions" label="合格" value="1"></el-option>
            <el-option class="comSelectOptions" label="不合格" value="0"></el-option>
          </el-select>
          <div class="otherModelBox">
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span class="red">您当前使用的模板已停用，是否更新为最新的模板？&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <el-radio v-model="asd_2" label="1">是</el-radio>
            <el-radio v-model="asd_2" label="0">否</el-radio>
          </div>
        </div>
      </div>
    </div>

    <div class="formLine">
      <!-- 变更说明 -->
      <div class="formLabel"><span class="red">*</span>变更说明：</div>
      <div class="formTextBox">
        <div class="formText">
           <!-- type="textarea" -->
          <el-input v-model="asd_3" size="mini" placeholder="请输入变更说明"></el-input>
        </div>
      </div>
    </div>

    <div class="formLine">
      <!-- 附件说明 -->
      <div class="formLabel">附件说明：</div>
      <div class="formTextBox">
        <div class="formText">
          <el-upload class="asd" action="#" multiple :file-list="[]"
            :on-preview="uploadLook" :http-request="uploadRequest" :before-remove="uploadRemove"
          >
            <el-button type="primary" size="mini" plain> + 上传附件</el-button>
          </el-upload>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      asd_1: '',
      asd_2: '',
      asd_3: ''
    }
  },
  methods: {
    /**
     * [上传附件：查看]
     */
    uploadLook(file) {
      const { is_pic, name, url } = file
      if (is_pic === 1) {
        /* 图片：预览 */
        window.open(url)
      } else {
        /* 文件：下载 */
        const a = document.createElement('a')
        a.href = url
        a.download = name
        a.click()
      }
    },
    /**
     * [上传附件：覆盖默认的上传行为]
     */
    uploadRequest(params) {
      const { file } = this.$store.state
      const { examine_goods_id } = this.examineGoods
      if (!file[examine_goods_id]) {
        file[examine_goods_id] = {}
      }
      file[examine_goods_id][params.file.uid] = params.file
      this.$store.commit('assignData', { name: 'file', obj: file })
    },
    /**
     * [上传附件：删除]
     * @param {[Object]} file 删除的图片信息
     */
    uploadRemove(file) {
      const { file: obj, del_files } = this.$store.state
      const { examine_goods_id } = this.examineGoods
      const { uid, acce_id } = file
      if (acce_id) {
        /* 删除数据：之前保存 */
        del_files.push(acce_id)
      } else {
        /* 删除数据：新上传 */
        delete obj[examine_goods_id][uid]
        this.$store.commit('assignData', { name: 'file', obj })
      }
    }
  }
}
</script>

<style scoped>
/*** 表单 ***/
.formLine { /* 单行 */
  width: 100%;
  font-size: 12px;
  display: flex;
}
.formLabel { /* 标题 */
  width: 80px;
  min-width: 80px;
  min-height: 34px;
  padding: 0 4px;
  border-right: 1px solid #DCDFE6;
  border-bottom: 1px solid #DCDFE6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.formTextBox {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}
.formText { /* 值 */
  white-space: nowrap;
  padding: 6px 10px;
  border-right: 1px solid #DCDFE6;
  border-bottom: 1px solid #DCDFE6;
  display: flex;
  align-items: center;
  flex: 1;
}
.formMiniText { /* 短框 */
  width: 200px;
  min-width: 200px;
  flex: 0;
}
.comSelectOptions { /* 下拉框 */
  margin-top: -3px;
}
.red {
  color: #F56C6C;
}
.otherModelBox { /* 其他模板 */
  display: flex;
  align-items: center;
}
</style>

<style>
/*** 上传 ***/
.asd { /* 整体容器 */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}
.asd > .el-upload-list { /* 列表 */
  display: flex;
  flex-wrap: wrap;
}
.asd > .el-upload-list > .el-upload-list__item { /* 单个文件 */
  width: auto !important;
  margin-top: 5px !important;
  margin-right: 10px !important;
  background: #F5F7FA !important;
}
.asd > .el-upload-list > .el-upload-list__item > .el-upload-list__item-name { /* 文件名 */
  margin-right: 25px !important;
}

/*** 下拉框 ***/
.comFormSelect {
  width: 150px !important;
  min-width: 150px !important;
}
</style>
