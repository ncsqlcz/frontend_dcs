<template>
    <el-dialog title="设备参数" :visible.sync="visibleDialog">
        <el-table :data="list">
            <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
            <el-table-column property="parameter_name" label="参数名称" ></el-table-column>
            <el-table-column property="parameter_unit" label="参数单位" ></el-table-column>
            <el-table-column property="parameter_type" label="参数类型" ></el-table-column>
            <el-table-column property="parameter_source" label="参数来源"></el-table-column>
        </el-table>
        <!--分页start -->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize"
                            :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
            </el-pagination>
        </el-col>
        <!--分页end -->
        <div slot="footer" class="dialog-footer"></div>
    </el-dialog>
</template>
<script>
import utils from "../../../common/js/utils";
import { queryEquipmentParam } from "../../../api/api";
export default {
  data() {
    return {
      visibleDialog: false,
      filters: {
        total: 0,
        page: 1,
        pageSize: 10,
        deviceId: ""
      },
      list:[]
    };
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: String
    },
    Paralist:{
      type:Object
    }
  },
  watch: {
    visible(val) {
      this.visibleDialog = val;
    },
    visibleDialog(val) {
      this.$emit("update:visible", val);
    },
    Paralist(val){
      this.filters.total=val.line;
      this.list=val.deviceParameterDOs
    }
  },
  // mounted(){
  //   this.getList();
  // },
  methods: {
    // 列表索引
    getIndex(index) {
      return utils.getHeadNumAdapter(
        this.filters.page,
        this.filters.pageSize,
        index
      );
    },
    handlePageChange(val) {
      this.filters.page = val;
      this.getList();
    },
    handleSizeChange(val) {
      this.filters.pageSize = val;
      this.filters.page=1;
      this.getList();
    },
    getList() {
      this.filters.deviceId = this.id;
      queryEquipmentParam(this.filters).then(res=>{
        console.log(res)
        if(res.status==0){
          this.list=res.map.deviceParameterDOs;
          this.filters.total=res.map.line
        }else{
          this.list=[];
          this.filters.total=0
           this.$message.error(res.msg)
        }
      })
    }
  }
};
</script>
<style scoped lang="scss">
</style>
