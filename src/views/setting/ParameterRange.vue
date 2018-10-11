/*
 * @Author:danqihao
 * @Date: 2018-04-08 17:43:48
 * @Last Modified by: danqihao
 * @Last Modified time: 2018-04-21 14:47:29
 */

<template>
  <section>
     <el-row class="toolbar">
       <el-form :inline="true" :model="filters" @submit.native.prevent>
         <el-col :span="24" class="text-right">
           <el-form-item :span="4">
             <el-select placeholder="请选择车间" size="medium" v-model="workshopId" @change="getList">
               <el-option v-for='(value,index) in workshopList'
                          :value = 'value.role_workshop_id' :label  = 'value.role_workshop_name' size="medium" :key="index"></el-option>
             </el-select>
           </el-form-item>
           <el-form-item :span="4" >
             <el-select  placeholder="请选择设备" size="medium" @change="deviceChange" v-model="filters.devicesId">
               <el-option  v-for='(value,index) in deviceList'
                           :value='value.devices.devices_control_devices_id' :label='value.devices.devices_control_devices_name' size="medium" :key="index"></el-option>
             </el-select>
           </el-form-item>
           <el-form-item :span="4">
             <el-input v-model.trim="keyword" size="medium" placeholder="输入关键字" @keyup.native.enter="filters.keyword = keyword"></el-input>
           </el-form-item>
           <el-form-item>
             <el-button size="medium" type="primary" icon="el-icon-search" @click="filters.keyword = keyword">搜索</el-button>
             <el-button size="medium" type='' @click="reset">重置</el-button>
           </el-form-item>

           <!--<el-form-item :span="4" :offset="11">-->
             <!--<el-input placeholder="请输入内容"  size="medium" v-model="searchValue" @keyup.native.enter="deviceChange">-->
               <!--<el-button slot="append" icon="el-icon-search" @click="deviceChange" ></el-button>-->
             <!--</el-input>-->
           <!--</el-form-item>-->
         </el-col>
       </el-form>
    </el-row>
	<el-row class="p-2">
		<el-col :span="12" >
        <span v-show='edit' class="editButton">编辑采集参数上下限</span>
        <span v-show='!edit' class="editButton">采集参数上下限</span>
    </el-col>
		<el-col :span="12" class="text-right">
            <el-button type="success" size="medium" icon="__el-icon-circle-plus" @click="submit" v-if='edit'>保存</el-button>
            <el-button type="danger" size="medium" icon="el-icon-delete" @click="handleClearData" v-if='edit'>清空</el-button>
            <el-button type="" size="medium" icon="el-icon-cancel" @click="handelCancelEdit" v-if='edit'>退出编辑</el-button>
            <el-button type="primary" size="medium" icon="el-icon-edits" @click= "edit=true" v-else :disabled="paramList.length===0">编辑</el-button>
        </el-col>
	</el-row>
    <el-table :data="paramList" style="width: 100%"  border v-loading="visible.loading">
        <el-table-column type="index"  label="序号" :width="50"></el-table-column>
        <el-table-column label="参数名称" prop="dynamic_acquisition_parameter"></el-table-column>
        <el-table-column label="参数单位" prop="dynamic_acquisition_parameter_unit"></el-table-column>
        <!-- <el-table-column label="当前数据" prop="dynamic_acquisition_data"></el-table-column> -->
      <el-table-column label="参数上限值">
        <template slot-scope="scope">
          <el-input-number size="medium" placeholder="请输入内容(必填)" v-if="edit" class="w-100"
          :min="scope.row.paramDownValue" :value='scope.row.paramUpValue' 
           v-model.number="scope.row.paramUpValue" @focus="hh(scope.$index)">
          </el-input-number>
          <div v-else class="text-center param-value">{{ scope.row.paramUpValue }}</div>
        </template>
      </el-table-column>
      <el-table-column label="参数下限值">
        <template slot-scope="scope">
          <el-input-number size="medium" placeholder="请输入内容(必填)" v-if="edit" class="w-100"
          :max="scope.row.paramUpValue" :value='scope.row.paramDownValue' 
           v-model.number="scope.row.paramDownValue" @focus="hh(scope.$index)">
          </el-input-number>
          <div v-else class="text-center param-value">{{ scope.row.paramDownValue }}	</div>
        </template>
      </el-table-column>
    </el-table>
    <!--<el-row>-->
        <!--<el-col class="text-right">-->
            <!--<el-pagination @current-change="handleCurrentChange" background  layout="total,prev,pager,next" :current-page="currenPage" :page-size="pagesize" :total=lines></el-pagination>-->
        <!--</el-col>-->
    <!--</el-row>-->
  </section>
