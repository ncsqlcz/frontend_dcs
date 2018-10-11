/*
 * @Author: liucz 
 * @Date: 2018-07-17 16:07:10 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-27 16:17:29
 */
<template>
  <!-- 选择设备参数弹窗 -->
  <el-dialog title="选择设备参数" :visible.sync="dialogVisible" width="40%" class="mes-dialog">
    <!-- 搜索 start -->
    <el-col class="toolbar hidden">
      <el-form :inline="true" :model="filters" @submit.native.prevent class="text-right">
        <el-form-item>
          <el-input type="text" size="small" v-model.trim="filters.keyword"></el-input>
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
      <el-table-column prop="warningDeviceParameterDO.parameter_name" label="参数名称" sortable></el-table-column>
      <el-table-column prop="warningDeviceParameterDO.paramter_unit" label="参数单位" sortable></el-table-column>
      <!-- <el-table-column prop="parameter_type_name" label="参数种类" sortable></el-table-column> -->
    </el-table>
    <!--列表 end-->

    <!--分页 start -->
    <el-col :span="24" class="toolbar hidden">
      <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                    :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>
    <!--分页 end -->

    <div slot="footer" class="dialog-footer">
      <el-button size="medium" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import utils from '../../../common/js/utils'
  import { queryAlreadyConParam } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import AlarmLevelTable from '../components/AlarmLevelTable.vue'
  export default {
    name: 'Process-Parameter-Dialog',
    data () {
      return {
        filters: {
          unitTypeId: '',
          warnUnitId: this.warnUnitId,
          warnCategoryId: this.warnCategoryId,
          deviceId: this.deviceId,
          keyword: '',
          type: 'all',
          // pageSize: 10,
          // page: 1,
          // total: 0
        },
        list: [],
        listLoading: false,
        dialogVisible: false,
        selectedRows: null
      }
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      parameterIds: Object,
      selectedIds: Array
    },
    computed: {
      ...mapGetters(['getSiteUnitTypeId'])
    },
    components: {},
    mounted () {
      this.filters.unitTypeId = this.getSiteUnitTypeId
    },
    methods: {
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
            if (item.warning_device_parameter_id === this.selectedIds[0]) {
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
        if (
          !this.dialogVisible ||
          this.listLoading ||
          this.filters.warnUnitId === '' ||
          this.filters.warnCategoryId === '' ||
          this.filters.deviceId === ''
        ) {
          return
        }
        this.listLoading = true
        queryAlreadyConParam(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            // this.filters.total = res.map.line
            this.list = res.map.DeviceParams
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
          warnUnitId: this.warnUnitId,
          warnCategoryId: this.warnCategoryId,
          deviceId: this.deviceId,
          keyword: ''
        }
        this.getList()
      }
    },
    watch: {
      visible (val) {
        this.dialogVisible = val
      },
      // 问题：由于数据更新需要多个ID来判断，这导致了很多问题，例如初始化的时候，由父组件传过来的值部分为空，虽然
      // 已经由getList()判断并且return出去了，当时又有新的问题，如再次选中时，这时ID都是有值的，并不会触发判定，
      // 然而部分ID改变时就触发了getList() ，就导致了数据错误。
      // 解决：使用一个随机数来作为watch的判定条件

      'parameterIds.random' (val) {
        this.filters.warnUnitId = this.parameterIds.warnUnitId
        this.filters.warnCategoryId = this.parameterIds.warnCategoryId
        this.filters.deviceId = this.parameterIds.deviceId
        this.getList()
      },
      dialogVisible (val) {
        this.$emit('update:visible', val)
      }
    }
  }
</script>

<style scoped lang="scss">
</style>