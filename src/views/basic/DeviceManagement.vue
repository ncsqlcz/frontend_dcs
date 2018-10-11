<template>
  <section>
    <!--搜索 start-->
    <el-col class="toolbar">
      <el-form :inline="true"
               :model="filters"
               @submit.native.prevent>
        <el-col :span="10"
                class="text-left">
          <el-form-item>
            <el-button type="default"
                       size="medium"
                       @click="handleDeviceDownload"
                       icon="fa fa-reply"> 导出设备</el-button>
          </el-form-item>
          <el-form-item>
            <el-upload class="upload"
                       :action="importEquipmentUrl"
                       :on-change="handleFileChange"
                       :file-list="fileList"
                       :show-file-list="false"
                       :auto-upload="false"
                       :multiple="false"
                       accept=".xlsx, .xls">
              <el-tooltip class="item"
                          effect="dark"
                          content="仅支持.xlsx 和 .xls"
                          placement="top">
                <el-button type="primary"
                           size="medium"
                           icon="fa fa-share"> 导入设备</el-button>
              </el-tooltip>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="14"
                class="text-right">
          <el-form-item>
            <el-select v-model="filters.deviceTypeId"
                       placeholder="全部设备类型"
                       style="width:150px"
                       size="medium"
                       v-if="status===0"
                       @focus="getDeviceType">
            </el-select>
            <el-select v-model="filters.type"
                       placeholder="全部设备类型"
                       style="width:150px"
                       size="medium"
                       disabled
                       v-else>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model.trim="filters.keyword"
                      size="medium"
                      placeholder="设备名称、编号或关键字"
                      @keyup.native.enter="getList"
                      v-if="status===0"></el-input>
            <el-input v-model.trim="filters.keyword"
                      size="medium"
                      placeholder="设备名称、编号或关键字"
                      @keyup.native.enter="getList"
                      disabled
                      v-else></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
                       size="medium"
                       @click="getList"
                       icon="el-icon-search"
                       v-if="status===0">查询</el-button>
            <el-button type="primary"
                       size="medium"
                       @click="getList"
                       icon="el-icon-search"
                       disabled
                       v-else>查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="default"
                       size="medium"
                       @click="reset"
                       v-if="status===0">重置</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-col>
    <!-- 设备引导说明 -->
    <el-col v-if="status==1"
            class="operation-desc">
      <div class="description">模块操作引导说明</div>
    </el-col>
    <el-col v-if="status == 0">
      <!-- 新增设备 start -->
      <el-row class="transparent"
              v-if="newlist.length>0">
        <el-col :span="24"
                class="title-name mt-1 color-999">新增设备</el-col>
        <el-col :span="24">
          <div class="flex-wrap">
            <el-card class="perspective-card mr-2 mt-1"
                     v-for="(item,index) in newlist"
                     :key="index">
              <div class="pb-1 clearfixx"
                   style="border-bottom:1px solid #eee">
                <span>{{item.device_name}}</span>
                <el-badge value="new"
                          class="item"
                          style="float: right;">
                </el-badge>
              </div>
              <div class="cen">
                <div class="text item">
                  <p>设备编号:
                    <span class="ml-2"> {{item.device_number}}</span>
                  </p>
                  <p>设备类型:
                    <span class="ml-2">{{item.device_type_name}}</span>
                  </p>
                  <p>设备型号:
                    <span class="ml-2">{{item.device_model}}</span>
                  </p>
                </div>
              </div>
              <div class="bTop clearfix">
                <el-col>
                  <el-col :span="8">
                    <el-dropdown size="mini"
                                 trigger="click">
                      <el-button type="primary"
                                 round
                                 plain
                                 size="mini">
                        参数管理
                        <i class="el-icon-caret-bottom el-icon--right"></i>
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>
                          <span @click="handleDownload(item.device_id)">导出excel</span>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <el-upload class="upload"
                                     :action="importEquipmentParamUrl"
                                     :on-change="handleFile"
                                     :http-request="FileUpload"
                                     :data="item"
                                     accept=".xlsx, .xls">
                            <el-tooltip class="item"
                                        effect="dark"
                                        content="仅支持.xlsx 和 .xls"
                                        placement="bottom">
                              <span> 导入excel</span>
                            </el-tooltip>
                          </el-upload>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </el-col>
                  <el-col :span="8"
                          :offset="7">
                    <el-button type="primary"
                               round
                               plain
                               disabled
                               size="mini"
                               :disabled="item.device_new_status==0">
                      查看参数
                    </el-button>
                  </el-col>
                </el-col>
                <el-col :span="8"
                        :offset="8"
                        class="mt-2">
                  <el-button type="primary"
                             round
                             plain
                             disabled
                             size="mini"
                             :disabled="item.device_new_status==0"
                             @click="showDeviceConfig(item)">
                    访问配置
                    <i class="el-icon--right"></i>
                  </el-button>
                </el-col>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
      <!-- <addDevice :list="newlist"></addDevice> -->
      <!-- 新增设备 end -->
      <!-- 现有设备 start -->
      <el-row class="transparent"
              v-if="existingList.length>0">
        <el-col :span="24"
                class="title-name mt-1 color-999">现有设备</el-col>
        <el-col :span="24">
          <div class="flex-wrap">
            <el-card class="perspective-card mr-2 mt-1"
                     v-for="(item,index) in existingList"
                     :key="index">
              <div class="pb-1"
                   style="padding-bottom:10px;border-bottom:1px solid #eee">
                <span>{{item.device_name}}</span>
              </div>
              <div class="cen">
                <div class="text item">
                  <p>设备编号:
                    <span class="ml-2"> {{item.device_number}}</span>
                  </p>
                  <p>设备类型:
                    <span class="ml-2">{{item.device_type_name}}</span>
                  </p>
                  <p>设备型号:
                    <span class="ml-2">{{item.device_model}}</span>
                  </p>
                </div>
              </div>
              <div class="bTop clearfix">
                <el-col>
                  <el-col :span="8">
                    <el-dropdown size="mini"
                                 trigger="click">
                      <el-button type="primary"
                                 round
                                 plain
                                 size="mini">
                        参数管理
                        <i class="el-icon-caret-bottom el-icon--right"></i>
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>
                          <span @click="handleDownload(item.device_id)">导出excel</span>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <el-upload class="upload"
                                     :action="importEquipmentParamUrl"
                                     :on-change="handleFile"
                                     :http-request="FileUpload"
                                     :data="item"
                                     accept=".xlsx, .xls">
                            <el-tooltip class="item"
                                        effect="dark"
                                        content="仅支持.xlsx 和 .xls"
                                        placement="bottom">
                              <span> 导入excel</span>
                            </el-tooltip>
                          </el-upload>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </el-col>
                  <el-col :span="8"
                          :offset="7">
                    <el-badge is-dot
                              class="item"
                              :hidden="item.is_parameter_update==1">
                      <el-button type="primary"
                                 round
                                 plain
                                 size="mini"
                                 @click="WatchPara(item)">
                        查看参数
                      </el-button>
                    </el-badge>
                  </el-col>
                </el-col>
                <el-col :span="8"
                        :offset="8"
                        class="mt-2">
                  <el-badge is-dot
                            class="item"
                            :hidden="item.is_access_update==1"
                            @click="WatchPara">
                    <el-button type="primary"
                               round
                               size="mini"
                               @click="showDeviceConfig(item)">
                      访问配置
                    </el-button>
                  </el-badge>
                </el-col>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
      <!-- 现有设备 end -->
    </el-col>
    <!-- </el-row> -->

    <!-- 查看参数弹框 -->
    <device-para :visible.sync="visible.ParaLoading"
                 :id="deviceId"
                 :Paralist="EquipmentParamList"></device-para>

    <!-- 设备配置组件-->
    <DeviceConfig :visible.sync="visible.deviceConfig"
                  :device-id="deviceId"></DeviceConfig>

  </section>
