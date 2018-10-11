/*
 * @Author: liucz 
 * @Date: 2018-06-20 08:53:25 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-01 15:32:10
 */
<template>
  <section v-loading="visible.listLoading">
    <el-row class="transparent p-2">
      <el-col class="lh-40" :span="12">
        <div class="card left-grid">
          <!-- <div class="title-name">{{ currentTime + '' }}</div> -->
          <el-row class="bg-white text-center mb-3">
            <el-col :span="12">
              <h2>{{ list.length }}</h2>
              <span>监控单元总数</span>
            </el-col>
            <el-col :span="12">
              <h2>{{ deviceCloseTotal }}</h2>
              <span>关闭报警设备总数</span>
            </el-col>
          </el-row>
        </div>
      </el-col>
      <el-col class="lh-40" :span="12">
        <el-col class="text-right perspective-wrap" v-if="getPerspectiveList.length > 0">
          <el-select v-model="warningUintTypeId" placeholder="选择视角" size="medium" @change="initPage" style="">
            <el-option v-for="item in getPerspectiveList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-col>
      </el-col>
    </el-row>

    <el-row class="transparent">
      <el-col :span="24">
        <!-- 报警开关 -->
          <div class="card">
            <div class="title-name">报警开关</div>
            <el-row class="transparent mb-3" style="min-height: 300px;">
              <el-col v-for="(item, index) in list" :key="index" class="bg-white mr-3 mt-3 px-3" style="width: 240px;">
                <p class="text-center" style="font-size: 16px;">{{ item.warning_unit_name }}</p>
                <p class="text-left" v-for="(val, index1) in item.warningConfCategoryLevelDOs" :key="index1">
                  <span class="color-666" style="display: inline-block; max-width: 165px;">{{ val.warning_category_name }}</span>
                  <el-switch v-model="val.category_switch" active-value="0" inactive-value="1" style="float: right;"
                            active-color="#13ce66" inactive-color="#ff4949" @change="handleAlarmSwitchChange(val, item)"></el-switch>
                </p>
                <p class="text-center mt-3">
                  <el-button type="primary" size="small" round plain @click="handleDeviceAlarmSwitch(item)">设备报警开关</el-button>
                </p>
              </el-col>
              <el-col v-if="!visible.listLoading && list.length === 0" class="text-center color-999 mt-5">暂无数据</el-col>
            </el-row>
          </div>
      </el-col>
    </el-row>

    <!-- 设备报警开关弹窗 -->
    <device-alarm-switch-dialog
      :show.sync="visible.dialog" :title="unitName" 
      :unit-type-id='warningUintTypeId' :unit-id="unitId"
      ></device-alarm-switch-dialog>

  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import { queryWarnUnitSwitch, modifyWarningConfUnitTypeCategoryIsOn } from '../../api/api'
  import { mapActions, mapGetters } from 'vuex'
  import DeviceAlarmSwitchDialog from './components/DeviceAlarmSwitchDialog.vue'
  export default {
    name: 'Alarm-Switch',
    data () {
      return {
        filters: {
          keyword: '',
          type: '',
          pageSize: 10,
          page: 1,
          total: 0
        },
        list: [],
        warningUintTypeId: '',
        visible: {
          listLoading: true,
          dialog: false
        },
        deviceCloseTotal: 0,
        unitId: '',
        unitName: ''
      }
    },
    components: { },
    computed: {
      ...mapGetters(['getPerspectiveList']),
    },
    components: { DeviceAlarmSwitchDialog },
    mounted () {
      this.initPerspectiveList().then(() => {
        this.warningUintTypeId = this.getPerspectiveList[0].warning_uint_type_id
        // this.warningUintTypeId = 'system5dfb03f9fc1b459a8dcb14a2460fdbcf'
        this.initPage()
      })
    },
    methods: {
      ...mapActions(['initPerspectiveList']),
      // 初始化页面
      initPage () {
        this.visible.listLoading = true
        queryWarnUnitSwitch({unitTypeId: this.warningUintTypeId}).then(res => {
          if (res.status === 0) {
            this.deviceCloseTotal = res.map.closeDeviceNum
            this.list = res.map.warningUnitDOs
          } else {
            this.deviceCloseTotal = 0
            this.list = []
          }
          this.visible.listLoading = false
        })
      },
      // 开，关报警
      handleAlarmSwitchChange (val, item) {
        // console.log(val)
        modifyWarningConfUnitTypeCategoryIsOn({
          // unitTypeId: this.warningUintTypeId,
          warningUnitId: item.warning_uint_id,
          warningCategoryId: val.warning_category_id,
          isOn: val.category_switch
        }).then(res => {
          if (res.status === 0) {
            this.$message.success('已保存')
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      // 设备报警开关
      handleDeviceAlarmSwitch (item) {
        console.log(item)
        this.visible.dialog = true
        this.unitName = item.warning_unit_name
        this.unitId = item.warning_uint_id
      }
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
