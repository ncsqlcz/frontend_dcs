/*
 * @Author: liucz 
 * @Date: 2018-06-20 09:26:26 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-06 16:31:07
 */
<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="35%" class="mes-dialog">
    <!--搜索 start-->
    <el-col class="toolbar" v-if="deviceList.length > 0">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="24" class="text-right">
          <el-form-item label="选择设备">
            <el-select v-model="filters.deviceId" placeholder="选择设备" size="medium" @change="handleDeviceChange">
              <el-option v-for="item in deviceList" :key="item.value" :label="item.device_name + ' / ' +item.device_number" :value="item.device_id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备报警开关" v-if="currentDevice && parameterList.length > 0">
            <el-switch v-model="currentDevice.device_switch"
                    active-value="0" inactive-value="1"
                    active-color="#13ce66" inactive-color="#ff4949"
                    @change="handleAlarmSwitchChange"></el-switch>
          </el-form-item>
        </el-col>
      </el-form>
    </el-col>
    <!--搜索 end-->
    
    <!--列表 start-->
    <el-table :data="parameterList" highlight-current-row v-loading="visible.listLoading">
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="parameter_name" label="参数名称" sortable></el-table-column>
      <!-- <el-table-column prop="device_parameter_id" label="参数ID" sortable></el-table-column> -->
      <el-table-column prop="paramter_unit" label="参数单位" sortable></el-table-column>
      <el-table-column prop="status" label="操作">
        <template slot-scope="scope">
          <el-switch v-if="currentDevice" v-model="scope.row.deviceParam_switch"
                    active-value="0" inactive-value="1"
                    active-color="#13ce66" inactive-color="#ff4949"
                    active-text="开" inactive-text="关" :disabled="currentDevice.device_switch === '1'"
                    @change="handleParameterAlarmSwitchChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
    </el-table>
    <!--列表 end-->

    <!--分页 start -->
    <el-col :span="24" class="toolbar hidden">
      <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                    :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>
    <!--分页 end -->

    <div slot="footer" class="dialog-footer mt-0">
      <el-button size="medium" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import utils from '../../../common/js/utils'
  import {
    queryConfDevice, queryWarnUnitDevice,
    queryWarnUnitSwitch, modifyWarningConfModuleUnitDevicePara,
    modifyWarningConfModuleUnitDevice
    } from '../../../api/api'
  export default {
    name: 'Device-Alarm-Switch',
    data () {
      return {
        filters: {
          deviceId: '',
          keyword: '',
          pageSize: 1000,
          page: 1,
          total: 0
        },
        visible: {
          listLoading: false
        },
        dialogVisible: false,
        currentDevice: null,
        currentDeviceId: '',
        deviceList: [],  // 设备列表
        parameterList: []  // 设备参数列表
      }
    },
    props: {
      show: {
        type: Boolean,
        required: true
      },
      title: String,
      unitTypeId: {
        type: String,
        required: true,
        default: ''
      },
      unitId: {
        type: String,
        required: true,
        default: ''
      }
    },
    computed: {},
    mounted () {},
    methods: {
      // 设备列表
      getDeviceList () {
        if (this.visible.listLoading) {
          return
        }
        this.visible.listLoading = true
        queryConfDevice({
          unitTypeId: this.unitTypeId,
          warnUnitId: this.unitId,
          deviceType: '',
          type: 'monitorUintType',
          alarmType: '',
          warnCategoryId: '',
          deviceTypeId: '',
          keyword: '',
          pageSize: '',
          page: ''
        }).then(res => {
          if (res.status === 0 && res.map.WarningConfModuleUnitDOs.length > 0) {
            this.deviceList = res.map.WarningConfModuleUnitDOs[0].deviceInfoDOs
            if (this.deviceList.length > 0) {
              this.currentDevice = this.deviceList[0]
              this.filters.deviceId = this.deviceList[0].device_id
              this.handleDeviceChange()
            }
          } else {
            this.currentDevice = null
            this.filters.deviceId = ''
            this.deviceList = []
          }
          this.visible.listLoading = false
        })
      },
      // 设备参数列表
      getList () {
        this.visible.listLoading = true
        let params = Object.assign({}, this.filters, {
          unitTypeId: this.unitTypeId,
          warnUnitId: this.unitId
        })
        queryWarnUnitDevice(params).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            if (res.map.deviceInfoDOs.length > 0) {
              this.currentDevice.device_switch = res.map.deviceInfoDOs[0].device_switch
              this.parameterList = res.map.deviceInfoDOs[0].warningDeviceParameterDOs
            }
          } else {
            this.filters.total = 0
            this.parameterList = []
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
          deviceId: '',
          keyword: '',
          pageSize: 1000,
          page: 1,
          total: 0
        }
        this.parameterList = []
        this.currentDevice = null
        this.filters.deviceId = ''
      },
      // 选择设备
      handleDeviceChange () {
        this.parameterList.forEach(item => {
          if (item.device_id === this.filters.deviceId) {
            this.currentDevice = item
          }
        })
        this.getList()
      },
      // 设备报警开关
      handleAlarmSwitchChange () {
        modifyWarningConfModuleUnitDevice({
          unitTypeId: this.unitTypeId,
          warnUnitId: this.unitId,
          isOn: this.currentDevice.device_switch,
          deviceId: this.filters.deviceId
        }).then(res => {
          if (res.status === 0) {
            this.$message.success('成功')
          } else {
            this.$message.error(res.msg || '失败')
          }
        })
      },
      // 参数报警开关
      handleParameterAlarmSwitchChange (row) {
        console.log(row)
        modifyWarningConfModuleUnitDevicePara({
          unitTypeId: this.unitTypeId,
          warnUnitId: this.unitId,
          isOn: row.deviceParam_switch,
          deviceId: this.filters.deviceId,
          parameterId: row.device_parameter_id
        }).then(res => {
          if (res.status === 0) {
            this.$message.success('成功')
          } else {
            this.$message.error(res.msg || '失败')
          }
        })
      }
    },
    watch: {
      show (val) {
        this.dialogVisible = val
      },
      dialogVisible (val) {
        if (!val) {
          this.reset()
        } else {
          if (this.unitId !== '' && this.unitTypeId !== '') {
            this.getDeviceList()
          }
        }
        this.$emit('update:show', val)
      },
      unitTypeId (val) {
        if (this.unitId !== '') {
          this.getDeviceList()
        }
      },
      unitId (val) {
        if (this.unitTypeId !== '') {
          this.getDeviceList()
        }
      }
    }
  }
</script>

<style scoped lang="scss">
</style>
