/*
 * @Author: liucz 
 * @Date: 2018-06-20 10:12:13 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-22 17:52:28
 */
<template>
  <section>
    <el-row>
      <!--toolbar start-->
      <el-col class="toolbar">
        <el-form :inline="false" @submit.native.prevent>
          <el-col :span="12" class="text-left">
            <el-form-item>
              <h3 class="no-margin" v-if="type === 'unit' && unitName!==''">{{ `${unitName}: 共 ${deviceWarningReturns.length} 台设备` }}</h3>
              <h3 class="no-margin" v-if="type === 'device' && deviceName !== ''">{{ `${deviceName}: ${deviceNumber}` }}</h3>
            </el-form-item>
            <el-form-item>
              <!-- 报警颜色组件 -->
              <alarm-color @loaded="initPage"></alarm-color>
            </el-form-item>
          </el-col>
        </el-form>
      </el-col>
      <!--toolbar end-->
    </el-row>
  
    <el-row :gutter="16" v-loading="visible.chartLoading" style="min-height: 300px;" class="transparent">
      <el-col :span="24" v-for="(item, index) in deviceWarningReturns" :key="index">
        <div class="title-name my-3">{{ item.device_name + ' ' + item.device_number }}</div>
        <!-- 异常参数图表组件 -->
        <abnormal-parameters-chart v-for="(val, index2) in item.parameteList" :key="index2" class="mb-4"
            :parameter="val.parameter" :refresh="1" :resize="resizeNum">
          <div slot="top">
            <div class="alarm-level" :style="{color: getAlarmColorDict[val.alarm_level].color}">{{ getAlarmColorDict[val.alarm_level].label }}</div>
            <el-col :span="24">
              <p class="no-margin mb-2 color-666">
                <span> 参数名称: {{ val.parameter_name }}</span>
                <span class="ml-4"> 参数单位: {{ val.parameter_unit }}</span>
              </p>
              <p class="no-margin color-666">{{ val.parameter_name + '报警窗口: ' + val.window_warning_time_txt }}</p>
            </el-col>
          </div>

          <el-col :span="24" class="text-center" slot="bottom">
            <el-button type="primary" size="medium" round plain @click="handleViewAll(item, val)">查看全部异常参数</el-button>
          </el-col>
        </abnormal-parameters-chart>
      </el-col>
    </el-row>

    <!-- 全部异常参数弹窗 -->
    <el-dialog title="全部异常参数" :visible.sync="dialogVisible" width="40%" class="mes-dialog">
      <!--搜索 start-->
      <el-col class="toolbar">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-col :span="16">
            <p class="no-margin mb-2 color-666">
              <span> 设备名称: {{ parameter.device_name }}</span>
              <span class="ml-4"> 设备编号: {{ parameter.device_number }}</span>
            </p>
            <p class="no-margin color-666">{{ parameter.parameter_name + '报警窗口: ' + parameter.window_warning_time_txt }}</p>
          </el-col>
        </el-form>
      </el-col>
      <!--搜索 end-->

      <!--列表 start-->
      <el-table :data="list" highlight-current-row v-loading="visible.listLoading">
        <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
        <el-table-column prop="collector_time" label="参数采集时间" sortable>
          <template slot-scope="scope">
            {{ getTime(scope.row.collector_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="parameter_value" label="参数严重报警异常值" sortable></el-table-column>
        <el-table-column prop="parameter_unit" label="单位"></el-table-column>
      </el-table>
      <!--列表 end-->

      <!--分页start -->
      <el-col :span="24" class="toolbar">
        <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                      :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
        </el-pagination>
      </el-col>
      <!--分页end -->

      <div slot="footer" class="dialog-footer mt-3">
        <el-button size="medium" @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
    
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import { queryWarnUnitByUnitTypeId } from '../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import AlarmColor from './components/AlarmColor.vue'
  import AbnormalParametersChart from './components/AbnormalParametersChart.vue'
  export default {
    name: 'Alarm-Params-No-Level',
    data () {
      return {
        basicFilters: {
          unitTypeId: this.$route.query.unitTypeId,
          unitId: this.$route.query.unitId,
          deviceId: this.$route.query.deviceId,
          warningCategoryId: this.$route.query.warningCategoryId,
          type: 'info'
        },
        filters: {
          deviceId: '',
          parameterId: '',
          // startTime: '',
          // endTime: '',
          createTime: '',
          page: 1,
          pageSize: 10,
          type: 'detail',
        },
        deviceWarningReturns: [],
        list: [],
        visible: {
          chartLoading: true,
          listLoading: true,
        },
        dialogVisible: false,
        type: '',
        unitName: '',
        totalDevice: 5,
        deviceName: '',
        deviceNumber: '',
        resizeNum: Math.random(),
        parameter: {}
      }
    },
    components: { AlarmColor, AbnormalParametersChart },
    computed: {
      ...mapGetters(['getAlarmColorDict'])
    },
    mounted () {
      this.type = this.basicFilters.deviceId === undefined ? 'unit' : 'device'
      window.onresize = () => {
        this.resizeNum = Math.random()
      }
    },
    methods: {
      ...mapActions(['initAlarmColorList']),
      initPage () {
        this.visible.chartLoading = true
        queryWarnUnitByUnitTypeId(this.basicFilters).then(res => {
          if (res.status === 0) {
            this.deviceWarningReturns = res.map.deviceWarningReturns
            this.deviceWarningReturns.forEach(item => {
              this.deviceName = item.device_name
              this.deviceNumber = item.device_number

              // 过滤没有采集记录的数据 collect_record
              for (let i = 0; i < item.parameteList.length; i++) {
                if (!item.parameteList[i].alertStatistic.collect_record)  {
                  item.parameteList.splice(i, 1)
                  i--
                }
              }

              item.parameteList.forEach(val => {
                val.level_warning_kv = JSON.parse(val.level_warning_kv)
                val.window_warning_kv = JSON.parse(val.window_warning_kv)
                val.alertStatistic.collect_record = JSON.parse(val.alertStatistic.collect_record)
                val.alarm_level = val.alertStatistic.warning_level
                val.window_warning_time_txt = `${val.window_warning_time}分钟内，超过${val.window_warning_kv[val.alertStatistic.warning_level]}次报警`
                
                // 组装成组件的参数格式
                val.parameter = {
                  parameter_name: '温度',
                  parameter_unit: '℃',
                  parameter_up: val.level_warning_kv[val.alarm_level],
                  parameter_down: val.level_warning_kv['U' + val.alarm_level.split('')[1]],
                  data: [
                    // {time: '2018-06-19 16:05:06', value: 45.12}
                  ]
                }
                // 注意：key value 格式的数据无顺序
                Object.entries(val.alertStatistic.collect_record).forEach(([key, value]) => {
                  val.parameter.data.push({
                    time: utils.formatDate.format(new Date(parseInt(key)), 'yyyy-MM-dd hh:mm:ss'),
                    value: value
                  })
                })
                // 时间从小到大排序
                val.parameter.data.sort((a, b) => {
                  return a.time > b.time ? 1 : -1
                })
              })
            })
          } else {
            this.deviceWarningReturns = []
          }
          this.visible.chartLoading = false
        })
      },
      handleViewAll (item, val) {
        // console.log(val)
        val.deviceName = item.device_name
        val.deviceNumber = item.device_number
        this.parameter = val
        this.dialogVisible = true
        this.filters.deviceId = item.device_id
        // this.filters.startTime = utils.formatDate.format(new Date(val.alertStatistic.warning_start_time), 'yyyy-MM-dd hh:mm:ss')
        // this.filters.endTime = utils.formatDate.format(new Date(val.alertStatistic.warning_end_time), 'yyyy-MM-dd hh:mm:ss')
        this.filters.createTime = utils.formatDate.format(new Date(val.alertStatistic.create_time), 'yyyy-MM-dd hh:mm:ss')
        this.filters.parameterId = val.device_parameter_id
        this.getList()
      },
      // 列表
      getList () {
        this.visible.listLoading = true
        let params = Object.assign({}, this.basicFilters, this.filters)
        queryWarnUnitByUnitTypeId(params).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            this.list = res.map.realtimeColloctorDataWarinings
          } else {
            this.filters.total = 0
            this.list = []
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
      getTime (timestamp) {
        if (!timestamp) {
            return ''
          } else {
            return utils.formatDate.format(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss')
        }
      }
    },
    watch: {}
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
.alarm-level {
  position: absolute;
  z-index: 2;
  right: 16px;
  top: 16px;
  font-size: 16px;
}
</style>
