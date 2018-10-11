/*
 * @Author: liucz 
 * @Date: 2018-06-29 13:53:38 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-21 15:50:55
 */
<template>
  <section>
    <!-- 报警种类 -->
    <el-row class="transparent mt-3">
      <div class="title-name mb-2">报警种类</div>
      <el-table :data="alarmTypeList" highlight-current-row v-loading="visible.alarmListLoading"
        style="max-width: 1200px;" class="px-3 pb-3">
        <el-table-column prop="warningConfCategoryLevelDO.warning_category_name" label="名称" width="220" sortable></el-table-column>
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
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import {
    queryWarningUnitTypeCategory, modifyWarningUnitTypeCategory,
    modifyCategoryStatus, modifyLevelEmailStatus,
    queryLevelEmail, modifyLevelEmail
    } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    name: 'Site-Management-Step1',
    data () {
      return {
        unitTypeId: '',
        alarmTypeList: [],
        mailAlarmList: [],
        visible: {
          listLoading: true,
          alarmListLoading: true,
          mailListLoading: true,
          emailDialog: false
        },
        emailList: []
      }
    },
    computed: {
      ...mapGetters(['getAlarmColorList', 'getSiteUnitTypeId'])
    },
    props: {
      apllySave: Boolean
    },
    mounted () {
      this.unitTypeId = this.getSiteUnitTypeId
      this.initPage()
      if (this.getAlarmColorList.length === 0) {
        this.initAlarmColorList()
      }
    },
    methods: {
      ...mapActions(['initAlarmColorList']),
      initPage () {
        // 查询所有报警种类
        queryWarningUnitTypeCategory({unitTypeId: this.unitTypeId}).then(res => {
          if (res.status === 0) {
            this.alarmTypeList = []
            res.map.Categorylevel.forEach(item => {
              item.alarm_level = {'L5': '0', 'L4': '0', 'L3': '0', 'L2': '0', 'L1': '1'}
              item.warningConfCategoryLevelDO.warningLevelDOs.forEach(val => {
                item.alarm_level[val.warning_level] = '1'
              })
              this.alarmTypeList.push(item)
            })
          } else {
            this.alarmTypeList = []
          }
          this.visible.alarmListLoading = false
        })
        // 查询现场管理邮件
        queryLevelEmail({unitTypeId: this.unitTypeId}).then(res => {
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
        // this.initAlarmColorList()
        // this.initAlarmTypeList()
      },
      // 报警种类开关
      handleAlarmSwitchChange (row) {
        modifyCategoryStatus({
          unitTypeId: this.unitTypeId,
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
        // console.log(row)
        this.emailList = row.warning_emails_list ? row.warning_emails_list.split(';') : []
        this.visible.emailDialog = true
        this.$mesMultiParamsInput.show('邮件发送地址', {
          type: 'email',
          tip: '多个邮件地址请用转行区分（一行一个邮件地址, 最多30个）',
          textList: this.emailList,
          // 是否内网
          isIntranet: row.net_status
        }).then(res => {
          // console.log(res)
          this.emailList = res.rows
          modifyLevelEmail({
            warningConfUnitTypeLevelId: row.warning_conf_unit_type_level_id,
            emailList: res.rows.join(';'),
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