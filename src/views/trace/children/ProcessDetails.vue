<template>
	<section>
    <el-row class="transparent">
      <!-- 左边 start -->
      <el-col class="p-0" :span="18">
        <!--搜索 start-->
        <el-col class="toolbar">
          <el-form :inline="true" :model="filters" @submit.native.prevent>
            <el-col :span="24">
              <el-form-item label="选择设备">
                <el-input v-model.trim="deviceName" size="medium" @click.native="showSelectDevice"
                  placeholder="点击选择设备" readonly class='pointer'>
                </el-input>
              </el-form-item>
              <el-form-item label="选择设备参数">
                <el-input v-model.trim="parameterName" size="medium" @click.native="showSelectDeviceParameter"
                  placeholder="点击选择参数" readonly class='pointer' :disabled="filters.deviceId === ''">
                </el-input>
              </el-form-item>
            </el-col>
          </el-form>
        </el-col>
        <!--搜索 end-->

        <el-col class="lh-40" :span="24" v-loading="visible.chartDataLoading" v-if="parameterName !== ''" style="min-height: 340px;">
          <div class="card" v-for="(data, index) in deviceData" :key="index" v-if="deviceData.length !== 0">
            <!-- <div class="card-title-name">{{ data.name }} {{ data.model }}</div> -->
            <!-- 设备参数折线图 -->
            <el-row class="transparent mb-3" :gutter="20">
              <el-col class="mb-2" :span="24" v-for="(parameter, index) in data.parameters" :key="index" v-if="data.parameters && data.parameters.length > 0">
                <el-col class="bg-white">
                  <el-row>
                    <el-col :span="12"><div class="title-name ml-1">{{ parameter.name }}</div></el-col>
                    <el-col :span="12" class="text-right">
                      <el-button type="text" size="medium" @click="handleView(data, parameter)">查看参数详情</el-button>
                    </el-col>
                  </el-row>
                  <!-- 折线图组件 -->
                  <process-device-collect-chart :parameter="parameter.values"></process-device-collect-chart>
                </el-col>
              </el-col>
            </el-row>
            <!--设备采集图像-->
            <el-row class="transparent mb-3" :span="24">
              <el-col class="bg-white mb-2" v-show="data.img.length !== 0">
                <div class="title-name ml-3">设备采集图像</div>
                <div style="max-height: 600px; overflow: auto;">
                  <!-- 图像组件 -->
                  <process-collect-picture :device-image="data.img"></process-collect-picture>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-col>
      <!-- 左边 end -->

      <!-- 右边 start -->
      <el-col class="p-2" :span="6" v-loading="visible.listLoading">
        <el-col class="lh-40 bg-gray" :span="24">
          <div class="card color-white">
            <div>
              <div class="card-title-name ml-2">{{ processDetailsData.device_name }}</div>
              <div class="card-data">
                <h3>工序持续时间：</h3>
                <p>{{ processDetailsData.keep_time }}</p>
                <h3>工序起止时间：</h3>
                <p>开始：{{ processDetailsData.realtime_start_time }}</p>
                <p>结束：{{ processDetailsData.realtime_end_time }}</p>
              </div>
            </div>
            <div>
              <div class="card-title-name ml-2">工序参数</div>
              <div class="card-data" v-for="(data, index) in processDetailsData.parameters" :key="index">
                <h3>参数名称：{{ data.parameter_name }}</h3>
                <p v-for="(val, valIndex) in data.value" :key="valIndex">参数值：{{ val }}</p>
              </div>
            </div>
          </div>
        </el-col>
      </el-col>
      <!-- 右边 end -->
    </el-row>

    <!-- 设备弹窗 -->
    <process-device-dialog
      :visible.sync="visible.deviceDialog"
      :warn-unit-id="this.filters.warningUintId"
      :selected-ids="deviceSelectedIds"
      @selected="handleSelectedDevice">
    </process-device-dialog>

    <!-- 设备参数弹窗 -->
    <process-device-parameter-dialog 
      :visible.sync="visible.parameterDialog"
      :parameter-ids="parameterDialogIds"
      :selected-ids="deviceParameterSelectedIds"
      @selected="handleSelectedDeviceParameter">
    </process-device-parameter-dialog>

    <!-- 查看所有参数详情 -->
    <process-device-parmeter-dialog
      :unit-type-id="filters.warningUintTypeId"
      :warning-uint-id="filters.warningUintId"
      :device-id="filters.deviceId"
      :device-parameter-id="filters.deviceParameterId"
      :show.sync="visible.dialog"
      :startTime="filters.startTime"
      :endTime="filters.endTime">
    </process-device-parmeter-dialog>
	</section>
