/*
 * @Author: Zhangshitu 
 * @Date: 2018-07-03 14:34:15 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-21 15:50:31
 */
 
<template>
  <section>
    <el-row class="transparent my-3" v-loading="visible.cardLoading">
      <el-col class="m-3" :span="24">
        <el-button type="primary" size="medium" @click="handleSelectProcess">选择工序</el-button>
      </el-col>
      <el-col class="mb-3 mr-3" :span="6" v-for="(item, index) in processData" :key="index" style="min-width: 290px;">
        <el-card class="box-card" shadow="always">
          <div class="workshop-card">
            <h3 class="mt-2 mb-4">{{ item.workshop_name }}</h3>
            <!-- 工序参数 start -->
            <el-row class="mb-2 pb-2" style="border-bottom: 1px solid #ccc">
              <el-col :span="10" class="lh-40">
                <span>工序参数: </span>
              </el-col>
              <el-col :span="13" class="text-right pr-3">
                <el-button type="primary" plain round @click="addProcess(item)">添加工序参数</el-button>
              </el-col>
              <el-col :span="1">
                <!-- 初始参数 -->
                <p class="number-prompt"> {{ item.warningUnitPara ? item.warningUnitPara.count : 0 }} </p>
              </el-col>
            </el-row>
            <!-- 工序参数 end -->

            <!-- 工序扫码枪 start -->
            <el-row class="mb-2 pb-2" style="border-bottom: 1px solid #ccc">
              <el-col :span="12" class="lh-40">
                <span>工序扫码枪: </span>
              </el-col>
              <el-col :span="11" class="text-right pr-3">
                <el-button type="primary" plain round @click="selectMesDevice(item, 'sweep')">添加设备</el-button>
              </el-col>
              <el-col :span="1">
                <!-- 初始参数 -->
                <p class="number-prompt"> {{ item.sweepProcessCode ? item.sweepProcessCode.count : 0 }} </p>
              </el-col>
            </el-row>
            <!-- 工序扫码枪 end -->

            <!-- 添加报警种类设备 start -->
            <el-row class="mb-2" v-for="type in item.warningConfModuleUnitDOs" :key="type.value">
              <el-col :span="12" class="lh-40">
                <span>{{ type.warning_category_name }}：</span>
              </el-col>
              <el-col :span="11" class="text-right pr-3">
                <el-button type="primary" plain round @click="selectMesDevice(item, 'notCollect', type)">添加设备</el-button>
              </el-col>
              <el-col :span="1">
                <!-- 初始参数 -->
                <p class="number-prompt"> {{type.count}} </p>
              </el-col>
            </el-row>
            <!-- 添加报警种类设备 end -->

            <p class="mt-3 color-999">设备总数：{{ item.count }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

      <!-- 选择工序参数弹窗 -->
      <select-process-dialog
        title="选择工序参数"
        type="select"
        :warningUnitId="warningUnitId"
        :currency="processSelectedCurrency"
        :special="processSelectedSpecial"
        @processParameter="getProcessParameter"
        :dialog="visible.dialog"
        :visibleLoading="visible.loading"
        @visibleDialog="visible.dialog = $event"
        @getVisibleLoading="visible.loading = $event"
      ></select-process-dialog>
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import {
    queryProcessTwoChoiceUnits, saveProcessTwoChoiceUnit,
    saveProcessTwoChoiceUnitParam, // 添加工序参数
    saveProcessTwoChoiceUnitCode, // 添加设备(工序扫码枪)
    saveProcessTwoChoiceUnitModuleDevice // 添加设备（报警种类）
  } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import selectProcessDialog from './SelectProcessPDialog.vue'
  export default {
    name: 'Site-Management-Step2',
    data () {
      return {
        warningUnitTypeId: '',
        warningUnitId: '',
        warningUintParaId: '',
        moduleId: '',
        processData: [],
        selectedIds: [],
        processSelectNumber: null,
        processSelectedCurrency: [], // 通用
        processSelectedSpecial: [], // 特定
        sweepProcessCodeId: '',
        visible: {
          cardLoading: false,
          dialog: false,
          loading: false,
        }
      }
    },
    components: { selectProcessDialog },
    computed: {
      ...mapGetters(['getAlarmTypeList', 'getSiteUnitTypeId']),
    },
    props: {
      apllySave: Boolean
    },
    mounted () {
      this.warningUnitTypeId = this.getSiteUnitTypeId
      // 初始化
      this.getList()
      this.initAlarmTypeList()
    },
    methods: {
      // 获取报警类型
      ...mapActions(['initAlarmTypeList']),
      initPage () {},
      // 获取工序详情数据
      getList() {
        this.visible.cardLoading = true
        queryProcessTwoChoiceUnits({
          unitTypeId: this.warningUnitTypeId
        }).then(res => {
          if (res.status === 0) {
            this.processData = res.map.warningUnits
            
            // 去掉离线和停机报警
            this.processData.forEach(data => {
              for (let i = 0; i < data.warningConfModuleUnitDOs.length; i++) {
                let name = data.warningConfModuleUnitDOs[i].warning_category_name
                if (name === '停机报警' || name === '离线报警') {
                  data.warningConfModuleUnitDOs.splice(i, 1)
                  i--
                }
              }
            })
            if (this.processSelectNumber !== null) {
              this.setProcess(this.processData[this.processSelectNumber])
              this.visible.loading = false
            }
          } else {
            this.processData = []
          }
          this.visible.cardLoading = false
        })
      },
      // 点击选择工序按钮
      handleSelectProcess () {
        if (this.processData.length !== 0) {
          // 打开权限确认弹窗
          this.$mesPermission.show('权限确认', {
            tips: '需要通过验证后才能修改配置！'
          }).then(res => {
            console.log(res)
            this.openProcess()
          })
        } else this.openProcess()
      },
      // 选择工序
      openProcess () {
        this.selectedIds = []
        if (this.processData.length !== 0) {
          this.selectedIds = this.processData.map(v => { return v.workshop_id })
        }
        this.$mesWorkstage.show('选择工序', {
          reRender: true,
          selectedIds: this.selectedIds,
          multiple: true
        }).then(res => {
          let param = []
          const newIds = res.rows.map(v => { return v.process_id })
          // 拿到新增或删除的ID
          const processDataID = utils.contrastIds(this.selectedIds, newIds)
          let delete_process_name = ''
          // 拿到新增的数据
          processDataID.addIds.forEach(id => {
            res.rows.forEach(item => {
              if (item.process_id === id) {
                param.push({
                  process_name: item.process_name,
                  process_id: item.process_id,
                })
              }
            })
          })
          // 拿到修改的工序名
          processDataID.delIds.forEach(id => {
            this.processData.forEach(item => {
              if (item.workshop_id === id) {
                delete_process_name = delete_process_name + ' "' + item.workshop_name + '" '
              }
            })
          })
          // 新增或删除工序
          if (processDataID.delIds.length !== 0) {
            this.$confirm('此操作会删除 ' + delete_process_name + ', 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.saveProcessChoiceUnit(param, processDataID.delIds)
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '已取消'
              })
            })
          } else this.saveProcessChoiceUnit(param, processDataID.delIds)
        })
      },
      // 点击选择工序参数
      addProcess (item) {
        this.visible.dialog = true
        this.processSelectNumber = this.processData.indexOf(item)
        this.setProcess(item)
      },
      // 取出通用/特定工序参数的数据
      setProcess (item) {
        this.warningUnitId = item.warning_uint_id
        this.processSelectedCurrency = [] // 通用
        this.processSelectedSpecial = [] // 特定
        if (item.warningUnitPara) {
          this.warningUintParaId = item.warningUnitPara.warning_uint_para_id
          this.processSelectedCurrency = item.warningUnitPara.processSceneParamCurrencys
          item.warningUnitPara.processSceneParamGivens.forEach(process => {
            this.processSelectedSpecial.push(process.process_scene_param_name)
          })
        }
      },
      // 获取选择工序参数的数据
      getProcessParameter (val) {
        const warningUnitPara = {
          process_scene_param_ids_names: [],
          warning_unit_id: this.warningUnitId,
          warning_uint_para_id: this.warningUintParaId
        }
        val.warningUnitPara.forEach(item => {
          warningUnitPara.process_scene_param_ids_names.push({
            process_scene_param_id: item.process_scene_param_id,
            process_scene_param_name: item.process_scene_param_name
          })
        })
        const paraNames = val.paraNames
        this.saveChoiceUnitParam({ warningUnitPara, paraNames })
      },
      // 点击添加设备按钮
      selectMesDevice (item, type, warningType) {
        let selectedIds = []
        switch (type) {
          // 工序扫码枪
          case 'sweep':
            selectedIds = item.sweepProcessCode ? item.sweepProcessCode.device_ids_list.split(",") : []
          break
          // 报警种类
          case 'notCollect':
            selectedIds = warningType.device_ids_list ? warningType.device_ids_list.split(",") : []
          break
        }
        this.warningUnitId = item.warning_uint_id
        this.sweepProcessCodeId = item.sweepProcessCode ? item.sweepProcessCode.sweep_process_code_id : ''
        this.warningConfModuleUnitId = warningType ? warningType.warning_conf_module_unit_id : ''
        this.openMesDevice(selectedIds, type)
      },
      // 选择设备
      openMesDevice (selectedIds, type) {
        this.$mesDevice.show('添加设备', {
          reRender: true,
          params: {
            keyword: '',
            type: type
          },
          selectedIds: selectedIds,
          multiple: true
        }).then(res => {
          switch (type) {
            // 添加设备（工序扫码枪）
            case 'sweep':
            const idList = res.rows.map(v => v.device_id)
            const sweepProcessCode = {
              warning_unit_id: this.warningUnitId,
              device_ids_list: idList.join(','),
              sweep_process_code_id: this.sweepProcessCodeId,
              count: '' // 为空就可以了
            }
            this.saveChoiceUnitCode(sweepProcessCode)
            break
            // 添加设备（报警种类）
            case 'notCollect':
            const deviceIdsList = res.rows.map(v => v.device_id).join(',')
            this.saveChoiceUnitModuleDevice(deviceIdsList)
            break
          }
        })
      },
      // 新增或删除工序 API
      saveProcessChoiceUnit (newData, oldId) {
        saveProcessTwoChoiceUnit({
          unitTypeId: this.warningUnitTypeId,
          processUnit: JSON.stringify(newData),
          processIds: oldId.join(',')
        }).then(res => {
          if (res.status === 0) {
            this.$message({
              type: 'success',
              message: '修改成功'
            })
            this.getList()
          } else {
            this.$message.error(res.msg)
            this.processData = []
          }
        })
      },
      // 添加工序参数 API
      saveChoiceUnitParam (data) {
        this.visible.cardLoading = true
        saveProcessTwoChoiceUnitParam({
          warningUnitPara: JSON.stringify(data.warningUnitPara), // 未更改
          paraNames: data.paraNames
        }).then(res => {
          if (res.status === 0) {
            this.$message({
              type: 'success',
              message: '修改工序参数成功'
            })
            this.getList()
          } else this.$message.error(res.msg)
          this.visible.cardLoading = false
        })
      },
      // 添加设备（工序扫码枪）API
      saveChoiceUnitCode (sweepProcessCode) {
        saveProcessTwoChoiceUnitCode({
          sweepProcessCode: JSON.stringify(sweepProcessCode),
        }).then(res => {
          if (res.status === 0) {
            this.$message({
              type: 'success',
              message: '添加设备成功'
            })
            this.getList()
          } else this.$message.error(res.msg)
        })
      },
      // 添加设备（报警种类）API
      saveChoiceUnitModuleDevice (deviceIdsList) {
        saveProcessTwoChoiceUnitModuleDevice ({
          warningConfModuleUnitId: this.warningConfModuleUnitId, // 模块单元配置id
          deviceIdsList: deviceIdsList // 分号分隔（报警单元设备id）
        }).then(res => {
          if (res.status === 0) {
            this.$message({
              type: 'success',
              message: '添加设备成功'
            })
            this.getList()
          } else this.$message.error(res.msg)
        })
      } 
    },
    watch: {
      apllySave (val) {
        if (val) {
          const counts = []
          let _p = true
          this.processData.forEach(item => {
            item.warningConfModuleUnitDOs.forEach(data => {
              counts.push(data.count)
            })
            if (item.sweepProcessCode) {
              counts.push(item.sweepProcessCode.count)
            } else {
              counts.push(0)
            }
            if (item.warningUnitPara) {
              counts.push(item.warningUnitPara.count)
            } else {
              counts.push(0)
            }
          })
          
          counts.forEach(count => {
            if (count === 0) {
              _p = false
              return
            }
          })
          this.$emit('save', _p)
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
.workshop-card {
  h3 {
    margin: 0;
  }
  span {
    line-height: 20px;
  }
  p {
    margin: 10px 0
  }
  .number-prompt {
    color: white;
    line-height: 20px;
    text-align: center;
    width: 20px;
    height: 20px;
    background: #409EFF;
    border-radius: 20px;
  }
}
</style>
