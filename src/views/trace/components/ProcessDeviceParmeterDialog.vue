<template>
  <el-dialog title="工序参数详情" :visible.sync="dialogVisible" width="60%" class="mes-dialog">
    <!--头部 start-->
    <el-row>
      <el-col :span="12" class="text-left">
        <div class="process_name mb-2">
          <span class="mr-5">参数名称： {{ parameterName }}</span>
          <span class="ml-5">参数单位： {{ parameterUnit }}</span>
        </div>
      </el-col>
      <el-col :span="12" class="text-right">
        <!-- <el-button class="ml-2 mb-2" type="primary" @click="portExcel">导出Excel</el-button> -->
        <el-select class="ml-2 mb-2" v-model="alarmID" placeholder="请选择">
          <el-option label="全部参数" value=""></el-option>
          <el-option
            v-for="item in getAlarmColorList"
            :key="item.value"
            :label="item.label"
            :value="item.warning_level_id">
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <!--头部 end-->

    <!--列表 start-->
    <el-table :data="parameterData" style="width: 100%;" v-loading="visible.listLoading">
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="parameter_value" align="center" label="参数值">
        <template slot-scope="scope">
          <span :style="{color: getAlarmColorDict[scope.row.warningLevelDo.warning_level].color}">{{ scope.row.parameter_value }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="warningLevelDo.warning_level" align="center" label="参数值异常等级">
        <template slot-scope="scope">
          <span>{{ getAlarmColorDict[scope.row.warningLevelDo.warning_level].label }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="collector_time" align="center" label="参数采集时间">
        <template slot-scope="scope">
          {{ getTime(scope.row.collector_time) }}
        </template>
      </el-table-column>
    </el-table>
    <!--列表 end-->

    <!--分页 start -->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                     :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>
    <!--分页 end -->

    <div slot="footer" class="dialog-footer mt-3">
      <el-button size="medium" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import utils from '../../../common/js/utils'
import { queryTranceAbnormalById, downloadDeviceParamUrl } from '../../../api/api'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Process-Device-Parmeter-Dialog',
  data () {
    return {
      filters: {
        warningUintTypeId: '',
        warningUintId: '',
        deviceId: '',
        deviceParameterId: '',
        levelId: '',
        type: 'info',
        startTime: '',
        endTime: '',
        pageSize: 10,
        page: 1,
        total: 0
      },
      parameterName: '',
      parameterUnit: '',
      alarmID: '',
      parameterData: [],
      visible: {
        listLoading: true
      },
      dialogVisible: false
    }
  },
  props: ['show', 'deviceParameterId', 'deviceId', 'startTime', 'endTime', 'unitTypeId', 'warningUintId'],
  watch: {
    dialogVisible (val) {
      this.$emit('update:show', val)
    },
    deviceParameterId (val) {
      this.filters.deviceParameterId = val
    },
    deviceId (val) {
      this.filters.deviceId = val
    },
    show (val) {
      this.dialogVisible = val
      if (val) {
        this.initPage()
      }
    },
    alarmID (val) {
      this.filters.levelId = val
      this.getList()
    }
  },
  computed: {
    ...mapGetters(['getAlarmColorList', 'getAlarmColorDict', 'getAlarmColorDict'])
  },
  mounted () {
  },
  methods: {
    ...mapActions(['initAlarmColorList']),
    initPage () {
      if (this.getAlarmColorList.length === 0) {
        this.initAlarmColorList().then(this.getList)
      } else {
        this.getList()
      }
    },
    getList () {
      this.visible.listLoading = true
      this.filters.type = 'info'
      if (!this.filters.deviceParameterId
        && this.filters.deviceParameterId === ''
        && !this.filters.deviceId
        && this.filters.deviceId === '') {
        return
      }
      queryTranceAbnormalById(Object.assign({}, this.filters, {
        warningUintTypeId: this.unitTypeId,
        warningUintId: this.warningUintId,
        startTime: this.startTime,
        endTime: this.endTime
      })).then(res => {
        if (res.status === 0) {
          this.filters.total = res.map.line
          this.parameterData = res.map.realtimeColloctorDataWarining
          if (this.parameterData.length > 0) {
            this.parameterName = this.parameterData[0].parameter_name
            this.parameterUnit = this.parameterData[0].parameter_unit
          }
        } else {
          this.parameterData = []
          this.filters.total = 0
          // this.$message.error(res.errorMsg)
        }
        this.visible.listLoading = false
      })
    },
    //  页面改变
    handlePageChange (val) {
      this.filters.page = val
      this.getList()
    },
    //  每页数量改变
    handleSizeChange (val) {
      this.filters.pageSize = val
      this.getList()
    },
    // 列表索引
    getIndex (index) {
      return utils.getHeadNumAdapter(this.filters.page, this.filters.pageSize, index)
    },
    // 重置       
    reset () {
      this.filters = {
        keyword: '',
        pageSize: 10,
        page: 1,
        total: 0
      }
      this.list = []
      this.currentDevice = null
      this.currentDeviceNumber = ''
    },
    getTime (timestamp) {
        if (!timestamp) {
          return '无'
        } else {
          return utils.formatDate.format(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss')
        }
      },
    // 选择报警参数
    handleDeviceChange (val) {
      this.list.forEach(item => {
        if (item.device_number === val) {
          this.currentDevice = item
        }
      })
    },
    // 导出excel
    portExcel () {
      let query = ''
      this.filters.type = 'export'
      for(let prop in this.filters) {
        if (prop === 'page' || prop === 'pageSize') {
          // 
        } else {
          const connector = query === '' ? '?' : '&'
          query = query + connector + prop + '=' + this.filters[prop]
        }
      }
      utils.downloadFile(downloadDeviceParamUrl + query)
    }
  }
}
</script>


<style scoped lang="scss">
  .process_name {
    border: 1px solid #dcdfe6;
    padding: 10px;
    border-radius: 5px;
    height: 40px;
    width: 400px;
  }
</style>
