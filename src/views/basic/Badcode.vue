<template>
    <section>
        <el-col class="toolbar">
            <el-form :inline="true" :model="filters" @submit.native.prevent>
               <el-col :span="12" class="text-left">
                   <el-form-item>
                        <el-button type="default" size="medium" @click="handleDownload" icon="fa fa-reply"> 导出不良代号</el-button>
                    </el-form-item>
                    <el-form-item>
                    <el-upload
                    class="upload"
                    :action="importBadCodeUrl"
                    :on-change="handleFileChange"
                    :file-list="fileList"
                    :show-file-list="false"
                    :auto-upload="false"
                    :multiple="false"
                    accept=".xlsx, .xls">
                    <el-tooltip class="item" effect="dark" content="仅支持.xlsx 和 .xls" placement="top">
                        <el-button type="primary" size="medium" icon="fa fa-share"> 导入不良代号</el-button>
                    </el-tooltip>
                    </el-upload>
                </el-form-item>
               </el-col>
               <el-col :span="12" class="text-right">
                   <el-form-item>
                        <el-input v-model.trim="filters.keyword" size="medium" style="width: 230px;" clearable @clear="getList"
                        placeholder="请输入不良名称、代号关键字" @keyup.native.enter="getList"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-search" size="medium" @click.prevent="getList">搜索</el-button>
                    </el-form-item>
               </el-col>
            </el-form>
        </el-col>
        <!--列表 start-->
        <el-table :data="list" highlight-current-row v-loading="visible.listLoading">
          <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
          <el-table-column prop="bad_code" label="不良代号" ></el-table-column>
          <el-table-column prop="bad_code_number" label="编号" ></el-table-column>
          <el-table-column prop="bad_code_describe" label="不良描述"></el-table-column>
          <!-- <el-table-column prop="" label="产出物型号" sortable></el-table-column> -->
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
import utils from "../../common/js/utils";
import {
  queryBadCode,
  importBadCode,
  exportBadCodeUrl,
  importBadCodeUrl
} from "../../api/api.js";
export default {
  data() {
    return {
      filters: {
        keyword: "",
        page: 1,
        pageSize: 10,
        total: 0
      },
      fileList: [], //上传的列表
      options: [
        { value: "", label: "全部产出物类型" },
        { value: "1", label: "半成品" },
        { value: "0", label: "成品" }
      ],
      importBadCodeUrl: importBadCodeUrl,
      list: [],
      visible: {
        listLoading: false
      }
    };
  },
  mounted () {
    this.getList()
  },
  methods: {
    // 列表
    getList() {
      this.visible.listLoading = true;
      queryBadCode(this.filters).then(res => {
        if (res.status === 0) {
          // this.filters.page = res.map.page
          this.filters.total = res.map.line;
          this.list = res.map.badCodeList;
        } else {
          this.filters.total = 0;
          this.list = [];
        }
        this.visible.listLoading = false;
      });
    },
    //  页面改变
    handlePageChange(val) {
      this.filters.page = val;
      this.getList();
    },
    //  每页数量改变
    handleSizeChange(val) {
      this.filters.pageSize = val;
      this.getList();
    },
    // 列表索引
    getIndex(index) {
      return utils.getHeadNumAdapter(
        this.filters.page,
        this.filters.pageSize,
        index
      );
    },
    handleDownload() {
      utils.downloadFile(exportBadCodeUrl);
    },
    // 导入
    handleImport() {
      let form = new FormData();
      for (let value of this.fileList) {
        form.append("type", this.filters.type);
        form.append("file", value.raw);
      }
      // 打开权限确认弹窗
      this.$mesPermission
        .show("权限确认", {
          tips: "需要通过验证后才能继续"
        })
        .then(res => {
          if (res === "pass") {
            importBadCode(form).then(res => {
              if (res.status === 0) {
                this.$message.success("成功");
                this.getList();
              } else {
                this.$message.error(res.msg || "失败");
              }
            });
          }
        });
    },
    // 文件改变就开始上传
    handleFileChange(file, fileList) {
      this.fileList = [file];
      this.handleImport();
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

