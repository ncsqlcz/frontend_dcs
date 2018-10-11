/*
 * @Author:danqihao
 * @Date: 2018-04-08 17:43:48
 * @Last Modified by: danqihao
 * @Last Modified time: 2018-04-26 14:54:16
 */

<template>
  <section>
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="24" class="text-right">
          <el-form-item :span="4">
            <el-select  placeholder="请选择车间" size="medium" @change="getList()" v-model="filters.workshopId">
              <el-option  v-for='(value,index) in workshopList' :key="index"
                          :value='value.role_workshop_id'
                          :label='value.role_workshop_name' size="medium"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :span="4">
            <el-select  size="medium" v-model="filters.status" placeholder="请选择状态">
              <el-option value="" label="请选择状态" size="medium"> </el-option>
              <el-option :value="1" label="打开的" size="medium"> </el-option>
              <el-option :value="0" label="关闭的" size="medium"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :span="4">
            <el-input v-model.trim="keyword" size="medium" placeholder="输入关键字" @keyup.native.enter="filters.keyword = keyword"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="medium" type="primary" icon="el-icon-search" @click="filters.keyword = keyword">搜索</el-button>
            <el-button size="medium" type='' @click="reset">重置</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-col>

    <el-row class="p-2" type="flex" justify="end">
      <el-col :span="4" class="text-right">
        <el-button type="danger" size="medium" icon="" v-show='batch' @click="batch = !batch">{{statusName}}</el-button>
        <el-button type="success" size="medium" icon="" @click="submit()" v-show='!batch'>确认</el-button>
        <el-button type="" size="medium" icon="" v-show='!batch' @click="batch = !batch">取消</el-button>
      </el-col>
    </el-row>
    <el-table :data="deviceListComputed" style="width: 100%"  v-loading="visible.loading"  @selection-change="handleSelectionChange">
      <el-table-column type="index" label="序号" :width="50"></el-table-column>
      <el-table-column label="设备名称" prop="devices.devices_control_devices_name"></el-table-column>
      <el-table-column label="设备编号" prop="devices.devices_control_devices_number"></el-table-column>
      <el-table-column label="设备类别" prop="devices.devicesType"></el-table-column>
      <el-table-column label="设备IP" prop="devices.devices_control_devices_IP"></el-table-column>
      <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button size="small" icon="" @click="changeStatus(scope.row, 0)" type="primary" v-if="scope.row.status === 1">打开报警</el-button>
        <el-button size="small" icon="" @click="changeStatus(scope.row, 1)" type="danger" v-if="scope.row.status === 0">关闭报警</el-button>
      </template>
      </el-table-column>
      <el-table-column v-if="!batch" type="selection" width="55" prop="选择"></el-table-column>
    </el-table>
    <!--<el-row>-->
        <!--<el-col class="text-right">-->
            <!--<el-pagination @current-change="handleCurrentChange" layout="total,prev,pager,next"-->
                           <!--:current-page="filters.currentPage" :page-size="filters.pageSize" :total="filters.total"></el-pagination>-->
        <!--</el-col>-->
    <!--</el-row>-->
  </section>
</template>

<script>
    // import utils from '../../common/js/utils'
    // import {mapGetters, mapActions} from 'vuex'
    import {queryWorkShopInfos, queryDevicesTeam} from '../../api/api'
    export default {
      data () {
        return {
          filters: {
            type: 'info',
            keyword: '',
            workshopId: '',
            status: '',
            total: 0,
            currentPage: 1,
            pageSize: 10
          },
          keyword: '',
          dataList: [],
          edit: true,
          batch: true,
          statusName: '批量更改',
          deviceList: [],
          multipleSelection: [],
          deviceName: '',
          searchValue: '',
          visible: {
            addForm: false,
            loading: false
          },
          deviceNameList: [],
          workshopList: []
        }
      },
      computed: {
        // ...mapGetters(['getDeviceTypes'])
        deviceListComputed () {
          let list = []
          this.deviceList.map(v => {
            if (
                v.devices.devices_control_devices_name.toLowerCase().indexOf(this.filters.keyword.toLowerCase()) > -1 ||
                v.devices.devices_control_devices_number.toLowerCase().indexOf(this.filters.keyword.toLowerCase()) > -1
            ) {
              if (this.filters.status === '') {
                list.push(v)
              } else if (
                this.filters.status === v.status) {
                list.push(v)
              }
            }
          })
          return list
        }
      },
      mounted () {
        this.getWorkShopList()
      },
      methods: {
        // ...mapActions(['initDevicesTypes']),
        getWorkShopList () {
          queryWorkShopInfos({type: 'info'}).then(res => {
            if (res.status === 0) {
              this.workshopList = res.map.workshopInfos
              if (this.workshopList.length > 0) {
                this.filters.workshopId = this.workshopList[1].role_workshop_id
                this.getList()
              }
            }
          })
        },
        getList () {
          this.deviceList = []
          this.visible.loading = true
          queryDevicesTeam({workshopId: this.filters.workshopId, headNum: 1, keyWord: this.filters.keyword}).then(res => {
            this.visible.loading = false
            if (res.status === 0) {
              this.filters.total = res.map.lines
              res.map.devices.forEach(item => {
                item.status = 1
              })
              this.deviceList = res.map.devices
            } else {
              this.filters.total = 0
              this.deviceList = []
            }
          })
        },
        handleCurrentChange () {

        },
        submit () {
          console.log(this.multipleSelection)
          this.$confirm('确定更改吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.multipleSelection.forEach((item, index) => {
              if (item.status === 0) {
                item.status = 1
              } else {
                item.status = 0
              }
            })
            this.batch = true
          })
        },
        reset () {
          this.filters = {
            type: 'info',
            keyword: '',
            workshopId: '',
            status: '',
            total: 0,
            currentPage: 1,
            pageSize: 10
          }
          this.keyword = ''
          this.getWorkShopList()
        },
        // 单个报警状态改变
        changeStatus (row, status) {
          const statusName = row.status === 0 ? '关闭' : '打开'
          // console.log(row)
          const h = this.$createElement;
          this.$msgbox({
            title: statusName + '警报',
            message: h('p', null, [
              h('h2', {style: 'text-align: center'}, '确认' + statusName),
              h('h3', {style: 'text-align: center'}, row.devices.devices_control_devices_name + ',' + row.devices.devices_control_devices_number),
              h('h3', {style: 'text-align: center'}, '的警报吗?')
            ]),
            showCancelButton: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          }).then(action => {
            if (row.status === 0) {
              row.status = 1
            } else {
              row.status = 0
            }
            this.$message({
              type: 'success',
              message: statusName + '成功'
            })
          })
        },

        batchStatus () {
          this.batch = !this.batch
          console.log(this.batch)
        },
        handleSelectionChange (val) {
          this.multipleSelection = val;
        }
      },
      watch: {}
    }
</script>

<style scoped lang="scss">
.editButton{
	font-size: 18px;
  line-height: 40px;
}
</style>
