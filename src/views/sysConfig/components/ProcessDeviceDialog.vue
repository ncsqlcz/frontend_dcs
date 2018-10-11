/*
 * @Author: liucz 
 * @Date: 2018-07-17 16:46:39 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-21 15:48:07
 */
<template>
  <!-- 选择设备弹窗 -->
  <el-dialog title="选择设备" :visible.sync="dialogVisible" width="50%" class="mes-dialog">
    <!-- 搜索 start -->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent class="text-right">
        <el-form-item>
          <el-select v-model="filters.deviceTypeId" placeholder="选择设备种类" size="small" @change="getList">
            <el-option label="全部设备种类" value=""></el-option>
            <el-option v-for="item in getDeviceTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input type="text" size="small" v-model.trim="filters.keyword" placeholder="请输入关键字"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click.native="getList" icon="el-icon-search" size="small">查询</el-button>
          <el-button type="" @click.native="reset" icon="" size="small">重置</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <!-- 搜索 end -->
    
    <!--列表 start-->
    <el-table :data="list" v-loading="listLoading"
              row-class-name="el-mini-row pointer"
              highlight-current-row
              ref="multipleTable"
              @selection-change="handleSelectionChange"
              @row-click="toggleCurrentRow">
      <el-table-column type="index" :index="getIndex" label="序号"></el-table-column>
      <el-table-column prop="device_name" label="设备名称" sortable></el-table-column>
      <el-table-column prop="device_number" label="设备编号" sortable></el-table-column>
      <el-table-column prop="device_type_name" label="设备种类" sortable></el-table-column>
      <el-table-column prop="collector_name" label="所属智能物联网关" sortable></el-table-column>
      <el-table-column prop="collector_id" label="所属工控机ID" width="180"></el-table-column>
    </el-table>
    <!--列表 end-->

    <!--分页 start -->
    <el-col :span="24" class="toolbar hidden">
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
  import { sceneConfQueryDevices } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import AlarmLevelTable from '../components/AlarmLevelTable.vue'
  export default {
    name: 'Process-Device-Parameter-Dialog',
    data () {
      return {
        filters: {
          unitTypeId: '',
          warningUnitId: this.warnUnitId,
          keyword: '',
          deviceTypeId: '',
          type: 'processParam',
          pageSize: 10,
          page: 1,
          total: 0
        },
        list: [],
        listLoading: false,
        dialogVisible: false,
        selectedRows: null,
      }
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      selectedIds: Array,
      warnUnitId: {
        type: String,
        required: true
      }
    },
    computed: {
      ...mapGetters(['getDeviceTypeList', 'getSiteUnitTypeId'])
    },
    components: {},
    mounted () {
      this.filters.unitTypeId = this.getSiteUnitTypeId
    },
    methods: {
      ...mapActions(['initDeviceTypeList']),
      handleSelectionChange (val) {
        this.selectedRows = val
      },
      toggleCurrentRow (row) {
        this.confirmSelected(row)
      },
      confirmSelected (row) {
        this.dialogVisible = false
        this.$emit('selected', row)
      },
      // 初始选择的行
      checkSelectedIds () {
        this.$nextTick(() => {
          this.$refs.multipleTable.setCurrentRow()
        })
        if (this.selectedIds.length > 0) {  // 单行选择的情况
          this.list.forEach((item, index) => {
            if (item.device_id === this.selectedIds[0]) {
              this.$nextTick(() => {
                this.$refs.multipleTable.setCurrentRow(this.list[index])
              })
            }
          })
        } else if (this.selectedIds.length === 0) {
          try {
            this.$refs.multipleTable.clearSelection()
          } catch (e) {}
        }
      },
      // 列表
      getList () {
        if (this.listLoading) {
          return
        }
        this.listLoading = true
        sceneConfQueryDevices(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            // this.filters.total = res.map.line
            this.list = res.map.deviceInfos
            this.checkSelectedIds()
          } else {
            this.filters.total = 0
            this.list = []
          }
          this.listLoading = false
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
          unitTypeId: this.getSiteUnitTypeId,
          warningUnitId: this.warnUnitId,
          keyword: '',
          deviceTypeId: '',
          type: 'processParam',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getList()
      }
    },
    watch: {
      visible (val) {
        this.dialogVisible = val
        if (val) {
          this.getList()
        }
      },
      dialogVisible (val) {
        this.$emit('update:visible', val)
      },
      warnUnitId (val) {
        this.filters.warningUnitId = this.warnUnitId
      }
    }
  }
</script>

<style scoped lang="scss">
</style>