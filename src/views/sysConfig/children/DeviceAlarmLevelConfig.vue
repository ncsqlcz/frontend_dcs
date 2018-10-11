/*
 * @Author: liucz 
 * @Date: 2018-06-26 17:44:50 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-04 17:11:04
 */
<template>
  <section>
    <!--搜索 start-->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="6" class="text-left lh-40">
          <span>{{ '设备名称：' + deviceName }}</span>
          <span class="ml-3">{{ '设备编号：' + (deviceNumber || '') }}</span>
        </el-col>
        <el-col :span="18" class="text-right">
          <el-button type="primary" size="medium" icon="fa fa-plus" @click="handleAddToTemplate" :disabled="list.length === 0"> 数据添加到模板</el-button>
          <el-button type="primary" size="medium" icon="fa fa-share" @click="handleExportTemplate" :disabled="list.length === 0"> 导入模板数据</el-button>
          <el-button type="success" size="medium" icon="fa fa-save" @click="handleSave" :disabled="list.length === 0"> 保存</el-button>
          <el-button type="" size="medium" icon="" @click="handleResetData" :disabled="list.length === 0"> 重置</el-button>
        </el-col>
      </el-form>
    </el-col>
    <!--搜索 end-->
    
    <!--列表 start-->
    <el-table :data="list" v-loading="visible.listLoading" class="table-header-no-padding">
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="parameter_name" label="参数名称" sortable></el-table-column>
      <el-table-column prop="paramter_unit" label="参数单位" sortable></el-table-column>
      <el-table-column v-for="(item, index) in alarmColorList" :key="index"
        prop="parameter_level" :label="item.value" :index="index" :render-header="renderTableHeader">
        <template slot-scope="scope">
          <!-- <span>{{ item.value }}</span> -->
          <!-- <div class="text-center">{{ scope.row.parameter_level[item.value] }}</div> -->
          <el-input-number size="small" v-model="scope.row.parameter_level[item.value]"
            :step="1" :controls="false" style="width: 100%;"></el-input-number>
        </template>
      </el-table-column>
    </el-table>
    <!--列表 end-->

    <!--分页start -->
    <el-col :span="24" class="toolbar hidden">
      <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                     :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>
    <!--分页end -->

    <!-- 导入模板数据弹窗 -->
    <el-dialog title="导入模板数据" :visible.sync="visible.templateDialog" width="60%" class="mes-dialog">
      <!-- 搜索 start -->
      <el-col class="toolbar">
        <el-form :inline="true" :model="templateFilters" @submit.native.prevent class="text-right">
          <el-form-item>
            <el-input type="text" size="small" v-model.trim="templateFilters.keyword"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click.native="getTemplateList" icon="el-icon-search" size="small">查询</el-button>
            <el-button type="" @click.native="resetTemplate" icon="" size="small">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!-- 搜索 end -->
      
      <!--列表 start-->
      <el-table :data="templateList" v-loading="visible.templateListLoading"
                row-class-name="el-mini-row pointer"
                highlight-current-row>
        <el-table-column type="index" :index="getTemplateIndex" label="序号"></el-table-column>
        <el-table-column prop="warning_device_parameter_conf_template_name" label="模板名称" sortable></el-table-column>
        <el-table-column prop="" label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="exportTemplate(scope.row)" icon="" size="small">导入数据</el-button>
            <el-button type="text" @click="handleEditTemplate(scope.row)" icon="" size="small">修改模板名称</el-button>
            <el-button type="text" @click="handleViewTemplate(scope.row)" icon="" size="small">查看参数</el-button>
            <el-button type="text" @click="handelRemoveTemplate(scope.row)" icon="" size="small">删除模板</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--列表 end-->

      <!--分页 start -->
      <el-col :span="24" class="toolbar hidden">
        <el-pagination layout="total, sizes, prev, pager ,next" :page-size="templateFilters.pageSize"
                      :total="templateFilters.total" @current-change="handleTemplatePageChange" @size-change="handleTemplateSizeChange">
        </el-pagination>
      </el-col>
      <!--分页 end -->
      <div slot="footer" class="dialog-footer mt-0">
        <el-button size="medium" @click="visible.templateDialog = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 查看模板参数弹窗 -->
    <el-dialog :title="templateName" :visible.sync="visible.parameterDialog" width="80%" class="mes-dialog">
      <!-- 报警级别颜色表格组件 -->
      <alarm-level-table type="level" :templateId="templateId" :multiple="false"
        :result-random="resultRandomNumber" @selected="handleSelected"></alarm-level-table>
      <div slot="footer" class="dialog-footer mt-3">
        <el-button size="medium" @click="visible.parameterDialog = false">关闭</el-button>
      </div>
    </el-dialog>
    
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import {
    queryWarningDeviceParamLevel, saveWarningDeviceParamLevel,
    queryTemplateBasic, saveTemplateWarningParamLevel,
    modifyParamTemplate, removeParamTemplate, queryParamTemplate
    } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import AlarmLevelTable from '../components/AlarmLevelTable.vue'
  export default {
    name: 'Device-Alarm-Level-Config',
    data () {
      return {
        filters: {
          deviceId: this.$route.params.id,
          keyword: '',
          type: 'level',
          pageSize: 10000,
          page: 1,
          total: 0
        },
        confId: this.$route.query.confId,
        list: [],
        visible: {
          listLoading: true,
          templateListLoading: true,
          templateDialog: false,
          parameterDialog: false
        },
        alarmColorList: [],
        // 模板名称列表
        templateList: [],
        templateFilters: {
          type: 'level',
          keyword: '',
          // pageSize: 10,
          // page: 1,
          // total: 0
        },
        deviceName: this.$route.query.name,
        deviceNumber: this.$route.query.number,
        templateName: '',
        deviceId: '',
        templateId: '',
        resultRandomNumber: 0,
      }
    },
    computed: {
      ...mapGetters(['getAlarmColorList'])
    },
    components: { AlarmLevelTable },
    mounted () {
      this.deviceId = this.filters.deviceId
      this.getList()
      this.initAlarmColorList().then(() => {
        let arr1 = []
        let arr2 = []
        this.getAlarmColorList.forEach(item => {
          arr1.push(utils.deepCopy(item))
          arr2.push(utils.deepCopy(item))
          // U1-U5
          arr2[arr2.length - 1].value = 'U' + arr2[arr2.length - 1].value.split('L')[1]
        })
        // console.log(arr1, arr2)
        this.alarmColorList = [...arr1, ...arr2.reverse()]
        // console.log(this.alarmColorList)
      })
    },
    methods: {
      ...mapActions(['initAlarmColorList', 'getEmptyLevelData']),
      // 列表
      getList () {
        this.visible.listLoading = true
        queryWarningDeviceParamLevel(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            // this.filters.total = res.map.line
            this.filters.total = res.map.warningDeviceParameters.length
            res.map.warningDeviceParameters.forEach(item => {
              if (item.level_warning_kv) {
                item.parameter_level = JSON.parse(item.level_warning_kv)
              } else {
                item.parameter_level = this.getEmptyLevelData()
              }
            })
            this.list = res.map.warningDeviceParameters
          } else {
            this.filters.total = 0
            this.list = []
          }
          this.visible.listLoading = false
        })
      },
      //  页面改变
      handlePageChange (val) {
        this.filters.page = val
        this.getList()
      },
      //  每页数量改变
      handleSizeChange (val) {
        this.filters.pageSize = val
        this.getList()
      },
      // 列表索引
      getIndex (index) {
        return utils.getHeadNumAdapter(this.filters.page, this.filters.pageSize, index)
      },
      // 重置
      reset () {
        this.filters = {
          deviceId: this.$route.params.id,
          keyword: '',
          type: 'level',
          pageSize: 10000,
          page: 1,
          total: 0
        }
        this.getList()
      },
      // 数据添加到模板
      handleAddToTemplate () {
        if (this.checkLevelData(this.list)) {
          this.$prompt('模板名称', '数据添加到模板', {
            inputValidator: (value) => {
              if (value && value.split('').length > 20) {
                return '名称不能多于20个字'
              }
              return value ? true : '模板名称不能为空'
            }
          }).then(data => {
            let param = {
              type: this.filters.type,
              templateName: data.value.trim(),
              deviceParams: this.getDeviceParamsString('addToTemplate')
            }
            saveTemplateWarningParamLevel(param).then(res => {
              if (res.status === 0) {
                this.$message.success('保存成功')
              } else {
                this.$message.warning(res.msg || '失败')
              }
            })
          }).catch(() => {})
        }
      },
      // 点击导入模板数据
      handleExportTemplate (row) {
        this.visible.templateDialog = true
        this.getTemplateList()
      },
      // 序列化级别参数
      getDeviceParamsString (type) {
        let arr = []
        this.list.forEach(item => {
          let data = {
            device_id: item.device_id,
            device_parameter_id: item.device_parameter_id,
            parameter_name: item.parameter_name,
            paramter_unit: item.paramter_unit
          }
          if (type === 'save') {
            data.level_warning_kv = JSON.stringify(Object.assign({}, this.getEmptyLevelData(), item.parameter_level))
            data.warning_device_parameter_id =  item.warning_device_parameter_id // 不传，参数列表数据保存后会翻倍
          } else {
            // 保存为模板 特殊处理
            data.level_window_warning_kv = JSON.stringify(Object.assign({}, this.getEmptyLevelData(), item.parameter_level))
          }
          arr.push(data)
        })
        return JSON.stringify(arr)
      },
      // 保存
      handleSave () {
        return new Promise((resolve, reject) => {
          if (this.checkLevelData(this.list)) {
            let param = {
              type: this.filters.type,
              confId: this.confId,
              deviceParams: this.getDeviceParamsString('save')
            }
            saveWarningDeviceParamLevel(param).then(res => {
              if (res.status === 0) {
                this.$message.success('保存成功')
                resolve()
              } else {
                this.$message.warning(res.msg || '保存失败')
              }
            })
          }
        })
      },
      // 严格数据校验 - 所有都填且必须正确
      checkLevelDataStrict (list) {
        let keys = this.alarmColorList.map(v => v.value)
        for (let i = 0; i < list.length; i++) {
          for (let j = 0; j < keys.length; j++) {
            // console.log(i, keys[j], list[i].parameter_level[keys[j]])
            // 上限 下限 label
            let leftLabel = ''
            let rightLabel = ''
            if (j < 5) {
              leftLabel = 'L' + keys[j].split('')[1] + '上限'
            } else {
              leftLabel = 'L' + keys[j].split('')[1] + '下限'
            }
            // 上限 下限 value
            let leftValue = list[i].parameter_level[keys[j]]
            let rightValue = ''
            if (j !== keys.length - 1) {
              rightValue = list[i].parameter_level[keys[j + 1]]
              if (j + 1 < 5) {
                rightLabel = 'L' + keys[j + 1].split('')[1] + '上限'
              } else {
                rightLabel = 'L' + keys[j + 1].split('')[1] + '下限'
              }
              if (parseFloat(leftValue) <= parseFloat(rightValue)) {
                this.$message.info(`第 ${i + 1} 行: ${rightLabel} 不能大于 ${leftLabel} `)
                return false
              }
            }
            if (leftValue === '' || leftValue === null || leftValue === undefined) {
              this.$message.info(`第 ${i + 1} 行: ${leftLabel} 不能为空`)
              return false
            }
          }
        }
        return true
      },
      // 数据校验 - L1 和 U1 必须要填，其它可填可不填
      checkLevelData (list) {
        let keys = this.alarmColorList.map(v => v.value)
        // 遍历所有数据
        for (let i = 0; i < list.length; i++) {
          // 遍历每一行的每一个key
          for (let j = 0; j < keys.length; j++) {
            let leftLabel = ''
            let rightLabel = ''
            if (j < 5) {
              leftLabel = 'L' + keys[j].split('')[1] + '上限'
            } else {
              leftLabel = 'L' + keys[j].split('')[1] + '下限'
            }
            // 当前遍历的前一个值
            let prevValue = ''
            // 当前遍历的值
            let leftValue = list[i].parameter_level[keys[j]]
            // 当前遍历 的下一个值
            let rightValue = ''

            // L1 和 U1 必须要填
            if (keys[j] === 'L1' || keys[j] === 'U1') {
              if (leftValue === undefined || leftValue === '') {
                this.$message.info(`第 ${i + 1} 行: ${leftLabel} 不能为空`)
                return false
              }
            }

            // 不是最后一个，也不是第一个；左边的值应该大于右边的值
            if (
              j !== keys.length - 1 ||
              j > 0 &&
              leftValue !== undefined &&
              rightValue !== undefined
            ) {
              // 遍历所有右边非空的值
              for (let k = j + 1; k < keys.length; k++) {
                rightValue = list[i].parameter_level[keys[k]]
                if (k < 5) {
                  rightLabel = 'L' + keys[k].split('')[1] + '上限'
                } else {
                  rightLabel = 'L' + keys[k].split('')[1] + '下限'
                }
                if (parseFloat(leftValue) <= parseFloat(rightValue)) {
                  this.$message.info(`第 ${i + 1} 行: ${rightLabel} 不能大于或等于 ${leftLabel} `)
                  return false
                }
              }
            }
          }
        }
        return true
      },
      // 重置
      handleResetData () {
        this.$confirm('确认清空表格数据吗？', '提示', {
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.list.forEach(item => {
              for (let key in item.parameter_level) {
                item.parameter_level[key] = undefined
              }
            })
            this.$message.info('表格数据已清空')
          }
        }).catch(() => {})
      },
      renderTableHeader(createElement, col) {
        // console.log(col)
        let label = ''
        if (col.$index < 3 + 5) {
          label = 'L' + col.column.label.split('')[1] + '上限'
        } else {
          label = 'L' + col.column.label.split('')[1] + '下限'
        }
        return createElement(
          'div',
          {
            'class': 'text-center neg-margin-lr',
            style: { backgroundColor: this.alarmColorList[col.column.index].color, color: '#fff'},
            attrs: { type: 'text' },
          }, [label]
        )
      },
      // 列表
      getTemplateList () {
        this.visible.templateListLoading = true
        queryTemplateBasic(this.templateFilters).then((res) => {
          if (res.status === 0) {
            // this.templateFilters.page = res.map.page
            // this.templateFilters.total = res.map.line
            this.templateFilters.total = res.map.template.length
            this.templateList = res.map.template
          } else {
            this.templateFilters.total = 0
            this.templateList = []
          }
          this.visible.templateListLoading = false
        })
      },
      //  页面改变
      handleTemplatePageChange (val) {
        this.templateFilters.page = val
        this.getTemplateList()
      },
      //  每页数量改变
      handleTemplateSizeChange (val) {
        this.templateFilters.pageSize = val
        this.getTemplateList()
      },
      // 列表索引
      getTemplateIndex (index) {
        return utils.getHeadNumAdapter(this.templateFilters.page, this.templateFilters.pageSize, index)
      },
      // 重置
      resetTemplate () {
        this.templateFilters = {
          type: this.filters.type,
          keyword: '',
          // pageSize: 10,
          // page: 1,
          // total: 0
        }
        this.getTemplateList()
      },
      // 导入数据
      exportTemplate (row) {
        console.log(row)
        queryParamTemplate({
          type: this.filters.type,
          templateId: row.warning_device_parameter_conf_template_id,
          pageSize: 1000,
          page: 1
        }).then(res => {
          if (res.status === 0 && res.map.template.length > 0) {
            // 合并数据 - 按行合并，多余的舍弃
            res.map.template.forEach((item, index) => {
              if (this.list.length > index) {
                this.list[index].parameter_level = JSON.parse(item.level_window_warning_kv)
              }
            })
            this.$forceUpdate()
            this.visible.templateDialog = false
            this.$message.success('成功')
          } else {
            this.$message.warning(res.msg || '失败')
          }
        })
      },
      // 修改模板名称
      handleEditTemplate (row) {
        // console.log(row)
        this.$prompt('模板名称', '数据添加到模板', {
          inputValue: row.warning_device_parameter_conf_template_name,
          inputValidator: (value) => {
            if (value && value.split('').length > 20) {
              return '名称不能多于20个字'
            }
            return value ? true : '模板名称不能为空'
          }
        }).then(res => {
          let param = {
            templateId: row.warning_device_parameter_conf_template_id,
            templateName: res.value.trim()
          }
          modifyParamTemplate(param).then(res => {
            if (res.status === 0) {
              this.$message.success('成功')
              this.getTemplateList()
            } else {
              this.$message.warning(res.msg)
            }
          })
        }).catch(() => {})
      },
      // 查看参数查看参数
      handleViewTemplate (row) {
        this.visible.parameterDialog = true
        this.templateName = row.template_name
        this.$nextTick(() => {
          this.templateId = row.warning_device_parameter_conf_template_id
        })
      },
      // 删除模板
      handelRemoveTemplate (row) {
        // console.log(row)
        this.$confirm('确认删除吗？', '提示', {
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            removeParamTemplate({
              type: this.filters.type,
              templateId: row.warning_device_parameter_conf_template_id
            }).then(res => {
              if (res.status === 0) {
                this.$message.success('已删除')
                this.getTemplateList()
              } else {
                this.$message.warning(res.msg || '失败')
              }
            })
          }
        }).catch(() => {})
      },
      handleSelected (rows) {
        console.log(rows)
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
</style>