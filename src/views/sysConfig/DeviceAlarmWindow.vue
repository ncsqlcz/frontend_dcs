/*
 * @Author: liucz 
 * @Date: 2018-06-28 14:23:15 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-08 14:23:07
 */
<template>
  <section>
    <!-- 操作提示组件 -->
    <operation-tips video="">
      <span class="color-999">配置全系统的报警窗口。每个设备的每个参数可以根据采样周期配置各自的报警，配置报警窗口。</span>
    </operation-tips>

    <!--搜索 start-->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="24" class="text-left my-2" style="position: relative;">
          <el-progress :text-inside="true" :stroke-width="18" :percentage="parseFloat(percentage)" status="success" :show-text="false"></el-progress>
          <span class="color-333" style="position: absolute; z-index: 2; top: -1px; min-width: 100px;" :style="{right: percentage < 10 ? '90%' : 101 - parseFloat(percentage) + '%'}">已配置 {{ alreadyConfiguredCount }} 台设备</span>
        </el-col>
        <el-col :span="24" class="text-right">
          <el-form-item>
            <el-select v-model="filters.status" placeholder="选择配置状态" size="medium" @change="getList" style="width: 140px;">
              <el-option label="未配置" value="0"></el-option>
              <el-option label="已配置" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.deviceType" placeholder="选择设备种类" size="medium" @change="getList">
                <el-option v-for="item in getDeviceTypeList" :key="item.value" :label="item.label" :value="item.value"
                  v-if="item.label !== '采集设备'"></el-option>
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
      <el-table-column prop="deviceName" label="设备名称" sortable></el-table-column>
      <el-table-column prop="deviceNumber" label="设备编号" sortable></el-table-column>
      <el-table-column prop="status_config_windows" label="配置状态" sortable>
        <template slot-scope="scope">
          <span :class="{'color-active': scope.row.status_config_windows === '1'}">
            {{ scope.row.status_config_windows === '1' ? '已配置' : '未配置' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="deviceTypeName" label="设备种类" sortable></el-table-column>
      <el-table-column prop="collectorName" label="所属智能物联网关名称" sortable></el-table-column>
      <el-table-column prop="collectorNumber" label="所属智能物联网关编号" sortable></el-table-column>
      <el-table-column prop="" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="medium" @click="toConfig(scope.row)">配置参数报警窗口</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--列表 end-->

    <!--分页start -->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize" :current-page.sync="filters.page"
                     :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>
    <!--分页end -->
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import {
    queryDeviceParamConf, 
    } from '../../api/api'
  import OperationTips from '@/components/OperationTips.vue'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    name: 'process-common-parameters',
    data () {
      return {
        filters: {
          status: this.$route.query.status || '',
          deviceType: this.$route.query.deviceType || '',
          keyword: this.$route.query.keyword || '',
          type: 'window',
          pageSize: 10,
          page: parseInt(this.$route.query.page || 1),
          total: parseInt(this.$route.query.total || 0)
        },
        list: [],
        visible: {
          listLoading: true,
        },
        alreadyConfiguredCount: 0,
        totalDevice: 0
      }
    },
    computed: {
      ...mapGetters(['getDeviceTypeList']),
      percentage () {
        return this.totalDevice === 0 ? 0 : (this.alreadyConfiguredCount / this.totalDevice * 100).toFixed(2)
      }
    },
    components: { OperationTips },
    mounted () {
      this.getList()
      this.initDeviceTypeList()
    },
    methods: {
      ...mapActions(['initDeviceTypeList']),
      // 列表
      getList () {
        this.visible.listLoading = true
        queryDeviceParamConf(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.lines
            this.list = res.map.warningConfDevices
            this.alreadyConfiguredCount = res.map.alreadyConfiguredCount
            this.totalDevice = res.map.totalDevice
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
          status: '',
          deviceType: '',
          keyword: '',
          type: 'window',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getList()
      },
      toConfig (row) {
        // console.log(row)
        // 参数保存到url
        utils.saveToUrl(this.filters)
        this.$router.push({
          path: `/sysConfig/deviceAlarmWindow/${row.device_id}`,
          query: {
            name: row.deviceName,
            number: row.deviceNumber,
            confId: row.device_collector_conf_id
          }
        })
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
</style>
