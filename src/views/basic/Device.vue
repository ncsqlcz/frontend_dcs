/*
 * @Author: liucz 
 * @Date: 2018-06-14 09:01:34 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-27 10:41:17
 */
<template>
  <section>
    <!--搜索 start-->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="12" class="text-left">
          <el-form-item>
            <!-- <el-button type="default" size="medium" @click="handleDownload" icon="fa fa-download"> 下载EXCEL</el-button> -->
            <el-button type="default" size="medium" @click="handleExport" icon="fa fa-reply"> 导出EXCEL</el-button>
          </el-form-item>
          <el-form-item>
            <el-upload
              class="upload-device"
              ref="upload"
              :http-request="handleImport"
              :on-change="handleFileChange"
              :action="importDeviceLedgerUrl"
              :auto-upload="false"
              :file-list="fileList"
              :show-file-list="false"
              :multiple="false"
              accept=".xlsx, .xls">
              <el-tooltip class="item" effect="dark" content="仅支持.xlsx 和 .xls" placement="top">
                <el-button type="primary" size="medium" icon="fa fa-share"> 导入EXCEL</el-button>
              </el-tooltip>
            </el-upload>
          </el-form-item>
          <!-- <el-form-item>
            <el-button type="primary" size="medium" @click="handleSync" icon="fa fa-exchange"> 与智能物联网关同步</el-button>
          </el-form-item> -->
        </el-col>
        <el-col :span="12" class="text-right">
          <el-form-item>
            <el-select placeholder="请选择类型" size="medium" v-model="filters.type" @change="getList">
               <el-option value='all' label='智能物联网关' size="medium"></el-option>
               <el-option value='sweep' label='扫码枪' size="medium"></el-option>
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
      <el-table-column prop="collector_name" label="智能物联网关名称" sortable></el-table-column>
      <el-table-column prop="collector_number" label="智能物联网关编号" sortable></el-table-column>
      <el-table-column prop="collector_import_id" label="设备ID" sortable></el-table-column>
      <el-table-column prop="collector_type_name" label="设备种类" sortable></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <!-- 扫码枪没有查看详情 -->
          <el-button type="text" size="medium" icon="" @click="handleView(scope.row)" v-if="filters.type === 'all'">查看详情</el-button>
          <span class="color-999" v-else>无</span>
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
    
    <!-- 设备详情组件-->
    <device-details :show.sync="visible.deviceDetailsDialog" :collector-id="collectorId"></device-details>

  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import {
    queryCollectorDevice,
    downloadExcelUrl,
    importDevice,
    importDeviceLedgerUrl,
    exportDeviceUrl
    } from '../../api/api'
  import DeviceDetails from './components/DeviceDetails.vue'
  export default {
    name: 'device',
    data () {
      return {
        filters: {
          keyword: '',
          collectorId: '',
          type: 'all',
          pageSize: 10,
          page: 1,
          total: 0
        },
        list: [],
        visible: {
          listLoading: true,
          deviceDetailsDialog: false
        },
        fileList: [],
        collectorId: '',
        importDeviceLedgerUrl: importDeviceLedgerUrl,
        selectedIds: []
      }
    },
    components: { DeviceDetails, DeviceConfig },
    computed: {},
    mounted () {
      this.getList()
    },
    methods: {
      // 列表
      getList () {
        this.visible.deviceConfig = true

        
        this.visible.listLoading = true
        queryCollectorDevice(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            if (this.filters.type === 'all') {
              this.list = res.map.collectors
              this.list.forEach(item => {
                item.collector_type_name = '智能物联网关'
              })
            } else {
              this.list = res.map.sweeps
              this.list.forEach(item => {
                item.collector_name = item.device_name
                item.collector_number = item.device_number
                item.collector_import_id = item.device_import_id
                item.collector_type_name = '扫码枪'
              })
            }
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
          collectorId: '',
          keyword: '',
          type: 'all',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getList()
      },
      // 下载
      handleDownload () {
        utils.downloadFile(downloadExcelUrl + '?type=device')
      },
      // 导入
      handleImport () {
        let form = new FormData()
        for (let value of this.fileList) {
          form.append('file', value.raw)
        }
        // 打开权限确认弹窗
        this.$mesPermission.show('权限确认', {
          tips: '需要通过验证后才能继续'
        }).then(res => {
          if (res === 'pass') {
            importDevice(form).then(res => {
              if (res.status === 0) {
                this.$message.success('成功')
                this.getList()
              } else {
                this.$message.error(res.msg || '失败')
              }
            })
          }
        })
      },
      // 导出
      handleExport () {
        utils.downloadFile(exportDeviceUrl)
      },
      // 同步
      handleSync () {},
      // 详情
      handleView (row) {
        this.collectorId = row.collector_id
        this.visible.deviceDetailsDialog = true
      },
      // 文件改变
      handleFileChange (file, fileList) {
        this.fileList = [file]
        this.handleImport()
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
</style>
