/*
 * @Author:danqihao
 * @Date: 2018-04-18 17:44:13
 * @Last Modified by: danqihao
 * @Last Modified time: 2018-04-21 17:11:04
 */

<template>
  <section>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>报警配置</span>
      </div>
        <div class="text item">
          <el-table :data="dataList">
            <el-table-column label="报警名称" prop="alertName" ></el-table-column>
            <el-table-column label="报警描述" prop="alertDescription"></el-table-column>
            <el-table-column label="报警级别描述">
              <template slot-scope="scope">
                  {{scope.row.alertGradeDescription}}
                  <span class = "p_12"  :style = "{backgroundColor:scope.row.alertColor} "></span>
              </template>
            </el-table-column>
            <el-table-column   label="操作"   prop="" >
              <template slot-scope="scope">
                <el-button size="small" icon="" @click="changeStatus(scope.row)" type="danger" v-if="scope.row.status">关闭报警</el-button>
                <el-button size="small" icon="" @click="changeStatus(scope.row)" type="primary" v-else>打开报警</el-button>
              </template>
            </el-table-column>
        </el-table>
      </div>
    </el-card>
  </section>
</template>

<script>
  // import utils from '../../common/js/utils'
  export default {
    data () {
      return {
        dataList: [
          {
            alertName: '离线报警',
            alertDescription: '判断设备与工控机的实时连接状态',
            alertGradeDescription: '一级报警：提示颜色',
            alertColor: 'rgba(255,185,85,.8)',
            status: false
          },
          {
            alertName: '停机报警',
            alertDescription: '判断设备与工控机的实时连接状态',
            alertGradeDescription: '二级报警：提示颜色',
            alertColor: 'rgba(255,90,90,.8)',
            status: true
          },
          {
            alertName: '数据采集异常报警',
            alertDescription: '判断设备实时采集数据是否超出设置范围',
            alertGradeDescription: '三级报警：提示颜色',
            alertColor: 'rgba(255,255,110,.8)',
            status: true
          }
        ]
      }
    },
    computed: {},
    mounted () {},
    methods: {
      changeStatus (row) {
        if (row.status) {
          this.$confirm(`确定要关闭${row.alertName}吗?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            row.status = !row.status
            this.$message.success('关闭报警成功')
          })
        } else {
          this.$confirm(`确定要打开${row.alertName}吗?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            row.status = !row.status
            this.$message.success('打开报警成功')
          })
        }
      }

    },
    watch: {}
  }
</script>

<style scoped lang="scss">
    .p_12{
        padding: 12px;
    }
    .el-table th{
        background-color:#bbb !important;
        font-size: large;
    }
</style>
