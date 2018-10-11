/*
 * @Author: liucz 
 * @Date: 2018-08-01 15:05:25 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-22 18:22:52
 */
<template>
  <section>
    <div class="card clearfix parameter-container">
      <div class="title-name">环境参数</div>
      <p v-if="!visible.listLoading && deviceList.length === 0" class="color-999 text-center w-100">暂无数据</p>
      <div
        v-for="(item, index) in deviceList"
        :key="item.device_id"
        v-loading="visible.parameterLoading">
        <!-- <p class="my-0 mt-3 device-name">{{ item.device_name }}</p> -->
        <!-- 报警等级 颜色 -->
        <alarm-unit class="mt-3"
          :title="item.device_name"
          :list="item.list"
          :id="item.device_id"
          @ColorClick="handleColorClick"
        >
          <div slot="info">
            <div class="flex-wrap parameter-wrap text-center">
              <!-- 设备的参数列表 -->
              <div class="parameter-item mt-3 pointer px-2"
                v-for="(parameter, idx) in item.parameters" :key="parameter.device_parameter_id">
                <div class="p-2">
                  <h2 class="my-0 mt-1">
                    {{ parameter.parameter_value }}
                    <span class="parameter-unit">{{ parameter.paramter_unit }}</span>
                  </h2>
                  <p class="my-2">{{ parameter.parameter_name }}</p>
                </div>
              </div>
              <p v-if="!visible.parameterLoading && item.parameters.length === 0" class="color-999 text-center w-100">暂无参数数据</p>
            </div>
          </div>
        </alarm-unit>
      </div>
    </div>
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import {
    queryWarningDeviceParamLevel,
    queryEnvironmentDevice
  } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import AlarmUnit from './AlarmUnit.vue'
  import SocketService from '../../../common/js/websocket'
  export default {
    name: 'Environment-Parameters',
    data () {
      return {
        deviceList: [],
        deviceDict: [],
        visible: {
          listLoading: true,
          parameterLoading: true
        },
        warningCategoryId: '',
        socketServiceList: []
      }
    },
    props: {
      unitTypeId: {
        type: String,
        required: true
      },
      unitId: {
        type: String,
        required: true
      }
    },
    components: { AlarmUnit },
    computed: {
      ...mapGetters(['getAlarmColorList', 'getAlarmTypeList'])
    },
    mounted () {
      this.getList()
    },
    methods: {
      ...mapActions(['initAlarmColorList', 'initAlarmTypeList']),
      getList () {
        this.visible.listLoading = true
        this.initAlarmTypeList().then(res => {
          this.getAlarmTypeList.forEach(item => {
            this.visible.listLoading = false
            if (item.warning_category_name === '环境报警' || item.warning_category_name === '环境异常') {
              this.warningCategoryId = item.warning_category_id
              queryEnvironmentDevice({
                unitTypeId: this.unitTypeId,
                warnUnitId: this.unitId,
                warningCategoryId: this.warningCategoryId
              }).then(res => {
                if (res.status === 0) {
                  this.deviceList = []
                  res.map.devices.forEach(item => {
                    // 使用字典的形式可以避免数组遍历，提升性能哦
                    this.deviceDict[item.device_id] = item
                    item.parameters = item.deviceParameterDOs
                    item.deviceParameterDOs.forEach(val => {
                      
                    })
                    // 报警种类
                    // item.warningCategorys.forEach((val, index) => {
                    //   let data = {
                    //     index: index,
                    //     id: item.device_id,
                    //     unitId: this.filters.warningUnitId,
                    //     warningCategoryId: val.warning_category_id,
                    //     name: val.warning_category_name,
                    //     level: 'L1'
                    //   }
                    //   item.list = item.list || []
                    //   item.list.push(data)
                    //   item.categoryIdDict = item.categoryIdDict || {}
                    //   item.categoryIdDict[val.warning_category_id] = data
                    // })
                    this.deviceList.push(item)
                  })
                } else {
                  this.deviceList = []
                }
                this.initAllDeviceSocket(this.deviceList)
              })
            }
          })
        })
      },
      // 跳转到 报警参数页面
      handleColorClick (deviceId, dataItem) {
        let deviceItem = this.deviceDict[deviceId]
        let alarmLevels = this.getAlarmColorList.map(v => v.value)
        let hasAlarm = false
        deviceItem.list.forEach(item => {
          if (item.level !== 'L1' && alarmLevels.indexOf(item.level) > -1) {
            hasAlarm = true
          }
        })
        if (hasAlarm) {
          // 车间如果有报警
          let alarmType = '';
          switch (dataItem.name) {
            case '离线报警':
              alarmType = 'offline'
            case '停机报警':
              if (alarmType === '') {
                alarmType = 'halt'
              }
              // 无报警级别
              // this.$router.push({
              //   path: '/monitoringAlarm/realTime/device/noAlarmLevel/' + this.filters.unitTypeId,
              //   query: {
              //     type: alarmType,
              //     unitName: dataItem.unitName,
              //     unitId: this.filters.warningUnitId,
              //     warningCategoryId: dataItem.warningCategoryId
              //   }
              // })
            break
            default:
              // 其它都是 有报警级别
              this.$router.push({
                path: '/monitoringAlarm/realTime/alarmLevel',
                query: {
                  deviceId: deviceId,
                  unitTypeId: this.filters.unitTypeId,
                  unitId: this.filters.warningUnitId,
                  warningCategoryId: dataItem.warningCategoryId
                }
              })
            break
          }
        }
      },
      // 获取设备所有参数信息
      getDeviceAllParameters (deviceId) {
        return new Promise((resolve, reject) => {
          queryWarningDeviceParamLevel({
            deviceId: deviceId,
            type: 'level',
            pageSize: 1000,
            page: 1
          }).then(res => {
            if (res.status === 0) {
              resolve(res.map.warningDeviceParameters)
            } else {
              reject()
            }
          })
        })
      },
      // 所有设备实时参数
      initAllDeviceSocket (deviceData) {
        // console.log(deviceData)
        deviceData.forEach(device => {
          this.visible.parameterLoading = true
          // 获取设备的所有参数
          this.getDeviceAllParameters(device.device_id).then(parameters => {
            device.parameters = parameters
            if (parameters.length > 0) {
              let socketService = SocketService()
              this.socketServiceList.push(socketService)
              // socketService初始化
              socketService.connect('/webSocket2/' + device.device_id)
              socketService.on('socket_opened', socket => {
                // console.log('socket_opened:', socket)
              })
              // 重连
              socketService.on('socket_reconnect', () => {
                console.log('socket_reconnect')
                this.initAllDeviceSocket()
              })

              // 设备参数实时数据
              socketService.on('DeviceParameterRealTimeData', map => {
                this.setDeviceRealTimeData(device, map)
              })

              // setInterval(() => {
              //   // 仅一个数据 好测试的
              //   let map = [
              //     {
              //       "collector_id": "basicdata265b2d29c7554c1197c8b0171cef2156",
              //       "collector_time": 1531481342036,
              //       "create_time": 1531481342036,
              //       "device_id": "01A2-03",
              //       "device_paramter_id": "03cf7f0fee7e4c7ebf11224950a14a8a",
              //       "device_status": "开机",
              //       "parameter_name": "参数7",
              //       "parameter_unit": "克",
              //       "parameter_value": 60 + Math.ceil(Math.random() * 530) + '',
              //       "realtime_colloctor_data_id": "devicecontrola6e4e8dc6c6a4295b869665f9eb99c3c"
              //     }
              //   ]
              //   this.setDeviceRealTimeData(device, map)
              // }, 1000)
            }
            this.visible.parameterLoading = false
          }).catch(() => {
            this.visible.parameterLoading = false
          })
        })
      },
      // 设置设备实时采集参数
      setDeviceRealTimeData (device, map) {
        for (let i = 0, len = device.parameters.length; i < len; i++) {
          let parameter = device.parameters[i]
          // parameter.parameter_value = Math.random()
          map.forEach(item => {
            if (item.device_paramter_id === parameter.device_parameter_id) {
              parameter.parameter_value = item.parameter_value
              // parameter.values = parameter.values || []
              // let valueItem = {
              //   time: utils.formatDate.format(new Date(item.collector_time), 'hh:mm:ss'),
              //   value: item.parameter_value
              // }
              // parameter.values = [...parameter.values, valueItem]
              // // 最多不超过10个数据
              // if (parameter.values.length > 9) {
              //   parameter.values.shift()
              // }
            }
          })
        }
        this.$forceUpdate()
      },
    },
    watch: {},
    destroyed () {
      this.socketServiceList.forEach(item => {
        if (item) {
          item.close()
        }
      })
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
      vertical-align: middle;
      margin-right: 8px;
    }
  }
.parameter-wrap{
  line-height: 20px;
  align-content: center;
  .device-name {
    font-size: 16px;
  }
  .parameter-item{
    // margin-right: 3.333%;
    width: 50%;
    // width: 80px;
    // height: 80px;
    
    &>div{
      border-radius: 8px;
      background-color: rgba(0, 0, 0, .05);
    }
    .parameter-unit {
      font-size: 14px;
      color: #666;
    }
  }
  .parameter-item:nth-child(2n - 1){
    // float: right;
  }
}
</style>
