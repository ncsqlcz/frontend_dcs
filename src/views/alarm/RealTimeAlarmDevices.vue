/*
 * @Author: liucz 
 * @Date: 2018-06-20 15:57:02 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-28 18:26:34
 */
<template>
  <section>
    <!--顶部 start-->
    <el-row class="transparent lh-40">
      <el-col class="p-2" :span="12">
        <div class="card">
          <div class="title-name">
            <span>{{ device.device_name }}</span>
            <span class="ml-3">{{ device.device_number }}</span>
            <span class="ml-3">{{ currentTime + '' }}</span>
            <span class="ml-3" v-show="device.deviceStartTime >= 0">开机时长: {{ getBootTime(device.deviceStartTime) }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <el-col class="text-right perspective-wrap" v-if="deviceList.length > 1">
          <el-form :inline="true" :model="filters" @submit.native.prevent>
            <el-col :span="24" class="text-right">
              <el-form-item label="选择设备">
                <el-select v-model="filters.deviceId" placeholder="选择设备" size="medium" @change="realTimeParameterId = ''; getList()">
                  <el-option v-for="item in deviceList" :key="item.device_id" :label="item.device_name" :value="item.device_id"></el-option>
                </el-select>
              </el-form-item>
              <!-- <el-form-item>
                <el-input v-model.trim="filters.keyword" size="medium" placeholder="输入关键字" @keyup.native.enter="getList"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="medium" @click="getList" icon="el-icon-search">查询</el-button>
                <el-button size="medium" @click="reset">重置</el-button>
              </el-form-item> -->
            </el-col>
          </el-form>
        </el-col>
      </el-col>
    </el-row>
    <!--顶部 end-->

    <el-row class="transparent">
      <el-col class="p-2">
        <!-- 左边 -->
        <el-col class="left-grid">
          <!-- 设备报警状态 -->
          <div class="card">
            <div class="title-name lh-40">设备报警状态</div>
            <alarm-unit :title="device.device_name" :list="device.list" 
                        :id="device.device_id" class="mt-1" @ColorClick="handleColorClick">
              <div slot="info" class="device-info mt-2" style="margin-bottom: -12px; line-height: 28px;">
                <el-row>
                  <el-col :span="12" class="text-right pr-1 color-666">设 备 编 号: </el-col>
                  <el-col :span="12" class="text-left pl-1 color-666">{{ device.device_number }}</el-col>
                </el-row>
                <el-row>
                  <el-col :span="12" class="text-right pr-1 color-666">设 备  I P: </el-col>
                  <el-col :span="12" class="text-left pl-1 color-666">{{ device.device_ip }}</el-col>
                </el-row>
                <el-row>
                  <el-col :span="12" class="text-right pr-1 color-666">设 备 冗 余: </el-col>
                  <el-col :span="12" class="text-left pl-1 color-666" :class="{'color-active': device.device_backup_status === '0'}">
                    {{ device.device_backup_status === '0' ? '冗余中' : '未冗余' }}
                  </el-col>
                </el-row>
              </div>
            </alarm-unit>
          </div>

          <!-- 近期报警统计 -->
          <div class="card mt-3 lh-40">
            <div class="title-name">近期报警统计</div>
            <el-row class="transparent text-center mb-3" v-loading="visible.statisticLoading">
              <el-col :span="8" v-for="item in timeList" :key="item">
                <span :class="{'color-active': lastTime === item}" class="pointer" @click="lastTime = item; queryStatistic();">最近{{ item }}分钟</span>
              </el-col>
              
              <el-col :span="10" class="bg-white" v-if="getAlarmColorList.length > 0">
                <h2 :style="{color: getAlarmColorDict.L5.color}">{{ offlineAlarmNum }}</h2>
                <span>离线报警</span>
              </el-col>
              <el-col :span="10" :offset="4" class="bg-white" v-if="getAlarmColorList.length > 0">
                <h2 :style="{color: getAlarmColorDict.L4.color}">{{ haltAlarmNum }}</h2>
                <span>停机报警</span>
              </el-col>
              
              <!-- 异常统计图表 -->
              <el-col :span="24" class="bg-white mt-3" v-for="(item, index) in statistic" :key="index">
                <alarm-count-chart :title="item.warningCategoryName" :data="item.levelData"
                  v-if="item.warningCategoryName !== '离线报警' && item.warningCategoryName !== '停机报警'"></alarm-count-chart>
              </el-col>
            </el-row>
          </div>
        </el-col>

        <!-- 右边 -->
        <el-col class="right-grid">
          <el-col :span="24">
            <div class="card lh-40">
              <div class="title-name">实时监控报警</div>
              <el-row class="mb-3 transparent">
                <el-col :span="24" style="height: 40px;">
                  <!-- 报警颜色组件 -->
                  <alarm-color @loaded="getTimeList"></alarm-color>
                </el-col>
              </el-row>
            </div>
            <el-row class="mb-3 transparent" v-loading="visible.listLoading" style="min-height: 500px;">
              
              <!-- 实时采集参数 -->
              <div class="card lh-40 my-3">
                <div class="title-name mb-2">设备实时采集参数</div>
                <el-row class="full-screen-wrap" ref="elTable">
                  <el-table :data="device.parameters" highlight-current-row v-loading="visible.listLoading">
                    <el-table-column type="index" label="序号" width="60"></el-table-column>
                    <el-table-column prop="parameter_name" label="参数名称" sortable></el-table-column>
                    <el-table-column prop="paramter_unit" label="参数单位"></el-table-column>
                    <!-- <el-table-column prop="parameter_alarm_level" label="参数报警状态" sortable>
                      <template slot-scope="scope">
                        <span :style="{color: getAlarmColorDict[scope.row.parameter_alarm_level].color}" style="">
                          {{ getAlarmColorDict[scope.row.parameter_alarm_level].label }}
                        </span>
                      </template>
                    </el-table-column> -->
                    <el-table-column prop="parameter_value" label="参数值"></el-table-column>
                    <!-- <el-table-column prop="" label="操作">
                      <template slot-scope="scope">
                        <el-button type="text" size="mini" @click="handleHistoryErrorData(scope.row)">历史异常参数</el-button>
                      </template>
                    </el-table-column> -->
                  </el-table>
                  <i class="fa fa-arrows-alt full-screen pointer" @click="fullScreen('elTable')"></i>
                </el-row>
              </div>
              

              <!-- 实时采集参数趋势图 -->
              <div class="card lh-40 my-3">
                <div class="title-name mb-2">设备实时采集参数趋势</div>
                <el-row class="full-screen-wrap" ref="elChart">
                  <device-collect-data-chart
                    :device-id="filters.deviceId" :data="deviceParametersData" :parameters="device.parameters"
                    :resize="resizeRandomNum" :level="parameterLevelData"
                  >
                  <el-row class="my-2" slot="top">
                    <el-col :span="12" class="text-center">
                      <div style="width: 500px;">
                        <el-col :span="5">保留数据个数：</el-col>
                        <el-col :span="3" v-for="item in timeList2" :key="item">
                          <span :class="{'color-active': historyNum === item}" class="pointer" @click="historyNum = item;">{{ item }}</span>
                        </el-col>
                      </div>
                    </el-col>
                    <el-col :span="12" class="text-right">
                      <span class="color-999 mr-2">参数</span>
                      <el-select v-model="realTimeParameterId" placeholder="选择参数" size="small" @change="handleParameterChange">
                        <el-option v-for="item in device.parameters" :key="item.device_parameter_id" :label="item.parameter_name" :value="item.device_parameter_id"></el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                  </device-collect-data-chart>
                  <i class="fa fa-arrows-alt full-screen pointer" @click="fullScreen('elChart')"></i>
                </el-row>
              </div>

              <!-- 设备实时采集图像 -->
              <div class="card lh-40 my-3" v-if="pictureList.length > 0">
                <div class="title-name mb-2">设备实时采集图像</div>
                <div style="max-height: 600px; overflow: auto;">
                  <el-row class="full-screen-wrap" ref="elPicture">
                    <device-collect-picture :picture-list="pictureList"></device-collect-picture>
                    <i class="fa fa-arrows-alt full-screen pointer" @click="fullScreen('elPicture')"></i>
                  </el-row>
                </div>
              </div>


            </el-row>
          </el-col>
        </el-col>
      </el-col>
    </el-row>

    <!-- 历史异常数据弹窗 -->
    <history-data-dialog :show.sync="visible.historyDataDialog"
      :device-id="filters.deviceId" :parameter-id="parameterId"
    ></history-data-dialog>

  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import {
    queryDeviceInfo,
    queryalertStatistic,
    queryWarningDeviceParamLevel,
    realTimeAlarmSendFileToCustomer,
    queryTimeConf
  } from '../../api/api'
  import SocketService from '../../common/js/websocket'
  import { mapActions, mapGetters } from 'vuex'
  import AlarmCountChart from './components/AlarmCountChart.vue'
  import AlarmColor from './components/AlarmColor.vue'
  import HistoryDataDialog from './components/HistoryDataDialog.vue'
  import DeviceCollectDataChart from './components/DeviceCollectDataChart.vue'
  import DeviceCollectPicture from './components/DeviceCollectPicture.vue'
  import AlarmUnit from './components/AlarmUnit.vue'
  export default {
    name: 'Real-Time-Alarm-Devices',
    data () {
      return {
        filters: {
          unitTypeId: this.$route.query.unitTypeId,
          warningUnitId: this.$route.query.unitId,
          deviceId: this.$route.params.id,
          keyword: '',
          pageSize: 1000,
          page: 1,
          total: 0
        },
        list: [],
        visible: {
          listLoading: true,
          deviceLoading: true,
          historyDataDialog: false,
          statisticLoading: true,
        },
        device: {
          parameters: []
        },
        deviceList: [],
        deviceDict: {},
        currentTime: '',
        lastTime: '',
        timeList: [],
        historyNum: 60,
        timeList2: [60, 180, 300],
        statistic: [],
        offlineAlarmNum: 0,
        haltAlarmNum: 0,
        parameterId: '',
        resizeRandomNum: 0,
        deviceParametersData: {x: [], y: [], parameterUnit: ''},
        parameterLevelData: {},
        realTimeParameterId: '',
        deviceParamLevelDict: {},
        pictureList: [],
        socketService: null,
        deviceParameterSocket: null,
        pictureSocketService: null,
      }
    },
    components: {
      AlarmCountChart, AlarmColor, HistoryDataDialog,
      DeviceCollectDataChart, DeviceCollectPicture,
      AlarmUnit
    },
    computed: {
      ...mapGetters(['getAlarmColorList', 'getAlarmColorDict'])
    },
    mounted () {
      this.currentTimeTick()
      this.initPerspectiveList().then(this.getList)
      this.initSocketService()
    },
    methods: {
      ...mapActions(['initPerspectiveList', 'getEmptyLevelData']),
      // 初始化页面
      getList () {
        // 替换地址栏url
        this.handleRaplaceLocation(this.filters.deviceId)
        this.visible.listLoading = true
        queryDeviceInfo(this.filters).then(res => {
          if (res.status === 0) {
            this.deviceList = []
            res.map.devices.forEach(item => {
              item.parameters = []
              // 使用字典的形式可以避免数组遍历，提升性能哦
              this.deviceDict[item.device_id] = item
              item.warningCategorys.forEach((val, index) => {
                let data = {
                  index: index,
                  id: item.device_id,
                  unitId: this.filters.warningUnitId,
                  warningCategoryId: val.warning_category_id,
                  name: val.warning_category_name,
                  level: 'L1'
                }
                item.list = item.list || []
                item.list.push(data)
                item.categoryIdDict = item.categoryIdDict || {}
                item.categoryIdDict[val.warning_category_id] = data
              })
              this.deviceList.push(item)
              // 当前设备
              if (item.device_id === this.filters.deviceId) {
                this.device = item
                this.getDeviceAllParameters()
                this.initDeviceParametersSocketService(item.device_id)
                this.initPictureSocketService(item.device_id) 
              }
            })
          } else {
            this.deviceList = []
            this.device = {}
          }
          this.visible.listLoading = false
        })
      },
      reset () {
        this.filters = {
          unitTypeId: this.$route.query.unitTypeId,
          warningUnitId: this.$route.query.unitId,
          deviceId: this.$route.params.id,
          keyword: '',
          pageSize: 1000,
          page: 1,
          total: 0
        }
        this.getList()
      },
      // 获取时间范围
      getTimeList () {
        queryTimeConf({unitTypeId: this.filters.unitTypeId}).then(res => {
          if (res.status === 0) {
            res.map.time.forEach(item => {
              if (item.type === 'alert') {
                this.timeList = item.round_level.split('#')
                this.lastTime = this.timeList[0]
              } else if (item.type === 'trend') {
                // this.timeList2 = item.round_level.split('#')
                // this.historyNum = this.timeList2[0]
              }
            })
            this.queryStatistic()
          } else {
            this.timeList = []
          }
        })
      },
      // 近期报警统计
      queryStatistic () {
        this.visible.statisticLoading = true
        queryalertStatistic({
          warningUintTypeId: this.filters.unitTypeId,
          warnUnitId: this.filters.warningUnitId,
          deviceId: this.filters.deviceId,
          time: this.lastTime
        }).then(res => {
          if (res.status === 0 && res.map.AlertStatisticDOs.length !== 0) {
            this.statistic = []
            res.map.AlertStatisticDOs.forEach(item => {
              item.levelData = { L2: '0', L3: '0', L4: '0', L5: '0' }
              item.alertLevelDOs.forEach(val => {
                item.levelData[val.warning_level] = val.warning_level_num
                if (item.warningCategoryName === '离线报警') {
                  this.offlineAlarmNum = item.category_num
                }
                if (item.warningCategoryName === '停机报警') {
                  this.haltAlarmNum = item.category_num
                }
              })
              this.statistic.push(item)
            })
          } else {
            this.statistic = []
            this.offlineAlarmNum = 0
            this.haltAlarmNum = 0
          }
          this.visible.statisticLoading = false
        })
      },
      currentTimeTick () {
        this.currentTime = utils.formatDate.format(new Date(), 'hh:mm MM月dd日 yyyy年')
        setInterval(() => {
          this.currentTime = utils.formatDate.format(new Date(), 'hh:mm MM月dd日 yyyy年')
          // 开机时长
          this.device.deviceStartTime += 1000
        }, 1000)
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
      // 跳转到设备采集参数详情
      handleRaplaceLocation (deviceId) {
        this.$router.replace({
          path: '/monitoringAlarm/realTime/device/' + deviceId,
          query: {
            unitTypeId: this.filters.unitTypeId,
            unitId: this.filters.warningUnitId
          }
        })
      },
      getBootTime (timestamp) {
        return utils.getBootTime(timestamp)
      },
      // 历史异常参数
      handleHistoryErrorData (row) {
        console.log(row)
        this.parameterId = row.parameter_id
        this.visible.historyDataDialog = true
      },
      // 全屏
      fullScreen (ref, isEsc) {
        if (this.$refs[ref].isFullScreen) {
          this.$refs[ref].isFullScreen = false
          this.$refs[ref].$el.classList.remove('w-100', 'h-100')
          if (!isEsc) {
            utils.exitFullScreen(this.$refs[ref].$el)
          }
        } else {
          // 按下esc键会触发 window.onresize
          window.onresize = () => {
            this.setRandNum()
            if (!utils.checkFullScreen()) {
              this.$refs[ref].isFullScreen = true
              this.fullScreen(ref, true)
              window.onresize = null
            }
          }
          this.$refs[ref].$el.classList.add('w-100', 'h-100')
          this.$refs[ref].isFullScreen = true
          utils.requestFullScreen(this.$refs[ref].$el)
        }
      },
      setRandNum () {
        this.resizeRandomNum = Math.random()
      },
      // 获取设备所有参数信息
      getDeviceAllParameters () {
        queryWarningDeviceParamLevel({
          deviceId: this.filters.deviceId,
          type: 'level',
          keyword: '',
          pageSize: 1000,
          page: 1,
          total: 0
        }).then(res => {
          if (res.status === 0) {
            this.device.parameters = res.map.warningDeviceParameters
            this.handleParameterChange()
          } else {
            this.device.parameters = []
            this.realTimeParameterId = ''
          }
        })
      },
      // 实时参数改变
      handleParameterChange () {
        // 初始化采集参数趋势的参数id
        if (
          this.realTimeParameterId === '' ||
          this.realTimeParameterId === undefined &&
          this.device.parameters.length > 0
        ) {
          this.realTimeParameterId = this.device.parameters[0].device_parameter_id
        }
        this.deviceParametersData = {x:[], y:[], parameterUnit: ''}
        this.getEmptyLevelData().then(levelData => {
          // 先置为默认空数据
          this.parameterLevelData = levelData
          this.device.parameters.forEach(item => {
            if(item.device_parameter_id === this.realTimeParameterId && item.level_warning_kv) {
              this.parameterLevelData = JSON.parse(item.level_warning_kv)
              // console.log(this.parameterLevelData)
            }
          })
        })
      },
      // SocketService 设备参数报警
      initSocketService () {
        if (this.socketService) {
          this.socketService.close()
        }
        this.socketService = SocketService()
        // socketService初始化
        this.socketService.connect('/webSocket')
        this.socketService.on('socket_opened', socket => {
          console.log('socket_opened: initSocketService', socket)
        })
        // 重连
        this.socketService.on('socket_reconnect', () => {
          console.log('socket_reconnect')
          this.initSocketService()
        })

        // 报警单元异常数据
        this.socketService.on('warningUnitDataError', map => {
          this.setDeviceAlarmLevel(map)
        })
        // 报警单元恢复正常
        this.socketService.on('warningUnitDataNormal', map => {
          this.setDeviceAlarmLevel(map)
        })
      },
      // 设置单元的报警类型
      setDeviceAlarmLevel (map, level = 'L1') {
        // map = {
        //   '报警': [{
        //     device_id: 'basicdata029345fd95fe423f85e0f6def10bb279',
        //     warning_category_id: 'systema99abcdca56a4b2c8579bab8a27d8879',
        //     warning_level: 'L5',
        //     warning_uint_id: 'systemac45da54e84f49c2a47078151484f647basicdata6de2117d75fe4c7cbbfaa5b4ffb37b39',
        //     warning_unit_type_id: 'systemac45da54e84f49c2a47078151484f647',
        //     device_backup_status: '0'
        //   },{
        //     device_id: 'basicdata41f29caf29d145c2b4a6c12ec8cb1662',
        //     warning_category_id: 'system3b540f91ffcd439fab2d2795ad8d5d0a',
        //     warning_level: 'L5',
        //     warning_uint_id: 'systemac45da54e84f49c2a47078151484f647basicdata6de2117d75fe4c7cbbfaa5b4ffb37b39',
        //     warning_unit_type_id: 'systemac45da54e84f49c2a47078151484f647',
        //     device_backup_status: '0'
        //   },{
        //     device_id: 'basicdata128658ad17f74582a6093cf42d7794b9',
        //     warning_category_id: 'system5a66137813a8496fa8a2bfc861a76f22',
        //     warning_level: 'L4',
        //     warning_uint_id: 'systemac45da54e84f49c2a47078151484f647basicdata6de2117d75fe4c7cbbfaa5b4ffb37b39',
        //     warning_unit_type_id: 'systemac45da54e84f49c2a47078151484f647',
        //     device_backup_status: '0'
        //   }]
        // }
        
        Object.values(map).forEach(mapValues => {
          mapValues.forEach(data => {
            // 相同视角类型和单元id
            if (data.warning_unit_type_id === this.filters.unitTypeId && data.warning_uint_id === this.filters.warningUnitId) {
              // 设备字典
              if (this.deviceDict[data.device_id] !== undefined) {
                // 设置设备冗余状态
                this.deviceDict[data.device_id].device_backup_status = data.device_backup_status
                if (this.deviceDict[data.device_id].categoryIdDict !== undefined) {
                  let categoryObj = this.deviceDict[data.device_id].categoryIdDict[data.warning_category_id]
                  if (categoryObj !== undefined) {
                    // 更改报警等级
                    categoryObj.level = data.warning_level
                    this.deviceDict[data.device_id].list.splice(categoryObj.index, 1, categoryObj)
                  }
                }
              }
            }
          })
        })
      },
      // 设备实时参数SocketService相关
      initDeviceParametersSocketService (deviceId) {
        if (this.deviceParameterSocket) {
          this.deviceParameterSocket.close()
        }
        this.deviceParameterSocket = SocketService()
        // 模拟采集数据
        setInterval(() => {
          return;
          let data = [
              {
              "collector_id": "basicdataf72fc63bc0c446ea97184361a1ef20e1",
              "collector_time": 1531481342036,
              "create_time": 1531481342036,
              "device_id": "basicdata43cb890864364317804ec9e40cd0d846",
              "device_paramter_id": "0285304b4f6d4ba2867b596fab043dba",
              "device_status": "开机",
              "parameter_name": "参数6",
              "parameter_unit": "克",
              "parameter_value": 50 + Math.ceil(Math.random() * 30) + '',
              "realtime_colloctor_data_id": "devicecontrol35de95bbf16d4a0788d20fedb7929a6c"
            }, {
              "collector_id": "basicdata265b2d29c7554c1197c8b0171cef2156",
              "collector_time": 1531481342036,
              "create_time": 1531481342036,
              "device_id": "basicdata43cb890864364317804ec9e40cd0d846",
              "device_paramter_id": "basicdata45thrt78348fbh78fb387h465b47",
              "device_status": "开机",
              "parameter_name": "参数7",
              "parameter_unit": "克",
              "parameter_value": 60 + Math.ceil(Math.random() * 30) + '',
              "realtime_colloctor_data_id": "devicecontrola6e4e8dc6c6a4295b869665f9eb99c3c"
            }, {
              "collector_id": "basicdatae3293f36dbc442f88c653e69219dd016",
              "collector_time": 1531481342036,
              "create_time": 1531481342036,
              "device_id": "basicdata43cb890864364317804ec9e40cd0d846",
              "device_paramter_id": "basicdatad8f7bg788adsfg9fubsfbh78dsf",
              "device_status": "开机",
              "parameter_name": "参数8",
              "parameter_unit": "克",
              "parameter_value": 70 + Math.ceil(Math.random() * 30) + '',
              "realtime_colloctor_data_id": "devicecontroleabae4cbf86c495b8059e7e2b6115174"
            }, {
              "collector_id": "basicdata94e20af15428499fb7063a09b0c73fae",
              "collector_time": 1531481342036,
              "create_time": 1531481342036,
              "device_id": "basicdata43cb890864364317804ec9e40cd0d846",
              "device_paramter_id": "basicdata8d7vgsfgb7643bv45v6b67vb4",
              "device_status": "开机",
              "parameter_name": "参数9",
              "parameter_unit": "克",
              "parameter_value": 80 + Math.ceil(Math.random() * 30) + '',
              "realtime_colloctor_data_id": "devicecontrol70c82ebd87b34657a041df8d41b878bc"
            }, {
              "collector_id": "basicdatacbe579ba10e54fc79aa96f4c865dd2c5",
              "collector_time": 1531481342036,
              "create_time": 1531481342036,
              "device_id": "basicdata43cb890864364317804ec9e40cd0d846",
              "device_paramter_id": "basicdata34b34b84b5nmam8e8gn8gbg",
              "device_status": "开机",
              "parameter_name": "参数10",
              "parameter_unit": "克",
              "parameter_value": 90 + Math.ceil(Math.random() * 30) + '',
              "realtime_colloctor_data_id": "devicecontrol971543bd06d7485d9292694ecabc809f"
            }
          ]
          // 找到对应的参数id，进行赋值
          for (let i = 0, len = this.device.parameters.length; i < len; i++) {
            let parameter = this.device.parameters[i]
            parameter.parameter_value = Math.random()
            data.forEach(item => {
              parameter.collector_time = utils.formatDate.format(new Date(item.collector_time), 'yyyy-MM-dd hh:mm:ss')
              if (item.device_paramter_id === parameter.device_parameter_id) {
                parameter.parameter_value = item.parameter_value
                this.device.parameters.splice(i, 1, parameter)
              }
            })
          }
          
          this.device.parameters.forEach(item => {
            // console.log(item.device_parameter_id , this.realTimeParameterId, item.device_parameter_id === this.realTimeParameterId)
            if (item.device_parameter_id === this.realTimeParameterId) {
              let obj = {
                x: [...this.deviceParametersData.x],
                y: [...this.deviceParametersData.y],
                parameterUnit: item.parameter_unit
              }
              obj.x.push(utils.formatDate.format(new Date(item.collector_time), 'hh:mm:ss'))
              obj.y.push(-100 + Math.ceil(Math.random() * 200) + '')
              
              // 限制最多保留的历史数据
              if (obj.x.length > this.historyNum) {
                obj.x.splice(0, obj.x.length - this.historyNum)
              }
              if (obj.y.length > this.historyNum) {
                obj.y.splice(0, obj.y.length - this.historyNum)
              }
              this.deviceParametersData = obj
            }
          })
          this.$forceUpdate();
        }, 50000)

        // socketService初始化
        this.deviceParameterSocket.connect('/webSocket2/' + deviceId)
        this.deviceParameterSocket.on('socket_opened', socket => {
          console.log('socket_opened: ', socket)
        })
        // 重连
        this.deviceParameterSocket.on('socket_reconnect', () => {
          console.log('socket_reconnect')
          this.initDeviceParametersSocketService()
        })

        // 设备参数实时数据
        this.deviceParameterSocket.on('DeviceParameterRealTimeData', data => {
          // 找到对应的参数id，进行赋值
          for (let i = 0, len = this.device.parameters.length; i < len; i++) {
            let parameter = this.device.parameters[i]
            // parameter.parameter_value = Math.random()
            data.forEach(item => {
              parameter.collector_time = utils.formatDate.format(new Date(item.collector_time), 'yyyy-MM-dd hh:mm:ss')
              if (item.device_paramter_id === parameter.device_parameter_id) {
                parameter.parameter_value = item.parameter_value
                this.device.parameters.splice(i, 1, parameter)
              }
            })
          }
          
          this.device.parameters.forEach(item => {
            // console.log(item.device_parameter_id , this.realTimeParameterId, item.device_parameter_id === this.realTimeParameterId)
            if (item.device_parameter_id === this.realTimeParameterId) {
              let obj = {
                x: [...this.deviceParametersData.x],
                y: [...this.deviceParametersData.y],
                parameterUnit: item.parameter_unit
              }
              obj.x.push(utils.formatDate.format(new Date(item.collector_time), 'hh:mm:ss'))
              obj.y.push(item.parameter_value)

              // 限制最多保留的历史数据
              if (obj.x.length > this.historyNum) {
                obj.x.splice(0, obj.x.length - this.historyNum)
              }
              if (obj.y.length > this.historyNum) {
                obj.y.splice(0, obj.y.length - this.historyNum)
              }
              this.deviceParametersData = obj
            }
          })
          this.$forceUpdate();
        })
      },
      // SocketService 设备实时采集图像
      initPictureSocketService (deviceId) {
        if (this.pictureSocketService) {
          this.pictureSocketService.close()
        }
        this.pictureSocketService = SocketService()
        // socketService初始化
        this.pictureSocketService.connect('/webSocket4/' + deviceId)
        this.pictureSocketService.on('socket_opened', socket => {
          console.log('socket_opened: initPictureSocketService', socket)
        })
        // 重连
        this.pictureSocketService.on('socket_reconnect', () => {
          console.log('socket_reconnect')
          this.initPictureSocketService()
        })

        // 设备实时采集图像数据
        this.pictureSocketService.on('deviceImage', map => {
          this.setPictureList(map)
        })
      },
      setPictureList (map) {
        map.forEach ((item, index) => {
          let imgUrl = realTimeAlarmSendFileToCustomer + item.collector_file_url
          this.pictureList.push(imgUrl)
          // 最多显示51张图片
          if (this.pictureList.length > 51) {
            this.pictureList.shift()
          }
        })
      }
    },
    watch: {},
    destroyed () {
      this.socketService.close()
      this.deviceParameterSocket.close()
      this.pictureSocketService.close()
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
.left-grid {
  width: 300px !important;
}
.right-grid {
  position: relative;
  padding-left: 16px;
  width: calc(100% - 300px);
  .perspective-wrap {
    position: absolute;
    z-index: 2;
    width: 100%;
    right: 0;
  }
  .alarm-unit-container {
    display: flex;
    flex-wrap: wrap;
    .alarm-unit-list {
      display: block;
      margin-right: 1rem;
      width: 240px;
    }
  }
}
.full-screen-wrap {
  position: relative;
  // 全屏按钮
  .full-screen{
    position: absolute;
    z-index: 9;
    bottom: 0;
    right: 0;
    font-size: 130%;
    color: #999;
    &:hover{
      color: #666;
    }
  }
}
</style>
