/*
 * @Author: liucz 
 * @Date: 2018-06-29 09:24:32 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-14 09:13:24
 */
<template>
  <section>
    <!-- 报警种类 -->
    <el-row class="transparent mt-3">
      <div class="title-name mb-2">报警种类</div>
      <el-table :data="alarmTypeList" highlight-current-row v-loading="visible.alarmListLoading"
        style="max-width: 1200px;" class="px-3 pb-3">
        <el-table-column prop="warningConfCategoryLevelDO.warning_category_name" label="报警等级" width="220" sortable></el-table-column>
        <el-table-column prop="alarm_level" label="对应的报警级别">
          <template slot-scope="scope">
            <el-checkbox
              v-for="(item, index) in getAlarmColorList" :key="item.value"
              v-model="scope.row.alarm_level[item.value]" size="medium"
              :label="item.label" true-label="1" false-label="0"
              :disabled="true" v-if="scope.row.alarm_level[item.value] === '1'"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="label" label="模块需要的报警种类" width="220">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.is_on" active-value="2" inactive-value="0" :disabled="scope.row.is_on === '2'" v-if="scope.row.is_on === '2'"
                      active-color="#13ce66" inactive-color="#ff4949" @change="handleAlarmSwitchChange(scope.row)"></el-switch>
            <el-switch v-model="scope.row.is_on" active-value="1" inactive-value="0" :disabled="scope.row.is_on === '2'" v-else
                      active-color="#13ce66" inactive-color="#ff4949" @change="handleAlarmSwitchChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <!-- 报警级别 -->
    <el-row class="transparent mt-3">
      <div class="title-name mb-2 mt-3">报警级别</div>
      <el-table :data="mailAlarmList" highlight-current-row v-loading="visible.mailListLoading"
        style="max-width: 800px;" class="px-3 pb-3">
        <el-table-column prop="warningLevelDO.warning_level" label="报警等级" sortable></el-table-column>
        <el-table-column prop="warningLevelDO.warning_level_name" label="名称" sortable></el-table-column>
        <el-table-column prop="warningLevelDO.warning_color" label="报警颜色">
          <template slot-scope="scope">
            <div style="width: 40px; height: 40px;" :style="{backgroundColor: scope.row.warningLevelDO.warning_color}"></div>
          </template>
        </el-table-column>
        <el-table-column prop="label" label="邮件提醒">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.is_on_email" active-value="1" inactive-value="0" :disabled="scope.$index === getAlarmColorList.length - 1"
                      active-color="#13ce66" inactive-color="#ff4949" @change="handleMailSwitchChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="" label="编辑邮件">
          <template slot-scope="scope">
            <span class="color-999" v-if="scope.$index === getAlarmColorList.length - 1">无</span>
            <el-button type="text" v-else size="medium" @click="handleEditEmail(scope.row)" :disabled="scope.row.is_on_email === '0'">
              编辑邮件 <el-badge class="mark-blue" :value="parseInt(scope.row.emailCount)" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <!-- 时间范围配置 -->
    <el-row class="transparent mt-3" v-loading="visible.timeListLoading">
      <div class="title-name mb-2 mt-3">时间范围配置</div>
      <el-col :span="24" class="pl-3">
        <p style="font-size: 20px;">“近期报警统计”时间范围（单位：分钟）</p>
        <span class="mr-2">第一档</span>
        <el-select v-model="timeRange.alarm.firstLeg" size="small" style="width: 120px;" @change="handleTimeChange(timeRange.alarm, 'firstLeg')">
          <el-option v-for="item in alarmTimeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input-number v-if="timeRange.alarm.firstLeg === '自定义'" v-model="customTime.alert.firstLeg" @change="handleTimeChangeCustom(timeRange.alarm)" size="small"
          :min="parseInt(alarmTimeOptions[0].value)" :max="parseInt(alarmTimeMax)" label=""></el-input-number>
        
        <span class="mr-2 ml-3">第二档</span>
        <el-select v-model="timeRange.alarm.secondLeg" size="small" style="width: 120px;" @change="handleTimeChange(timeRange.alarm, 'secondLeg')">
          <el-option v-for="item in alarmTimeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input-number v-if="timeRange.alarm.secondLeg === '自定义'" v-model="customTime.alert.secondLeg" @change="handleTimeChangeCustom(timeRange.alarm)" size="small"
          :min="parseInt(alarmTimeOptions[0].value)" :max="parseInt(alarmTimeMax)" label=""></el-input-number>

        <span class="mr-2 ml-3">第三档</span>
        <el-select v-model="timeRange.alarm.thirdLeg" size="small" style="width: 120px;" @change="handleTimeChange(timeRange.alarm, 'thirdLeg')">
          <el-option v-for="item in alarmTimeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input-number v-if="timeRange.alarm.thirdLeg === '自定义'" v-model="customTime.alert.thirdLeg" @change="handleTimeChangeCustom(timeRange.alarm)" size="small"
          :min="parseInt(alarmTimeOptions[0].value)" :max="parseInt(alarmTimeMax)" label=""></el-input-number>
      </el-col>
      
      <el-col :span="24" class="pl-3 hidden">
        <p style="font-size: 20px;">“设备实时采集参数趋势”时间范围（单位：分钟）</p>
        <span class="mr-2">第一档</span>
        <el-select v-model="timeRange.parameter.firstLeg" size="small" style="width: 120px;" @change="handleTimeChange(timeRange.parameter, 'firstLeg')">
          <el-option v-for="item in parameterTimeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input-number v-if="timeRange.parameter.firstLeg === '自定义'" v-model="customTime.trend.firstLeg" @change="handleTimeChangeCustom(timeRange.parameter)" size="small"
          :min="parseInt(parameterTimeOptions[0].value)" :max="parseInt(parameterTimeMax)" label=""></el-input-number>
        
        <span class="mr-2 ml-3">第二档</span>
        <el-select v-model="timeRange.parameter.secondLeg" size="small" style="width: 120px;" @change="handleTimeChange(timeRange.parameter, 'secondLeg')">
          <el-option v-for="item in parameterTimeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input-number v-if="timeRange.parameter.secondLeg === '自定义'" v-model="customTime.trend.secondLeg" @change="handleTimeChangeCustom(timeRange.parameter)" size="small"
          :min="parseInt(parameterTimeOptions[0].value)" :max="parseInt(parameterTimeMax)" label=""></el-input-number>

        <span class="mr-2 ml-3">第三档</span>
        <el-select v-model="timeRange.parameter.thirdLeg" size="small" style="width: 120px;" @change="handleTimeChange(timeRange.parameter, 'thirdLeg')">
          <el-option v-for="item in parameterTimeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input-number v-if="timeRange.parameter.thirdLeg === '自定义'" v-model="customTime.trend.thirdLeg" @change="handleTimeChangeCustom(timeRange.parameter)" size="small"
          :min="parseInt(parameterTimeOptions[0].value)" :max="parseInt(parameterTimeMax)" label=""></el-input-number>
      </el-col>
    </el-row>
    <p style="padding: 200px 0;"></p>
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import { modifyWarningUnitTypeCategory, modifyCategoryStatus, modifyLevelEmail,
    queryWarningUnitTypeCategory, queryLevelEmail, queryTimeConf,
    modifyTimeConf, modifyLevelEmailStatus } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    name: 'Perspective-Step1',
    data () {
      return {
        alarmTypeList: [],
        mailAlarmList: [],
        timeRange: {
          alarm: {
            firstLeg: '',
            secondLeg: '',
            thirdLeg: ''
          },
          parameter: {
            firstLeg: '',
            secondLeg: '',
            thirdLeg: ''
          }
        },
        visible: {
          alarmListLoading: true,
          mailListLoading: true,
          timeListLoading: true,
          emailDialog: false
        },
        alarmTypeStatus: ['1', '1', '1', '0', '0'],
        warnCategorys: [],
        mailStatus: ['1', '1', '1', '0', '0'],
        warnLevels: [],
        // 近期报警统计时间选项
        alarmTimeOptions: [
          {label: '最近5分钟', value: '5'},
          {label: '最近15分钟', value: '15'},
          {label: '最近30分钟', value: '30'},
          {label: '最近45分钟', value: '45'},
          {label: '最近60分钟', value: '60'},
          {label: '最近90分钟', value: '90'},
          {label: '最近120分钟', value: '120'},
          {label: '最近150分钟', value: '150'},
          {label: '最近180分钟', value: '180'},
          {label: '自定义', value: '自定义'}
        ],
        alarmTimeMax: '1440',
        customTime: {
          alert: {
            firstLeg: '',
            secondLeg: '',
            thirdLeg: ''
          },
          trend: {
            firstLeg: '',
            secondLeg: '',
            thirdLeg: ''
          }
        },
        // 近期报警统计时间选项
        parameterTimeOptions: [
          {label: '最近5分钟', value: '5'},
          {label: '最近10分钟', value: '10'},
          {label: '最近15分钟', value: '15'},
          {label: '最近20分钟', value: '20'},
          {label: '最近25分钟', value: '25'},
          {label: '最近30分钟', value: '30'},
          {label: '最近60分钟', value: '60'},
          {label: '自定义', value: '自定义'}
        ],
        parameterTimeMax: '120'
      }
    },
    computed: {
      ...mapGetters(['getAlarmColorList'])
    },
    props: {
      perspectiveId: {
        type: String
      },
      apllySave: Boolean
    },
    mounted () {
      this.initPage()
      if (this.getAlarmColorList.length === 0) {
        this.initAlarmColorList()
      }
    },
    methods: {
      ...mapActions(['initAlarmColorList']),
      initPage () {
        // 获取报警种类开关数据
        queryWarningUnitTypeCategory ({
          unitTypeId: this.perspectiveId
        }).then((res) => {
          if (res.status === 0) {
            this.alarmTypeList = []
            res.map.Categorylevel.forEach(item => {
              item.alarm_level = {'L5': '0', 'L4': '0', 'L3': '0', 'L2': '0', 'L1': '1'}
              item.warningConfCategoryLevelDO.warningLevelDOs.forEach(val => {
                item.alarm_level[val.warning_level] = '1' // val.status
              })
              this.alarmTypeList.push(item)
            })
          } else {
            this.alarmTypeList = []
          }
          this.visible.alarmListLoading = false
        })
        // 查询现场管理邮件
        queryLevelEmail({
          unitTypeId: this.perspectiveId
        }).then(res => {
          if (res.status === 0) {
            this.mailAlarmList = []
            res.map.levels.forEach(item => {
              item.alarm_level = {'L5': '0', 'L4': '0', 'L3': '0', 'L2': '0', 'L1': '1'}
              item.alarm_level[item.warning_level] = '1'
              this.mailAlarmList.push(item)
            })
            this.mailAlarmList = res.map.levels
          } else {
            this.mailAlarmList = []
          }
          this.visible.mailListLoading = false
        })
        // 查询时间范围配置
        queryTimeConf({
          type: '',
          unitTypeId: this.perspectiveId
        }).then(res => {
          if (res.status === 0) {
            res.map.time.forEach(item => {
              if (item.type === 'alert') {
                this.timeRange.alarm = item
              } else if (item.type === 'trend') {
                this.timeRange.parameter = item
              }
            })
          } else this.timeRange = { alarm: {}, parameter: {} }
          this.visible.timeListLoading = false
        })
      },
      // 报警种类开关
      handleAlarmSwitchChange (row) {
        modifyCategoryStatus({
          unitTypeId: this.perspectiveId,
          warningCategoryLevelId: row.warning_conf_unit_type_category_id,
          isOn: row.is_on
        }).then(res => {
          if (res.status === 0) {
            this.$message.success('已保存')
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      // 邮件提醒开关
      handleMailSwitchChange (row) {
        modifyLevelEmailStatus({
          warningConfUnitTypeLevelId: row.warning_conf_unit_type_level_id,
          isOn: row.is_on_email
        }).then(res => {
          if (res.status === 0) {
            this.$message.success('已保存')
          } else {
            this.$message.error(res.msg)
          }
        })
      },
      // 编辑邮件
      handleEditEmail (row) {
        this.emailList = row.warning_emails_list ? row.warning_emails_list.split(';') : []
        this.visible.emailDialog = true
        this.$mesMultiParamsInput.show('邮件发送地址', {
          type: 'email',
          tip: '多个邮件地址请用转行区分（一行一个邮件地址, 最多30个）',
          textList: this.emailList,
          // 是否内网
          isIntranet: row.net_status
        }).then(res => {
          this.emailList = res.rows
          modifyLevelEmail({
            warningConfUnitTypeLevelId: row.warning_conf_unit_type_level_id,
            emailList: res.rows ? res.rows.join(';') : '',
            netStatus: res.isIntranet
          }).then(res => {
            if (res.status === 0) {
              this.$message.success('已保存')
              this.initPage()
            } else {
              this.$message.error(res.msg || '失败')
            }
          })
        })
      },
      // 保存select选中时间
      handleTimeChange (time, timeNumber) {

        if (time[timeNumber] === '自定义') {
          return
        } else if (time[timeNumber] !== '自定义') {
          this.customTime[time.type][timeNumber] = ''
        }
        
        const roundConfs = {
          round_time_conf_id: time.round_time_conf_id,
          type: time.type,
          round_level: time.firstLeg + '#' + time.secondLeg + '#' + time.thirdLeg,
          warning_module_id: "scenemanaged178f9577d414e3690ee5e7d5401e9ab",
          warning_uint_type_id: this.perspectiveId
        }
        this.setModifyTimeConf(roundConfs)
      },
      // 保存自定义时间
      handleTimeChangeCustom (time) {
        let first = this.customTime[time.type].firstLeg ? this.customTime[time.type].firstLeg : time.firstLeg
        let second = this.customTime[time.type].secondLeg ? this.customTime[time.type].secondLeg : time.secondLeg
        let third = this.customTime[time.type].thirdLeg ? this.customTime[time.type].thirdLeg : time.thirdLeg

        const roundConfs = {
          round_time_conf_id: time.round_time_conf_id,
          type: time.type,
          round_level: first + '#' + second + '#' + third,
          warning_module_id: "scenemanaged178f9577d414e3690ee5e7d5401e9ab",
          warning_uint_type_id: this.perspectiveId
        }

        this.setModifyTimeConf(roundConfs)
      },
      // 保存时间 API
      setModifyTimeConf (roundConfs) {
        modifyTimeConf({
          roundConfs: JSON.stringify(roundConfs)
        }).then(res => {
          if (res.status === 0) {
              this.$message.success('已保存')
              this.initPage()
            } else {
              this.$message.error(res.msg || '失败')
            }
        })
      }
    },
    watch: {
      apllySave (val) {
        if (val) {
          this.$emit('save', '')
        }
      }
    }
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
.perspective-card {
  width: 300px;
  overflow: hidden;
}
</style>

<style>
.mark-blue.el-badge>.el-badge__content{
  background-color: #66B8FE !important;
}
</style>
