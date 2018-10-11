<template>
	<section>
    <el-row class="transparent">
      <!-- 左边 start -->
      <el-col class="p-2" :span="15">
        <el-row class="transparent mb-3">
          <el-col :span="4">
            <h3>{{ processData.name }}</h3>
          </el-col>
          <el-col :span="14">
            <h3 class="mr-4" style="float: left;">工序开始时间： {{ processData.start_time }}</h3>
            <h3 class="mr-3">工序持续时间： <span style="color: #409EFF">{{ getFormatKeepTime }}</span></h3>
          </el-col>
          <el-col class="text-right" :span="6">
            <h3>{{ currentTime + '' }}</h3>
          </el-col>
        </el-row>
        <!-- 设备实时参数 -->
        <el-col class="lh-40" :span="24" v-loading="visible.listLoading" style="min-height: 400px;">

          <!-- 所有设备 -->
          <el-radio-group v-model="deviceId" @change="handleDeviceChange">
            <el-radio-button v-for="item in deviceData" :key="item.value" :label="item.device_id" >{{ item.device_name }}</el-radio-button>
          </el-radio-group>

          <!-- 报警颜色组件 -->
          <alarm-color @loaded="initPage" class="mt-3"></alarm-color>
          <div style="width: 300px;" class="mt-3">
            <!-- 报警单元组件 -->
            <alarm-unit title=""
            v-if="device"
            :list="device.list"
            :id="device.device_id"
            @ColorClick="handleColorClick">
            </alarm-unit>
          </div>

          <!-- <span class="color-999">选择设备：</span>
          <el-select v-model="deviceId" placeholder="选择设备" size="medium" @change="handleDeviceChange">
            <el-option v-for="item in deviceData" :key="item.value" :label="item.device_name" :value="item.device_id"></el-option>
          </el-select> -->

          <div class="card" v-if="device">
              <!-- <div class="card-title-name">{{ device.device_name }}</div> -->
              <div class="mt-3 mb-3">
                <!-- 报警类型组件 -->
                <!-- <process-alarm ></process-alarm> -->
              </div>
              <!-- 设备参数折线图 -->
              <el-row class="transparent mb-3">
                <el-col 
                class="mb-4 full-screen-wrap"
                :span="24"
                v-for="(data, idx) in device.parameters"
                :key="data.device_paramter_id"
                v-if="device.parameters.length > 0">
                  <el-col class="bg-white h-100" :ref="'parameter_' + '_' + idx">
                    <el-row>
                      <el-col :span="12"><div class="title-name pl-2">{{ data.parameter_name + ' (' + data.paramter_unit + ')' }}</div></el-col>
                      <el-col :span="12" class="text-right full-screen-wrap">
                        <i class="fa fa-arrows-alt full-screen pointer mr-2" @click="fullScreen('parameter_' + '_' + idx)"></i>
                      </el-col>
                    </el-row>
                    <el-row class="h-100">
                      <!-- 折线图组件 -->
                      <process-device-collect-chart :parameter="data.values" :resize="resizeNum"></process-device-collect-chart>
                    </el-row>
                  </el-col>
                </el-col>
                <el-col v-if="!visible.parameterLoading && device.parameters.length === 0" class="color-999 text-center">暂无数据</el-col>
              </el-row>

              <!--设备实时采集图像-->
              <el-row class="transparent mb-3" :span="24" v-if="deviceImg.length > 0">
                <el-col class="bg-white p-2 mb-2">
                  <el-row>
                    <el-col :span="12"><div class="title-name ml-1">设备实时采集图像</div></el-col>
                    <el-col :span="12" class="text-right full-screen-wrap">
                      <i class="fa fa-arrows-alt full-screen pointer" @click="fullScreen('picture_' + index + '_' + idx)"></i>
                    </el-col>
                  </el-row>
                  <div style="max-height: 250px; overflow: auto;">
                    <!-- 图像组件 -->
                    <el-row class="full-screen-wrap" :ref="'picture_' + index + '_' + idx">
                      <process-collect-picture :device-image="deviceImg[index]"></process-collect-picture>
                    </el-row>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-col>
      </el-col>
      <!-- 左边 end -->
      <!-- 右边 start-->
      <el-col 
        class="shadow"
        :span="8" 
        v-loading="visible.listLoading" 
        style="position: fixed; z-index: 9; max-height: 672px; right: 0; overflow-y: auto; overflow-x: hidden; border-radius: 8px;"
      >
        <el-col class="lh-40 bg-gray p-3" :span="24">
          <div class="card color-white">
            <div>
              <div class="card-title-name">工序生产执行</div>
              <div>
                <span>工序起止依据判断</span>
                <div class="text-center process-switch-wrap">
                  <el-switch
                    v-model="isAuto"
                    active-text="自动判断"
                    inactive-text="手动判断"
                    active-value="1"
                    inactive-value="0"
                    :disabled="isStart === '1'"
                    @change="handleAutoChange">
                  </el-switch>
                </div>
              </div>
              <div class="mb-2">
                <el-row class="bg-gray" v-for="(selectData, index) in processParameter.processSelectParameter" :key="index">
                  <process-management-select
                    :id="selectData.id"
                    :selectData="selectData"
                    :processState="processState"
                    @change="handleParameterChange">
                  </process-management-select>
                </el-row>
              </div>
              <div v-show="isAuto === '0'" class="text-center mt-3">
                <el-button type="primary" round @click="startProcess" :disabled="isStart === '1'">工序开始</el-button>
                <el-button type="danger" round @click="endProcess" :disabled="isStart === '0'">工序结束</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-col>
      <!-- 右边 end-->
    </el-row>
	</section>
