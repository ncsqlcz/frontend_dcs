/*
 * @Author: liucz 
 * @Date: 2018-07-02 20:25:53 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-07-30 11:39:10
 */
<template>
  <section class="table-header-no-padding">
    <!--列表 start-->
    <el-table :data="list" v-loading="visible.listLoading"
              row-class-name="el-mini-row pointer"
              ref="multipleTable"
              @selection-change="handleSelectionChange"
              @row-click="toggleCurrentRow"
              :highlight-current-row="!multiple">
      <el-table-column type="selection" width="55" v-if="multiple"></el-table-column>
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="parameter_name" label="参数名称" sortable></el-table-column>
      <el-table-column prop="paramter_unit" label="参数单位" sortable></el-table-column>
      <el-table-column v-for="(item, index) in alarmColorList" :key="index"
        prop="parameter_level" :label="item.value" :index="index" :render-header="renderTableHeader">
        <template slot-scope="scope">
          <div class="text-center">{{ scope.row.parameter_level[item.value] }}</div>
          <!-- <el-input-number size="small" v-model="scope.row.parameter_level[item.value]"
            :step="1" :controls="false" style="width: 100%;"></el-input-number> -->
        </template>
      </el-table-column>
    </el-table>
    <!--列表 end-->

    <!--分页start -->
    <el-col :span="24" class="toolbar hidden" v-if="!parameterData">
      <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                     :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>
    <!--分页end -->
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import { queryParamTemplate, queryWarningDeviceParamLevel } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    name: 'Alarm-Level-Table',
    data () {
      return {
        param: {
          templateId: '',
          deviceId: ''
        },
        filters: {
          keyword: '',
          type: '',
          pageSize: 1000,
          page: 1,
          total: 0
        },
        list: [],
        visible: {
          listLoading: true,
          templateListLoading: true,
          templateDialog: false,
          parameterDialog: false
        },
        alarmColorList: [],
        // 模板名称列表
        templateList: [
          {template_id: '1', template_name: 'X-ray采集参数模板'}
        ],
        templateFilters: {
          keyword: '',
          pageSize: 10,
          page: 1,
          total: 0
        },
        selectedRows: null,
      }
    },
    props: {
      type: {
        type: String,
        default: 'level'
      },
      multiple: {
        type: Boolean,
        default: false
      },
      deviceId: {
        type: String
      },
      templateId: {
        type: String
      },
      parameterData: Array,
      parameterNumber: Number,
      selectedIds: {
        type: Array,
        default: () => { return [] }
      },
      resultRandom: Number,
      openDialog: Number
    },
    computed: {
      ...mapGetters(['getAlarmColorList'])
    },
    mounted () {
      this.initAlarmColorList().then(() => {
        let arr1 = []
        let arr2 = []
        this.getAlarmColorList.forEach(item => {
          arr1.push(utils.deepCopy(item))
          arr2.push(utils.deepCopy(item))
          arr2[arr2.length - 1].value = 'U' + arr2[arr2.length - 1].value.split('L')[1]
        })
        // console.log(arr1, arr2)
        this.alarmColorList = [...arr1, ...arr2.reverse()]
        // console.log(this.alarmColorList)
      })
      this.filters.type = this.type
      if (this.templateId) {
        this.filters.deviceId = undefined
        this.filters.templateId =  this.templateId
        
        this.getTemplateList()
      }
      if (this.deviceId) {
        this.filters.templateId = undefined
        this.filters.deviceId =  this.deviceId
        this.getDeviceList()
      }
    },
    methods: {
      ...mapActions(['initAlarmColorList', 'getEmptyLevelData']),
      handleSelectionChange (rows) {
        this.selectedRows = rows
      },
      // 确认选择
      confirmSelected (row) {
        this.visible.listLoading = false
        if (this.multiple) {
          // 选择多行
          this.selectedRows = this.$refs.multipleTable.selection
        } else {
          // 选择单行
          this.selectedRows = [row]
        }
        this.$emit('selected', this.selectedRows)
      },
      // 多选情况
      toggleCurrentRow (row) {
        if (this.multiple) {
          this.$refs.multipleTable.toggleRowSelection(row)
        } else {
          this.confirmSelected(row)
        }
      },
      // 初始选择的行
      checkSelectedIds () {
        if (!this.multiple) {
          this.$nextTick(() => {
            this.$refs.multipleTable.setCurrentRow()
          })
        }
        // 多行选择的情况
        if (this.selectedIds.length > 0 && this.multiple) {
          this.selectedIds.forEach(id => {
            this.list.forEach((item, index) => {
              if (item.warning_device_parameter_id === id) {
                this.$nextTick(() => {
                  this.$refs.multipleTable.toggleRowSelection(this.list[index], true)
                })
              } else {
                this.$refs.multipleTable.toggleRowSelection(this.list[index], false)
              }
            })
          })
        } else if (this.selectedIds.length > 0 && !this.multiple) {  // 单行选择的情况
          this.list.forEach((item, index) => {
            if (item.warning_device_parameter_id === this.selectedIds[0]) {
              this.$nextTick(() => {
                this.$refs.multipleTable.setCurrentRow(this.list[index])
              })
            }
          })
        } else if (this.selectedIds.length === 0) {
          try {
            this.$refs.multipleTable.clearSelection()
          } catch (e) {}
        }
      },
      // 列表
      getTemplateList () {
        this.visible.listLoading = true
        queryParamTemplate(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            res.map.template.forEach(item => {
              if (item.level_window_warning_kv) {
                item.parameter_level = JSON.parse(item.level_window_warning_kv)
              } else {
                item.parameter_level = this.getEmptyLevelData()
              }
            })
            this.list = res.map.template
            this.checkSelectedIds()
          } else {
            this.filters.total = 0
            this.list = []
          }
          this.visible.listLoading = false
        })
      },
      getDeviceList () {
        this.visible.listLoading = true
        queryWarningDeviceParamLevel(this.filters).then((res) => {
          if (res.status === 0) {
            this.filters.total = res.map.line
            res.map.warningDeviceParameters.forEach(item => {
              if (item.level_warning_kv) {
                item.parameter_level = JSON.parse(item.level_warning_kv)
              } else {
                item.parameter_level = this.getEmptyLevelData()
              }
            })
            this.list = res.map.warningDeviceParameters
            this.checkSelectedIds()
          } else {
            this.filters.total = 0
            this.list = []
          }
          this.visible.listLoading = false
        })
      },
      // 页面改变
      handlePageChange (val) {
        this.filters.page = val
        this.getList()
      },
      // 每页数量改变
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
          keyword: '',
          type: '',
          pageSize: 10,
          page: 1,
          total: 0
        }
        if (this.templateId) this.filters.templateId =  this.templateId
        if (this.deviceId) this.filters.deviceId =  this.deviceId
        this.filters.type =  this.type
        this.getList()
      },
      // 数据校验
      checkLevelData (list, keys) {
        return true
        
        // console.log(keys)
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
      // 重置
      handleReset () {
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
      }
    },
    watch: {
      deviceId (val) {
        this.filters.templateId = undefined
        this.filters.deviceId =  this.deviceId
        this.filters.type = this.type
        this.getDeviceList()
      },
      templateId (val) {
        this.filters.deviceId = undefined
        this.filters.templateId =  this.templateId
        this.filters.type = this.type
        this.getTemplateList()
      },
      parameterNumber (val) {
        this.list = this.parameterData
        this.visible.listLoading = false
      },
      resultRandom (val) {
        this.confirmSelected()
      },
      openDialog (val) {
        this.checkSelectedIds()
      }
    }
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