</template>

<script>
  import utils from './../../../common/js/utils'
  import {
    queryTranceProcess,
    queryTranceAbnormalById,
    queryWarningLevel,
    queryDeviceProcess
  } from '../../../api/api'
  import ProcessDeviceCollectChart from './../components/ProcessDeviceCollectChart.vue'
  import ProcessCollectPicture from './../components/ProcessCollectPicture.vue'
  import ProcessDeviceParmeterDialog from './../components/ProcessDeviceParmeterDialog.vue'
  import ProcessDeviceDialog from '../../sysConfig/components/ProcessDeviceDialog.vue'
  import ProcessDeviceParameterDialog from '../../sysConfig/components/ProcessDeviceParameterDialog.vue'
  export default {
    name: 'process-details',
    data () {
      return {
        filters: {
          warningUintTypeId: this.$route.query.unitTypeId,
          warningUintId: this.$route.query.warningUnitId,
          // type: 'detail',
          deviceId: '',
          deviceParameterId: '',
          levelId: '',
          page: 1,
          pageSize: 100,
          startTime: utils.formatDate.format(new Date(parseInt(this.$route.query.startTime)), 'yyyy-MM-dd hh:mm:ss'),
          endTime: utils.formatDate.format(new Date(parseInt(this.$route.query.endTime)), 'yyyy-MM-dd hh:mm:ss')
        },
        deviceName: '',
        parameterName: '',
        warnCategoryId: '',
        process_id: '',
        processDetailsData: {
          device_name: '',
          realtime_start_time: '',
          realtime_end_time: '',
          keep_time: '',
          parameters: []
        },
        deviceData: [
          {
            device_id: '',
            name: '',
            model: '',
            parameters: [
              // {
              //   name: '参数名',
              //   values: [{time: '2017', value: 12}, {time: '2018', value: 23}]
              // }
            ],
            img: []
          }
        ],
        device_id: '',
        device_parameter_id: '',
        visible: {
          listLoading: true,
          dialog: false,
          deviceDialog: false,
          parameterDialog: false,
          chartDataLoading: true
        },
        deviceSelectedIds: [],
        deviceParameterSelectedIds: [],
        parameterDialogIds: {
          warnUnitId: '',
          warnCategoryId: '',
          deviceId: '',
          random: Math.random()
        }
      }
    },
    components: {
      ProcessDeviceCollectChart,
      ProcessCollectPicture,
      ProcessDeviceParmeterDialog,
      ProcessDeviceDialog,
      ProcessDeviceParameterDialog
    },
    mounted () {
      this.getBasicData()
    },
    methods: {
      // 选择设备
      showSelectDevice () {
        this.visible.deviceDialog = true
      },
      // 右侧数据
      getBasicData () {
        this.visible.listLoading = true
        queryTranceProcess({
          unitTypeId: this.$route.query.unitTypeId,
          warnUnitId: this.$route.query.warningUnitId,
          type: 'detail',
          page: 1,
          pageSize: 100,
          startTime: this.filters.startTime,
          endTime: this.filters.endTime
        }).then(res => {
          this.processDetailsData = {
            device_name: '',
            realtime_start_time: '',
            realtime_end_time: '',
            keep_time: '',
            parameters: []
          }
          if (res.status === 0) {
            const processDetails = res.map.processDetails
            // 右侧数据
            this.processDetailsData = {
              device_name: processDetails[0].warning_unit_name,
              realtime_start_time: processDetails[0].realtime_start_time ? utils.formatDate.format(new Date(processDetails[0].realtime_start_time), 'hh:mm MM月dd日 yyyy年') : '无',
              realtime_end_time: processDetails[0].realtime_end_time ? utils.formatDate.format(new Date(processDetails[0].realtime_end_time), 'hh:mm MM月dd日 yyyy年') : '无',
              keep_time: '',
              parameters: []
            }
            processDetails[0].map.forEach(val => {
              this.processDetailsData.parameters.push({
                parameter_name: val.id,
                value: val.value.split(',')
              })
            })
          }
          this.visible.listLoading = false
        })
      },
      // 选择设备参数
      showSelectDeviceParameter () {
        if (this.filters.deviceId !== '') {
          this.parameterDialogIds = {
            warnUnitId: this.filters.warningUintId,
            warnCategoryId: this.warnCategoryId,
            deviceId: this.filters.deviceId,
            random: Math.random()
          }
          this.visible.parameterDialog = true
        }
      },
      // 选中设备
      handleSelectedDevice (row) {
        this.filters.deviceId = row.device_id
        this.deviceName = row.device_name
        // 选择设备参数要用哦
        this.warnCategoryId = row.warning_category_id
        this.deviceSelectedIds = [this.filters.deviceId]
        // 清空设备参数
        this.filters.deviceParameterId = ''
        this.parameterName = ''
      },
      // 选中设备参数
      handleSelectedDeviceParameter (row) {
        this.filters.deviceParameterId = row.warningDeviceParameterDO.device_parameter_id
        this.parameterName = row.warningDeviceParameterDO.parameter_name
        this.deviceParameterSelectedIds = [this.filters.deviceParameterId]
        this.initPage()
      },
      initPage () {
        // 左侧列表
        this.visible.chartDataLoading = true
        queryDeviceProcess(this.filters).then(res => {
          if (res.status === 0) {
            let list = res.map.realtimeColloctorDataWarining
            this.deviceData = [
              {
                device_id: '',
                name: '',
                model: '',
                parameters: [
                  {
                    id: list[0].device_paramter_id,
                    name: list[0].parameter_name,
                    values: []
                  }
                ],
                img: []
              }
            ]
            list.forEach((data, a) => {
              this.deviceData[0].parameters[0].values.push(
                {
                  time: utils.formatDate.format(new Date(data.collector_time), a === 0 ? 'yyyy-MM-dd hh:mm:ss' : 'hh:mm:ss'),
                  value: data.parameter_value
                }
              )

              return;
              data.deviceInfos && data.deviceInfos.forEach((item, b) => {
                this.deviceData.push({
                  device_id: item.device_id,
                  name: item.device_name,
                  model: item.device_number,
                  parameters: [],
                  img: []
                })
                item.deviceParameterDOs.forEach((device, c) => {
                  this.deviceData[utils.getArraysIndex([a, b])].parameters.push({
                    id: device.device_parameter_id,
                    name: device.realtimeColloctorDataDOs[0].parameter_name,
                    values: []
                  })
                  device.realtimeColloctorDataDOs.forEach((parameter, d) => {
                    if (d < 10) {
                      this.deviceData[utils.getArraysIndex([a, b])].parameters[c].value.push({
                        time: utils.formatDate.format(new Date(parameter.collector_time), 'MM-dd hh:mm'),
                        values: parameter.parameter_value
                      })
                    }
                  })
                })
              })
            })
          } else {
            this.$message.error(res.errorMsg)
          }
          this.visible.chartDataLoading = false
        })
      },
      // 查看详情
      handleView (device, parameters) {
        this.visible.dialog = true
      }
    }
  }
</script>
<style scoped  lang="scss">
@import '~scss_vars';
.card {
  .card-title-name {
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
  .title-name {
    font-size: 18px;
  }
  .card-data {
    border: 1px solid white;
    border-radius: 5px;
    margin: 10px;
    h3 {
      margin: 5px;
    }
    p {
      margin: 0 15px;
    }
  }
}
</style>
