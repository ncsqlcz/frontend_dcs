/*
 * @Author: liucz 
 * @Date: 2018-06-14 09:01:34 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-07-25 16:43:59
 */
<template>
  <section>
    <el-dialog title="查看控制设备" :visible.sync="dialogVisible" width="50%" class="mes-dialog">
      <!--搜索 start-->
      <el-col class="toolbar">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-col :span="24" class="text-right">
            <el-form-item>
              <el-select v-model="filters.deviceTypeId" placeholder="选择设备种类" size="medium" @change="getList">
                <el-option v-for="item in getDeviceTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input v-model.trim="filters.keyword" size="medium" placeholder="输入关键字" @keyup.native.enter="getList"></el-input>
            </el-form-item>
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
        <el-table-column prop="device_name" label="设备名称" sortable></el-table-column>
        <el-table-column prop="device_number" label="设备编号" sortable></el-table-column>
        <el-table-column prop="device_ip" label="设备IP" sortable></el-table-column>
        <el-table-column prop="device_import_id" label="设备ID" width="200" sortable></el-table-column>
        <el-table-column prop="device_type_name" label="设备种类" sortable></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" size="medium" icon="" @click="handleView(scope.row)">查看设备参数</el-button>
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
      <div slot="footer" class="dialog-footer mt-3">
        <el-button size="medium" @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import { queryCollectorDevice } from '../../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    name: 'device-details',
    data () {
      return {
        filters: {
          collectorId: '',
          keyword: '',
          deviceTypeId: '',
          type: 'detail',
          pageSize: 10,
          page: 1,
          total: 0
        },
        list: [
          {device_name: '1', device_number: '1', devivce_id: '1', devivce_type_name: '1'}
        ],
        visible: {
          listLoading: true
        },
        dialogVisible: false
      }
    },
    props: {
      show: {
        type: Boolean,
        required: true
      },
      collectorId: {
        type: String,
        required: true
      }
    },
    components: {},
    computed: {
      ...mapGetters(['getDeviceTypeList'])
    },
    mounted () {
      this.initDeviceTypeList().then(
        console.log(this.getDeviceTypeList)
      )
    },
    methods: {
      ...mapActions(['initDeviceTypeList']),
      // 列表
      getList () {
        this.visible.listLoading = true
        queryCollectorDevice(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            this.list = res.map.devices
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
          collectorId: this.collectorId,
          keyword: '',
          deviceTypeId: '',
          type: 'detail',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getList()
      },
      // 详情
      handleView (row) {
        this.$mesDeviceParameters.show('查看设备参数', {
          reRender: true,
          params: {
            deviceId: row.device_id
          }
        }).then(res => {
           console.log(res)
        })
      }
    },
    watch: {
      show (val) {
        this.dialogVisible = val
      },
      dialogVisible (val) {
        this.$emit('update:show', val)
      },
      collectorId (val) {
        this.filters.collectorId = val
        this.getList()
      }
    }
  }
</script>

<style scoped lang="scss">
</style>
