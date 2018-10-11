/*
 * @Author: liucz 
 * @Date: 2018-06-19 11:30:07 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-07-12 10:25:43
 */
<template>
  <section>
    <!--搜索 start-->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="12" class="text-left">
          <el-form-item>
            <h3 class="no-margin">{{ `${unitName}: 共 ${list.length} 台设备` }}</h3>
            <p class="no-margin">{{ alarmTypeDict[$route.query.type] }}</p>
          </el-form-item>
          <el-form-item>
          </el-form-item>
        </el-col>
      </el-form>
    </el-col>
    <!--搜索 end-->
    
    <!--列表 start-->
    <el-table :data="list" highlight-current-row v-loading="visible.listLoading">
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="device_name" label="设备名称" sortable></el-table-column>
      <el-table-column prop="device_number" label="设备编号" sortable></el-table-column>
      <el-table-column prop="device_type_name" label="设备种类" sortable></el-table-column>
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
  import { queryWarningDeviceNum, downloadExcelUrl } from '../../api/api'
  export default {
    name: 'Alarm-Params-No-Level',
    data () {
      return {
        filters: {
          unitTypeId: '',
          warnUnitId: '',
          warningCategoryId: '',
          keyword: '',
          type: '',
          pageSize: 10,
          page: 1,
          total: 0
        },
        list: [
          {device_name: '1', device_number: '1', process_id: '1', device_type_name: '1', active: false}
        ],
        visible: {
          listLoading: true,
        },
        unitName: '',
        alarmTypeDict: {
          offline: '离线报警',
          halt: '停机报警'
        }
      }
    },
    computed: {},
    mounted () {
      console.log(this.$route)
      this.filters.unitTypeId = this.$route.params.id
      this.unitName = this.$route.query.unitName
      this.filters.warnUnitId = this.$route.query.unitId
      this.filters.warningCategoryId = this.$route.query.warningCategoryId
      this.getList()
    },
    methods: {
      // 列表
      getList () {
        this.visible.listLoading = true
        queryWarningDeviceNum(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            this.list = res.map.deviceInfoDOs
          } else {
            this.filters.total = 0
            this.list = []
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
          type: '',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getList()
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
</style>
