/*
 * @Author: liucz
 * @Date: 2018-06-14 16:35:25
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-27 15:25:03
 */
<template>
  <section>
    <!-- 操作提示组件 -->
    <operation-tips video="">
      <span class="color-999">可以根据在配置模块配置的工序参数，实现工单追溯、正向追溯、逆向追溯。即，若您需要工单追溯，则需要在现场管理的配置模块中，添加名为“工单”的工序参数，并在现场执行时录入工单的值</span>
    </operation-tips>

    <!--搜索 start-->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="24" class="text-center">
          <el-form-item>
            <el-input class="pointer" v-model.trim="processName" size="medium" placeholder="点击选择工序"
                      @click.native="handleSelectWarningUnit" readonly></el-input>
          </el-form-item>
          <el-form-item>
            <el-input class="pointer" v-model.trim="parameterName" size="medium" placeholder="点击选择工序参数"
                      @click.native="handleSelectProcessParameter" readonly :disabled="filters.warnUnitId === ''"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model.trim="filters.keyword" size="medium" placeholder="输入现场录入的工序参数内容或值"
                      @keyup.native.enter="getList" style="width: 244px"></el-input>
          </el-form-item>
          <br><br>
          <el-form-item>
            <el-date-picker
              v-model="timeValues" type="datetimerange"
              start-placeholder="开始日期" range-separator="至" end-placeholder="结束日期"
              align="right" size="medium" @change="handleTimeChange">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.status" placeholder="选择工序状态" size="medium" @change="getList">
              <el-option v-for="item in getProcessStatusList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <br><br>
          <el-form-item>
            <el-button type="primary" size="medium" @click="getList" icon="el-icon-search">查询</el-button>
            <el-button size="medium" @click="reset">重置</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-col>
    <!--搜索 end-->

    <!--列表 start-->
    <el-table :data="list" highlight-current-row v-loading="visible.listLoading">
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="warning_unit_name" label="工序名称" sortable></el-table-column>
      <el-table-column prop="status" label="工序状态" sortable>
        <template slot-scope="scope">
          <span :class="{'color-active': parseInt(scope.row.status) === 0}">{{ getStatusName(scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="realtime_start_time" label="工序开始时间" sortable>
        <template slot-scope="scope">
          {{ getTime(scope.row.realtime_start_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="realtime_end_time" label="工序结束时间" sortable>
        <template slot-scope="scope">
          {{ getTime(scope.row.realtime_end_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="" label="工序参数详情">
        <template slot-scope="scope">
          <el-button type="text" size="medium" @click="handleView(scope.row)" v-if="parseInt(scope.row.status) === 1">查看详情</el-button>
          <span v-else>无</span>
        </template>
      </el-table-column>
    </el-table>
    <!--列表 end-->

    <!--分页start -->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                     :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>
    <!--分页end -->
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import OperationTips from '@/components/OperationTips.vue'
  import { queryTranceProcess } from '../../api/api'
  import { mapGetters } from 'vuex'
  export default {
    name: 'process-trace',
    components: { OperationTips },
    data () {
      return {
        filters: {
          unitTypeId: '',
          warnUnitId: '',  // 工序 预警单元id
          stageParameterId: '',
          startTime: '',
          endTime: '',
          status: '',
          keyword: '',
          type: 'info',
          pageSize: 10,
          page: 1,
          total: 0
        },
        selectedWarningUnitIds: [],
        processName: '',  // 工序名称
        parameterName: '',  // 工序参数名称
        list: [],
        visible: {
          listLoading: true
        },
        pickerOptions: utils.pickerOptionsBefore,
        timeValues: []
      }
    },
    computed: {
      ...mapGetters(['getProcessStatusList', 'getSiteUnitTypeId'])
    },
    mounted () {
      this.filters.unitTypeId = this.getSiteUnitTypeId
      this.getList()
    },
    methods: {
      // 列表
      getList () {
        this.visible.listLoading = true
        queryTranceProcess(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            this.list = res.map.processSummary
          } else {
            this.filters.total = 0
            this.list = []
          }
          this.visible.listLoading = false
        })
      },
      // 选择报警单元 - 现场管理的预警单元就是工序哦 - 没想到吧
      handleSelectWarningUnit () {
        this.$mesWarningUnit.show('选择工序', {
          reRender: true,
          multiple: false,
          selectedIds: this.selectedWarningUnitIds,
          params: {
            warnUnitTypeId: this.getSiteUnitTypeId, // 现场管理的预警单元id
            keyword: ''
          }
        }).then(res => {
          this.selectedWarningUnitIds = res.rows.map(v => v.warning_uint_id)
          this.filters.warnUnitId = res.rows[0].warning_uint_id
          this.processName = res.rows[0].workshop_name
          this.getList()
        })
      },
      // 选择工序
      handleSelectProcess () {
        this.$mesWorkstage.show('选择工序', {
          reRender: true,
          multiple: false,
          selectedIds: [this.filters.warnUnitId]
        }).then(res => {
          this.filters.warnUnitId = res.rows[0].process_id
          this.processName = res.rows[0].process_name
          this.getList()
        })
      },
      // 选择工序参数
      handleSelectProcessParameter () {
        if (this.processName !== '') {
          this.$mesWorkstageParameters.show('选择工序参数', {
            reRender: true,
            multiple: false,
            selectedIds: [this.filters.stageParameterId],
            params: {
              processId: this.filters.warnUnitId
            }
          }).then(res => {
            this.filters.stageParameterId = res.rows[0].process_scene_param_id
            this.parameterName = res.rows[0].process_scene_param_name
            this.getList()
          })
        }
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
          unitTypeId: this.getSiteUnitTypeId,
          warnUnitId: '',  // 工序id
          stageParameterId: '',
          startTime: '',
          endTime: '',
          status: '',
          keyword: '',
          type: 'info',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.selectedWarningUnitIds = []
        this.processName = ''  // 工序名称
        this.parameterName = ''  // 工序参数名称
        this.timeValues = []
        this.getList()
      },
      getTime (timestamp) {
        if (!timestamp) {
          return '无'
        } else {
          return utils.formatDate.format(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss')
        }
      },
      getStatusName (status) {
        let name = ''
        this.getProcessStatusList.forEach(item => {
          if (parseInt(status) === parseInt(item.value)) {
            name = item.label
          }
        })
        return name
      },
      // 时间改变
      handleTimeChange (times) {
        if (times) {
          this.filters.startTime = this.getTime(times[0])
          this.filters.endTime = this.getTime(times[1])
        } else {
          this.filters.startTime = ''
          this.filters.endTime = ''
        }
        this.getList()
       
      },
      handleView (row) {
        // console.log(row)
        this.$router.push({
          // path: '/trace/process/details/' + row.warning_unit_id ? row.warning_uint_id : 'systemac45da54e84f49c2a47078151484f647basicdata7740b8a512d64a879d209e219fc9c82f',
          path: '/trace/process/details/' + row.warning_unit_id,
          query: {
            unitTypeId: row.warning_unit_type_id,
            warningUnitId: row.warning_unit_id,
            startTime: row.realtime_start_time,
            endTime: row.realtime_end_time
          }
        })
      }
    }
  }
</script>

<style scoped lang="scss">
</style>
