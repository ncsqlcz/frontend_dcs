/*
 * @Author: liucz 
 * @Date: 2018-06-20 10:50:42 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-27 20:30:55
 */
<template>
  <section>
    <!--顶部 start-->
    <el-row class="transparent lh-40">
      <el-col class="py-2" :span="12">
        <div class="card">
          <div class="title-name">
            <span>{{ alarmUnitName }}</span>
            <span class="ml-3">{{ currentTime + '' }}</span>
            <span class="ml-3">设备总数: {{ deviceList.length }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <el-col class="text-right perspective-wrap mt-2" v-if="getPerspectiveList.length > 0">
          <el-form :inline="true" :model="filters" @submit.native.prevent>
            <el-form-item>
              <el-input v-model.trim="filters.keyword" size="medium" placeholder="输入关键字" @keyup.native.enter="getList"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="medium" @click="getList" icon="el-icon-search">查询</el-button>
              <el-button size="medium" @click="reset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-col>
    </el-row>
    <!--顶部 end-->

    <el-row class="transparent">
      <el-col class="py-2">
        <!-- 左边 -->
        <el-col class="lh-40 left-grid">
          <environment-parameters
            :unit-type-id="filters.unitTypeId" 
            :unit-id="filters.warningUnitId"
          ></environment-parameters>

          <div class="card mt-3">
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
              <div class="title-name">设备监控报警</div>
              <el-row class="mb-3 transparent">
                <el-col :span="24" style="height: 40px;">
                  <!-- 报警颜色组件 -->
                  <alarm-color @loaded="getList"></alarm-color>
                </el-col>
              </el-row>
            </div>
            <el-row class="mb-3 transparent" v-loading="visible.deviceLoading" style="min-height: 500px;">
              <el-col :span="24" class="alarm-unit-container">
                <!-- 报警单元组件 -->
                <span class="alarm-unit-list mt-3" v-for="(item, index) in deviceList" :key="index">
                  <alarm-unit :title="item.device_name" :list="item.list" :total="item.deviceTotalNumber" :id="item.device_id" 
                    @WrapClick="handleWrapClick" @ColorClick="handleColorClick">
                    <div slot="info" class="device-info mt-2" style="margin-bottom: -12px; line-height: 28px;">
                      <el-row>
                        <el-col :span="12" class="text-right pr-1 color-666">设 备 编 号: </el-col>
                        <el-col :span="12" class="text-left pl-1 color-666">{{ item.device_number }}</el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="12" class="text-right pr-1 color-666">设 备  I P: </el-col>
                        <el-col :span="12" class="text-left pl-1 color-666">{{ item.device_ip }}</el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="12" class="text-right pr-1 color-666">设 备 冗 余: </el-col>
                        <el-col :span="12" class="text-left pl-1 color-666" :class="{'color-active': item.device_backup_status === '0'}">
                          {{ item.device_backup_status === '0' ? '冗余中' : '未冗余' }}
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="12" class="text-right pr-1 color-666">设备开机时长: </el-col>
                        <el-col :span="12" class="text-left pl-1 color-666">{{ getBootTime(item.deviceStartTime) }}</el-col>
                      </el-row>
                    </div>
                  </alarm-unit>
                </span>
              </el-col>
            </el-row>
            
          </el-col>
        </el-col>
      </el-col>
    </el-row>

  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import {
    queryDeviceInfo,
    queryalertStatistic,
    queryTimeConf
  } from '../../api/api'
  // import SocketService from '../../common/js/websocket'
  import { mapActions, mapGetters } from 'vuex'
  import AlarmCountChart from './components/AlarmCountChart.vue'
  import AlarmColor from './components/AlarmColor.vue'
  import AlarmUnit from './components/AlarmUnit.vue'
  import EnvironmentParameters from './components/EnvironmentParameters.vue'
  import AlarmSocketService from '@/mixins/AlarmSocketService.js'
  export default {
    name: 'Real-Time-Alarm-Unit',
    mixins: [AlarmSocketService],
    data () {
      return {
        filters: {
          unitTypeId: this.$route.query.unitTypeId,
          warningUnitId: this.$route.params.id,
          keyword: '',
          // type: '',
          // pageSize: 10,
          // page: 1,
          // total: 0
        },
        list: [],
        visible: {
          listLoading: true,
          deviceLoading: true,
          statisticLoading: true
        },
        alarmUnitName: '搅拌设备',
        perspectiveValue: '',
        currentTime: '',
        deviceTotalNumber: '123',
        unitTotalNumber: '15',
        lastTime: '',
        statistic: [],
        offlineAlarmNum: 0,
        haltAlarmNum: 0,
        deviceList: [],
        deviceDict: {},
        timeList: []
      }
    },
    components: { AlarmCountChart, AlarmColor, AlarmUnit, EnvironmentParameters },
    computed: {
      ...mapGetters(['getAlarmColorList', 'getPerspectiveList', 'getAlarmColorDict']),
      currentPerspectiveName () {
        let label = ''
        this.getPerspectiveList.forEach(item => {
          if (item.value === this.perspectiveValue) {
            label = item.label
          }
        })
        return label
      }
    },
    mounted () {
      this.currentTimeTick()
      this.initPerspectiveList().then(this.initPage)
      this.initAlarmSocketService(`{ "warnUnitId": "${this.filters.warningUnitId}" }`)
      this.getTimeList()
    },
    methods: {
      ...mapActions(['initPerspectiveList']),
      reset () {
        this.filters.keyword = ''
        this.getList()
      },
      // 初始化页面
      initPage () {
        this.perspectiveValue = this.getPerspectiveList[0].value
      },
      // 获取时间范围
      getTimeList () {
        queryTimeConf({unitTypeId: this.filters.unitTypeId}).then(res => {
          if (res.status === 0) {
            res.map.time.forEach(item => {
              if (item.type === 'alert') {
                this.timeList = item.round_level.split('#')
                this.lastTime = this.timeList[0]
              }
            })
            this.queryStatistic()
          } else {
            this.timeList = []
          }
        })
      },
      getList () {
        this.visible.deviceLoading = true
        queryDeviceInfo(this.filters).then(res => {
          if (res.status === 0) {
            this.deviceList = []
            res.map.devices.forEach(item => {
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
            })
          } else {
            this.deviceList = []
          }
          this.visible.deviceLoading = false
        })
      },
      // 近期报警统计
      queryStatistic () {
        this.visible.statisticLoading = true
        queryalertStatistic({
          warningUintTypeId: this.filters.unitTypeId,
          warnUnitId: this.filters.warningUnitId,
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
      getRandomLevel () {
        let arr = ['L1', 'L2', 'L3', 'L4', 'L5']
        let index = Math.floor(Math.random() * 5)
        return arr[index]
      },
      currentTimeTick () {
        this.currentTime = utils.formatDate.format(new Date(), 'hh:mm MM月dd日 yyyy年')
        setInterval(() => {
          this.currentTime = utils.formatDate.format(new Date(), 'hh:mm MM月dd日 yyyy年')
          // 设备开机时长自动自增
          this.deviceList.forEach(device => {
            device.deviceStartTime += 1000
          })
        }, 1000)
      },
      // 跳转到 报警参数页面
      handleColorClick (deviceId, dataItem) {
        console.log(dataItem)
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
      handleWrapClick (deviceId) {
        this.$router.push({
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
      // 设置单元的报警类型
      setUnitAlarmLevel (map, level = 'L1') {
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
        //     device_backup_status: '1'
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
      }
    },
    watch: {}
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
</style>
