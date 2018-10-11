/*
 * @Author: liucz 
 * @Date: 2018-07-17 16:46:39 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-07-23 14:52:19
 */
<template>
  <!-- 选择工序参数弹窗 -->
  <el-dialog title="选择工序参数" :visible.sync="dialogVisible" width="40%" class="mes-dialog">
    <!-- 搜索 start -->
    <el-col class="toolbar">
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
      <el-table-column prop="process_scene_param_name" label="参数名称" sortable></el-table-column>
      <!-- <el-table-column prop="parameter_unit" label="参数单位" sortable></el-table-column> -->
      <!-- <el-table-column prop="parameter_type_name" label="参数种类" sortable></el-table-column> -->
    </el-table>
    <!--列表 end-->

    <!--分页 start -->
    <el-col :span="24" class="toolbar">
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
  import { querySceneModule } from '../../../api/api'
  // import { mapGetters, mapActions } from 'vuex'
  import AlarmLevelTable from '../components/AlarmLevelTable.vue'
  export default {
    name: 'Process-Device-Parameter-Dialog',
    data () {
      return {
        filters: {
          warningUnitId: this.warnUnitId,
          keyword: '',
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
    computed: {},
    components: {},
    mounted () {
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
            if (item.process_scene_param_id === this.selectedIds[0]) {
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
        querySceneModule(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            this.list = res.map.processSceneParamInfos
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
          warningUnitId: this.warnUnitId,
          keyword: '',
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