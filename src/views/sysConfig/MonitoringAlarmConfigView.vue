/*
 * @Author: Zhangshitu 
 * @Date: 2018-06-30 14:18:39 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-21 16:21:45
 */
<template>
  <section>
    <el-row class="transparent">
      <el-col class="lh-40" :span="12">
        <div class="card mt-3">
          <div class="title-name">{{ getMonitoringAlarmConfigName }}</div>
        </div>
      </el-col>
      <el-col class="mt-3 text-right" :span="12">
        <!-- <el-button type="primary" @click="goToPerspective">返回视角</el-button> -->
        <el-button type="primary" @click="geToConfigStep">编辑</el-button>
      </el-col>
      <el-col class="mt-3" :span="6">
        <el-row class="transparent text-center mb-3">
          <div class="title-card bg-white">
            <h2>{{ deviceTotalNumber}}</h2>
            <p>监控设备总数</p>
          </div>
          <div class="title-card bg-white">
            <h2>{{ unitTotalNumber}}</h2>
            <p>监控单元总数</p>
          </div>
        </el-row>
      </el-col>
    </el-row>
    <el-row class="transparent">
      <el-col class="mb-3 mr-3" :span="6" v-for="(item, index) in alarmUnit" :key="index" style="min-width: 290px;">
        <el-card class="box-card" shadow="always">
          <div class="workshop-card">
            <h3 class="mb-3">{{ item.warning_unit_name }}</h3>
            <p class="mt-3"><span>设备总数：</span> {{ item.count }}</p>
            <el-row class="mb-2" v-for="(device, i) in item.warningConfModuleUnitDOs" :key="i">
              <el-col :span="10">
                <span>{{ device.warningCategoryDO.warning_category_name }}设备数：</span>
              </el-col>
              <el-col class="text-center" :span="4">
                <p class="number-prompt">{{ device.count }}</p>
              </el-col>
              <el-col class="text-center" :span="10">
                <el-button type="primary" plain @click="openDetails(item.warning_uint_id, device.warningCategoryDO.warning_category_id)">详情</el-button>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 参数详情弹窗 -->
    <prespective-parameter-dialog 
      :dialogValue="parameterDialogValue" 
      :visibleDialogTable="visible.dialogTable" 
      @closeDialog="getCloseDialog">
    </prespective-parameter-dialog>
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import { queryWarningUnitType, queryModuleUnit } from '../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import PrespectiveParameterDialog from './components/PerspectiveParameterDialog.vue'

  export default {
    name: 'Monitoring-Alarm-Config-View',
    data () {
      return {
        filters: {
          unitTypeId: this.$route.params.id,
          warnUnitId: null,
          warnCategoryId: null,
          type: 'info',
          page: '',
          pageSize: '',
          total: ''
        },
        deviceTotalNumber: '',
        unitTotalNumber: '',
        alarmUnit: [],
        parameterDialogValue: {
          warn_category_id: '',
          alarmUnit_id: ''
        },
        visible: {
          dialogTable: false
        }
      }
    },
    components: { PrespectiveParameterDialog },
    computed: {
      getMonitoringAlarmConfigName () {
        return this.filters.unitTypeId === '1' ? '默认报警视角--车间' : '自定义报警视角--' + '人员视角'
      }
    },
    created () {},
    mounted () {
      this.initPage()
    },
    methods: {
      ...mapActions(['']),
      // 初始化页面
      initPage () {
        queryModuleUnit(this.filters).then(res => {
          if (res.status === 0) {
            this.deviceTotalNumber = res.map.total
            this.unitTotalNumber = res.map.UnitCount
            this.alarmUnit = res.map.warningUnitDOs
          }
        })
      },
      // 返回视角
      goToPerspective () {
        this.$router.push({path: '/sysConfig/monitoringAlarm/perspective'})
      },
      // 前往编辑
      geToConfigStep () {
        this.$router.push({path: '/sysConfig/monitoringAlarm/perspective/step/' + this.filters.unitTypeId})
      },
      // 打开详情
      openDetails (alarmUnit_id, warn_category_id) {
        this.visible.dialogTable = true
        this.parameterDialogValue = {
          warn_category_id: warn_category_id,
          alarmUnit_id: alarmUnit_id
        }
      },
      getCloseDialog (val) {
        this.visible.dialogTable = val
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
@import '~scss_vars';
.card {
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
.title-card {
  width: 120px;
  float: left;
}
.workshop-card {
  h3 {
    margin: 0;
  }
  span {
    line-height: 22px;
    color: #909399;
  }
}
</style>
