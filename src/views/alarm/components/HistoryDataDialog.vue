/*
 * @Author: liucz 
 * @Date: 2018-06-20 17:09:04 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-06-21 15:30:05
 */
<template>
  <el-dialog title="历史异常数据" :visible.sync="dialogVisible" width="50%" class="mes-dialog">
    <el-row class="mb-3">
      <el-col :span="24">
        <!-- 报警颜色组件 -->
        <alarm-color></alarm-color>
      </el-col>
    </el-row>
    <!-- 搜索 start -->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent class="text-right">
        <el-form-item>
          <div class="block">
            <span class="demonstration mr-2">选择时间</span>
            <el-date-picker
              v-model="datePickerValues"
              type="datetimerange"
              size="small"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions2"
              @change="datePickerChange">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click.native="getList" icon="el-icon-search" size="small">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <!-- 搜索 end -->
    
    <!--列表 start-->
    <el-table :data="list" v-loading="visible.listLoading"
              row-class-name="el-mini-row pointer"
              highlight-current-row>
      <el-table-column type="index" :index="getIndex" label="序号"></el-table-column>
      <el-table-column prop="parameter_name" label="参数名称" sortable></el-table-column>
      <el-table-column prop="parameter_unit" label="单位" sortable></el-table-column>
      <el-table-column prop="parameter_value" label="异常参数值" sortable>
        <template slot-scope="scope">
          <span :style="{color: getAlarmColorDict[scope.row.parameter_alarm_level].color}" style="">
            {{ scope.row.parameter_value }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="parameter_time" label="异常采集时间" sortable>
        <template slot-scope="scope">
          {{ getTime(scope.row.parameter_time) }}
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
  import { mapGetters } from 'vuex'
  import { queryStaff } from '../../../api/api'
  import AlarmColor from './AlarmColor.vue'
  export default {
    name: 'History-Data-Dialog',
    data () {
      return {
        filters: {
          deviceId: this.deviceId,
          parameterId: this.parameterId,
          start_time: '',
          end_time: '',
          keyword: '',
          pageSize: 10,
          page: 1,
          total: 0
        },
        datePickerValues: [],
        visible: {
          listLoading: true
        },
        dialogVisible: false,
        list: [],
        pickerOptions2: utils.pickerOptionsBefore2
      }
    },
    props: {
      show: {
        type: Boolean,
        required: true
      },
      title: String,
      deviceId: {
        type: String,
        required: true
      },
      parameterId: {
        type: String,
        required: true
      }
    },
    components: { AlarmColor },
    computed: {
      ...mapGetters(['getAlarmColorDict'])
    },
    mounted () {},
    methods: {
      // 列表
      getList () {
        this.visible.listLoading = true
        setTimeout(() => {
          this.visible.listLoading = false
          this.list = [
            {parameter_id: '1', parameter_name: '温度', parameter_value: '23.12', parameter_time: 1000, parameter_unit: '℃', status: '1', parameter_alarm_level: 'L1'},
            {parameter_id: '2', parameter_name: '温度1', parameter_value: '23.12', parameter_time: 1000, parameter_unit: '℃', status: '0', parameter_alarm_level: 'L2'},
            {parameter_id: '3', parameter_name: '温度2', parameter_value: '23.12', parameter_time: 1000, parameter_unit: '℃', status: '1', parameter_alarm_level: 'L3'},
            {parameter_id: '4', parameter_name: '温度3', parameter_value: '23.12', parameter_time: 1000, parameter_unit: '℃', status: '1', parameter_alarm_level: 'L4'},
            {parameter_id: '5', parameter_name: '温度4', parameter_value: '23.12', parameter_time: 1000, parameter_unit: '℃', status: '1', parameter_alarm_level: 'L5'},
          ]
        }, 1000)
        return;

        queryStaff(this.filters).then((res) => {
          if (res.status === 0) {
            this.filters.page = res.map.page
            this.filters.total = res.map.total
            this.list = res.map.staffs
          } else {
            // this.filters.total = 0
            // this.list = []
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
          deviceId: this.deviceId,
          parameterId: this.parameterId,
          start_time: '',
          end_time: '',
          keyword: '',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.list = []
      },
      getTime (timestamp) {
        if (!timestamp) {
            return ''
          } else {
            return utils.formatDate.format(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss')
        }
      },
      datePickerChange (vals) {
        console.log(vals)
        if (vals) {
          this.filters.start_time = utils.formatDate.format(new Date(vals[0]), 'yyyy-MM-dd hh:mm:ss')
          this.filters.end_time = utils.formatDate.format(new Date(vals[1]), 'yyyy-MM-dd hh:mm:ss')
        } else {
          this.filters.start_time = ''
          this.filters.end_time = ''
        }
        this.getList()
      }
    },
    watch: {
      show (val) {
        this.dialogVisible = val
      },
      dialogVisible (val) {
        this.$emit('update:show', val)
      },
      parameterId (val) {
        this.getList()
      }
    }
  }
</script>

<style scoped lang="scss">
</style>
