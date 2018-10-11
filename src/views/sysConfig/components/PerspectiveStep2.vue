/*
 * @Author: Zhangshitu 
 * @Date: 2018-06-29 15:02:03 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-23 10:49:35
 */

<template>
  <section>
    <el-row class="transparent mt-3" v-loading="visible.listLoading">
      <el-col :span="24" class="title-name mb-3">报警视角: {{ perspectiveName }}</el-col>
      <el-col :span="24">
        <el-button class="mb-3" type="primary" style="width: 120px;" @click="selectWarningUnit">创建报警单元</el-button>
        <!-- <el-button class="mb-3" type="primary" style="width: 120px;" @click="selectMesWorkShop">选择车间</el-button> -->
      </el-col>
      <el-col class="mb-3 mr-3" :span="6" v-for="(data, index) in workshopData" :key="index" style="min-width: 290px;">
        <el-card class="box-card" shadow="always">
          <div class="workshop-card">
            <h3 class="mb-3">
              {{ data.warning_unit_name }}
              <el-badge value="新" class="item" v-if="data.count === 0" style="height: 16px;"></el-badge>
            </h3>
            <el-row class="mb-2" v-for="(type, typeIndex) in data.warningConfModuleUnitDOs" :key="typeIndex">
              <el-col :span="12">
                <span>{{ type.warningCategoryDO.warning_category_name }}：</span>
              </el-col>
              <el-col :span="11">
                <el-button type="primary" plain @click="openMesDevice(type)">添加设备</el-button>
              </el-col>
              <el-col :span="1">
                <p class="number-prompt">{{ type.count }}</p>
              </el-col>
            </el-row>
            <p class="mt-3">设备总数：{{ data.count }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <new-warning-unit-dialog :visible.sync="visible.warningUnitDialog"
                              :create-type.sync="createType"
                              @change="handleWarningUnitChange"
                              :textList="unitNameList"
                              ></new-warning-unit-dialog>
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import {
    saveModuleUnitTwo,
    queryModuleUnitTwo,
    saveModuleConfDevices,
    modifyWarnUnitCreateType,
    queryWarnUnitByCreateType,
    queryWarnUnitCreateType
  } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import NewWarningUnitDialog from './NewWarningUnitDialog.vue'
  export default {
    name: 'Perspective-Step2',
    data () {
      return {
        workshopData: [],
        visible: {
          listLoading: false,
          permissionDialog: false,
          warningUnitDialog: false
        },
        deviceId: [],
        warnUnitTypeId: '',
        warnUnitId: '',
        moduleConfUnitId: '',
        selectedIds: [],
        userForm: {
          password: ''
        },
        rules: {
          password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
        },
        originCreateType: '', // 原始的createType
        createType: '',
        unitNameList: [],
        unitNameDict: {}
      }
    },
    computed: {
      ...mapGetters(['getAlarmTypeList'])
    },
    props: {
      perspectiveId: String,
      perspectiveName: String,
      apllySave: Boolean
    },
    components: { NewWarningUnitDialog },
    mounted () {
      this.warnUnitTypeId = this.perspectiveId
      this.initPage()
      this.initAlarmTypeList()
    },
    methods: {
      ...mapActions(['initAlarmTypeList']),
      // 初始化数据
      initPage () {
        this.visible.listLoading = true
        queryModuleUnitTwo({
          unitTypeId: this.perspectiveId
        }).then(res => {
          if (res.status === 0) {
            this.workshopData = res.map.warningUnitDOs
            this.selectedIds = this.workshopData.map(v => { return v.workshop_id })
            // 建立名字和id的映射
            this.workshopData.forEach(item => {
              this.unitNameDict[item.workshop_name] = item
            })
            // 去掉离线和停机报警
            this.workshopData.forEach(data => {
              for (let i = 0; i < data.warningConfModuleUnitDOs.length; i++) {
                let name = data.warningConfModuleUnitDOs[i].warningCategoryDO.warning_category_name
                if (name === '停机报警' || name === '离线报警') {
                  data.warningConfModuleUnitDOs.splice(i, 1)
                  i--
                }
              }
            })
          } else {
            this.workshopData = []
            this.selectedIds = []
          }
          this.visible.listLoading = false
        })
      },
      // 选择报警单元 
      selectWarningUnit () {
        // 打开权限确认弹窗
        this.$mesPermission.show('权限确认', {
          tips: '需要通过验证后才能配置报警单元设备！'
        }).then(action => {
          if (action === 'pass') {
            this.afterPermissionPass()
          }
        })
      },
      // 权限确认之后
      async afterPermissionPass () {
        let res = await queryWarnUnitCreateType({warnUnitTypeId: this.warnUnitTypeId})
        if (res.status === 0) {
          this.originCreateType = this.createType = res.data
          this.visible.warningUnitDialog = true
          // 初始化自定义单元报警数据
          if (this.createType === 'custom') {
            let result = await queryWarnUnitByCreateType({
              warnUnitTypeId: this.warnUnitTypeId,
              createType: this.createType
            })
            if (result.status === 0) {
              this.unitNameList = result.map.warnUnit.map(v => v.workshop_name)
            } else {
              this.unitNameList = []
            }
          }
        }
      },
      // 选择报警单元
      async handleWarningUnitChange (data) {
        // 不相等才修改
        if (data.type !== this.originCreateType) {
          let res = await modifyWarnUnitCreateType({
            warnUnitTypeId: this.warnUnitTypeId,
            createType: data.type === 'workshop' ? 'custom' : 'workshop' // 要传另一个类型，真tm神逻辑
          })
          if (res.status === 0) {
            this.beforeSaveModuleUnit(data)
          } else {
            this.$message.error(res.msg)
          }
        } else {
          this.beforeSaveModuleUnit(data)
        }
      },
      beforeSaveModuleUnit (data) {
        switch (data.type) {
          case 'workshop':
            this.openMesWorkShop()
          break
          case 'custom':
            let params = {rows: [], action: 'selected'}
            if (data.data.length === 0) {
              this.$confirm('', '提示', {
                message: '数据为空，此操作会清空现有数据，是否继续？',
                type: 'warning'
              }).then(action => {
                if (action === 'confirm') {
                  this.handleSaveModuleUnit(params, data.type)
                }
              }).catch(err => {})
            } else {
              // 构造一下数据
              data.data.forEach(item => {
                params.rows.push({
                  warning_unit_name: item,
                  workshop_id: this.unitNameDict[item] ? this.unitNameDict[item].workshop_id : item,
                  workshop_name: item
                })
              })
              this.handleSaveModuleUnit(params, data.type)
            }
          break
        }
      },
      // 点击选择车间 - 弃用
      selectMesWorkShop () {
        if (this.workshopData.length !== 0) {
          // 打开权限确认弹窗
          this.$mesPermission.show('权限确认', {
            tips: '需要通过验证后才能配置报警单元设备！'
          }).then(res => {
            console.log(res)
            this.openMesWorkShop()
          })
        } else this.openMesWorkShop()
      },
      // 选择车间弹窗
      openMesWorkShop () {
        this.$mesWorkShop.show('选择车间', {
          reRender: true,
          selectedIds: this.selectedIds,
          params: {
            keyword: '',
            type: 'workshop'
          },
          multiple: true
        }).then(res => {
          this.handleSaveModuleUnit(res, 'workshop')
        })
      },
      // 处理保存
      handleSaveModuleUnit (res, type = 'workshop') {
        // 创建一个对象 保存选择及删除的车间
        const workShopData = {
          add: [],
          del: []
        }
        let delete_workshop_name = '' // 删除车间的名称
        const newIds = res.rows.map(v => { return v.workshop_id })
        // 拿到新增或删除的ID
        const workShopDataID = utils.contrastIds(this.selectedIds, newIds)
        console.log(workShopDataID)

        // 如果报警单元类型和最初不相同,则删除之前所有的id
        if (type !== this.originCreateType) {
          workShopDataID.delIds = []
          this.selectedIds.forEach(id => {
            workShopDataID.delIds.push(id)
          })
        }

        this.workshopData.forEach(item => {
          workShopDataID.delIds.forEach(id => {
            if (item.workshop_id === id) {
              delete_workshop_name = delete_workshop_name + ' "' + item.warning_unit_name + '" '
              workShopData.del.push(this.perspectiveId + item.workshop_id)
            }
          })
        })
        res.rows.forEach(item => {
          workShopDataID.addIds.forEach(id => {
            if (item.workshop_id === id) {
              workShopData.add.push({
                warning_unit_name: item.workshop_name,
                warning_unit_type_id: this.perspectiveId,
                warning_module_id: '222',
                workshop_id: item.workshop_id,
                create_type: type
              })
            }
          })
        })
        
        // 新增或删除车间
        if (workShopData.del.length !== 0) {
          this.$confirm('此操作会删除 ' + delete_workshop_name + ', 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.saveModuleUnit(workShopData)
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            })
          })
        } else this.saveModuleUnit(workShopData)
      },
      // 保存选择的车间
      saveModuleUnit (data) {
        console.log(data)
        saveModuleUnitTwo({
          warnUnits: JSON.stringify(data.add),
          warnUnitIds: data.del.join(',')
        }).then(res => {
          if (res.status === 0) {
            this.initPage()
          } else {
            this.$message.error(res.msg)
          }
        })
      },


      // 点击添加设备
      openMesDevice (type) {
        let selectedIds = []
        if (type.device_ids_list !== null || type.device_ids_list) {
          selectedIds = type.device_ids_list.split(",")
        }
        this.moduleConfUnitId = type.warning_conf_module_unit_id
        this.warnUnitTypeId = type.warning_unit_type_id
        this.warnUnitId = type.warning_unit_id
        this.$mesDevice.show('添加设备', {
          reRender: true,
          selectedIds: selectedIds,
          multiple: true
        }).then(res => {
          // 取出选中的id
          this.saveUnitModuleDevice(res.rows)
        })
      },
      // 保存选择设备API
      saveUnitModuleDevice (row) {
        this.deviceId = []
        this.deviceId = row.map(item => item.device_id)
        const deviceId = this.deviceId.join(",")
        saveModuleConfDevices({
          warnUnitTypeId: this.warnUnitTypeId,
          warnUnitId: this.warnUnitId,
          moduleConfUnitId: this.moduleConfUnitId,
          deviceIds: deviceId
        }).then(res => {
          if (res.status === 0) {
            this.initPage()
            this.$message({
              message: '添加设备成功',
              type: 'success'
            })
          }
        })
      }
    },
    watch: {
      apllySave (val) {
        if (val) {
          const counts = []
          let _p = true
          this.workshopData.forEach(item => {
            item.warningConfModuleUnitDOs.forEach(data => {
              counts.push(data.count)
            })
          })
          // 判断是否存在未选择设备的情况
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
