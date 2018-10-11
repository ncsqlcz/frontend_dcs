/*
 * @Author: liucz
 * @Date: 2018-06-15 08:49:47
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-27 20:27:31
 */
<template>
  <section>
    <!--顶部 start-->
    <el-row class="transparent">
      <el-col class="py-2">
        <!-- 左边 -->
        <el-col class="lh-40 left-grid">
          <div class="card">
            <div class="title-name">{{ currentTime + '' }}</div>
            <el-row class="bg-white text-center mb-3" v-loading="visible.alarmLoading">
              <el-col :span="12">
                <h2>{{ deviceTotalNumber}}</h2>
                <span>监控设备总数</span>
              </el-col>
              <el-col :span="12">
                <h2>{{ alarmUnitList.length }}</h2>
                <span>{{ currentPerspectiveName }}总数</span>
              </el-col>
            </el-row>
          </div>

          <div class="card">
            <div class="title-name">近期报警统计</div>
            <el-row class="transparent text-center mb-3" v-loading="visible.statisticLoading" style="min-height: 300px;">
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
          <el-col class="text-right perspective-wrap" v-if="getPerspectiveList.length > 0">
            <span class="color-999">视角: </span>
            <el-select v-model="unitTypeId" placeholder="选择视角" size="medium" @change="handleUnitChange">
              <el-option v-for="item in getPerspectiveList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-col>
          <el-col :span="24">
            <div class="card lh-40">
              <div class="title-name">实时监控报警</div>
              <el-row class="mb-3 transparent">
                <el-col :span="24" style="height: 40px;">
                  <!-- 报警颜色组件 -->
                  <alarm-color @loaded="initPage"></alarm-color>
                </el-col>
              </el-row>
            </div>
            <el-row class="mb-3 transparent" v-loading="visible.alarmLoading" style="min-height: 500px;">
              <el-col :span="24" class="alarm-unit-container">
                <!-- 报警单元组件 -->
                <span class="alarm-unit-list mt-3" v-for="(item, index) in alarmUnitList" :key="index">
                  <alarm-unit :title="item.warning_unit_name" :list="item.list" :total="item.count" :id="item.warning_uint_id"
                    @WrapClick="handleWrapClick" @ColorClick="handleColorClick">
                  </alarm-unit>
                </span>
              </el-col>
            </el-row>

          </el-col>
        </el-col>
      </el-col>
    </el-row>
    <!--顶部 end-->

  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  // import SocketService from '../../common/js/websocket'
  import {
    queryalertStatistic,
    queryAllWarningUnit,
    queryTimeConf
    } from '../../api/api'
  import { mapActions, mapGetters } from 'vuex'
  import AlarmCountChart from './components/AlarmCountChart.vue'
  import AlarmColor from './components/AlarmColor.vue'
  import AlarmUnit from './components/AlarmUnit.vue'
  import AlarmSocketService from '@/mixins/AlarmSocketService.js'
  export default {
    name: 'Real-Time-Alarm-Overview',
    mixins: [AlarmSocketService],
    data () {
      return {
        unitTypeId: '',
        alarmUnitList: [],
        alarmUnitDict: {},
        visible: {
          listLoading: true,
          statisticLoading: true,
          alarmLoading: true
        },
        currentTime: '',
        deviceTotalNumber: 0,
        lastTime: '15',
        statistic: [],
        offlineAlarmNum: 0,
        haltAlarmNum: 0,
        timeList: []
      }
    },
    components: { AlarmCountChart, AlarmColor, AlarmUnit },
    computed: {
      ...mapGetters(['getAlarmColorList', 'getPerspectiveList', 'getAlarmColorDict']),
      // 报警视角
      currentPerspectiveName () {
        let label = ''
        this.getPerspectiveList.forEach(item => {
          if (item.value === this.unitTypeId) {
            label = item.label
          }
        })
        return label
      }
    },
    mounted () {
      this.currentTimeTick()
    },
    methods: {
      ...mapActions(['initPerspectiveList']),
      // 初始化报警单元列表
      initPage () {
        this.initPerspectiveList().then(() => {
          let hasId = false
          this.getPerspectiveList.forEach(item => {
            if (sessionStorage.lastSelectedUnitTypeId === item.value) {
              hasId = true
            }
          })
          if (hasId) {
            this.unitTypeId = sessionStorage.lastSelectedUnitTypeId
          } else {
            this.unitTypeId = this.getPerspectiveList[0].value
          }
          this.handleUnitChange()
        })
      },
      // 视角变化
      handleUnitChange () {
        this.initAlarmSocketService(`{ "warnUnitTypeId": "${this.unitTypeId}" }`)
        // 记录当前选择视角
        sessionStorage.lastSelectedUnitTypeId = this.unitTypeId
        this.getTimeList()
        // 查询所有报警单元
        this.visible.alarmLoading = true
        queryAllWarningUnit({warningUintTypeId: this.unitTypeId}).then(res => {
          if (res.status === 0) {
            this.alarmUnitList = []
            this.deviceTotalNumber = res.map.totalDevice
            res.map.warningUnitDOs.forEach(item => {
              // 使用字典的形式可以避免数组遍历，提升性能哦
              this.alarmUnitDict[item.warning_uint_id] = item
              item.warningConfModuleUnitDOs.forEach((val, index) => {
                let data = {
                  index: index,
                  id: item.warning_uint_id,
                  unitId: item.warning_uint_id,
                  unitName: item.warning_unit_name,
                  warningCategoryId: val.warning_category_id,
                  name: val.warning_category_name,
                  level: 'L1'
                }
                item.list = item.list || []
                item.list.push(data)
                item.categoryIdDict = item.categoryIdDict || {}
                item.categoryIdDict[val.warning_category_id] = data
              })
              this.alarmUnitList.push(item)
            })
          } else {
            this.alarmUnitList = []
          }
          this.visible.alarmLoading = false
        })
      },
      // 获取时间范围
      getTimeList () {
        queryTimeConf({unitTypeId: this.unitTypeId}).then(res => {
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
      // 近期报警统计
      queryStatistic () {
        this.visible.statisticLoading = true
        queryalertStatistic({
          warningUintTypeId: this.unitTypeId,
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
      // 当前时间 实时
      currentTimeTick () {
        this.currentTime = utils.formatDate.format(new Date(), 'hh:mm MM月dd日 yyyy年')
        setInterval(() => {
          this.currentTime = utils.formatDate.format(new Date(), 'hh:mm MM月dd日 yyyy年')
        }, 1000)
      },
      // 报警颜色点击回调
      handleColorClick (unitId, dataItem) {
        // console.log(dataItem)
        let unitItem = this.alarmUnitDict[unitId]
        let alarmLevels = this.getAlarmColorList.map(v => v.value)
        alarmLevels.pop()
        // 车间如果有报警
        let hasAlarm = false
        unitItem.list.forEach(item => {
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
              this.$router.push({
                path: '/monitoringAlarm/realTime/device/noAlarmLevel/' + this.unitTypeId,
                query: {
                  type: alarmType,
                  unitName: dataItem.unitName,
                  unitId: unitId,
                  warningCategoryId: dataItem.warningCategoryId
                }
              })
            break
            default:
              // 其它都是 有报警级别
              this.$router.push({ 
                path: '/monitoringAlarm/realTime/alarmLevel',
                query: {
                  unitTypeId: this.unitTypeId,
                  unitId: unitId,
                  warningCategoryId: dataItem.warningCategoryId
                }
              })
            break
          }
        } else {
          // 无报警的情况，跳转到报警单元详情
          this.handleWrapClick(unitId)
        }
      },
      // 点击整个车间
      handleWrapClick (unitId) {
        this.$router.push({
          path: '/monitoringAlarm/realTime/unit/' + unitId,
          query: {
            unitTypeId: this.unitTypeId
          }
        })
      },
      // 设置单元的报警类型
      setUnitAlarmLevel (map, level = 'L1') {
        Object.values(map).forEach(mapValues => {
          mapValues.forEach(data => {
            // data.alert_statistic_id
            // data.device_id
            // data.device_paramter_id
            // data.warning_category_id = 'system9e06eeb19c9b477f8d1a88cbdbdde8f9'
            // data.warning_level = 'L5'
            // data.warning_level_id
            // data.warning_uint_id = 'system0109e6acedb149d58fb970c2c6d5ece5'
            // data.warning_unit_type_id = 'system013c54d9bc974f1fa29cd7b2288378b4'

            // 相同视角类型
            if (data.warning_unit_type_id === this.unitTypeId) {
              // 报警单元字典
              // console.log(this.alarmUnitDict[data.warning_uint_id], data.warning_uint_id, this.alarmUnitDict)
              if (this.alarmUnitDict[data.warning_uint_id] !== undefined) {
                let categoryObj = this.alarmUnitDict[data.warning_uint_id].categoryIdDict[data.warning_category_id]
                if (categoryObj !== undefined) {
                  // 更改报警等级
                  categoryObj.level = data.warning_level
                  this.alarmUnitDict[data.warning_uint_id].list.splice(categoryObj.index, 1, categoryObj)
                }
              }
              // 遍历所有报警单元，找到单元下面的报警类型
              // 数组遍历实现
              // this.alarmUnitList.forEach(unit => {
              //   let arr = []
              //   unit.list.forEach(val => {
              //     // 相同单元 相同报警类型
              //     if (val.unitId === data.warning_uint_id && unit.categoryIdDict[data.warning_category_id] !== undefined) {
              //       val.level = data.warning_level
              //     }
              //     arr.push(val)
              //   })
              //   unit.list = arr
              // })
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
