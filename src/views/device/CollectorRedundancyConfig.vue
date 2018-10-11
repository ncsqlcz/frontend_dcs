/*
 * @Author: liucz 
 * @Date: 2018-06-14 18:05:24 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-29 16:27:44
 */
<template>
  <section>
    <!-- 搜索start -->
    <el-col class="toolbar">
      <el-form :inline="true"
               :model="filters"
               @submit.native.prevent>
        <el-col :span="12"
                class="text-left">
          <el-form-item>
            <el-button type="primary"
                       size="medium"
                       @click="showTopoDialog"> 冗余拓扑图</el-button>
          </el-form-item>
        </el-col>
        <el-col :span="12"
                class="text-right">
          <el-form-item>
            <el-select v-model="filters.type"
                       placeholder="全部配置状态"
                       style="width:150px"
                       size="medium">
              <el-option v-for="item in configList"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model.trim="filters.keyword"
                      size="medium"
                      placeholder="请输入智能物联网管名称或编号"
                      @keyup.native.enter="getList"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
                       size="medium"
                       @click="getList"
                       icon="el-icon-search">查询</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-col>
    <!-- 搜索end -->
    <!--列表 start-->
    <el-table :data="list"
              highlight-current-row
              v-loading="visible.listLoading">
      <el-table-column type="index"
                       :index="getIndex"
                       label="序号"
                       width="60"></el-table-column>
      <el-table-column prop="collector_name"
                       label="智能物联网关名称"
                       sortable></el-table-column>
      <el-table-column prop="collector_number"
                       label="智能物联网关编号"
                       sortable></el-table-column>
      <el-table-column prop="collector_ip"
                       label="智能物联网关IP"
                       sortable>
        <template slot-scope="scope">
          <span v-if="scope.row.collector_ip">{{ scope.row.collector_ip }}</span>
          <span v-else
                class="color-999">未配置IP</span>
        </template>
      </el-table-column>
      <el-table-column prop="status"
                       label="冗余配置状态"
                       sortable>
        <template slot-scope="scope">
          <span :class="{'color-active': parseInt(scope.row.status) === 0}">{{ getStatusName(scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop=""
                       label="操作">
        <template slot-scope="scope">
          <el-button type="text"
                     size="medium"
                     @click="handleSelect(scope.row)">选择冗余设备</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--列表 end-->

    <!--分页start -->
    <el-col :span="24"
            class="toolbar hidden">
      <el-pagination layout="total, sizes, prev, pager ,next"
                     :page-size="filters.pageSize"
                     :total="filters.total"
                     @current-change="handlePageChange"
                     @size-change="handleSizeChange">
      </el-pagination>
    </el-col>
    <!--分页end -->

    <!-- 设备冗余拓扑图 -->
    <DeviceTopoDialog :visible.sync="visible.topoDialog"
                      :data="topoData"></DeviceTopoDialog>
  </section>
</template>

<script>
import utils from '@/common/js/utils'
import { queryCollector, saveCollectorBackup } from '@/api/api'
import DeviceTopoDialog from './components/DeviceTopoDialog.vue'
export default {
  name: 'collector-redundancy-config',
  data() {
    return {
      filters: {
        keyword: '',
        pageSize: 1000,
        page: 1,
        total: 0
      },
      list: [],
      visible: {
        listLoading: true,
        topoDialog: false
      },
      configStatusList: [
        { label: '未配置', value: '1' },
        { label: '未配置', value: null },
        { label: '已配置', value: '0' }
      ],
      configList: [
        { label: '全部智能物联网关', value: 'all' },
        { label: '未配置IP', value: '0' },
        { label: '已配置IP', value: '1' }
      ],
      topoData: []
    }
  },
  components: { DeviceTopoDialog },
  computed: {},
  mounted() {
    this.getList()
  },
  methods: {
    // 显示拓扑图
    showTopoDialog() {
      this.topoData = [
        [
          {
            device_id: '111',
            device_name: '搅拌设备1',
            device_number: '搅拌设备1'
          },
          {
            device_id: '222',
            device_name: '搅拌设备2',
            device_number: '搅拌设备2'
          }
        ],
        [
          {
            device_id: '222',
            device_name: '搅拌设备2',
            device_number: '搅拌设备2'
          },
          {
            device_id: '333',
            device_name: 'X-Ray',
            device_number: 'X-Ray'
          }
        ],
        [
          {
            device_id: '444',
            device_name: '激光设备',
            device_number: '激光设备1243'
          },
          {
            device_id: '333',
            device_name: 'X-Ray',
            device_number: 'X-Ray'
          }
        ],
        [
          {
            device_id: '555',
            device_name: '激光设备',
            device_number: '激光设备1243'
          },
          {
            device_id: '111',
            device_name: '搅拌设备1',
            device_number: '搅拌设备1'
          }
        ],
        [
          {
            device_id: '777',
            device_name: '切割设备',
            device_number: '切割设备sdf'
          }
        ],
        [
          {
            device_id: '666',
            device_name: '速率采集',
            device_number: '速率采集423'
          },
          {
            device_id: '999',
            device_name: '温控机',
            device_number: '温控机21321'
          }
        ],
        [
          {
            device_id: '333',
            device_name: 'X-Ray',
            device_number: 'X-Ray'
          },
          {
            device_id: '777',
            device_name: '切割设备',
            device_number: '切割设备sdf'
          }
        ]
      ]
      this.visible.topoDialog = true
    },
    // 列表
    getList() {
      this.visible.listLoading = true
      queryCollector(this.filters).then(res => {
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
    handlePageChange(val) {
      this.filters.page = val
      this.getList()
    },
    //  每页数量改变
    handleSizeChange(val) {
      this.filters.pageSize = val
      this.getList()
    },
    // 列表索引
    getIndex(index) {
      return utils.getHeadNumAdapter(
        this.filters.page,
        this.filters.pageSize,
        index
      )
    },
    // 重置
    reset() {
      this.filters = {
        keyword: '',
        pageSize: 1000,
        page: 1,
        total: 0
      }
      this.getList()
    },
    // 选择冗余设备
    handleSelect(row) {
      if (!row.collector_ip) {
        this.$message.warning('请先配置IP')
      } else {
        let obj = {
          params: {
            collectorId: row.collector_id,
            keyword: ''
          },
          selectedIds: [
            row.collectorBackupDo && row.collectorBackupDo.backup_collector_id
          ]
        }
        this.$mesCollector.show('选择冗余设备', obj).then(res => {
          if (res.rows[0].collector_id === row.collector_id) {
            this.$message.warning('不能选择与自身相同的冗余设备')
          } else {
            // 保存选择的冗余设备
            saveCollectorBackup({
              backup: JSON.stringify([
                {
                  collector_id: row.collector_id,
                  backup_collector_id: res.rows[0].collector_id
                }
              ])
            }).then(_res => {
              if (_res.status === 0) {
                this.$message.success('配置成功')
                this.getList()
              } else {
                this.$message.error(_res.msg)
              }
            })
          }
        })
      }
    },
    getStatusName(status) {
      let name = ''
      this.configStatusList.forEach(item => {
        if (status === item.value) {
          name = item.label
        }
      })
      return name
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
</style>
