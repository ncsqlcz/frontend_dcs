/*
 * @Author: liucz 
 * @Date: 2018-06-25 13:54:08 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-27 15:50:29
 */
<template>
  <section>
    <!--顶部 start-->
    <el-row class="transparent">
      <el-row class="transparent">
      <!-- 选择日期 -->
      <el-col :span="18" class="py-3 date-wrap">
        <span class="color-666 mr-2">选择日期</span>
        <el-date-picker
          v-model="currentTime" size="medium"
          align="right" type="date"
          placeholder="选择日期"
          :picker-options="pickerOptions"
          @change="initPage"
          value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-col>
      <el-col :span="6"  class="py-3 date-wrap text-right">
        <el-form>
          <el-form-item>
             <span class="color-999">视角: </span>
              <el-select v-model="unitTypeId" placeholder="请选择视角" size="medium" @change="initPage" v-if="getPerspectiveList.length > 0">
                <el-option v-for="item in getPerspectiveList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

      <!-- 报警种类统计 -->
      <el-col :span="24" class="py-3" v-loading="visible.alarmLoading">
        <div class="card">
          <div class="title-name">报警种类统计</div>
          <el-row class="transparent py-3" v-if="getAlarmColorList.length > 0">
            <el-col style="width: 120px;" class="bg-white text-center py-2 mr-3" v-for="(item, index) in alertStatisticsData" :key="index">
              <h2 :style="{color: index < 2 ? getAlarmTypeList[index].warningLevels[0].warning_color : '#000'}">{{ item.category_num }}</h2>
              <p class="mt-1 mb-3">{{ item.category_name }}</p>
            </el-col>
          </el-row>
        </div>
      </el-col>

      <!-- 报警级别统计 -->
      <el-col :span="24" class="py-3" v-loading="visible.alarmLoading">
        <div class="card">
          <div class="title-name">报警级别统计</div>
          <el-row class="transparent mt-3">
            <el-col :span="24" class="mb-3">
              <alarm-color></alarm-color>
            </el-col>
            <el-col :span="6" class="pt-1 text-center" v-for="(item, index) in alertStatisticsData" :key="index">
              <div style="width: 96%" class="bg-white clearfix p-3">
                <alarm-count-chart :title="item.category_name" title-position="top" :data="item.paramsAlarmData" :resize="resizeNum"></alarm-count-chart>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>

      <!-- 报警次数分布统计 -->
      <el-col :span="24" v-loading="visible.alarmLoading">
        <div class="card mb-3">
          <div class="title-name">报警次数分布统计</div>
        </div>
        <div class="flex-wrap">
          <div class="alarm-count-wrap pointer"
            v-for="(item, index) in alertStatisticsList" :key="index"
            :style="{backgroundColor: getAlarmColor(index * 3).backgroundColor}"
            :class="{'color-active': active === index}"
            @click="handleAlarmUnitClick(item, index)"
            placeholder="点击查看列表数据">
            <p class="alarm-unit-name m-0 mt-2">{{ item.warningUintName }}</p>
            <p class="alarm-unit-times my-2"
              :style="{color: getAlarmColor(index * 3).color}"
            >{{ item.warningUintNum }}</p>
          </div>
        </div>
      </el-col>

      <el-col :span="24" style="min-height: 750px">
        <el-col :span="24" class="mt-3" v-if="currentAlarmUnitName !== ''">
          <!--搜索 start-->
          <el-col class="toolbar">
            <el-form :inline="true" :model="filters" @submit.native.prevent>
              <el-col :span="6" class="lh-40">{{ currentAlarmUnitName }} </el-col>
              <el-col :span="18" class="text-right">
                <el-form-item>
                  <el-select v-model="filters.warningCategoryId" placeholder="选择报警种类" size="medium" @change="getList">
                    <el-option label="全部报警种类" value=""></el-option>
                    <el-option v-for="item in getAlarmTypeList" :key="item.value" :label="item.label" :value="item.warning_category_id"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-select v-model="filters.warningLevelId" placeholder="选择报警级别" size="medium" @change="getList">
                    <el-option label="全部报警级别" value=""></el-option>
                    <el-option v-for="item in getAlarmColorList" :key="item.value" :label="item.label" :value="item.warning_level_id"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="medium" @click="handleSelectDevice">选中单元内设备</el-button>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="medium" @click="handleExportExcel" icon="fa fa-reply"> 导出EXCEL</el-button>
                </el-form-item>
                <el-form-item>
                  <!-- <el-button type="primary" size="medium" @click="getList" icon="el-icon-search">查询</el-button>
                  <el-button size="medium" @click="reset">重置</el-button> -->
                </el-form-item>
              </el-col>
            </el-form>
          </el-col>
          <!--搜索 end-->
          
          <!--列表 start-->
          <el-table :data="ColloctorDataWariningList" highlight-current-row v-loading="visible.listLoading">
            <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
            <el-table-column prop="collector_time" label="报警时间" sortable>
              <template slot-scope="scope">
                {{ getTime(scope.row.collector_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="warning_category_name" label="报警种类" sortable>
              <!-- <template slot-scope="scope">
                {{ '离线报警' }}
              </template> -->
            </el-table-column>
            <el-table-column prop="warning_level_name" label="报警级别" sortable></el-table-column>
            <el-table-column prop="device_name" label="设备名称" sortable></el-table-column>
            <el-table-column prop="device_number" label="设备编号" sortable></el-table-column>
            <el-table-column prop="device_parameter_name" label="参数名称" sortable></el-table-column>
            <el-table-column prop="device_parameter_unit" label="参数单位" sortable></el-table-column>
            <el-table-column prop="" label="报警窗口内异常值">
              <template slot-scope="scope">
                <span v-if="scope.row.warning_category_name !== '停机报警' && scope.row.warning_category_name !== '离线报警'">
                  <el-button type="text" size="medium" @click="handleView(scope.row)">点击查看</el-button>
                </span>
              </template>
            </el-table-column>
          </el-table>
          <!--列表 end-->

          <!--分页start -->
          <el-col :span="24" class="toolbar">
            <el-pagination layout="total, sizes, prev, pager, next" :page-size="filters.pageSize"
                          :total="filters.total" @current-change="handlePageChange"  @size-change="handleSizeChange">
            </el-pagination>
          </el-col>
          <!--分页end -->
        </el-col>
      </el-col>
    </el-row>
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import {
    queryWarnStatistic, queryAbnormalParam,
    abnormalParamExcelUrl,queryConfDevice
    } from '../../api/api'

  import { mapActions, mapGetters } from 'vuex'
  import AlarmCountChart from '../alarm/components/AlarmCountChart.vue'
  import AlarmColor from '../alarm/components/AlarmColor.vue'
  export default {
    name: 'Monitoring-Alarm-Log',
    data () {
      return {
        currentTime: utils.formatDate.format(new Date(), 'yyyy-MM-dd'),
        pickerOptions: utils.pickerOptionsBefore,
        filters: {
          unitId: '',
          deviceId: '',
          keyword: '',
          alarmType: '',
          alarmLevel: '',
          pageSize: 10,
          page: 1,
          warningLevels:'',
          total: 0,
          warningCategoryId: '',
          warningLevelId: ''
        },
        active: '',
        alertStatisticsData: [],
        alertNumberStatisticsList: [],
        ColloctorDataWariningList:[],
        alertStatisticsList:[],
        queryConfDeviceList:[],
        list: [],
        visible: {
          listLoading: true,
          alarmLoading: false
        },
        deviceTotalNumber: '123',
        unitTotalNumber: '15',
        lastTime: '15',
        paramsAlarmData: {},
        environmentAlarmData: {},
        resizeNum: 0,
        currentAlarmUnitName: '',
        currentAlarmUnitId: '',
        currentLevelId: '',
        unitTypeId: ''
      }
    },
    components: { AlarmCountChart, AlarmColor },
    computed: {
      ...mapGetters(['getAlarmColorList', 'getAlarmColorDict', 'getAlarmTypeList','getPerspectiveList']),
      alarmLevelList () {
        return this.getAlarmColorList.map(v => {
          return {
            label: v.label,
            value: v.value
          }
        })
      }
    },
    mounted () {
      this.initAlarmTypeList()
      this.initAlarmColorList()
      this.initPerspectiveList().then(() => {
        this.unitTypeId = this.getPerspectiveList[0].value
        this.initPage()
      })
      this.getList()
      window.onresize = () => {
        this.resizeNum = Math.random()
      }
    },
    methods: {
      ...mapActions(['initAlarmColorList', 'initAlarmTypeList', 'initPerspectiveList']),
      // 初始化页面
      initPage () {
        this.clearData()
        this.initCharts()
      },
      clearData () {
        this.active = '' // 清除选中
        this.currentAlarmUnitName = ''
        this.ColloctorDataWariningList = []
      },
      initCharts () {
        this.visible.alarmLoading = true
        queryWarnStatistic({
          startTime: this.currentTime + ' 00:00:00 ',
          endTime: this.currentTime + ' 23:59:59 ',
          unitTypeId: this.unitTypeId
        }).then((res) => {
          this.clearData()
          if (res.status === 0) {
            // this.alertStatisticsData = res.map.alertCategorys
            this.alertNumberStatisticsList = res.map.alertStatistics
            this.alertStatisticsList = res.map.alertStatistics
            if (this.alertStatisticsList.length === 0 && this.alertNumberStatisticsList.length === 0) {
              this.$message({
                message: '数据库查无数据',
                type: 'warning'
              })
            }
            res.map.alertCategorys.forEach(item => {
              item.paramsAlarmData = {L2: 0, L3: 0, L4: 0, L5: 0}   //设置所有等级的默认状态
              item.alertLevels.forEach(val => {
                item.paramsAlarmData[val.warning_level] = val.warning_level_num
              })
            })
            this.alertStatisticsData = res.map.alertCategorys
          } else {
          }
          this.visible.alarmLoading = false
        })
      },
      getRandomLevel () {
        let arr = ['L1', 'L2', 'L3', 'L4', 'L5']
        let index = Math.floor(Math.random() * 5)
        return arr[index]
      },
      // 根据报警次数获取不同背景颜色
      getAlarmColor (times) {
        let color = {
          backgroundColor: '#fff',
          color: '#666'
        }
        if (times > 0) {
          color.color = '#fff'
          color.backgroundColor = `rgba(0,0,0, ${'0.' + (Math.floor(times / 10) + 1)})`
        }
        if (times >= 70) {
          color.backgroundColor = 'rgba(0,0,0,.8)'
        }
        return color
      },
      // 点击选中报警单元
      handleAlarmUnitClick (item, index) {
        // console.log(item)
        this.currentAlarmUnitName = item.warningUintName
        this.currentAlarmUnitId = item.warning_uint_id
        this.currentAlarmLevelId = item.warning_level  //等级id
        this.warningCategoryId= item.currentCategoryId  //种类id
        this.active = index
        this.getList()
      },
      // 参数异常列表
      getList () {
        this.visible.listLoading = true
        queryAbnormalParam({
          type: 'info',
          warningUnitTypeId: this.unitTypeId,
          warningUnitId: this.currentAlarmUnitId,
          warningCategoryId: this.filters.warningCategoryId,
          warningLevelId: this.filters.warningLevelId,
          deviceId: this.filters.deviceId,
          // warningCategoryId:this报警种类
          startTime: this.currentTime + ' 00:00:00',
          endTime: this.currentTime + ' 23:59:59',
          page: this.filters.page,
          pageSize: this.filters.pageSize,
        }).then(res => {
          if (res.status === 0) {
            this.ColloctorDataWariningList = res.map.ColloctorDataWariningList
            this.filters.total = res.map.line
          } else {
            this.filters.total = 0
            this.ColloctorDataWariningList = []
          }
          this.visible.listLoading = false
        })
      },
        // 报警视角
      currentPerspectiveName () {
        let label = ''
        this.getPerspectiveList.forEach(item => {
          if (item.value === this.unitTypeId) {
            label = item.label
          }
        })
        return label
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
          alarmType: '',
          alarmLevel: '',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.timeValues = []
        this.getList()
      },
      getTime (timestamp) {
        if (!timestamp) {
            return ''
          } else {
            return utils.formatDate.format(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss')
        }
      },
      // 选中设备
      handleSelectDevice () {
        this.$mesDevice.show('选择设备', {
          params: {
            unitId: this.filters.unitId,
            keyword: '',
            type: 'all'
          },
          selectedIds: [this.filters.deviceId]
        }).then(res => {
          // console.log(res)
          // this.queryConfDeviceList = res.map.queryConfDeviceList
          this.filters.deviceId = res.rows[0].device_id
          // this.filters.deviceId = res.rows[0].device_parameter_id
          this.getList()
        })
      },
      // 导出表格
      handleExportExcel () {
        // utils.downloadFile(abnormalParamExcelUrl + '?type=Monitoring-Alarm-Log')
        utils.downloadFile(
          abnormalParamExcelUrl + 
          '?type=export' + 
          '&warningUnitTypeId=' + this.unitTypeId + 
          '&warningUnitId=' + this.currentAlarmUnitId +
          '&warningCategoryId=' + this.filters.warningCategoryId + 
          '&warningLevelId=' + this.filters.warningLevelId + 
          '&deviceId=' + this.filters.deviceId +
          '&startTime=' + this.currentTime + ' 00:00:00' +
          '&endTime=' + this.currentTime + ' 23:59:59'
         )
      },
      // 点击查看
      handleView (row) {
        // console.log(row)
        this.$router.push({
          path: '/reports/AbnormalParameters',
          query: {
            deviceId: row.device_id,
            unitTypeId: this.unitTypeId,  //视角类型id
            unitId: this.currentAlarmUnitId,
            parameteId: row.device_parameter_id,
            warningCategoryId: row.warning_category_id,
            warningLevelId: row.warning_level_id,
            alertId: row.alert_statistic_id,
            // deviceId: 'basicdata43cb890864364317804ec9e40cd0d846',  //模拟数据
            // unitTypeId: 'systemac45da54e84f49c2a47078151484f647',  //视角类型id
            // unitId: 'systemac45da54e84f49c2a47078151484f647basicdata7740b8a512d64a879d209e219fc9c82f',
            // parameteId: 'basicdata34b34b84b5nmam8e8gn8gbg',
            startTime: this.currentTime + ' 00:00:00',
            endTime: this.currentTime + ' 23:59:59'
          }
        })
      }
      // console.log(parameteId)
    },
    watch: {
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
.alarm-count-wrap{
  width: 160px;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid transparent;
  transition: .2s ease-in;
  .alarm-unit-name {
    font-size: 18px;
  }
  .alarm-unit-times {
    font-size: 44px;
  }
  &.color-active {
    border: 1px solid $color-active;
  }
  &:hover{
    border: 1px solid $color-active;
  }
}
</style>
