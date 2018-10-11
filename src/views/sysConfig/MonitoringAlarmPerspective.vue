/*
 * @Author: liucz 
 * @Date: 2018-06-28 16:31:21 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-08 11:53:36
 */
<template>
  <section>
    <!-- 操作提示组件 -->
    <operation-tips video="">
      <span class="color-999">系统默认报警为“车间”视角，用户可根据需要自定义其他视角的报警单元。报警视角与报警单元的种类属性对应。当配置完全≥2个报警视角的时候，在监控报警模块可以切换不同的监控视角。
        例如：当配置完整“车间”报警视角、“责任人”报警视角之后，在“监控报警”模块可以切换监控报警视角。</span>
    </operation-tips>
    
    <el-row class="transparent mt-3">
      <el-col :span="24" class="title-name">报警视角</el-col>
      <el-col :span="24" v-loading="visible.listLoading">
        <div class="flex-wrap">
          <el-card class="perspective-card mr-2 mt-3" v-for="(item, index) in list" :key="index">
            <div slot="header" class="clearfix">
              <span class="color-999"
                v-if="item.warning_uint_type_id === 'systemac45da54e84f49c2a47078151484f647'">
                默认报警视角
              </span>
              <span v-else class="color-999">自定义报警视角</span>
              <el-button style="float: right; padding: 0 0;" type="text"
                v-if="item.warning_uint_type_id !== 'systemac45da54e84f49c2a47078151484f647'"
                @click="handleDeletePerspective(item)">删除</el-button>
            </div>
            <div>
              <p class="text-center" style="font-size: 30px;">{{ item.warning_unit_type_name }}</p>
              <p class="text-center">
                <el-button type="primary" round @click="toConfigPage(item)" class="w-75" v-if="item.view_status === '0'">点击配置</el-button>
                <div v-if="item.view_status === '1'">
                  <el-button type="primary" round @click="toOverview(item)" class="w-75">查看配置</el-button>
                  <i class="fa fa-minus-circle pointer ml-2" style="color: red; font-size: 45px; vertical-align: -10px;"
                    @click="clearConfig(item)" placeholder="清空配置"></i>
                </div>
              </p>
            </div>
          </el-card>

          <!-- 添加自定义报警视角 -->
          <el-card class="perspective-card mr-2 mt-3">
            <div slot="header" class="clearfix">
              <span class="color-999">自定义报警视角</span>
            </div>
            <div>
              <p class="text-center" style="font-size: 30px;"></p>
              <p>
                <div class="text-center">
                  <i class="fa fa-plus" style="font-size: 60px; margin-top: -15px; color: #ddd;"></i>
                </div>
                <div class="text-center" style="margin-top: 25px;">
                  <el-button type="primary" round @click="handleAddPerspective" class="w-75">点击添加</el-button>
                </div>
              </p>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <!-- 导入模板数据弹窗 -->
    <el-dialog title="导入模板数据" :visible.sync="visible.templateDialog" width="40%" class="mes-dialog">
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
    </el-dialog>
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import { queryWarningUnitType, saveWarningUnitType,
    permissionsToConfirm, modifyWarningUnitType, removeWarningUnitTypeConf } from '../../api/api'
  import { mapGetters, mapActions } from 'vuex'
  import OperationTips from '@/components/OperationTips.vue'
  export default {
    name: 'Monitoring-Alarm-Config-View',
    data () {
      return {
        filters: {
          status: '',
          deviceType: '',
          keyword: '',
          type: '',
          pageSize: 10,
          page: 1,
          total: 0
        },
        list: [],
        visible: {
          listLoading: true,
          templateDialog: false
        }
      }
    },
    computed: {
      ...mapGetters([''])
    },
    components: { OperationTips },
    mounted () {
      this.getList()
    },
    methods: {
      ...mapActions(['initAlarmColorList']),
      // 列表
      getList () {
        this.visible.listLoading = true
        queryWarningUnitType(this.filters).then((res) => {
          if (res.status === 0) {
            this.list = res.map.unitType
          } else {
            this.$message.error(res.msg)
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
          type: '',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getList()
      },
      // 跳转到监控报警视角配置参数页面
      toConfigPage (item) {
        this.$router.push({path:'/sysConfig/monitoringAlarm/perspective/step/' + item.warning_uint_type_id, query: { name: item.warning_unit_type_name }})
      },
      // 查看配置
      toOverview (item) {
        this.$router.push({path:'/sysConfig/monitoringAlarm/overview/' + item.warning_uint_type_id})
      },
      // 清空配置
      clearConfig (item) {
        this.$mesPermission.show('权限确认', {
          tips: '清空数据后，监控报警模块中该视角的所有功能将无法使用?'
        }).then(res => {
          console.log(res)
          this.removeUnitTypeConf(item.warning_uint_type_id)
        })
      },
      // 新增视角
      handleAddPerspective () {
        this.$prompt('报警视角名称', '自定义报警视角', {
          inputPlaceholder: '请输入名称，不超过8个字母或汉字',
          inputValidator: (value) => {
            if (value && value.split('').length > 8) {
              return '名称不能多于8个字'
            }
            return value ? true : '名称不能为空'
          }
        }).then(res => {
          const unitTypeName = res.value.trim()
          this.$mesPermission.show('权限确认', {
            tips: '是否添加视角 ‘' + unitTypeName + '’'
          }).then(pass => {
            console.log(pass)
            this.saveUnitType(unitTypeName)
          })
        }).catch(() => {})
      },
      // 删除视角
      handleDeletePerspective (item) {
        this.$mesPermission.show('权限确认', {
          tips: '删除视角后，该视角卡片被删；监控报警模块中该视角的所有功能将无法使用。'
        }).then(res => {
          console.log(res)
          this.delUnitType(item.warning_uint_type_id)
        })
      },
      // 新增视角API
      saveUnitType (name) {
        saveWarningUnitType({
          warningUnit:JSON.stringify({
            warning_unit_type_name: name,
            warning_module_id: '1113332222'
          })
        }).then(res => {
          if (res.status === 0) {
            this.$message.success('成功')
            this.getList()
          } else {
            this.$message.warning('' || '失败')
          }
        })
      },
      // 删除视角API
      delUnitType (delId) {
        modifyWarningUnitType({
          unitTypeId: delId
        }).then(res => {
          if (res.status === 0) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.warning('' || '失败')
          }
        })
      },
      // 删除视角配置API
      removeUnitTypeConf (emptyId) {
        removeWarningUnitTypeConf({
          UnitTypeId: emptyId
        }).then(res => {
          if (res.status === 0) {
            this.$message.success('删除配置成功')
            this.getList()
          } else {
            this.$message.warning('' || '失败')
          }
        })
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
@import '~scss_vars';
.title-name {
  font-size: 18px;
  &::before{
    content: '';
    display: inline-block;
    height: 20px;
    width: 8px;
    background-color: $color-active;
    vertical-align: -3px;
    margin-right: 8px;
  }
}
.perspective-card {
  width: 300px;
  overflow: hidden;
}
</style>
