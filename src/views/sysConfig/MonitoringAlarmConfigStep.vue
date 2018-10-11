/*
 * @Author: liucz 
 * @Date: 2018-06-29 09:16:58 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-27 16:12:55
 */
<template>
  <section>
    <!-- 操作提示组件 -->
    <operation-tips video="">
      <span class="color-999">报警配置分三步。 第1步：报警配置，在全局报警配置的基础上，选择模块需要用的报警配置。   第2步：报警单元设备配置，配置单元内不同报警种类对应的设备。   第3步：报警设备配置，配置设备需要监控的参数。</span>
    </operation-tips>

    <el-row class="transparent mt-3">
      <el-col :span="12" :offset="6">
        <el-steps :active="config.step" finish-status="success" align-center>
          <el-step title="视角报警配置"></el-step>
          <el-step title="报警单元设备配置"></el-step>
          <el-step title="报警设备参数配置"></el-step>
        </el-steps>
      </el-col>
      <el-col :span="6" class="text-right">
        <el-button type="primary" size="medium" @click="lastStep" v-if="config.step > 0">上一步</el-button>
        <el-button type="primary" size="medium" :loading="visible.saving" @click="saveAndNext" v-if="config.step < 3">{{getButtonName}}</el-button>
      </el-col>
    </el-row>

    <!-- 步骤组件 -->
    <perspective-step1 v-if="config.step === 0" :apllySave="apllySave" @save="getOneSave" :perspective-id="perspectiveId"></perspective-step1>
    <perspective-step2 v-if="config.step === 1" :apllySave="apllySave" @save="getTwoSave" :perspective-id="perspectiveId" :perspective-name="perspectiveName"></perspective-step2>
    <perspective-step3 v-if="config.step === 2" :apllySave="apllySave" @save="getThreeSave" @saveData="getThreeData" :perspective-id="perspectiveId"></perspective-step3>
    
      
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import {
    modifyWarnUnitTypeConfStatus,
    saveDevicesMonitor
  } from '../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import OperationTips from '@/components/OperationTips.vue'
  import PerspectiveStep1 from './components/PerspectiveStep1.vue'
  import PerspectiveStep2 from './components/PerspectiveStep2.vue'
  import PerspectiveStep3 from './components/PerspectiveStep3.vue'
  export default {
    name: 'Monitoring-Alarm-Config-Step',
    data () {
      return {
        perspectiveId: this.$route.params.id,
        perspectiveName: this.$route.query.name,
        config: {
          step: -1,
        },
        apllySave: false,
        visible: {
          saving: false
        },
      }
    },
    components: { PerspectiveStep1, PerspectiveStep2, PerspectiveStep3, OperationTips },
    computed: {
      ...mapGetters(['']),
      getButtonName () {
        let name = ''
        if (this.config.step === 2) {
          name = '提交'
        } else {
          name = '保存下一步'
        }
        return name
      }
    },
    mounted () {
      this.initPage()
    },
    methods: {
      ...mapActions(['initAlarmColorList']),
      // 初始化页面
      initPage () {
        this.config.step = parseInt('1') - 1
      },
      lastStep () {
        this.config.step--
      },
      // 第一步
      getOneSave (val) {
        this.config.step++
        this.visible.saving = false
        this.apllySave = false
      },
      // 第二步
      getTwoSave (val) {
        if (val) {
          this.config.step++
        } else {
          this.$alert('部分报警单元未选择设备', '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
        }
        this.apllySave = false
        this.visible.saving = false
      },
      // 第三步
      getThreeSave (val) {
        if (val) {
          this.$alert('监控报警模块已经可以使用。', '配置完成', {
            confirmButtonText: '确定',
            callback: action => {
              this.$router.push({ path: '/sysConfig/monitoringAlarm/overview/' + this.perspectiveId })
            }
          })
        } else {
          this.$alert('部分报警单元未选择参数', '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
        }
        this.apllySave = false
        this.visible.saving = false
      },
      getThreeData (val) {
        modifyWarnUnitTypeConfStatus({
          warnUnitTypeId: val
        }).then(res => {
          if (res.status === 0) {
            console.log('配置状态修改成功')
          } else {
            console.log('配置状态修改失败')
          }
        })
      },
      // 保存并下一步
      saveAndNext () {
        this.visible.saving = true
        if (this.config.step === 1) {
          // 第二步报警单元设备配置，点击下一步要调接口
          saveDevicesMonitor({
            warnUnitTypeId: this.perspectiveId
          }).then(res => {
            if (res.status === 0) {
              this.apllySave = true
            } else {
              this.$message.error(res.msg)
            }
          })
        } else {
          this.apllySave = true
        }
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">

</style>