</template>

<script>
    // import utils from '../../common/js/utils'
    // import {mapGetters, mapActions} from 'vuex'
    import {queryWorkShopInfos, queryDevicesTeam, queryDevicesParameterById} from '../../api/api'
    export default {
      data () {
        return {
          filters: {
            devicesId: '',
            startTime: '',
            endTime: '',
            keyword: '',
            headNum: 1
          },
          keyword: '',
          workshopId: '',
          paramDataList: [],
          edit: false,
          searchValue: '',
          visible: {
            addForm: false,
            loading: false
          },
          workshopList: [],
          deviceList: []
        }
      },
      computed: {
        // ...mapGetters(['getDeviceTypes'])
        paramList () {
          let list = []
          this.paramDataList.map(v => {
            if (v.dynamic_acquisition_parameter.toLowerCase().indexOf(this.filters.keyword.toLowerCase()) > -1) {
              list.push(v)
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
                this.workshopId = this.workshopList[8].role_workshop_id
                this.getList()
              }
            }
          })
        },
        getList () {
          this.filters.devicesId = ''
          this.deviceList = []
          this.paramDataList = []
          this.visible.loading = true
          queryDevicesTeam({workshopId: this.workshopId, headNum: 1}).then(res => {
            this.visible.loading = false
            if (res.status === 0) {
              // this.filters.total = res.map.lines
              res.map.devices.forEach(item => {
                item.status = 1
              })
              this.deviceList = res.map.devices
              // console.log(this.deviceList.map(v => v.devices.devices_control_devices_id));
              this.filters.devicesId = this.deviceList[0].devices.devices_control_devices_id
              this.deviceChange()
            } else {
              this.filters.total = 0
              this.deviceList = []
            }
          })
        },
        deviceChange () {
          this.paramDataList = []
          if (this.workshopId === '') {
            this.$message({
              type: 'error',
              message: '请先选择工序车间'
            });
            this.filters.devicesId = ''
            return
          }
          this.visible.loading = true
          this.paramDataList = []
          queryDevicesParameterById(this.filters).then(res => {
            this.visible.loading = false
            if (res.status === 0) {
              // this.filters.total = res.map.lines
              res.map.parameters.forEach(item => {
                item.paramDownValue = item.paramDownValueInit = parseFloat(parseFloat(Math.floor(10 * Math.random())).toFixed(2))
                item.paramUpValue = item.paramUpValueInit = parseFloat(parseFloat(Math.floor(10 * Math.random() + 10)).toFixed(2))
              })
              this.paramDataList = res.map.parameters
            } else {
              this.paramDataList = []
            }
          })
        },
        handleCurrentChange () {},
        hh (val) {
          // console.log(val)
          // console.log(1)
        },
        submit () {
          this.$confirm('确定保存更改吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.edit = false
            this.paramList.forEach(item => {
              item.paramUpValueInit = item.paramUpValue
              item.paramDownValueInit = item.paramDownValue
            })
          })
        },
        reset () {
          this.filters = {
            workshopId: '',
            devicesId: '',
            keyword: ''
          }
          this.keyword = ''
          this.getWorkShopList()
        },
        handleClearData () {
          this.$confirm('确定清空所有参数值吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.paramList.forEach(item => {
              item.paramDownValue = 0
              item.paramUpValue = 0
            })
          })
        },
        handelCancelEdit () {
          this.edit = false
          this.paramList.forEach(item => {
            item.paramUpValue = item.paramUpValueInit
            item.paramDownValue = item.paramDownValueInit
          })
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
.param-value {
  padding: 6.5px 0;
}
</style>
