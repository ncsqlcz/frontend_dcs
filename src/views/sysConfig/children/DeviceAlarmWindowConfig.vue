/*
 * @Author: liucz 
 * @Date: 2018-06-28 14:36:17 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-04 17:19:31
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
    <el-table :data="list" v-loading="visible.listLoading">
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="parameter_name" label="参数名称" sortable></el-table-column>
      <el-table-column prop="paramter_unit" label="参数单位" sortable></el-table-column>
      <el-table-column prop="sample_period" label="参数采集周期" width="140" sortable></el-table-column>
      <el-table-column prop="window_warning_time" label="报警窗口时间" sortable>
        <template slot-scope="scope">
          <el-select v-model="scope.row.window_warning_time" placeholder="选择时间" style="width: 100px;" size="small">
            <el-option
              v-for="item in alarmWindowTimeOptions" :key="item.value"
              :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column v-for="(item, index) in alarmColorList" :key="index"
                      prop="parameter_level" :label="item.value" :index="index" :render-header="renderTableHeader">
        <template slot-scope="scope">
          <div class="text-center">
            <el-select v-model="scope.row.parameter_level[item.value]" placeholder="选择次数" style="width: 120px;" size="small">
              <el-option
                v-for="item in alarmWindowCountOptions" :key="item.value"
                :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </div>
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
            <el-button type="text" @click.native="exportTemplate(scope.row)" icon="" size="small">导入数据</el-button>
            <el-button type="text" @click.native="handleEditTemplate(scope.row)" icon="" size="small">修改模板名称</el-button>
            <el-button type="text" @click.native="handleViewTemplate(scope.row)" icon="" size="small">查看参数</el-button>
            <el-button type="text" @click.native="handelRemoveTemplate(scope.row)" icon="" size="small">删除模板</el-button>
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
      <div slot="footer" class="dialog-footer mt-3">
        <el-button size="medium" @click="visible.templateDialog = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 查看模板参数弹窗 -->
    <el-dialog :title="templateName" :visible.sync="visible.parameterDialog" width="80%" class="mes-dialog">
      <!--列表 start-->
      <el-table :data="parameterList" v-loading="visible.parameterListLoading"
                row-class-name="el-mini-row pointer"
                highlight-current-row>
        <el-table-column type="index" :index="getParameterIndex" label="序号"></el-table-column>
        <el-table-column prop="parameter_name" label="参数名称" sortable></el-table-column>
        <el-table-column prop="paramter_unit" label="参数单位" sortable></el-table-column>
        <!-- <el-table-column prop="sample_period" label="参数采集周期" width="140" sortable></el-table-column> -->
        <el-table-column prop="window_warning_time" label="报警窗口时间" sortable>
          <template slot-scope="scope">
            <div class="text-center">{{ scope.row.window_warning_time }}分钟</div>
          </template>
        </el-table-column>
        <el-table-column v-for="(item, index) in alarmColorList" :key="index"
                        prop="parameter_level" :label="item.value" :index="index" :render-header="renderTableHeader">
          <template slot-scope="scope">
            <div class="text-center">
              <span>{{ scope.row.parameter_level[item.value] }}次</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!--列表 end-->

      <!--分页 start -->
      <el-col :span="24" class="toolbar">
        <el-pagination layout="total, sizes, prev, pager ,next" :page-size="parameterFilters.pageSize"
                      :total="parameterFilters.total" @current-change="handleParameterPageChange" @size-change="handleParameterSizeChange">
        </el-pagination>
      </el-col>
      <!--分页 end -->

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
  export default {
    name: 'Device-Alarm-Window-Config',
    data () {
      return {
        filters: {
          deviceId: this.$route.params.id,
          keyword: '',
          type: 'window',
          pageSize: 10,
          page: 1,
          total: 0
        },
        confId: this.$route.query.confId,
        list: [],
        visible: {
          listLoading: true,
          templateListLoading: true,
          parameterListLoading: true,
          templateDialog: false,
          parameterDialog: false
        },
        deviceName: this.$route.query.name,
        deviceNumber: this.$route.query.number,
        alarmColorList: [],
        // 模板名称列表
        templateList: [],
        templateFilters: {
          type: 'window',
          keyword: '',
          // pageSize: 10,
          // page: 1,
          // total: 0
        },
        // 模板参数列表
        parameterList: [],
        parameterFilters: {
          templateId: '',
          type: '',
          keyword: '',
          pageSize: 10,
          page: 1,
          total: 0
        },
        templateName: '',
        alarmWindowTimeOptions: [ // 报警窗口时间
          {label: '1分钟', value: '1'},
          {label: '3分钟', value: '3'},
          {label: '5分钟', value: '5'},
          {label: '10分钟', value: '10'}
        ],
        alarmWindowCountOptions: [  // 报警窗口次数
          {label: '10次', value: '10'},
          {label: '20次', value: '20'},
          {label: '30次', value: '30'},
          {label: '40次', value: '40'},
          {label: '50次', value: '50'},
          {label: '60次', value: '60'},
          {label: '70次', value: '70'},
          {label: '80次', value: '80'},
          {label: '90次', value: '90'},
          {label: '100次', value: '100'}
        ]
      }
    },
    computed: {
      ...mapGetters(['getAlarmColorList'])
    },
    mounted () {
      this.getList()
      this.initAlarmColorList().then(() => {
        let arr = []
        this.getAlarmColorList.forEach(item => {
          arr.push(utils.deepCopy(item))
        })
        arr.pop()
        this.alarmColorList = [...arr]
        // console.log(this.alarmColorList)
      })
    },
    methods: {
      ...mapActions(['initAlarmColorList', 'getEmptyWindowData']),
      // 列表
      getList () {
        this.visible.listLoading = true
        queryWarningDeviceParamLevel(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            // this.filters.total = res.map.total
            this.filters.total = res.map.warningDeviceParameterWarningConfs.length
            res.map.warningDeviceParameterWarningConfs.forEach(item => {
              item.parameter_level = {}
              if (item.window_warning_kv) {
                item.parameter_level = JSON.parse(item.window_warning_kv)
              } else {
                this.getEmptyWindowData().then(obj => {
                  item.parameter_level = obj
                })
              }
            })
            this.list = res.map.warningDeviceParameterWarningConfs
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
          type: 'window',
          pageSize: 10,
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
      handleExportTemplate () {
        this.visible.templateDialog = true
        this.getTemplateList()
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
        return true
        
        let keys = this.alarmColorList.map(v => v.value)
        for (let i = 0; i < list.length; i++) {
          for (let j = 0; j < keys.length; j++) {
            // console.log(i, keys[j], list[i].parameter_level[keys[j]])
            // 上限 下限 label
            let leftLabel = ''
            let rightLabel = ''
            if (j < 5) {
              leftLabel = 'L' + keys[j].split('')[1] + '报警窗口'
            } else {
              leftLabel = 'L' + keys[j].split('')[1] + '报警窗口'
            }
            // 上限 下限 value
            let leftValue = list[i].parameter_level[keys[j]]
            let rightValue = ''
            if (j !== keys.length - 1) {
              rightValue = list[i].parameter_level[keys[j + 1]]
              if (j + 1 < 5) {
                rightLabel = 'L' + keys[j + 1].split('')[1] + '报警窗口'
              } else {
                rightLabel = 'L' + keys[j + 1].split('')[1] + '报警窗口'
              }
              // if (parseFloat(leftValue) <= parseFloat(rightValue)) {
              //   this.$message.info(`第 ${i + 1} 行: ${rightLabel} 不能大于 ${leftLabel} `)
              //   return false
              // }
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
        return true
        
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
      // 序列化参数
      getDeviceParamsString (type) {
        let arr = []
        this.list.forEach(item => {
          let data = {
            device_id: item.device_id,
            device_parameter_id: item.device_parameter_id,
            parameter_name: item.parameter_name,
            device_parameter_id: item.device_parameter_id,
            paramter_unit: item.paramter_unit,
            window_warning_time: item.window_warning_time
          }
          if (type === 'save') {
            data.window_warning_kv = JSON.stringify(Object.assign({}, this.getEmptyWindowData(), item.parameter_level))
            data.sample_period = item.sample_period
            data.warning_device_parameter_warning_conf_id =  item.warning_device_parameter_warning_conf_id // 不传，参数列表数据保存后会翻倍
          } else {
            // 保存为模板 特殊处理
            data.level_window_warning_kv = JSON.stringify(Object.assign({}, this.getEmptyWindowData(), item.parameter_level))
          }
          arr.push(data)
        })
        return JSON.stringify(arr)
      },
      // 重置
      handleResetData () {
        this.$confirm('确认清空表格数据吗？', '提示', {
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.list.forEach(item => {
              item.window_warning_time = '1'
              for (let key in item.parameter_level) {
                item.parameter_level[key] = ''
              }
            })
            this.$message.info('表格数据已清空')
          }
        }).catch(() => {})
      },
      renderTableHeader(createElement, col) {
        // console.log(col)
        let label = ''
        if (col.$index < 4 + 5) {
          label = 'L' + col.column.label.split('')[1] + '报警窗口'
        } else {
          label = 'L' + col.column.label.split('')[1] + '报警窗口'
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
      // 参数列表
      getParameterList () {
        this.visible.parameterListLoading = true
        queryParamTemplate(this.parameterFilters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            res.map.template.forEach(item => {
              item.parameter_level = JSON.parse(item.level_window_warning_kv)
            })
            this.parameterList = res.map.template
          } else {
            this.filters.total = 0
            this.parameterList = []
          }
          this.visible.parameterListLoading = false
        })
      },
      //  页面改变
      handleParameterPageChange (val) {
        this.parameterFilters.page = val
        this.getParameterList()
      },
      //  每页数量改变
      handleParameterSizeChange (val) {
        this.parameterFilters.pageSize = val
        this.getParameterList()
      },
      // 列表索引
      getParameterIndex (index) {
        return utils.getHeadNumAdapter(this.parameterFilters.page, this.parameterFilters.pageSize, index)
      },
      // 重置
      resetParameter () {
        this.parameterFilters = {
          templateId: this.templateId,
          type: 'window',
          keyword: '',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getParameterList()
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
                // this.list[index].sample_period = item.sample_period
                this.list[index].window_warning_time = item.window_warning_time
                this.list[index].parameter_level = JSON.parse(item.level_window_warning_kv)
              }
            })
            if (res.map.template.length === 0) {
              this.$message.info('模板数据为空')
            } else {
              this.$forceUpdate()
              this.visible.templateDialog = false
              this.$message.info('已导入数据')
            }
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
      // 查看参数
      handleViewTemplate (row) {
        console.log(row)
        this.templateName = row.template_name
        this.visible.parameterDialog = true
        this.parameterFilters.templateId = row.warning_device_parameter_conf_template_id
        this.parameterFilters.type = this.filters.type
        this.getParameterList()
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
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
</style>
<style>
.neg-margin-lr {
  width: calc(100% + 20px);
  margin-left: -10px;
  margin-right: -10px;
}
</style>