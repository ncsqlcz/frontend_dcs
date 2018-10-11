/*
 * @Author: liucz 
 * @Date: 2018-09-25 14:14:58 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-28 15:15:26
 */
<template>
  <el-dialog title="访问配置"
             :visible.sync="dialogVisible"
             width="70%"
             class="mes-dialog"
             :close-on-click-modal="false">
    <el-tabs v-model="activeTabModule"
             @tab-click="handleTabClick">
      <el-tab-pane v-for="(item, idx) in tabList"
                   :key="item.module"
                   :label="item.title"
                   :name="item.module">

        <!-- 设备发送数据 -->
        <DeviceConfigIP v-if="item.module === 'deviceIp'"
                        :device-id="curDeviceId"
                        :data="deviceConfigData['deviceIp']"
                        :response-next="randomData['deviceIp']"
                        @verify="handleVerify"
                        @next="handleVerifyBeforeNext"></DeviceConfigIP>

        <!-- 来源于PLC -->
        <DeviceConfigFromPLC v-if="item.module === 'fromPLC'"
                             :device-id="curDeviceId"
                             :data="deviceConfigData['fromPLC']"
                             :response-next="randomData['fromPLC']"
                             @verify="handleVerify"
                             @next="handleVerifyBeforeNext"></DeviceConfigFromPLC>

        <!-- 来源于数据库 -->
        <DeviceConfigFromDB v-if="item.module === 'fromDB'"
                            :device-id="curDeviceId"
                            :data="deviceConfigData['fromDB']"
                            :response-next="randomData['fromDB']"
                            @verify="handleVerify"
                            @next="handleVerifyBeforeNext"></DeviceConfigFromDB>

        <!-- 来源于文件夹 -->
        <DeviceConfigFromFolder v-if="item.module === 'fromFolder'"
                                :device-id="curDeviceId"
                                :data="deviceConfigData['fromFolder']"
                                :response-next="randomData['fromFolder']"
                                @verify="handleVerify"
                                @next="handleVerifyBeforeNext"></DeviceConfigFromFolder>
      </el-tab-pane>
    </el-tabs>

    <div slot="footer"
         class="dialog-footer mt-3 text-center ">
      <el-button type="primary"
                 size=""
                 @click="applyNext"
                 style="width: 200px;"
                 :loading="show.submitLoading">
        <span v-if="isLastStep && !show.dataLoading">确认</span>
        <span v-else>下一步</span>
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import utils from '@/common/js/utils'
import { queryParamSources, saveAccessConfig } from '@/api/api'
import { mapGetters, mapActions } from 'vuex'
import DeviceConfigIP from './DeviceConfigIP.vue'
import DeviceConfigFromPLC from './DeviceConfigFromPLC.vue'
import DeviceConfigFromDB from './DeviceConfigFromDB.vue'
import DeviceConfigFromFolder from './DeviceConfigFromFolder.vue'
export default {
  name: 'device-config',
  data() {
    return {
      curDeviceId: '',
      show: {
        dataLoading: true,
        submitLoading: false
      },
      dialogVisible: false,
      activeTabModule: 'deviceIp',
      tabList: [
        {
          title: '设备发送数据',
          module: 'deviceIp',
          verified: false, // 模块数据校验是否成功
          value: '' // 后端接口需要的值
        }
      ],
      deviceConfigData: {
        deviceIp: {
          access_config_id: '',
          ip: ''
        },
        fromPLC: {
          access_config_id: '',
          ip: '',
          port: '',
          list: []
        },
        fromDB: {
          access_config_id: '',
          ip: '',
          port: '',
          dbType: '',
          dbName: '',
          username: '',
          password: '',
          tableName: '',
          list: []
        },
        fromFolder: {
          access_config_id: '',
          ip: '',
          port: '',
          username: '',
          password: '',
          folderPath: ''
        }
      },
      randomData: {
        deviceIp: Math.random(),
        fromPLC: Math.random(),
        fromDB: Math.random(),
        fromFolder: Math.random()
      }
    }
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    deviceId: {
      type: String,
      required: true,
      default: ''
    }
  },
  components: {
    DeviceConfigIP,
    DeviceConfigFromPLC,
    DeviceConfigFromDB,
    DeviceConfigFromFolder
  },
  computed: {
    ...mapGetters(['getDeviceTypeList']),
    // 是否是最后一步
    isLastStep() {
      let index = this.tabList.findIndex(item => {
        return item.module === this.activeTabModule
      })
      return index === this.tabList.length - 1
    }
  },
  mounted() {},
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    },
    deviceId(val) {
      this.initPage()
    }
  },
  methods: {
    ...mapActions(['initDeviceTypeList']),
    // 初始化页面
    initPage() {
      this.tabList = [
        {
          title: '设备发送数据',
          module: 'deviceIp',
          verified: false, // 模块数据校验是否成功
          value: '' // 后端接口需要的值
        }
      ]
      this.show.dataLoading = true
      // 获取tab
      queryParamSources({ deviceId: this.deviceId }).then(res => {
        if (res.status === 0) {
          let tabs = []
          res.map.source.forEach(item => {
            if (!item) return true
            let tab = {}
            switch (item.parameter_source) {
              case 'PLC':
                {
                  tab = {
                    title: '来源于PLC',
                    module: 'fromPLC',
                    verified: false,
                    value: item.parameter_source
                  }
                }
                break
              case '设备数据库':
                {
                  tab = {
                    title: '来源于数据库',
                    module: 'fromDB',
                    verified: false,
                    value: item.parameter_source
                  }
                }
                break
              case '设备文件夹':
                {
                  tab = {
                    title: '来源于文件夹',
                    module: 'fromFolder',
                    verified: false,
                    value: item.parameter_source
                  }
                }
                break
            }
            this.tabList.push(tab)
          })
        }
        this.show.dataLoading = false
        // 更新子组件的deviceid
        this.$nextTick(() => {
          this.curDeviceId = this.deviceId
        })
      })
    },
    // 点击下一步
    applyNext() {
      this.randomData[this.activeTabModule] = Math.random()
    },
    // 下一步
    nextStep() {
      // 是否是最后一步
      if (this.isLastStep) {
        this.handleSubmit()
      } else {
        let index = this.getModuleIndex(this.activeTabModule)
        this.activeTabModule = this.tabList[++index].module
      }
    },
    // 获取模块索引位置
    getModuleIndex(module) {
      return this.tabList.findIndex(item => {
        return item.module === module
      })
    },
    handleTabClick(tab) {
      // console.log(tab)
    },
    // 子组件校验结果回调
    handleVerify(valid) {
      this.tabList[this.getModuleIndex(this.activeTabModule)].verified = valid
    },
    // 子组件下一步之前回调
    handleVerifyBeforeNext(valid, data) {
      this.handleVerify(valid)
      this.nextStep()
    },
    // 提交数据
    handleSubmit() {
      // 是否全部校验通过
      let verified = this.tabList.find(item => {
        return item.verified === false
      })
      if (!verified) {
        this.$confirm('确认提交?', '提示', {
          type: 'warning'
        })
          .then(action => {
            if (action === 'confirm') {
              this.submit()
            }
          })
          .catch(() => {
            this.show.submitLoading = false
          })
      } else {
        this.$message.info('有页面未完成数据校验, 请检查后再提交')
      }
    },
    // 调用接口提交数据
    submit() {
      this.show.submitLoading = true
      let params = []
      this.tabList.forEach(item => {
        let module = item.module
        if (module !== 'deviceIp') {
          let param = {
            access_config_id: '',
            parameter_source: item.value,
            device_id: this.deviceId,
            device_ip: this.deviceConfigData[module].ip,
            access_port: this.deviceConfigData[module].port || '',
            device_parameter_id: this.deviceConfigData[module].list
              ? this.deviceConfigData[module].list
                  .map(v => v.data_type)
                  .join(',')
              : '',
            user_name: this.deviceConfigData[module].username || '',
            password: this.deviceConfigData[module].password || '',
            file_path: this.deviceConfigData[module].folderPath || '',
            database_name: this.deviceConfigData[module].dbName || '',
            database_type: this.deviceConfigData[module].dbType || '',
            table_name: this.deviceConfigData[module].tableName || '',
            data_field: this.deviceConfigData[module].list
              ? this.deviceConfigData[module].list
                  .map(v => v.data_field)
                  .join(',')
              : ''
          }
          if (module === 'fromFolder') {
            param.data_field = undefined
          }
          params.push(param)
        }
      })

      saveAccessConfig({ accessConfs: JSON.stringify(params) })
        .then(res => {
          if (res.status === 0) {
            this.$message.success('已保存')
            this.dialogVisible = false
          } else {
            this.$message.error(res.msg)
          }
          this.show.submitLoading = false
        })
        .catch(() => {
          this.show.submitLoading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
</style>
