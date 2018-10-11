/*
 * @Author: Zhangshitu 
 * @Date: 2018-06-30 09:23:58 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-27 16:17:41
 */
<template>
  <section>
    <el-dialog title="环境异常报警设备  参数详情" 
        :visible.sync="visible.dialogTable" 
        @close="closeDialog"
        width="90%"
    >
        <el-row class="transparent" v-loading="visible.tableLoading">
            <el-col :span="4">
                <el-table @row-click="chooseDevice" :data="deviceData" highlight-current-row>
                    <el-table-column align="center" label="选择设备">
                        <el-table-column prop="device_name" align="center" label="设备名称"></el-table-column>
                        <el-table-column prop="device_number" align="center" label="设备编号"></el-table-column>
                    </el-table-column>
                </el-table>
            </el-col>
            <el-col :span="20">
                <!-- 选择设备参数表格组件 -->
                <alarm-level-table type="level" 
                :parameterData="parameterData"
                :parameterNumber="parameterNumber"
                :multiple="false">
                </alarm-level-table>
            </el-col>
        </el-row>
    </el-dialog>
  </section>
</template>

<script>
import alarmLevelTable from './AlarmLevelTable.vue'
import { queryModuleUnit, queryAlreadyConParam } from '../../../api/api'
import { mapGetters, mapActions } from 'vuex'
export default {
    name: 'Perspective-Parameter-Dialog',
    data () {
        return {
            filters: {
                unitTypeId: null,
                warnUnitId: null,
                warnCategoryId: null,
                type: 'detail',
                page: '',
                pageSize: '',
                total: ''
            },
            deviceData: [],
            parameterData: [],
            parameterNumber: 0,
            deviceId: '',
            visible: {
                dialogTable: false,
                tableLoading: false,
                rightTableLoading: false
            }
        }
    },
    props: ['visibleDialogTable', 'dialogValue'],
    computed: {
      ...mapGetters(['getSiteUnitTypeId'])
    },
    components: { alarmLevelTable },
    mounted () {
        // 初始化数据
        if (this.$route.params.id) {
            this.filters.unitTypeId = this.$route.params.id
        } else {
            this.filters.unitTypeId = this.getSiteUnitTypeId
        }
        this.filters.warnUnitId = this.dialogValue.alarmUnit_id
        this.filters.warnCategoryId = this.dialogValue.warn_category_id
        this.getDeviceData()
    },
    methods: {
        // 获取设备列表
        getDeviceData () {
            this.visible.tableLoading = true
            queryModuleUnit(this.filters).then(res => {
                if (res.status === 0) {
                    this.deviceData = []
                    res.map.warningConfModule.forEach(conf => {
                        conf.deviceInfoDOs.forEach(item => {
                            this.deviceData.push(item)
                        })
                    })
                    this.deviceId = this.deviceData[0].device_id
                    this.queryAlreaParam()
                }
                this.visible.tableLoading = false
            })
        },
        // 关闭弹窗
        closeDialog () {
            this.$emit('closeDialog', false)
        },
        // 选中设备
        chooseDevice ( row, event, column ) {
            this.visible.rightTableLoading = true
            this.deviceId = row.device_id
            this.queryAlreaParam()
        },
        // 调用查看设备参数 API
        queryAlreaParam () {
            queryAlreadyConParam({
                unitTypeId: this.filters.unitTypeId,
                warnUnitId: this.filters.warnUnitId,
                warnCategoryId: this.filters.warnCategoryId,
                deviceId: this.deviceId,
                type: 'nowUse'
            }).then(res => {
                if (res.status === 0) {
                    const warningDeviceParameterDO = []
                    if (res.map) {
                        res.map.DeviceParams.forEach(item => {
                            item.warningDeviceParameterDO.parameter_level = JSON.parse(item.warningDeviceParameterDO.level_warning_kv)
                            warningDeviceParameterDO.push(item.warningDeviceParameterDO)
                        })
                    }
                    this.parameterNumber = Math.floor(100 * Math.random())
                    this.parameterData = warningDeviceParameterDO
                } else {
                    this.parameterData = []
                    this.parameterNumber = Math.floor(100 * Math.random())
                }
                this.visible.rightTableLoading = false
            })
        }
    },
    watch: {
        // 打开弹窗
        visibleDialogTable (newVal) {
            this.visible.dialogTable = newVal
        },
        // 当接收参数改变时
        dialogValue (newVal) {
            this.filters.warnUnitId = newVal.alarmUnit_id
            this.filters.warnCategoryId = newVal.warn_category_id
            this.getDeviceData()
        }
    }
}
</script>

<style scoped lang="scss">
.perspective-nav {
    .perspective-button {
        float: left;
        position: relative;
        min-width: 60px;
        margin-bottom: 35px; 
    }
    .alarm-name {
        position: absolute;
        width: 110px;
        left: -25px;
        text-align: center;
        color: #a6a9ad;
    }
}
</style>