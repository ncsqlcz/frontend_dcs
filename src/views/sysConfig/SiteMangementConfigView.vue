/*
 * @Author: Zhangshitu 
 * @Date: 2018-07-04 15:42:32 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-27 16:23:55
 */

<template>
   <section>
    <el-row class="transparent">
      <el-col class="mt-3 lh-40" :span="18" v-loading="visible.dataLoading">
        <el-row class="transparent text-center mb-3">
          <div class="title-card bg-white">
            <h2>{{ deviceTotalNumber }}</h2>
            <span>监控设备总数</span>
          </div>
          <div class="title-card bg-white">
            <h2>{{ scanNumber }}</h2>
            <span>扫码枪数量</span>
          </div>
          <div class="title-card bg-white">
            <h2>{{ workstageNumber }}</h2>
            <span>工序数量</span>
          </div>
        </el-row>
      </el-col>
      <el-col class="mt-3 text-right" :span="6">
        <el-button type="primary" @click="geToConfigStep">编辑</el-button>
      </el-col>
    </el-row>
    <el-row class="transparent">
      <!-- 工序卡片 -->
      <el-col class="mb-3 mr-3" :span="6" v-for="(data, index) in workstage" :key="index" style="min-width: 290px;" v-loading="visible.dataLoading">
        <el-card shadow="always">
          <div class="workshop-card">
            <h3 class="mb-3">{{ data.workshop_name }}</h3>
            <!-- 工序参数 -->
            <el-row class="mb-2 pb-2" style="border-bottom: 1px solid #ccc">
              <el-col :span="12">
                <span>工序参数：</span>
              </el-col>
              <el-col class="text-center" :span="12">
                <el-button type="primary" plain @click="openWorkstagePar(data)">详情</el-button>
              </el-col>
            </el-row>
            <!-- 设备总数 -->
            <p class="mt-3"><span>设备总数：</span> {{ data.count }}</p>
            <!-- 工序扫码枪 -->
            <el-row class="mb-2">
              <el-col :span="10">
                <span>工序扫码枪：</span>
              </el-col>
              <el-col class="text-center" :span="4">
                <p class="number-prompt"> {{ data.sweepProcessCode.count }} </p>
              </el-col>
              <el-col class="text-center" :span="10">
                <el-button type="primary" plain @click="openScan(data)">详情</el-button>
              </el-col>
            </el-row>
            <!-- 报警种类 -->
            <el-row class="mb-2" v-for="(warningConf, index) in data.warningConfModuleUnitDOs" :key="index">
              <el-col :span="10">
                <span>{{ warningConf.warning_category_name }}：</span>
              </el-col>
              <el-col class="text-center" :span="4">
                <p class="number-prompt"> {{ warningConf.count }} </p>
              </el-col>
              <el-col class="text-center" :span="10">
                <el-button type="primary" plain @click="openDetails(data, warningConf)">详情</el-button>
              </el-col>
            </el-row>
            <!-- 起止时间 -->
            <el-row class="mb-2 pt-2"  style="border-top: 1px solid #ccc">
              <el-col :span="12">
                <span>工序起止时间：</span>
              </el-col>
              <el-col class="text-center" :span="12">
                <el-button type="primary" plain @click="openWorkstageTime(data)">详情</el-button>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>


    <!-- 扫码枪弹窗 -->
    <el-dialog title="扫码枪" :visible.sync="visible.scanDialog">
      <el-table :data="scanData">
        <el-table-column prop="sweep_name" label="设备名称"></el-table-column>
        <el-table-column prop="sweep_number" label="设备编号"></el-table-column>
      </el-table>
    </el-dialog>

    <!-- 工序起止时间弹窗 -->
    <el-dialog title="工序起止时间" :visible.sync="visible.timeDialog" width="50%">
      <el-row class="transparent">
        <el-col class="mb-3" :span="24">
          <div class="title-name mb-3">工序开始时间依据</div>
          <span class="timeType">{{getTimeType ? '设备参数' : '扫码枪录入参数'}}</span>
          <div class="mt-3">
            <span class="mr-3">开始值</span>
            <el-button class="mt-3 mb-3" type="primary" plain disabled>
              {{ getTimeType ? processTimeData.device_name_start : processTimeData.warning_start_uint_para_name }}
            </el-button>
            <el-button v-if="getTimeType" class="mb-3" type="primary" plain disabled>
              {{ processTimeData.device_parameter_name_start ? processTimeData.device_parameter_name_start : '未选择设备参数' }}
            </el-button>
            <el-input class="ml-3" v-if="getTimeType" v-model="parameterStartMinValue" style="width: 150px;" placeholder="未设置参数下限" disabled></el-input>
            <el-input class="ml-3" v-if="getTimeType" v-model="parameterStartMaxValue" style="width: 150px;" placeholder="未设置参数上限" disabled></el-input>
          </div>
        </el-col>
        <el-col class="mb-3" :span="24">
          <div class="title-name mb-3">工序结束时间依据</div>
          <span class="timeType">{{getTimeType ? '设备参数' : '扫码枪录入参数'}}</span>
          <div class="mt-3">
            <span class="mr-3">结束值</span>
            <el-button class="mt-3 mb-3" type="primary" plain disabled>
              {{ getTimeType ? processTimeData.device_name_end : processTimeData.warning_end_uint_para_name }}
            </el-button>
            <el-button v-if="getTimeType" class="mb-3" type="primary" plain disabled>
              {{ processTimeData.device_parameter_name_end ? processTimeData.device_parameter_name_end : '未选择设备参数' }}
            </el-button>
            <el-input class="ml-3" v-if="getTimeType" v-model="parameterEndMinValue" style="width: 150px;" placeholder="未设置参数下限" disabled></el-input>
            <el-input class="ml-3" v-if="getTimeType" v-model="parameterEndMaxValue" style="width: 150px;" placeholder="未设置参数上限" disabled></el-input>
          </div>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 选择工序参数弹窗 -->
    <select-process-dialog
      title="查看工序参数"
      type="check"
      :dialog="visible.procesDialog"
      :currency="processSelectedCurrency"
      :special="processSelectedSpecial"
      @visibleDialog="getVisibleDialog"
    ></select-process-dialog>

    <!-- 参数详情弹窗 -->
    <prespective-parameter-dialog
      :dialogValue="parameterDialogValue" 
      :visibleDialogTable="visible.parameterDialog" 
      @closeDialog="getCloseDialog">
    </prespective-parameter-dialog>
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import { querySceneModule } from '../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import selectProcessDialog from './components/SelectProcessPDialog.vue'
  import PrespectiveParameterDialog from './components/PerspectiveParameterDialog.vue'

  export default {
    name: 'Site-Mangement-Config-View',
    data () {
      return {
        workstage: [],
        parameterDialogValue: {
          warn_category_id: '',
          alarmUnit_id: ''
        },
        processSelectedCurrency: [], // 通用
        processSelectedSpecial: [], // 特定
        parameterStartMinValue: '',
        parameterStartMaxValue: '',
        parameterEndMinValue: '',
        parameterEndMaxValue: '',
        process_parameter_id: '',
        deviceTotalNumber: '',
        workstageNumber: '',
        scanNumber: '',
        scanData: [],
        processTimeData: {},
        visible: {
          dataLoading: false,
          procesDialog: false,
          parameterDialog: false,
          timeDialog: false,
          scanDialog: false
        }
      }
    },
    components: { PrespectiveParameterDialog, selectProcessDialog },
    computed: {
      // 获取判断时间依据的种类
      getTimeType () {
        if (this.processTimeData.type) {
          if (this.processTimeData.type === 'device') {
            return true
          } else return false
        } else return false
      }
    },
    created () {
      // 初始化页面
      this.initPage('', '')
    },
    mounted () {},
    methods: {
      ...mapActions(['initAlarmColorList']),
      // 获取数据
      initPage (type, warningUnitId) {
        this.visible.dataLoading = true
        querySceneModule({
          type: type,
          warningUnitId: warningUnitId
        }).then(res => {
          if (res.status === 0) {
            switch (type) {
              case '': // 该视角ID下所有报警单元信息
                this.deviceTotalNumber = res.map.deviceNum
                this.scanNumber = res.map.sweepProcessCodeNum
                this.workstageNumber = res.map.workshopNum
                this.workstage = res.map.warningUnits
                let isCompleted = true
                this.workstage.forEach((item, index) => {
                  if (this.workstage.length === 0 || !item.sweepProcessCode || item.warningConfModuleUnitDOs.length === 0) {
                    isCompleted = false
                    return
                  }
                })
                if (!isCompleted) {
                  // 如果现场管理没有配置过，则直接跳转到配置页面
                  this.$message({
                    message: '现场管理模块尚未配置，请先进行配置！',
                    type: 'warning'
                  })
                  this.$router.push({path: '/sysConfig/siteMangement/overview/step'})
                }
              break
              case 'processParam': // 工序参数详情
                this.processSelectedCurrency = []
                this.processSelectedSpecial = []
                res.map.processSceneParamInfos.forEach(item => {
                  if (item.type === '0') {
                    this.processSelectedCurrency.push(item)
                  } else if (item.type === '1') {
                    this.processSelectedSpecial.push(item.process_scene_param_name)
                  }
                })
                this.visible.procesDialog = true
              break
              case 'sweep': // 扫码枪设备
                this.scanData = res.map.sweepInfos
              break
              case 'warnCategory': // 其他设备
              break
              case 'processStart': // 工序起止时间
                this.processTimeData = res.map.warningConfUnitWorkingStatus
                if (this.processTimeData.warning_unit_device_para_start_value) {
                  const valStart = this.processTimeData.warning_unit_device_para_start_value.split(',')
                  this.parameterStartMinValue = valStart[0]
                  this.parameterStartMaxValue = valStart[1]
                }
                if (this.processTimeData.warning_unit_device_para_end_value) {
                  const valEnd = this.processTimeData.warning_unit_device_para_end_value.split(',')
                  this.parameterEndMinValue = valEnd[0]
                  this.parameterEndMaxValue = valEnd[1]
                }
              break
              default:
                this.$message.error('无此类型的数据')
              break
            }
          } else this.$message.error(res.msg)
          this.visible.dataLoading = false
        })
      },
      // 编辑按钮
      geToConfigStep () {
        this.$router.push({path: '/sysConfig/siteMangement/overview/step'})
      },
      // 查看工序参数详情
      openWorkstagePar (item) {
        this.initPage('processParam', item.warning_uint_id)
      },
      // 关闭弹窗
      getVisibleDialog (val) {
        this.visible.procesDialog = val
      },
      // 扫码枪弹窗
      openScan (item) {
        this.initPage('sweep', item.warning_uint_id)
        this.visible.scanDialog = true
      },
      // 打开设备详情弹窗
      openDetails (item, type) {
        this.parameterDialogValue = {
          warn_category_id: type.warning_category_id,
          alarmUnit_id: item.warning_uint_id
        }
        this.visible.parameterDialog = true
      },
      // 关闭设备详情弹窗
      getCloseDialog (val) {
        this.visible.parameterDialog = val
      },
      // 工序起止时间弹窗
      openWorkstageTime (item) {
        this.initPage('processStart', item.warning_uint_id)
        this.visible.timeDialog = true
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
    vertical-align: -3px;
    margin-right: 8px;
  }
}
.timeType {
  color: #409EFF;
  font-size: 12px;
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
