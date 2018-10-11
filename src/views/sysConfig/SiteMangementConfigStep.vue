/*
 * @Author: liucz 
 * @Date: 2018-06-29 13:55:43 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-08 11:56:25
 */
<template>
  <section>
    <!-- 操作提示组件 -->
    <operation-tips video="">
      <span class="color-999">现场管理配置分四步。 第1步：报警配置，在全局报警配置的基础上，选择模块需要用的报警配置。   第2步：工序配置，配置工序以及工序需要用到的设备   第3步：工序设备配置，配置设备需要监控的参数。  第4步：配置工序起止时间，即现场生产时判断工序开始、结束的依据。</span>
    </operation-tips>

    <el-row class="transparent mt-3">
      <el-col :span="16" :offset="3">
        <el-steps :active="config.step" finish-status="success" align-center>
          <el-step title="报警配置"></el-step>
          <el-step title="工序配置"></el-step>
          <el-step title="工序设备参数配置"></el-step>
          <el-step title="工序起止时间配置"></el-step>
        </el-steps>
      </el-col>
      <el-col :span="5" class="text-right">
        <el-button type="primary" size="medium" @click="lastStep" v-if="config.step > 0">上一步</el-button>
        <el-button type="primary" size="medium" :loading="visible.saving" @click="saveAndNext" v-if="config.step < 4">{{getButtonName}}</el-button>
      </el-col>
    </el-row>

    <!-- 步骤组件 -->
    <site-management-step1 v-if="config.step === 0" :apllySave="apllySave" @save="getOneSave"></site-management-step1>
    <site-management-step2 v-if="config.step === 1" :apllySave="apllySave" @save="getTwoSave"></site-management-step2>
    <site-management-step3 v-if="config.step === 2" :apllySave="apllySave" @save="getThreeSave"></site-management-step3>
    <site-management-step4 v-if="config.step === 3" :apllySave="apllySave" @save="getFourSave" @saveData="getFourData"></site-management-step4>
    
      
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import { modifyLoginStatus } from '../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import OperationTips from '@/components/OperationTips.vue'
  import SiteManagementStep1 from './components/SiteManagementStep1.vue'
  import SiteManagementStep2 from './components/SiteManagementStep2.vue'
  import SiteManagementStep3 from './components/SiteManagementStep3.vue'
  import SiteManagementStep4 from './components/SiteManagementStep4.vue'
  export default {
    name: 'Site-Mangement-Config-Step',
    data () {
      return {
        config: {
          step: -1,
        },
        apllySave: false,
        visible: {
          saving: false
        },
      }
    },
    components: { SiteManagementStep1, SiteManagementStep2, SiteManagementStep3, SiteManagementStep4, OperationTips },
    computed: {
      ...mapGetters(['']),
      getButtonName () {
        let name = ''
        if (this.config.step === 3) {
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
      getOneSave (val) {
        this.config.step++
        this.visible.saving = false
        this.apllySave = false
      },
      getTwoSave (val) {
        if (val) {
          this.config.step++
        } else {
          this.$alert('工序未全部配置，请先配置设备', '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
        }
        this.apllySave = false
        this.visible.saving = false
      },
      getThreeSave (val) {
        if (val) {
          this.config.step++
        } else {
          this.$alert('工序设备参数未全部配置，请至少选择一个参数', '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
        }
        this.apllySave = false
        this.visible.saving = false
      },
      getFourSave (val) {
        if (val) {
          this.$alert('现场管理模块已经可以使用。', '配置完成', {
            confirmButtonText: '确定',
            callback: action => {
              this.$router.push({ path: '/sysConfig/siteMangement/overview'})
            }
          })
        } else {
          this.$alert('还有工序未配置起止时间', '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
        }
        this.apllySave = false
        this.visible.saving = false
      },
      getFourData (val) {
        const warnUnitIds = val.map(v => v.warning_uint_id).join(',')
        modifyLoginStatus({
          warnUnitIds: warnUnitIds
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
        this.apllySave = true
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">

</style>
