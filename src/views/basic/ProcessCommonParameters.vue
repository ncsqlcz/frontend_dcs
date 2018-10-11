/*
 * @Author: liucz 
 * @Date: 2018-06-14 11:29:31 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-07-23 14:19:43
 */
<template>
  <section>
     <!-- 操作提示组件 -->
    <operation-tips video="">
      <span class="color-999">工序生产执行过程中的现场执行单元，录入的各个执行单元通用的参数在这里配置。为了简化后续操作，并且减小输入的错误概率。</span>
    </operation-tips>
    <!--搜索 start-->
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="12" class="text-left">
          <el-form-item>
            <el-button type="primary" size="medium" @click="handleAdd" icon="el-icon-plus"> 添加通用工序参数</el-button>
          </el-form-item>
          <el-form-item class="hidden">
            <el-button type="primary" size="medium" @click="handleAddNotCommon" icon="el-icon-plus"> 添加非通用工序参数</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-col>
    <!--搜索 end-->
    
    <!--列表 start-->
    <!-- <el-table :data="list" highlight-current-row v-loading="visible.listLoading">
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="process_scene_param_name" label="工序参数名称" sortable></el-table-column>
      <el-table-column prop="" label="是否在现场管理模块配置中显示">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.status" 
            active-text="开" inactive-text="关"
            active-value="0" inactive-value="1"
            active-color="#13ce66" inactive-color="#ff4949"
            @change="handleStatusChange(scope.row)"
            ></el-switch>
        </template>
      </el-table-column>
    </el-table> -->
    <!--列表 end-->

    <!--分页start -->
    <!-- <el-col :span="24" class="toolbar">
      <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                     :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
      </el-pagination>
    </el-col> -->
    <!--分页end -->
    
    <!--卡片start -->
    <el-col>
        <el-row class="transparent">
            <el-col :span="24">
              <div class="flex-wrap">
                <el-col :span="12" v-for="item in 4" :key="item">
                  <el-col class="title-name  my-2 color-999">执行信息</el-col>
                  <el-card class="perspective-card mr-1 mt-1">
                      <el-table :data="list" highlight-current-row v-loading="visible.listLoading">
                        <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
                        <el-table-column prop="process_scene_param_name" label="工序参数名称" sortable></el-table-column>
                        <el-table-column prop="" label="是否在现场管理模块配置中显示">
                          <template slot-scope="scope">
                            <el-switch v-model="scope.row.status" 
                              active-text="开" inactive-text="关"
                              active-value="0" inactive-value="1"
                              active-color="#13ce66" inactive-color="#ff4949"
                              @change="handleStatusChange(scope.row)"
                              ></el-switch>
                          </template>
                        </el-table-column>
                      </el-table>
                      <div class="bottom clearfix">
                        <el-button type="primary" size="medium" class="mt-2" >添加自定义参数</el-button>
                      </div>
                  </el-card>
                </el-col>
              </div>
            </el-col>
        </el-row>
    </el-col>
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import OperationTips from '@/components/OperationTips.vue'
  import {
    queryProcessParam, saveProcessParam,
    modifyProcessParam
  } from '../../api/api'
  export default {
    name: 'process-common-parameters',
    data () {
      return {
        filters: {
          keyword: '',
          type: 'common',
          pageSize: 10,
          page: 1,
          total: 0
        },
        list: [],
        visible: {
          listLoading: true,
        },
        textList: []
      }
    },
    components:{OperationTips},
    computed: {},
    mounted () {
      this.getList()
    },
    methods: {
      // 列表
      getList () {
        this.visible.listLoading = true
        queryProcessParam(this.filters).then((res) => {
          if (res.status === 0) {
            // this.filters.page = res.map.page
            this.filters.total = res.map.line
            this.list = res.map.processSceneParamInfos
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
          type: 'common',
          pageSize: 10,
          page: 1,
          total: 0
        }
        this.getList()
      },
      // 添加通用工序参数
      handleAdd () {
        this.$mesMultiParamsInput.show('添加通用工序参数', {
          reRender: true,
          textList: this.textList,
          tip: '多个工序参数请用转行区分（一行一个工序参数）'
        }).then(res => {
          if (res.rows.length > 0) {
            this.textList = res.rows
            let param = {
              type: this.filters.type,
              processParams: this.textList.join(',')
            }
            saveProcessParam(param).then(res => {
              if (res.status === 0) {
                this.textList = []
                this.$message.success('成功')
                this.getList()
              } else {
                this.$message.error(res.msg || '失败')
              }
            })
          }
        })
      },
      // 不用了
      handleAddNotCommon () {
        this.$mesMultiParamsInput.show('添加非通用工序参数', {
          reRender: true,
          textList: ['1', '1', 2, '工序参数342'],
          tip: '多个工序参数请用转行区分（一行一个工序参数）'
        }).then(res => {
          console.log(res)
        })
      },
      // 是否显示
      handleStatusChange (row) {
        // console.log(row)
        let param = {
          processSceneParamId: row.process_scene_param_id,
          status: row.status
        }
        modifyProcessParam(param).then(res => {
          if (res.status === 0) {
            this.$message.success('已保存')
          } else {
            this.$message.success('保存失败')
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
  width: 540px;
  overflow: hidden;
}
</style>