</template>
<script>
import utils from '../../common/js/utils'
import devicePara from './components/DevicePara.vue'
import DeviceConfig from './components/DeviceConfig.vue'
// import addDevice from './components/addDevice.vue';
import {
  queryEquipment,
  importEquipment,
  exportEquipmenUrl,
  importEquipmentUrl,
  exportEquipmentParamUrl,
  importEquipmentParamUrl,
  importEquipmentParam,
  queryEquipmentParam
} from '../../api/api'
export default {
  data() {
    return {
      status: 0,
      filters: {
        keyword: '',
        deviceTypeId: '',
        // pageSize: 10,
        // page: 1,
        total: 0
      },
      options: [],
      list: [],
      deviceType: [], //设备类型
      visible: {
        importLoading: false,
        listLoading: true,
        ParaLoading: false, //控制查看参数弹框显示或隐藏
        AccessPara: false, //控制查看访问配置弹框显示或隐藏
        deviceConfig: false
      },
      fileList: [],
      importEquipmentUrl: importEquipmentUrl,
      importEquipmentParamUrl: importEquipmentParamUrl,
      newlist: [],
      existingList: [],
      EquipmentParamList: {},
      deviceId: '' // 当前访问配置设备id
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    // 列表
    getList() {
      this.visible.listLoading = true
      queryEquipment(this.filters).then(res => {
        console.log(res)
        if (res.status == 0) {
          this.filters.total = res.map.line
          this.list = res.map.deviceList
          let newdata = []
          let nowData = []
          this.list.forEach(item => {
            if (item.device_new_status == 0) {
              newdata.push(item)
            } else {
              nowData.push(item)
            }
          })
          this.newlist = newdata
          this.existingList = nowData
          this.status = res.status
        } else {
          if (this.filters.keyword !== '' || this.filters.deviceTypeId !== '') {
            this.list = []
            this.filters.total = 0
            this.newlist = []
            this.existingList = []
            this.$message.error('没有该设备的数据，可以导入相关设备')
          } else {
            this.status = 1
          }
        }
        this.visible.listLoading = false
      })
    },
    // 导出设备参数
    handleDownload(val) {
      this.deviceId = val
      // console.log(this.deviceId)
      utils.downloadFile(exportEquipmentParamUrl + `?deviceId=${this.deviceId}`)
    },
    // 导出设备
    handleDeviceDownload() {
      utils.downloadFile(exportEquipmenUrl)
    },
    // 导入设备
    handleDeviceImport() {
      let form = new FormData()
      for (let value of this.fileList) {
        // form.append("type", this.filters.type);
        form.append('file', value.raw)
      }
      if (this.status !== 0) {
        //初始化状态
        this.$confirm(
          '请使用系统提供的excel模板，确保在导入前进行“导出设备（excel）操作',
          '导入设备(excel)'
        ).then(action => {
          if (action == 'confirm') {
            this.importEquipment(form)
          }
        })
      } else {
        // // 打开权限确认弹窗
        this.$mesPermission
          .show('权限确认', {
            tips: '需要通过验证后才能继续'
          })
          .then(res => {
            if (res === 'pass') {
              this.$confirm(
                '请使用系统提供的excel模板，确保在导入前进行“导出设备（excel）操作',
                '导入设备(excel)'
              ).then(action => {
                if (action == 'confirm') {
                  this.importEquipment(form)
                }
              })
            }
          })
      }
    },
    // 导入设备表格
    importEquipment(value) {
      importEquipment(value).then(res => {
        if (res.status === 0) {
          this.$message.success('成功')
          this.getList()
        } else {
          this.$message.error(res.msg || '失败')
        }
      })
    },
    // 导入设备参数
    FileUpload(item) {
      // console.log(item)
      let form = new FormData()
      for (let value of this.fileList) {
        form.append('deviceId', item.data.device_id)
        form.append('file', value.raw)
      }
      if (item.data.device_new_status == 0) {
        this.$confirm(
          '请使用系统提供的excel模板，确保在导入前进行“导出excel操作',
          '导入excel'
        ).then(action => {
          if (action == 'confirm') {
            importEquipmentParam(form).then(res => {
              if (res.status === 0) {
                this.$message.success('成功')
                this.getList()
              } else {
                this.$message.error(res.msg || '失败')
              }
            })
          }
        })
      } else {
        this.$mesPermission
          .show('权限确认', {
            tips: '需要通过验证后才能继续'
          })
          .then(res => {
            if (res === 'pass') {
              this.$confirm(
                '请使用系统提供的excel模板，确保在导入前进行“导出excel操作',
                '导入excel'
              ).then(action => {
                if (action == 'confirm') {
                  importEquipmentParam(form).then(res => {
                    if (res.status === 0) {
                      this.$message.success('成功')
                      this.getList()
                    } else {
                      this.$message.error(res.msg || '失败')
                    }
                  })
                }
              })
            }
          })
      }
    },
    // 文件改变就开始上传
    handleFileChange(file, fileList) {
      this.fileList = [file]
      this.handleDeviceImport()
    },
    handleFile(file, fileList) {
      // console.log(val)
      this.fileList = [file]
      // this.handleImport();
    },
    // 获取设备参数
    getDeviceType() {
      this.$mesDeviceTypes
        .show('选择设备类型', {
          reRender: true,
          multiple: false,
          params: {
            keyword: ''
          },
          selectedIds: this.selectedIds
        })
        .then(res => {
          // console.log(res.rows[0]);
          this.deviceType = res.rows
          this.filters.deviceTypeId = res.rows[0].device_type_id
          this.getList()
          this.selectedIds = res.rows.map(v => v.device_type_id)
        })
    },
    // 查看参数
    WatchPara(value) {
      this.visible.ParaLoading = true
      this.deviceId = value.device_id
      let data = {
        total: 0,
        page: 1,
        pageSize: 10,
        deviceId: this.deviceId
      }
      queryEquipmentParam(data).then(res => {
        console.log(res)
        if (res.status == 0) {
          this.EquipmentParamList = res.map
        } else {
          this.EquipmentParamList = {}
          this.$message.error(res.msg)
        }
        value.is_parameter_update = 1
      })
    },
    // 显示访问配置
    showDeviceConfig(item) {
      item.is_access_update = 1
      this.deviceId = item.device_id
      this.visible.deviceConfig = true
    },
    // 重置
    reset() {
      this.filters = {
        keyword: '',
        deviceTypeId: '',
        // pageSize: 10,
        // page: 1,
        total: 0
      }
      this.getList()
    }
  },
  components: {
    devicePara,
    DeviceConfig
    // AccessConfig,
    // addDevice
  }
}
</script>
<style>
.el-badge__content.is-fixed {
  position: absolute;
  top: 11px;
  -webkit-transform: translateY(-50%) translateX(100%);
  transform: translateY(-50%) translateX(100%);
}
</style>


<style lang="scss" scoped>
.bTop {
  border-top: 1px solid #eee;
  padding-top: 10px;
}
.cen {
  padding: 15px 0px;
}
.clearfix:after {
  content: '';
  display: block;
  clear: both;
  visibility: hidden;
  height: 0;
}
.perspective-card {
  width: 270px;
  overflow: hidden;
}
.operation-desc {
  display: flex;
  align-items: center;
  justify-content: center;
  .description {
    width: 800px;
    height: 300px;
    line-height: 300px;
    text-align: center;
    margin-top: 100px;
    background-color: #eee;
    border: 1px solid #ccc;
  }
}
</style>

