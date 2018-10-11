<!-- 刘宇 2018/7/12-->
<template>
    <section>
        <el-row :gutter="16"
                v-loading="visible.chartLoading"
                style="min-height: 300px;"
                class="transparent">
            <el-col :span="24"
                    v-for="(item, index) in ParametersReturnList"
                    :key="index"
                    class="mb-3">
                <div class="title-name my-3">{{ item.device_name + ' ' + item.device_number }}</div>

                <!-- 异常参数图表组件 -->
                <abnormal-parameters-chart v-for="(val, index2) in item.parameteList"
                                           :key="index2"
                                           v-if="val.device_parameter_id === basicFilters.parameterId"
                                           :parameter="val.parameter"
                                           :refresh="1"
                                           :resize="resizeNum">
                    <div slot="top">
                        <div class="alarm-level"
                             :style="{color: getAlarmColorDict[val.alarm_level].color}">{{ getAlarmColorDict[val.alarm_level].label }}</div>
                        <el-col :span="24">
                            <p class="no-margin mb-2 color-666">
                                <span> 参数名称: {{ val.parameter_name }}</span>
                                <span class="ml-4"> 参数单位: {{ val.parameter_unit }}</span>
                            </p>
                            <p class="no-margin color-666">{{ val.parameter_name + '报警窗口: ' + val.window_warning_time_txt }}</p>
                        </el-col>
                    </div>

                </abnormal-parameters-chart>
            </el-col>
        </el-row>

        <!--列表 start-->
        <el-col :span="24"
                class="text-right hande-excel"
                slot="bottom">
            <el-button type="primary"
                       size="medium"
                       @click="handleExport">导出EXCEL</el-button>
        </el-col>
        <el-table :data="ParameterShow"
                  highlight-current-row
                  v-loading="visible.ParameterShowLoading">
          <el-table-column type="index" :index="getIndex" label="序号"></el-table-column>
            <el-table-column prop="parameter_value" label="参数值">
              <template slot-scope="scope">
                <span :style="{color: scope.row.warning_color}">{{ scope.row.parameter_value }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="warning_level_name" label="参数所属报警等级">
              <template slot-scope="scope">
                  <span :style="{color: scope.row.warning_color}">{{ scope.row.warning_level_name }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="collector_time" label="参数采集时间">
              <template slot-scope="scope">
                {{ getTime(scope.row.collector_time) }}
              </template>
            </el-table-column>
        </el-table>
        <!--列表 end-->

        <!--分页start -->
        <el-col :span="24"
                class="toolbar">
            <el-pagination layout="total, sizes, prev, pager ,next"
                           :page-size="filters.pageSize"
                           :total="filters.total"
                           @current-change="handlePageChange"
                           @size-change="handleSizeChange">
            </el-pagination>
        </el-col>
        <!--分页end -->
    </section>
</template>
<script>
import utils from "../../../common/js/utils";
import {
  queryWarnUnitByUnitTypeId,
  processExportParamValueUrl
} from "../../../api/api";
import { mapGetters, mapActions } from "vuex";
import AbnormalParametersChart from "../../alarm/components/AbnormalParametersChart.vue";
export default {
  data() {
    return {
      // currentTime: utils.formatDate.format(new Date(), 'yyyy-MM-dd'),
      basicFilters: {
        unitTypeId: this.$route.query.unitTypeId,
        unitId: this.$route.query.unitId,
        deviceId: this.$route.query.deviceId,
        parameterId: this.$route.query.parameteId,
        warningCategoryId: this.$route.query.warningCategoryId,
        warningLevelId: this.$route.query.warningLevelId,
        alertStatisticId: this.$route.query.alertId,
        // startTime: '',
        // endTime: '',
        page: 1,
        pageSize: 10,
        type: 'info'
      },
      filters: {
        unitTypeId: this.$route.query.unitTypeId,
        unitId: this.$route.query.unitId,
        deviceId: this.$route.query.deviceId,
        parameterId: this.$route.query.parameteId,
        warningCategoryId: this.$route.query.warningCategoryId,
        warningLevelId: this.$route.query.warningLevelId,
        alertStatisticId: this.$route.query.alertId,
        // startTime: this.$route.query.startTime,
        // endTime: this.$route.query.endTime,
        page: 1,
        pageSize: 10,
        type: 'info' // 'detail'
      },
      ParametersReturnList: [],
      ParameterShow: [],
      visible: {
        ParameterShowLoading: false,
        chartLoading: false
      },
      dialogVisible: false,
      type: '',
      unitName: '注液车间',
      totalDevice: 5,
      deviceName: "注液设备",
      deviceNumber: "注液设备4",
      resizeNum: Math.random(),
      parameter: {}
    };
  },
  components: { AbnormalParametersChart },
  computed: {
    ...mapGetters(["getAlarmColorDict"])
  },
  mounted() {
    this.initAlarmColorList().then(() => {
      this.getList();
    });
  },
  methods: {
    ...mapActions(["initAlarmColorList"]),
    // 列表
    getList() {
      this.visible.chartLoading = true;
      queryWarnUnitByUnitTypeId(this.basicFilters).then(res => {
        if (res.status === 0) {
          this.ParametersReturnList = res.map.deviceWarningReturns;
          // console.log(this.ParametersReturnList)
          this.ParametersReturnList.forEach(item => {
            item.parameteList.forEach(val => {
              val.level_warning_kv = JSON.parse(val.level_warning_kv);
              val.window_warning_kv = JSON.parse(val.window_warning_kv);
              val.alertStatistic.collect_record = JSON.parse(
                val.alertStatistic.collect_record
              );
              val.alarm_level = val.alertStatistic.warning_level;
              val.window_warning_time_txt = `${
                val.window_warning_time
              }分钟内，超过${
                val.window_warning_kv[val.alertStatistic.warning_level]
              }次报警`;
              
              // 组装成组件的参数格式
              val.parameter = {
                parameter_name: val.parameter_name,
                parameter_unit: val.parameter_unit,
                parameter_up: val.level_warning_kv[val.alarm_level] || '',
                parameter_down: val.level_warning_kv["U" + val.alarm_level.split("")[1]] || '',
                data: []
              };
              
              // 注意：key value 格式的数据无顺序
              Object.entries(val.alertStatistic.collect_record).forEach(([key, value]) => {
                val.parameter.data.push({
                  time: utils.formatDate.format(new Date(parseInt(key)), 'hh:mm:ss'),
                  value: value
                })
              })
              // 时间从小到大排序
              val.parameter.data.sort((a, b) => {
                return a.time > b.time ? 1 : -1;
              });
              
              // 设置表格数据开始时间和结束时间
              // this.filters.startTime = utils.formatDate.format(new Date(parseInt(val.alertStatistic.warning_start_time)), 'yyyy-MM-dd hh:mm:ss')
              // this.filters.endTime = utils.formatDate.format(new Date(parseInt(val.alertStatistic.warning_end_time)), 'yyyy-MM-dd hh:mm:ss')
              
              this.getParameterShow();
            });
          });
        } else {
          this.ParametersReturnList = [];
        }
        this.visible.chartLoading = false;
      });
    },
    // 参数表格
    getParameterShow() {
      this.visible.ParameterShowLoading = true;
      queryWarnUnitByUnitTypeId(this.filters).then(res => {
        if (res.status === 0) {
          // this.filters.total = res.map.line;
          this.ParameterShow = res.map.realtimeColloctorDataWariningDOs;
          // if (!this.ParameterShow) {
          //   this.filters.total = (this.filters.page - 1) * this.filters.pageSize;  
          // }
        } else {
          this.filters.total = 0;
          this.ParameterShow = [];
        }
        this.visible.ParameterShowLoading = false;
      });
    },
    //  页面改变
    handlePageChange(val) {
      this.filters.page = val;
      this.getParameterShow();
    },
    //  每页数量改变
    handleSizeChange(val) {
      this.filters.pageSize = val;
      this.getParameterShow();
    },
    // 列表索引
    getIndex(index) {
      return utils.getHeadNumAdapter(
        this.filters.page,
        this.filters.pageSize,
        index
      );
    },
    // 导出
    handleExport() {
      // utils.downloadFile(abnormalParametersExcelUrl + '?type=export' + '&warningUnitId=' + this.currentAlarmUnitId)
      utils.downloadFile(
        processExportParamValueUrl + '?' +
        'warningUnitTypeId=' + this.basicFilters.unitTypeId +
        '&warningUnitId=' + this.basicFilters.unitId +
        '&deviceId=' + this.basicFilters.deviceId +
        '&parameterId=' + this.basicFilters.parameterId +
        '&startTime=' + this.filters.startTime +
        '&endTime=' + this.filters.endTime +
        '&warningCategoryId=' + this.filters.warningCategoryId +
        '&warningLevelId=' + this.filters.warningLevelId +
        '&alertStatisticId=' + this.basicFilters.alertStatisticId
      )
    },
    getTime(timestamp) {
      if (!timestamp) {
        return "";
      } else {
        return utils.formatDate.format(
          new Date(timestamp),
          "yyyy-MM-dd hh:mm:ss"
        );
      }
    }
  }
};
</script>
<style scoped lang="scss">
@import "~scss_vars";
.title-name {
  font-size: 18px;
  &::before {
    content: "";
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
