/*
 * @Author: Zhangshitu 
 * @Date: 2018-06-30 08:55:51 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-21 15:49:57
 */
<template>
  <section>
    <el-row class="transparent mt-3">
      <el-col class="p-3 mt-3" :span="24" v-loading="visible.alarmUnitLoading">
        <perspective-nav-button :alarm-unit="alarmUnit" @alarmUnit="getWorkingProcedure"></perspective-nav-button>
      </el-col>
      <!-- 搜索 start -->
      <el-col class="toolbar text-right" :span="24">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item>
            <el-select v-model="filters.deviceTypeId" @change="initAlarmUnit" placeholder="请选择设备种类">
              <el-option value="" label="全部设备种类"></el-option>
              <el-option
                v-for="(item, index) in getDeviceTypeList"
                :key="index"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.warnCategoryId" @change="initAlarmUnit" placeholder="设备所属报警种类">
              <el-option
                v-for="(item, index) in alarmTypeList"
                v-if="item.label !== '停机报警' && item.label !== '离线报警'"
                :key="index"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model.trim="filters.keyword" size="medium" placeholder="输入关键字" @keyup.native.enter="initAlarmUnitData"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="medium" @click="initAlarmUnitData" icon="el-icon-search">查询</el-button>
            <el-button size="medium" @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!-- 搜索 end -->
      <!-- 列表 start -->
      <el-col :span="24" v-loading="visible.listLoading">
        <el-table highlight-current-row :data="alarmUnitData" style="width: 100%">
          <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
          <el-table-column prop="device_name" label="设备名称" sortable></el-table-column>
          <el-table-column prop="device_number" label="设备编号" sortable></el-table-column>
          <el-table-column prop="warningCategoryDO.warning_category_name" label="所属设备报警种类" sortable></el-table-column>
          <el-table-column prop="device_type_name" label="设备种类" sortable></el-table-column>
          <el-table-column label="选择参数" width="200">
            <template slot-scope="scope">
              <el-button type="text" size="medium" icon="" @click="openMesWorkstage(scope.row)" v-if="scope.row.device_type_name !== '采集设备'">点击选择</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <!-- 列表 end -->
      <!-- 分页 start -->
      <!-- <el-col :span="24" class="toolbar">
        <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                      :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
        </el-pagination>
      </el-col> -->
      <!-- 分页 end -->
    </el-row>

    <!-- 选择设备参数 -->
    <el-dialog
      title="选择设备参数"
      :visible.sync="visible.dialog"
      width="80%">
      <!-- 选择设备参数表格组件 -->
      <alarm-level-table type="level"
        :selectedIds="parameter_ids"
        :deviceId="deviceId"
        :multiple="true"
        :openDialog="openDialogNumber"
        :result-random="resultRandomNumber"
        @selected="handleSelected">
      </alarm-level-table>
      <div slot="footer" class="dialog-footer mt-4">
        <el-button @click="visible.dialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmSelected">确 定</el-button>
      </div>
    </el-dialog>
    
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import { queryWarnUnit, queryConfDevice, saveModuleUnitThree } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import PerspectiveNavButton from './PerspectiveNavButton.vue'
  import alarmLevelTable from './AlarmLevelTable.vue'
  export default {
    name: 'Perspective-Step3',
    data () {
      return {
        warningUnitTypeId: '',
        filters: {
          type: 'sceneUintType',
          warnCategoryId: '',
          unitTypeId: '',
          warnUnitId: '',
          deviceTypeId: '',
          keyword: '',
          pageSize: '',
          page: '',
          total: ''
        },
        deviceId: '',
        templateId: '',
        resultRandomNumber: -1,
        currentAlarmUnit: {},
        parameter_ids: '',
        warningCategoryId: '',
        deviceId: '',
        openDialogNumber: -1,
        alarmUnit: [],
        alarmUnitData: [],
        visible: {
          alarmUnitLoading: false,
          listLoading: true,
          dialog: false
        }
      }
    },
    computed: {
      ...mapGetters(['getDeviceTypeList', 'getAlarmTypeList', 'getSiteUnitTypeId']),
      alarmTypeList () {
        // 去掉离线报警、停机报警
        let newData = []
        this.getAlarmTypeList.forEach((val) => {
          switch (val.value) {
            case 'offline': 
              break;
            case 'halt': 
              break;
            default:
              newData.push(val)
              break;
          }
        })
        return newData
      }
    },
    props: {
      apllySave: Boolean
    },
    components: { PerspectiveNavButton, alarmLevelTable },
    mounted () {
      this.warningUnitTypeId = this.getSiteUnitTypeId
      // 初始化数据
      this.initAlarmUnit()
      if (this.getAlarmTypeList) {
        this.initAlarmTypeList()
      }
    },
    methods: {
      ...mapActions(['initAlarmTypeList']),
      // 获取报警单元
      initAlarmUnit () {
        this.visible.alarmUnitLoading = true
        queryWarnUnit({
          unitTypeId: this.warningUnitTypeId
        }).then(res => {
          if (res.status === 0) {
            this.alarmUnit = res.map.warningUnitDOs
            if (!this.currentAlarmUnit.warning_uint_id) {
              this.currentAlarmUnit.warning_uint_id = this.alarmUnit[0].warning_uint_id
            }
            this.initAlarmUnitData()
          } else {
            this.alarmUnit = []
          }
          this.visible.alarmUnitLoading = false
        })
      },
      // 获取报警单元的设备详情
      initAlarmUnitData () {
        this.visible.listLoading = true
        this.filters.unitTypeId = this.warningUnitTypeId
        this.filters.warnUnitId = this.currentAlarmUnit.warning_uint_id
        queryConfDevice(this.filters).then(res => {
          if (res.status === 0) {
            this.alarmUnitData = []
            const map = res.map.WarningConfModuleUnitDOs
            map.forEach(warningType => {
              warningType.deviceInfoDOs.forEach(item => {
                this.alarmUnitData.push(item)
              })
            })
          } else {
            this.alarmUnitData = []
          }
          this.visible.listLoading = false
        })
      },
      // 选择参数
      handleView (row) {
      },
      //  页面改变
      handlePageChange (val) {
        this.filters.page = val
        this.initAlarmUnitData()
      },
      //  每页数量改变
      handleSizeChange (val) {
        this.filters.pageSize = val
        this.initAlarmUnitData()
      },
      // 列表索引
      getIndex (index) {
        return utils.getHeadNumAdapter(this.filters.page, this.filters.pageSize, index)
      },
      // 重置
      reset () {
        this.filters = {
          type: 'sceneUintType',
          warnCategoryId: '',
          unitTypeId: '',
          warnUnitId: '',
          deviceTypeId: '',
          keyword: '',
          pageSize: '',
          page: '',
          total: ''
        }
        this.initAlarmUnitData()
      },
      // 选择设备参数组件返回数据
      handleSelected (val) {
        const deviceParameterId = val.map(v => { return v.device_parameter_id })
        const newIds = val.map(v => { return v.warning_device_parameter_id })
        // 获取新增、删除的参数的ID
        const paramIds = utils.contrastIds(this.parameter_ids, newIds)
        const deviceParamsData = []
        paramIds.addIds.forEach(id => {
          val.forEach(item => {
            if (item.warning_device_parameter_id === id) {
              deviceParamsData.push({
                warning_unit_type_id: this.warningUnitTypeId,
                warning_device_parameter_id: id,
                warning_module_id: "112233",
                warning_unit_id: this.currentAlarmUnit.warning_uint_id,
                device_id: this.deviceId,
                warning_category_id: this.warningCategoryId,
                device_parameter_id: item.device_parameter_id
              })
            }
          })
        })
        saveModuleUnitThree({
          unitTypeId: this.warningUnitTypeId,
          warningCategoryId: this.warningCategoryId,
          warnUnitId: this.currentAlarmUnit.warning_uint_id,
          deviceParams: JSON.stringify(deviceParamsData), // 新增设备参数
          paramIds: paramIds.delIds.join(',') // 删除设备参数
        }).then(res => {
          if (res.status === 0) {
            this.$message({
              message: '保存设备参数成功',
              type: 'success'
            })
            this.visible.listLoading = false
            this.initAlarmUnit()
          } else {
            this.$message.error(res.msg);
          }
        })
      },
      // 获取导航处返回的ID
      getWorkingProcedure (val) {
        this.currentAlarmUnit = val
        this.initAlarmUnitData()
      },
      // 点击选择设备参数按钮
      openMesWorkstage (data) {
        this.parameter_ids = []
        if (data.warningCategoryDO.warningConfModuleUnitDeviceParaDOs.length !== 0) {
          this.parameter_ids = data.warningCategoryDO.warningConfModuleUnitDeviceParaDOs.map(v => { return v.warning_device_parameter_id })
        }
        this.visible.dialog = true
        this.warningCategoryId = data.warningCategoryDO.warning_category_id
        this.deviceId = data.device_id
        this.openDialogNumber = Math.floor(100 * Math.random())
      },
      // 确认选择参数
      confirmSelected () {
        this.visible.listLoading = true
        this.visible.dialog = false
        this.resultRandomNumber = Math.floor(100 * Math.random())
      }
    },
    watch: {
      apllySave (val) {
        if (val) {
          let _p = true
          this.alarmUnit.forEach(item => {
            if (item.conf_status === '0') {
              _p = false
              return
            }
          })
          this.$emit('save', _p)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
// @import '~scss_vars';
</style>
