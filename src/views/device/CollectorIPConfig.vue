/*
 * @Author: liucz 
 * @Date: 2018-06-14 11:29:31 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-01 16:11:17
 */
<template>
  <section>
    <!--搜索 start-->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="24" class="text-right">
          <el-form-item>
            <el-select v-model="filters.type" placeholder="选择智能物联网关状态" size="medium" @change="getList">
              <el-option v-for="item in configStatusList" :key="item.value" :label="item.label" :value="item.value"></el-option>
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
      <el-table-column prop="collector_ip" label="智能物联网关IP" sortable>
        <template slot-scope="scope">
          <span v-if="scope.row.collector_ip">{{ scope.row.collector_ip }}</span>
          <span v-else class="color-999">未配置IP</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="配置状态" sortable>
        <template slot-scope="scope">
          <span :class="{'color-active': parseInt(scope.row.status) === 1}">{{ getStatusName(scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="medium" @click="handleEditIP(scope.row)">编辑IP</el-button>
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
  import { queryIpConf, modifyCollectorIp } from '../../api/api'
  export default {
    name: 'collector-ip-config',
    data () {
      return {
        filters: {
          keyword: '',
          type: 'all',
          pageSize: 10,
          page: 1,
          total: 0
        },
        list: [
          {name: '1', number: '1', IP: '192.168.1.222', state: '0'}
        ],
        visible: {
          listLoading: true
        },
        configStatusList: [
          {label: '全部智能物联网关', value: 'all'},
          {label: '未配置IP', value: '0'},
          {label: '已配置IP', value: '1'}
        ]
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
        queryIpConf(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            this.list = res.map.collector
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
          type: 'all',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getList()
      },
      getStatusName (status) {
        let name = ''
        this.configStatusList.forEach(item => {
          if (parseInt(status) === parseInt(item.value)) {
            name = item.label
          }
        })
        return name
      },
      // 编辑
      handleEditIP (row) {
        console.log(row)
        this.$prompt('请输入IP地址', {
          title: '编辑IP',
          showInput: true,
          inputValue: row.collector_ip,
          inputPattern: utils.reg.ip,
          inputErrorMessage: '请输入正确格式的IP地址'
        }).then(res => {
          if (res.action === 'confirm' && row.collector_ip === res.value) {
            this.$message.info('未修改')
          } else {
            modifyCollectorIp(
              {
                collectors: JSON.stringify([{ collector_id: row.collector_id, collector_ip: res.value }])
              }).then(_res => {
              if (_res.status === 0) {
                this.$message.success('已保存')
                this.getList()
              } else {
                this.$message.error(_res.msg)
              }
            })
          }
        }).catch(() => {})
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
</style>
