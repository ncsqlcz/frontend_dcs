/*
 * @Author: Zhangshitu 
 * @Date: 2018-07-04 08:38:23 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-21 15:49:39
 */

<template>
  <section>
    <el-row class="transparent mt-3">
      <el-col class="p-3 mt-3" :span="24" v-loading="visible.alarmUnitLoading">
        <perspective-nav-button :alarm-unit="alarmUnit" @alarmUnit="getWorkingProcedure"></perspective-nav-button>
      </el-col>
    </el-row>
    <el-row class="transparent">
      <!-- 工序开始时间 start -->
      <el-col class="mb-5" :span="24" v-loading="visible.startLoading">
        <div class="title-name mb-3">工序开始时间依据（自动判断时启用）</div>

        <el-radio v-model="radio" label="1">设备参数</el-radio>
        <el-radio v-model="radio" label="2">扫码枪录入参数</el-radio>
        
        <!-- radio选择 // 设备参数 -->
        <el-col class="mt-3" :span="24" v-if="radio === '1'">
          <span class="mr-2">设定开始值</span>
          <!-- 选择设备 -->
          <el-button type="primary" plain @click="openSelectDeviceStart">
            {{deviceFilters.device_name_start ? deviceFilters.device_name_start : '点击选择设备'}}
          </el-button>
          <!-- 选择设备参数 -->
          <el-button type="primary" 
            plain 
            @click="openSelectDeviceParameterStart" 
            :disabled="!deviceFilters.device_id_start">
            {{deviceFilters.device_parameter_name_start ? deviceFilters.device_parameter_name_start : '点击选择设备参数'}}
          </el-button>
          <el-input v-model="parameterStartMinValue" 
            :disabled="!deviceFilters.device_parameter_id_start" 
            style="width: 150px;" 
            placeholder="请输入范围下限" 
            @change="putValMinStart">
          </el-input>
          <el-input v-model="parameterStartMaxValue"
            :disabled="!deviceFilters.device_parameter_id_start" 
            style="width: 150px;" 
            placeholder="请输入范围上限" 
            @change="putValMaxStart">
          </el-input>
        </el-col>
        <!-- radio选择 // 扫码枪录入参数 -->
        <el-col class="mt-3" :span="24" v-if="radio === '2'">
          <span class="mr-2">设定开始值</span>
          <el-button type="primary" plain @click="openSelectProcedureParStart">
            {{sweepFilters.warning_start_uint_para_name ? sweepFilters.warning_start_uint_para_name : '点击选择工序参数'}}
          </el-button>
        </el-col>
      </el-col>
      <!-- 工序开始时间 end -->

      <!-- 工序结束时间 start -->
      <el-col class="mb-5" :span="24" v-loading="visible.startLoading">
        <div class="title-name mb-3">工序结束时间依据（自动判断时启用）</div>
        
        <el-radio v-model="radio" label="1" disabled>设备参数</el-radio>
        <el-radio v-model="radio" label="2" disabled>扫码枪录入参数</el-radio>
        
        <!-- radio选择 // 设备参数 -->
        <el-col class="mt-3" :span="24" v-if="radio === '1'">
          <span class="mr-2">设定开始值</span>
          <!-- 选择设备 -->
          <el-button type="primary" plain @click="openSelectDeviceEnd">
            {{deviceFilters.device_name_end ? deviceFilters.device_name_end : '点击选择设备'}}
          </el-button>
          <!-- 选择设备参数 -->
          <el-button type="primary" 
            plain 
            @click="openSelectDeviceParameterEnd" 
            :disabled="!deviceFilters.device_id_end">
            {{deviceFilters.device_parameter_name_end ? deviceFilters.device_parameter_name_end : '点击选择设备参数'}}
          </el-button>
          <el-input v-model="parameterEndMinValue"
            :disabled="!deviceFilters.device_parameter_id_end" 
            style="width: 150px;"
            placeholder="请输入范围下限"
            @change="putValMinEnd">
          </el-input>
          <el-input v-model="parameterEndMaxValue"
            :disabled="!deviceFilters.device_parameter_id_end" 
            style="width: 150px;" 
            placeholder="请输入范围上限"
            @change="putValMaxEnd">
          </el-input>
        </el-col>
         <!-- radio选择 // 扫码枪录入参数 -->
        <el-col class="mt-3" :span="24" v-if="radio === '2'">
          <span class="mr-2">设定开始值</span>
          <el-button type="primary" plain @click="openSelectProcedureParEnd">
            {{sweepFilters.warning_end_uint_para_name ? sweepFilters.warning_end_uint_para_name : '点击选择工序参数'}}
          </el-button>
        </el-col>
      </el-col>
      <!-- 工序结束时间 end -->
    </el-row>

    <!-- 设备弹窗 -->
    <process-device-dialog
      :visible.sync="visible.deviceDialog"
      :warn-unit-id="warnUnitId"
      :selectedIds="deviceSelectedIds"
      @selected="handleSelectedDevice">
    </process-device-dialog>

    <!-- 设备参数弹窗 -->
    <process-device-parameter-dialog 
      :visible.sync="visible.dialog"
      :parameterIds="parameterDialogIds"
      :selectedIds="deviceParameterSelectedIds"
      @selected="handleSelectedDeviceParameter">
    </process-device-parameter-dialog>

    <!-- 工序参数弹窗 -->
    <process-parameter-dialog
      :visible.sync="visible.parameterDialog"
      :warn-unit-id="warnUnitId"
      :selectedIds="parameterSelectedIds"
      @selected="handleSelectedParameter">
    </process-parameter-dialog>
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import { querySceneModule, 
    queryWarningLevel, saveProcessFour,
    queryWarningUnits } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import PerspectiveNavButton from './PerspectiveNavButton.vue'
  import ProcessDeviceParameterDialog from './ProcessDeviceParameterDialog.vue'
  import ProcessDeviceDialog from './ProcessDeviceDialog.vue'
  import ProcessParameterDialog from './ProcessParameterDialog.vue'
  export default {
    name: 'Perspective-Step4',
    data () {
      return {
        warningUnitTypeId: '',
        sweepFilters: {
          device_id_start: null, // 开始时间依据——工序ID
          device_name_start: null, // 开始时间依据——工序名称
          warning_start_uint_para_id: null, // 开始时间依据——工序参数ID
          warning_start_uint_para_name: null, // 开始时间依据——工序参数名称

          device_id_end: null, // 结束时间依据——工序ID
          device_name_end: null, //  结束时间依据——工序名称
          warning_end_uint_para_id: null, // 结束时间依据——工序参数ID
          warning_end_uint_para_name: null, // 结束时间依据——工序参数名称

          warning_unit_id: null, // 报警单元ID
          warning_conf_unit_working_status_id: null,
        },
        deviceFilters: {
          device_id_start: null, // 开始时间依据——设备ID
          device_name_start: null, // 开始时间依据——设备名称
          device_parameter_id_start: null, // 开始时间依据——设备参数ID
          device_parameter_name_start: null, // 开始时间依据——设备参数名称
          warning_unit_device_para_start_value: null,  // 开始时间依据——设备参数值
          
          device_id_end: null, // 结束时间依据——设备ID
          device_name_end: null, //  结束时间依据——设备名称
          device_parameter_id_end: null, // 结束时间依据——设备参数ID
          device_parameter_name_end: null, // 结束时间依据——设备参数名称
          warning_unit_device_para_end_value: null, // 结束时间依据——设备参数值
          
          warning_conf_unit_working_status_id: null,
          warning_unit_id: null, // 报警单元ID
        },
        parameterStartMinValue: '',
        parameterStartMaxValue: '',
        parameterEndMinValue: '',
        parameterEndMaxValue: '',
        warnUnitId: '',
        warnUnitName: '',
        parameterSelectedIds: [],
        deviceParameterSelectedIds: [],
        deviceSelectedIds: [],
        alarmUnit: [],
        radio: '1',
        timeType: '',
        parameterDialogIds: {},
        visible: {
          alarmUnitLoading: false,
          dialog: false,
          parameterDialog: false,
          deviceDialog: false,
          listLoading: false,
          startLoading: true,
        }
      }
    },
    components: { PerspectiveNavButton, ProcessDeviceParameterDialog, ProcessDeviceDialog, ProcessParameterDialog },
    computed: {
      ...mapGetters(['getSiteUnitTypeId'])
    },
    props: {
      apllySave: Boolean
    },
    created () {
      // this.workingProcedure = this.alarmUnit[0]
    },
    mounted () {
      this.warningUnitTypeId = this.getSiteUnitTypeId
      this.initAlarmUnit()
    },
    methods: {
      ...mapActions([]),
      // 获取报警单元
      initAlarmUnit () {
        this.visible.alarmUnitLoading = true
        queryWarningUnits({
          unitTypeId: this.warningUnitTypeId
        }).then(res => {
          if (res.status === 0) {
            this.alarmUnit = res.map.warningUnits
            if (!this.warnUnitId) {
              this.getWorkingProcedure(this.alarmUnit[0])
            }
          } else {
            this.alarmUnit = []
          }
          this.visible.alarmUnitLoading = false
        })
      },
      // 获取导航处返回的ID
      getWorkingProcedure (val) {
        this.warnUnitId = val.warning_uint_id
        this.warnUnitName = val.warning_unit_name
        this.getTimeData()
      },
      // 选择开始设备
      openSelectDeviceStart () {
        this.timeType = 'start'
        this.deviceSelectedIds = [this.deviceFilters.device_id_start]
        this.visible.deviceDialog = true
      },
      // 选择结束设备
      openSelectDeviceEnd () {
        this.timeType = 'end'
        this.deviceSelectedIds = [this.deviceFilters.device_id_end]
        this.visible.deviceDialog = true
      },
      // 确认选择设备按钮
      handleSelectedDevice (row) {
        switch (this.timeType) {
          case 'start':
            if (!row.device_id) {
              this.$message.error('系统错误，设备ID为空')
              return
            } else {
              this.deviceFilters.device_id_start = row.device_id
              this.deviceFilters.device_name_start = row.device_name
              this.deviceFilters.warning_category_id_start = row.warning_category_id
              this.saveTimeProcess('device', this.deviceFilters)
            }
          break
          case 'end':
            if (!row.device_id) {
              this.$message.error('系统错误，设备ID为空')
              return
            } else {
              this.deviceFilters.device_id_end = row.device_id
              this.deviceFilters.device_name_end = row.device_name
              this.deviceFilters.warning_category_id_end = row.warning_category_id
              this.saveTimeProcess('device', this.deviceFilters)
            }
          break
          default:
          break
        }
      },
      // 打开选择开始设备参数弹窗
      openSelectDeviceParameterStart () {
        this.timeType = 'start'
        this.deviceParameterSelectedIds = [this.deviceFilters.device_parameter_id_start]
        this.parameterDialogIds = {
          warnUnitId: this.warnUnitId,
          warnCategoryId: this.deviceFilters.warning_category_id_start,
          deviceId: this.deviceFilters.device_id_start,
          random: Math.random()
        }
        this.visible.dialog = true
      },
      // 打开选择结束设备参数弹窗
      openSelectDeviceParameterEnd () {
        this.timeType = 'end'
        this.deviceParameterSelectedIds = [this.deviceFilters.device_parameter_id_end]
        this.parameterDialogIds = {
          warnUnitId: this.warnUnitId,
          warnCategoryId:  this.deviceFilters.warning_category_id_end,
          deviceId: this.deviceFilters.device_id_end,
          random: Math.random()
        }
        this.visible.dialog = true
      },
      // 确认选择设备参数按钮
      handleSelectedDeviceParameter (row) {
        switch (this.timeType) {
          case 'start':
            if (row.warningDeviceParameterDO.device_parameter_id) {
              this.deviceFilters.device_parameter_id_start = row.warningDeviceParameterDO.device_parameter_id
              this.deviceFilters.device_parameter_name_start = row.warningDeviceParameterDO.parameter_name
              this.saveTimeProcess('device', this.deviceFilters)
            } else {
              this.$message.error('系统错误，设备参数ID为空')
              return
            }
          break
          case 'end':
            if (row.warningDeviceParameterDO.device_parameter_id) {
              this.deviceFilters.device_parameter_id_end = row.warningDeviceParameterDO.device_parameter_id
              this.deviceFilters.device_parameter_name_end = row.warningDeviceParameterDO.parameter_name
              this.saveTimeProcess('device', this.deviceFilters)
            } else {
              this.$message.error('系统错误，设备ID为空')
              return
            }
          break
          default:
          break
        }
      },
      // 选择开始工序参数
      openSelectProcedureParStart () {
        this.timeType = 'start'
        this.visible.parameterDialog = true
      },
      // 选择结束工序参数
      openSelectProcedureParEnd () {
        this.timeType = 'end'
        this.visible.parameterDialog = true
      },
      // 确认选择工序参数按钮
      handleSelectedParameter (row) {
        switch (this.timeType) {
          case 'start':
            this.sweepFilters.warning_start_uint_para_id = row.process_scene_param_id
            this.sweepFilters.warning_start_uint_para_name = row.process_scene_param_name
          break
          case 'end':
            this.sweepFilters.warning_end_uint_para_id = row.process_scene_param_id
            this.sweepFilters.warning_end_uint_para_name = row.process_scene_param_name
          break
          default:
          break
        }
        this.saveTimeProcess('sweep', this.sweepFilters)
      },
      // 输入开始范围下限
      putValMinStart () {
        this.$message('请继续输入范围上限')
        this.deviceFilters.warning_unit_device_para_start_value = this.parameterStartMinValue + ',' + this.parameterStartMaxValue
        this.saveTimeProcess('device', this.deviceFilters)
      },
      // 输入结束范围下限
      putValMinEnd () {
        this.$message('请继续输入范围上限')
        this.deviceFilters.warning_unit_device_para_end_value = this.parameterEndMinValue + ',' + this.parameterEndMaxValue
        this.saveTimeProcess('device', this.deviceFilters)
      },
      // 输入开始范围上限
      putValMaxStart () {
        this.deviceFilters.warning_unit_device_para_start_value = this.parameterStartMinValue + ',' + this.parameterStartMaxValue
        this.saveTimeProcess('device', this.deviceFilters)
      },
      // 输入结束范围上限
      putValMaxEnd () {
        this.deviceFilters.warning_unit_device_para_end_value = this.parameterEndMinValue + ',' + this.parameterEndMaxValue
        this.saveTimeProcess('device', this.deviceFilters)
      },
      // 重置数据
      resetData () {
        this.sweepFilters = {
          device_id_start: null,
          device_name_start: null,
          warning_start_uint_para_id: null,
          warning_start_uint_para_name: null,
          device_id_end: null,
          device_name_end: null,
          warning_end_uint_para_id: null,
          warning_end_uint_para_name: null,
          warning_unit_id: null,
          warning_conf_unit_working_status_id: null
        }
        this.deviceFilters = {
          device_id_start: null,
          device_name_start: null,
          device_parameter_id_start: null,
          device_parameter_name_start: null,
          warning_unit_device_para_start_value: null,
          device_id_end: null,
          device_name_end: null,
          device_parameter_id_end: null,
          device_parameter_name_end: null,
          warning_unit_device_para_end_value: null,
          warning_conf_unit_working_status_id: null,
          warning_unit_id: null,
          warning_category_id_start: null,
          warning_category_id_end: null
        }
      },
      // 第四步提交时间的接口   这里type是指选择设备还是扫码枪
      saveTimeProcess (type, data) {
        this.visible.startLoading = true
        saveProcessFour({
          type: type,
          warnConfUnitWorking: JSON.stringify(data)
        }).then(res => {
          if (res.status === 0) {
            this.$message({
              message: '修改成功',
              type: 'success'
            })
            this.getTimeData()
            this.initAlarmUnit()
          } else {
            this.$message.error(res.msg)
          }
          this.visible.startLoading = false
        })
      },
      // 获取报警单元的配置时间 API
      getTimeData () {
        this.visible.startLoading = true
         querySceneModule({
          type: 'processStart',
          warningUnitId: this.warnUnitId
        }).then(res => {
          // 接口调用成功后，优先将数据重置为空,避免错误
          this.resetData()
          if (res.status === 0) {
            if (res.map) {
              const alarmUnitTimeData = res.map.warningConfUnitWorkingStatus
              switch (res.map.warningConfUnitWorkingStatus.type) {
                case 'device':
                  this.deviceFilters = {
                    device_id_start: alarmUnitTimeData.device_id_start,
                    device_name_start: alarmUnitTimeData.device_name_start,
                    device_parameter_id_start: alarmUnitTimeData.device_parameter_id_start,
                    device_parameter_name_start: alarmUnitTimeData.device_parameter_name_start,
                    warning_unit_device_para_start_value: alarmUnitTimeData.warning_unit_device_para_start_value,
                    device_id_end: alarmUnitTimeData.device_id_end,
                    device_name_end: alarmUnitTimeData.device_name_end,
                    device_parameter_id_end: alarmUnitTimeData.device_parameter_id_end,
                    device_parameter_name_end: alarmUnitTimeData.device_parameter_name_end,
                    warning_unit_device_para_end_value: alarmUnitTimeData.warning_unit_device_para_end_value,
                    warning_conf_unit_working_status_id: alarmUnitTimeData.warning_conf_unit_working_status_id,
                    warning_unit_id: alarmUnitTimeData.warning_unit_id,
                    warning_category_id_start: alarmUnitTimeData.warning_category_id_start,
                    warning_category_id_end: alarmUnitTimeData.warning_category_id_end
                  }
                  if (this.deviceFilters.warning_unit_device_para_start_value) {
                    const valStart = this.deviceFilters.warning_unit_device_para_start_value.split(',')
                    this.parameterStartMinValue = valStart[0]
                    this.parameterStartMaxValue = valStart[1]
                  }
                  if (this.deviceFilters.warning_unit_device_para_end_value) {
                    const valEnd = this.deviceFilters.warning_unit_device_para_end_value.split(',')
                    this.parameterEndMinValue = valEnd[0]
                    this.parameterEndMaxValue = valEnd[1]
                  }
                  this.radio = '1'
                break
                case 'sweep':
                  this.sweepFilters = {
                    device_id_start: alarmUnitTimeData.device_id_start,
                    device_name_start: alarmUnitTimeData.device_name_start,
                    warning_start_uint_para_id: alarmUnitTimeData.warning_start_uint_para_id,
                    warning_start_uint_para_name: alarmUnitTimeData.warning_start_uint_para_name,
                    device_id_end: alarmUnitTimeData.device_id_end,
                    device_name_end: alarmUnitTimeData.device_name_end,
                    warning_end_uint_para_id:  alarmUnitTimeData.warning_end_uint_para_id,
                    warning_end_uint_para_name: alarmUnitTimeData.warning_end_uint_para_name,
                    warning_unit_id: alarmUnitTimeData.warning_unit_id,
                    warning_conf_unit_working_status_id: alarmUnitTimeData.warning_conf_unit_working_status_id
                  }
                  this.radio = '2'
                break
                default:
                  this.$message.error('依据类型不存在')
                break
              }
              // 若从未配置过时间判断依据，则该值为空，若后台返回数据存在该值，则必须传入该值，传给后台时代表我是进行一个修改的操作
              if (alarmUnitTimeData.warning_conf_unit_working_status_id) {
                this.sweepFilters.warning_conf_unit_working_status_id = alarmUnitTimeData.warning_conf_unit_working_status_id
                this.deviceFilters.warning_conf_unit_working_status_id = alarmUnitTimeData.warning_conf_unit_working_status_id
              }
            } else {
              this.radio = '1'
              this.$message('未进行过配置')
            }
            this.deviceFilters.warning_unit_id = this.warnUnitId
            this.sweepFilters.warning_unit_id = this.warnUnitId
          } else {
            this.$message.error(res.msg)
            this.alarmUnitTimeDeviceData = {}
            this.alarmUnitTimeSweepData = {}
          }
          this.visible.startLoading = false
        })
      }
    },
    watch: {
      radio (val) {
        if (val === '2') {
          this.sweepFilters.device_id_start = this.warnUnitId
          this.sweepFilters.device_name_start = this.warnUnitName
          this.sweepFilters.device_id_end = this.warnUnitId
          this.sweepFilters.device_name_end = this.warnUnitName
        }
      },
      apllySave (val) {
        if (val) {
          let _p = true
          this.alarmUnit.forEach(item => {
            if (item.conf_status === '0' || item.conf_status === '1') {
              _p = false
              return
            }
          })
          this.$emit('save', _p)
          this.$emit('saveData', this.alarmUnit)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
@import '~scss_vars';
.title-name {
  font-size: 18px;
  &::before{
    content: '';
    display: inline-block;
    height: 20px;
    width: 8px;
    background-color: $color-active;
    vertical-align: -3px;
    margin-right: 8px;
  }
}
</style>