</template>

<script>
import utils from '../../common/js/utils'
import {
  queryProcessExecuteConf,
  saveProcessStartTime,
  modifyProcessEndTime,
  modifyProcessExecuteStatus,
  saveProcessForAuto,
  queryWarningConfUnitWorkingStatus,
  queryWarningDeviceParamLevel,
  saveProcessParameter
} from '../../api/api'
import { mapActions, mapGetters } from 'vuex'
import SocketService from '../../common/js/websocket'
import AlarmColor from './../alarm/components/AlarmColor.vue'
import ProcessAlarm from './components/ProcessAlarm.vue'
import ProcessCollectPicture from './../trace/components/ProcessCollectPicture.vue'
import ProcessDeviceCollectChart from './../trace/components/ProcessDeviceCollectChart.vue'
import ProcessManagementSelect from './components/ProcessManagementSelect.vue'
import AlarmUnit from '../alarm/components/AlarmUnit.vue'
export default {
  name: '',
  data () {
    return {
      filters: {
        warningUnitId: '',
        unitTypeId: '',
      },
      currentTime: '',
      isAuto: '1', // 是否是自动判断，默认 1：自动
      autoType: '', // 自动判断的类型 device sweep
      isStart: '0', // 工序是否已经开始，默认 0：未开始
      processData: {
        id: '',
        name: '',
        start_time: '',
        keep_time: '',
        deviceId: [],
        processSelectParameter: [
          // {
          //   id: '1',
          //   name: 'oddNumbers',
          //   title: '工单编号',
          //   value: [],
          //   lock: false
          // }
        ]
      },
      deviceId: '',
      device: null,
      deviceData: [],
      deviceDict: [],
      deviceImg: [],
      visible: {
        listLoading: false,
        processButton: true,
        parameterLoading: true
      },
      processState: 'start',
      processParameter: {},  // 工序参数
      recordId: '', // 接口需要的主键id
      unitWorkingStatusId: '',
      resizeNum: 0,
      socketServiceList: [],
      autoSocketService: null,
      alarmSocketService: null
    }
  },
  computed: {
    ...mapGetters(['getAlarmColorList']),
    getFormatKeepTime () {
      return utils.getBootTime(this.processData.keep_time)
    }
  },
  components: { 
    AlarmColor, 
    ProcessAlarm, 
    ProcessCollectPicture, 
    ProcessDeviceCollectChart,
    ProcessManagementSelect,
    AlarmUnit
  },
  created () {
    // 如果没有登录，则直接跳到登录界面
  },
  mounted () {
    this.getList()
    this.currentTimeTick()
  },
  methods: {
    initPage () {},
    // 手动 自动改变
    handleAutoChange (value) {
      this.visible.processButton = !this.visible.processButton
        modifyProcessExecuteStatus({
          unitWorkingStatusId: this.unitWorkingStatusId,
          unitWorkingMode: value
        }).then(res => {
          if (res.status === 0) {
            this.$message.success(res.msg)
            // 自动判断有id
            if (value === '1') {
              // 如果是设备自动
              if (this.autoType === 'device') {
                this.recordId = ''
                this.initAutoSocketService()
              } else {
                this.recordId = res.map.realtime_unit_para_record_id || ''
              }
            } else {
              this.recordId = ''
              if (this.autoSocketService) {
                this.autoSocketService.close()
              }
            }
          } else {
            this.$message.error(res.msg)
          }
        })
    },
    // 工序开始
    startProcess () {
      this.$confirm('', '提示', {
        message: '确认开始吗？开始后无法再次修改自动、手动判断。',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          this.processState = 'start'
          saveProcessStartTime({
            warnUnitId: this.filters.warningUnitId
          }).then(res => {
            if (res.status === 0) {
              this.isStart = res.map.isStart
              this.recordId = res.map.realtime_unit_para_record_id || ''
              this.$message.success('工序已开始')
            } else {
              this.recordId = ''
              this.$message.error(res.msg)
            }
          })
        }
      }).catch(err => {})
    },
    // 结束工序
    endProcess () {
      // console.log(this.processParameter)
      let paraList = []
      this.processParameter.processSelectParameter.forEach((item, index) => {
        paraList[index] = {
          id: item.id,
          value: item.value.join(',')
        }
      })
      // 工序结束
      this.processState = 'end'
      modifyProcessEndTime({
        unitParaRecordId: this.recordId || '',
        paraList: JSON.stringify(paraList)
      }).then(res => {
        if (res.status === 0) {
          this.isStart = res.map.isStart
          this.$message.success(res.msg)
          this.recordId = ''
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 初始化
    getList () {
      this.visible.listLoading = true
      this.filters.warningUnitId = this.$route.query.unitId
      if (!this.filters.warningUnitId) {
        this.$router.push({path: '/site/process/login'})
        // this.$message.info('请先登录')
        return
      }
      queryProcessExecuteConf({
        warnUnitId: this.filters.warningUnitId
      }).then(res => {
        if (res.status === 0) {
          this.filters.unitTypeId = res.map.warning_unit_type_id
          this.filters.warningUnitId = res.map.warning_unit_id
          this.processData.id = res.map.process_name
          this.processData.name = res.map.process_name
          this.unitWorkingStatusId = res.map.warning_conf_unit_working_status_id
          this.recordId = res.map.realtime_unit_para_record_id || ''
          this.processData.start_time = res.map.process_start_time ? utils.formatDate.format(new Date(res.map.process_start_time), 'yyyy-MM-dd hh:mm:ss') : ''
          this.processData.keep_time = res.map.process_continue_time || 0
          // res.map.warning_start_uint_para_id
          // res.map.warning_end_uint_para_id
          
          this.isAuto = res.map.unit_working_mode || '1'
          // 自动判断的类型: device sweep
          this.autoType = res.map.type
          this.isStart = res.map.isStart || '0'

          // 右侧工序生产执行所需参数
          let paramValues = JSON.parse(res.map.realtime_paras_list || '[]')
          let params = JSON.parse(res.map.process_scene_param_ids_names)
          params.forEach(val => {
            val.id = val.process_scene_param_id
            val.name = val.process_scene_param_name
            val.title = val.process_scene_param_name
            val.value = []
            val.lock = false
            // 初始化参数值
            paramValues.forEach(paramVal => {
              if (val.id === paramVal.id && paramVal.value !== '') {
                val.value = paramVal.value.split(',')
              }
            })
          })

          this.processParameter = {
            processSelectParameter: params
          }

          // 初始化设备报警列表
          this.deviceData = []
          res.map.deviceInfoDOs.forEach(item => {
            // 构造设备参数字段
            item.parameters = []
            // 构造设备报警字段
            item.list = []

            this.deviceDict[item.device_id] = item
            item.warningConfModuleUnitDeviceParaDOs && item.warningConfModuleUnitDeviceParaDOs.forEach((val, index) => {
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
            this.deviceData.push(item)
          })
          // 默认选择第一个设备
          if (this.deviceData.length > 0) {
            this.deviceId = this.deviceData[0].device_id
            this.handleDeviceChange()
          }

          // 自动判断并且是设备的情况要用websocket
          if (this.isAuto === '1' && this.autoType === 'device') {
            // 此时要用推送过来的 recordId
            this.recordId = ''
            // 先查询工序开始结束的信息
            this.initAutoSocketService()
          }
        } else {
          this.deviceData = []
          this.processParameter = {}
        }
        this.visible.listLoading = false
      })
    },
    currentTimeTick () {
      // this.processData.keep_time = 0
      this.currentTime = utils.formatDate.format(new Date(), 'hh:mm MM月dd日 yyyy年')
      setInterval(() => {
        // 如果工序已经开始就跳时间
        if (this.isStart === '1') {
          this.processData.keep_time += 1000
        }
        this.currentTime = utils.formatDate.format(new Date(), 'hh:mm MM月dd日 yyyy年')
      }, 1000)
    },
    // 选择设备
    handleDeviceChange () {
      this.deviceData.forEach(item => {
        if (item.device_id === this.deviceId) {
          this.device = item
          this.device.parameters = []
          // this.device.list = []
          this.initAllDeviceSocket([this.device])
          this.initAlarmSocketService()
        }
      })
    },
    // 报警颜色点击回调
    handleColorClick (unitId, dataItem) {
      // console.log(dataItem)
      let alarmLevels = this.getAlarmColorList.map(v => v.value)
      alarmLevels.pop()
      // 车间如果有报警
      let hasAlarm = false
      this.device.list.forEach(item => {
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
            //     unitId: unitId,
            //     warningCategoryId: dataItem.warningCategoryId
            //   }
            // })
          break
          default:
            // 其它都是 有报警级别
            this.$router.push({ 
              path: '/monitoringAlarm/realTime/alarmLevel',
              query: {
                unitTypeId: this.filters.unitTypeId,
                unitId: this.filters.warningUnitId,
                deviceId: this.deviceId,
                warningCategoryId: dataItem.warningCategoryId
              }
            })
          break
        }
      } else {
        // 无报警的情况，跳转到报警单元详情
        // this.handleWrapClick(unitId)
      }
    },
    // 全屏
    fullScreen (ref, isEsc) {
      // console.log(ref)
      if (!ref) return
      this.$refs[ref].forEach(item => {
        if (item.isFullScreen) {
          item.isFullScreen = false
          item.$el.classList.remove('w-100', 'h-100')
          if (!isEsc) {
            utils.exitFullScreen(item.$el)
          }
        } else {
          // 按下esc键会触发 window.onresize
          window.onresize = () => {
            this.setRandNum()
            if (!utils.checkFullScreen()) {
              item.isFullScreen = true
              this.fullScreen(ref, true)
              window.onresize = null
            }
          }
          item.$el.classList.add('w-100', 'h-100')
          item.isFullScreen = true
          utils.requestFullScreen(item.$el)
        }
      })
    },
    setRandNum () {
      this.resizeNum = Math.random()
    },
    // 参数值改变 - 自动判断的时候需要 输一个值就传一遍数据
    handleParameterChange (val) {
      let paraList = []
      this.processParameter.processSelectParameter.forEach((item, index) => {
        paraList[index] = {
          id: item.id,
          value: item.value.join(',')
        }
      })
      // 自动判断
      if (this.isAuto === '1') {
        saveProcessForAuto({
          unitParaRecordId: this.recordId || '',
          paraList: JSON.stringify(paraList),
          warnUnitId: this.filters.warningUnitId
        }).then(res => {
          if (res.status === 0) {
            this.$message.success(res.msg || '已保存')
            if (res.map) {
              this.isStart = res.map.isStart
              // 工序结束清空数据
              if (this.isStart === '0') {
                this.processState = 'end'
                this.recordId = ''
              } else {
                this.processState = 'start'
              }
              // 如果是扫码枪自动判断，接收下一个realtime_unit_para_record_id
              if (this.autoType === 'sweep') {
                this.recordId = res.map.realtime_unit_para_record_id || ''
              }
            }
          } else {
            this.$message.error(res.msg)
          }
        })
      } else {
        // 手动判断自动保存
        saveProcessParameter({
          unitParaRecordId: this.recordId || '',
          paraList: JSON.stringify(paraList),
          // warnUnitId: this.filters.warningUnitId
        }).then(res => {
          if (res.status === 0) {
            this.$message.success(res.msg || '已保存')
          } else {
            this.$message.error(res.msg)
          }
        })
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
      this.clearSocketServiceList()
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
    // 设置设备实时采集参数的值
    setDeviceRealTimeData (device, map) {
      for (let i = 0, len = device.parameters.length; i < len; i++) {
        let parameter = device.parameters[i]
        // parameter.parameter_value = Math.random()
        map.forEach(item => {
          if (item.device_paramter_id === parameter.device_parameter_id) {
            parameter.values = parameter.values || []
            let valueItem = {
              time: utils.formatDate.format(new Date(item.collector_time), 'hh:mm:ss'),
              value: item.parameter_value
            }
            parameter.values = [...parameter.values, valueItem]
            // 最多不超过10个数据
            if (parameter.values.length > 9) {
              parameter.values.shift()
            }
          }
        })
      }
      this.$forceUpdate()
    },
    // 清除websocket
    clearSocketServiceList () {
      this.socketServiceList.forEach(item => {
        if (item) {
          item.close()
        }
      })
      this.socketServiceList = []
    },
    // 设备报警SocketService相关
    initAlarmSocketService () {
      if (this.alarmSocketService) {
        this.alarmSocketService.close()
      }
      this.alarmSocketService = SocketService()
      // socketService初始化
      this.alarmSocketService.connect('/webSocket')
      this.alarmSocketService.on('socket_opened', socket => {
        console.log('socket_opened:', socket)
        socket.send(`{ "warnUnitId": "${this.filters.warningUnitId}" }`)
      })
      // 重连
      this.alarmSocketService.on('socket_reconnect', () => {
        console.log('socket_reconnect')
        this.initAlarmSocketService()
      })

      // 报警单元异常数据
      this.alarmSocketService.on('warningUnitDataError', map => {
        this.setUnitAlarmLevel(map)
      })
      // 报警单元恢复正常
      this.alarmSocketService.on('warningUnitDataNormal', map => {
        this.setUnitAlarmLevel(map)
      })
    },
    // 设置单元的报警类型
    setUnitAlarmLevel (map, level = 'L1') {
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
    // 自动判断socket
    initAutoSocketService () {
      // 先断开
      if (this.autoSocketService) {
        this.autoSocketService.close()
      }
      this.autoSocketService = SocketService()
      // socketService初始化
      this.autoSocketService.connect('/webSocket3/' + this.filters.warningUnitId)
      this.autoSocketService.on('socket_opened', socket => {
        console.log('socket_opened:', socket)
        queryWarningConfUnitWorkingStatus({warningUnitId: this.filters.warningUnitId})
      })
      // 重连
      this.autoSocketService.on('socket_reconnect', () => {
        console.log('socket_reconnect')
        this.initAutoSocketService()
      })

      this.autoSocketService.on('workingStartAndEnd', data => {
        switch (data.status) {
          case 'start':
            this.isStart = '1'
            this.processState = 'start'
            this.recordId = data.recordId || ''
            this.$message.success('工序已开始')
          break
          case 'running':
            this.isStart = '1'
            this.processState = 'start'
            this.recordId = data.recordId || ''
            this.$message.success('工序正在进行中')
          break
          case 'end':
            this.isStart = '0'
            this.processState = 'end'
            this.recordId = ''
            this.$message.success('工序已结束')
          break
        }
      })
    }
  },
  watch: {},
  destroyed () {
    this.clearSocketServiceList()
    if (this.autoSocketService) {
      this.autoSocketService.close()
    }
    if (this.alarmSocketService) {
      this.alarmSocketService.close()
    }
  }
}
</script>


<style scoped lang="scss">
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
.full-screen-wrap {
  position: relative;
}
.full-screen{
    font-size: 130%;
    color: #999;
    &:hover{
      color: #666;
    }
  }
</style>

<style>
.process-switch-wrap .el-switch__label{
  color: #fff !important;
}
</style>
