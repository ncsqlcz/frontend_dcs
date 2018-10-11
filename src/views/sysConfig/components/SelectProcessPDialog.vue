/*
import func from './vue-temp/vue-editor-bridge';
 * @Author: Zhangshitu 
 * @Date: 2018-06-30 09:23:58 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-17 11:27:16
 */
<template>
  <section>
    <el-dialog width="50%" :title="title" :visible.sync="visible.dialog">
      <div class="card mb-3">
        <div class="title-name mb-3">工序通用参数</div>
        <el-button class="mb-3" type="primary" @click="selectProcessParameters" v-if="visible.closable">选择通用参数</el-button>
        <div v-loading="visible.loading">
          <el-tag class="mr-3 mb-3"
            v-for="data in generalParameters"
            :key="data.process_scene_param_id"
            :closable="visible.closable"
            :disable-transitions="false"
            @close="handleClose(data)"
            type="primary">
            {{data.process_scene_param_name}}
          </el-tag>
          <span v-if="generalParameters.length === 0">无</span>
        </div>
      </div>
      <div class="card">
        <div class="title-name mb-3">工序特定参数</div>
        <el-row v-if="visible.closable">
          <el-col :span="24" class="color-999">多个工序参数请用转行区分（一行一个工序参数）</el-col>
          <el-col :span="24" class="mt-3">
            <el-input type="textarea" v-model.trim="textValue" :autosize="{ minRows: 10 }" spellcheck="false" style="font-size: 16px;"></el-input>
          </el-col>
        </el-row>
        <el-card class="box-card" v-if="!visible.closable" shadow="never">
          <div class="text item mb-2 text-center" style="font-size: 16px;">
            <span>{{textValue}}</span>
          </div>
        </el-card>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmParameters">确 定</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  export default {
    name: 'Select-Process-Dialog',
    data () {
        return {
          generalParameters: [],
          specificParameters: [],
          processparameters: [],
          textValue: '',
          visible: {
            dialog: false,
            closable: true,
            loading: false,
          }
        }
    },
    props: {
        title: String,
        dialog: Boolean,
        visibleLoading: Boolean,
        type: String,
        warningUnitId: String,
        currency: Array,
        special: Array
    },
    computed: {
    },
    mounted () {
      this.initType()
    },
    methods: {
      initType () {
        if (this.type === 'check') {
          this.visible.closable = false
        } else {
          this.visible.closable = true
        }
      },
      // 点击关闭标签
      handleClose(data) {
        this.generalParameters.splice(this.generalParameters.indexOf(data), 1);
        this.$emit('getVisibleLoading', true)
        this.checkSpecificParameters()
      },
      // 选择工序参数
      selectProcessParameters () {
        let selectedIds = []
        this.generalParameters.forEach((data) => {
          selectedIds.push(data.process_scene_param_id)
        })
        this.$mesCommonProcessParameters.show('选择工序参数', {
          reRender: true,
          multiple: true,
          selectedIds: selectedIds
        }).then(res => {
          this.$emit('getVisibleLoading', true)
          this.generalParameters = res.rows
          this.checkSpecificParameters()
        })
      },
      // 点击确认
      confirmParameters () {
        // 取消弹窗
        this.visible.dialog = false
        this.checkSpecificParameters()
      },
      checkSpecificParameters () {
        if (this.textValue === '') {
          this.specificParameters = []
        } else {
          this.specificParameters = this.textValue.split('\n')
          // 去除空数据
          for (let i = 0; i < this.specificParameters.length; i++) {
            if (this.specificParameters[i].trim() === '') {
              this.specificParameters.splice(i, 1)
              i--
            } else {
              this.specificParameters[i] = this.specificParameters[i].trim()
            }
          }
          if (this.checkMaxLength() === false) {
            return false
          }
        }
        this.processparameters = {
          warningUnitPara: this.generalParameters,
          paraNames: this.specificParameters.join(',')
        }
        this.$emit('processParameter', this.processparameters)
      },
      // 最多输入多少行
      checkMaxLength () {
        if (this.specificParameters.length > 30) {
            this.$message.warning(`最多不超过30行数据`)
            return false
          }
          return true
      },
      // 初始化数据
      Initialization () {
        this.generalParameters = []
        this.textValue = ''
        if (this.currency.length !== 0) {
          this.generalParameters = this.currency
        }
        if (this.special.length !== 0) {
          this.textValue = this.special.join('\n')
        }
      }
    },
    watch: {
      'visible.dialog': function (val) {
        this.$emit('visibleDialog', val)
      },
      dialog (val) {
        this.visible.dialog = val
        // 初始化数据
        this.Initialization()
      },
      visibleLoading (val) {
        this.visible.loading = val
         // 初始化数据
        this.Initialization()
      },
      type () {
        this.initType()
      },
      warningUnitId () {
        // 
      }
    }
  }
</script>

<style scoped lang="scss">
@import '~scss_vars';
.card {
  h2{
    margin: 0 0;
    margin-top: 12px;
  }
  .title-name {
    font-size: 18px;
    &::before{
      content: '';
      display: inline-block;
      height: 20px;
      width: 8px;
      background-color: $color-active;
      vertical-align: middle;
      margin-right: 8px;
    }
  }
}
</style>