/*
 * @Author: liucz 
 * @Date: 2018-06-14 11:29:31 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-01 19:46:12
 */
<template>
  <section>
    <!--搜索 start-->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="12" class="text-left">
          <el-form-item>
            <el-button type="default" size="medium" @click="handleDownload" icon="fa fa-reply"> 导出EXCEL</el-button>
          </el-form-item>
          <el-form-item>
            <el-upload
              class="upload"
              :action="importWorkShopOrProcessUrl"
              :on-change="handleFileChange"
              :file-list="fileList"
              :show-file-list="false"
              :auto-upload="false"
              :multiple="false"
              accept=".xlsx, .xls">
              <el-tooltip class="item" effect="dark" content="仅支持.xlsx 和 .xls" placement="top">
                <el-button type="primary" size="medium" icon="fa fa-share"> 导入EXCEL</el-button>
              </el-tooltip>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" class="text-right">
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
      <el-table-column prop="process_name" label="工序名称" sortable></el-table-column>
      <el-table-column prop="process_import_id" label="工序ID" sortable></el-table-column>
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
  import {
    queryWorkShopOrProcess, importWorkShopOrProcess,
    downloadExcelUrl, importWorkShopOrProcessUrl
  } from '../../api/api'
  export default {
    name: 'process',
    data () {
      return {
        filters: {
          keyword: '',
          type: 'workstage',
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
        fileList: [],
        importWorkShopOrProcessUrl: importWorkShopOrProcessUrl
      }
    },
    computed: {},
    mounted () {
      this.getList()
    },
    methods: {
      // 列表
      getList () {
        this.visible.listLoading = true
        queryWorkShopOrProcess(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            this.list = res.map.processDataMap
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
          type: 'workstage',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getList()
      },
      // 下载
      handleDownload () {
        utils.downloadFile(downloadExcelUrl + '?type=process')
      },
      // 导入
      handleImport () {
        let form = new FormData()
        for (let value of this.fileList) {
          form.append('type', this.filters.type)
          form.append('file', value.raw)
        }
        // 打开权限确认弹窗
        this.$mesPermission.show('权限确认', {
          tips: '需要通过验证后才能继续'
        }).then(res => {
          if (res === 'pass') {
            importWorkShopOrProcess(form).then(res => {
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
      // 详情
      handleView (row) {
        this.selectedDeviceId = 'selectedDeviceId' + Math.random()
        this.visible.deviceDetailsDialog = true
      },
      // 文件改变就开始上传
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
