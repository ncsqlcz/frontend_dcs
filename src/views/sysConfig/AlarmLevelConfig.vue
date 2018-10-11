/*
 * @Author: liucz 
 * @Date: 2018-06-26 15:26:51 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-08 17:23:10
 */
<template>
  <section>
    <!-- 操作提示组件 -->
    <operation-tips video="">
      <span class="color-999">配置全系统的报警配置，在模块的配置中会使用到全系统的报警配置参数</span>
    </operation-tips>

    <!-- 报警种类 -->
    <div class="card lh-40 my-2">
      <div class="title-name">报警种类</div>
      <el-row class="transparent mb-2">
        <el-col :span="24">
          <el-button type="primary" size="medium" icon="el-icon-plus" @click="visible.dialog = true">新增种类</el-button>
        </el-col>
      </el-row>
      <el-table :data="getAlarmTypeList" highlight-current-row v-loading="visible.listLoading"
        style="max-width: 900px;" class="px-3 pb-3">
        <el-table-column prop="label" label="报警名称" width="220" sortable></el-table-column>
        <el-table-column prop="warningLevels" label="对应的报警级别">
          <template slot-scope="scope">
            <el-checkbox
              v-for="(item, index) in getAlarmColorList" :key="item.value"
              v-model="scope.row.alarm_level[item.value]" size="medium"
              :label="item.label" true-label="1" false-label="0"
              @change="handleLevelChange(scope, item.value)"
              :disabled="index === getAlarmColorList.length - 1"></el-checkbox>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 报警级别 -->
    <div class="card lh-40 my-2">
      <div class="title-name">报警级别</div>
      <el-table :data="getAlarmColorList" v-loading="visible.listLoading"
        style="max-width: 800px;" class="px-3 pb-3">
        <el-table-column prop="value" label="报警等级" width="200" sortable></el-table-column>
        <el-table-column prop="label" label="名称">
          <template slot-scope="scope">
            <el-input type="text" size="small" class="el-input-no-border" style="width: 160px;"
              v-model.trim="scope.row.label" @blur="handleColorAndNameChange(scope.row)"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="color" label="报警颜色">
          <template slot-scope="scope">
            <el-color-picker class="no-clear" v-model="scope.row.color" @change="handleColorAndNameChange(scope.row, 'color')"></el-color-picker>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增报警种类弹窗 -->
    <el-dialog :visible.sync="visible.dialog" title="新增报警种类"
      :before-close="resetAddForm" width="40%">
      <el-form :inline="false" :model="addForm" @submit.native.prevent :rules="addFormRules" ref="addForm">
        <el-form-item label="名称" prop="name">
          <el-input type="text" size="medium" v-model.trim="addForm.name" placeholder="请输入新增种类名称"></el-input>
        </el-form-item>
        <el-form-item label="对应报警级别" prop="alarmLevel">
          <br>
          <el-checkbox
              v-for="(item, index) in getAlarmColorList" :key="item.value"
              v-model="addForm.alarmLevel[item.value]" size="medium" border
              :label="item.label" true-label="1" false-label="0"
              @change="handleAddFormLevelChange(item)"
              :disabled="index === getAlarmColorList.length - 1"></el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" size="medium" @click="addAlarmType">确定</el-button>
        <el-button type="" size="medium" @click="visible.dialog = false; resetAddForm(null)">取消</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import {
    modifyWarningLevel, saveWarningCategory,
    modifyWarningCategory
    } from '../../api/api'
  import OperationTips from '@/components/OperationTips.vue'
  import { mapActions, mapGetters } from 'vuex'
  export default {
    name: 'Alarm-Level-Config',
    data () {
      return {
        filters: {
          keyword: '',
          type: '',
          pageSize: 10,
          page: 1,
          total: 0
        },
        list: [],
        visible: {
          listLoading: true,
          dialog: false
        },
        addForm: {
          name: '',
          alarmLevel: {'L5': '1', 'L4': '1', 'L3': '1', 'L2': '1', 'L1': '1'}
        },
        addFormRules: {
          name: [{ required: true, message: '名称不能为空', trigger: 'blur'}]
        }
      }
    },
    components: { OperationTips },
    computed: {
      ...mapGetters(['getAlarmColorList', 'getAlarmTypeList', 'getAlarmColorDict'])
    },
    mounted () {
      this.initAlarmColorList().then(res => {
        this.visible.listLoading = false
      })
      this.initAlarmTypeList()
      this.initPage()
    },
    methods: {
      ...mapActions(['initAlarmColorList', 'initAlarmTypeList']),
      initPage () {
      },
      // 颜色改变
      handleColorAndNameChange (row, type) {
        // console.log(row)
        if (row.label === '') {
          this.$message.info('名称不能为空！已恢复为默认名称')
          row.label = row.warning_level_name
          return
        }
        if ((row.color && row.warning_level_name !== row.label) || type === 'color') {
          let param = {
            levelId: row.warning_level_id,
            color: row.color,
            warningName: row.label
          }
          modifyWarningLevel(param).then(res => {
            if (res.status === 0) {
              this.$message.success('已保存')
              this.initAlarmColorList()
            } else {
              this.$message.warning(res.msg || '保存失败')
            }
          })
        }
      },
      // 报警级别改变
      handleLevelChange (scope, level) {
        // 前两个报警种类是单选，需要特殊处理
        if (scope.row.warning_category_name === '停机报警' || scope.row.warning_category_name === '离线报警') {
          for (let key in scope.row.alarm_level) {
            if (key !== level && key !== 'L1') {
              scope.row.alarm_level[key] = '0'
            }
          }
        }
        // 选中的报警级别id
        let selectedIds = []
        for (let key in scope.row.alarm_level) {
          if (scope.row.alarm_level[key] === '1') {
            this.getAlarmColorList.forEach(item => {
              if (item.value === key) {
                selectedIds.push(item.warning_level_id)
              }
            })
          }
        }
        let param = {
          warningCategoryLevelId: scope.row.warning_conf_category_level_id,
          warningCategoryLevelIds: selectedIds.join(',')
        }
        modifyWarningCategory(param).then(res => {
          if (res.status === 0) {
            this.$message.success('已保存')
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      // 新增的时候级别改变
      handleAddFormLevelChange (item) {},
      // 重置新增表单
      resetAddForm (done) {
        this.$refs.addForm.resetFields()
        for (let key in this.addForm.alarmLevel) {
          this.addForm.alarmLevel[key] = '1'
        }
        done && done()
      },
      // 新增
      addAlarmType () {
        this.$refs.addForm.validate(valid => {
          let param = {
            warningCategoryName: this.addForm.name,
            warningLevelIds: []
          }
          let count = 0
          for (let key in this.addForm.alarmLevel) {
            if (key !== 'L1' && this.addForm.alarmLevel[key] === '1') {
              count++
            }
            if (this.addForm.alarmLevel[key] === '1') {
              param.warningLevelIds.push(this.getAlarmColorDict[key].warning_level_id)
            }
          }
          param.warningLevelIds = param.warningLevelIds.join(',')
          if (count === 0) {
            this.$message.warning('至少选择一个报警级别')
            return false
          }
          if (valid) {
            saveWarningCategory(param).then(res => {
              if (res.status === 0) {
                // 成功
                this.$message.success('成功')
                this.resetAddForm(null)
                this.visible.dialog = false
                this.initAlarmTypeList()
              } else {
                this.$message.warning(res.msg || '失败')
              }
            })
          }
        })
      }
    },
    watch: {}
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
<style>
.el-input-no-border input {
  border: none !important;
}
</style>

