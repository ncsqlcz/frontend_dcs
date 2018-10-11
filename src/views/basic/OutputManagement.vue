<template>
    <section>
        <el-col class="toolbar">
            <el-form :inline="true" :model="filters" @submit.native.prevent>
               <el-col :span="12" class="text-left">
                   <el-form-item>
                        <el-button type="default" size="medium" @click="handleDownload" icon="fa fa-reply"> 导出产出物EXCEL</el-button>
                    </el-form-item>
                    <el-form-item>
                    <el-upload
                    class="upload"
                    :action="importOutPutArticleUrl"
                    :on-change="handleFileChange"
                    :file-list="fileList"
                    :show-file-list="false"
                    :auto-upload="false"
                    :multiple="false"
                    accept=".xlsx, .xls">
                    <el-tooltip class="item" effect="dark" content="仅支持.xlsx 和 .xls" placement="top">
                        <el-button type="primary" size="medium" icon="fa fa-share"> 导入产出物EXCEL</el-button>
                    </el-tooltip>
                    </el-upload>
                </el-form-item>
               </el-col>
               <el-col :span="12" class="text-right">
                   <el-form-item>
                         <el-select v-model="filters.outPutType" placeholder="请选择"style="width:150px" size="medium" @change="getList">
                            <el-option v-for="item in options" :key="item.title" :label="item.label" :value="item.title">
                         </el-option>
                        </el-select>
                    </el-form-item>
                   <el-form-item>
                        <el-input v-model.trim="filters.keyWord" size="medium" placeholder="输入名称、编号或型号关键字" @keyup.native.enter="getList"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="medium" @click.prevent="getList">搜索</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="medium" @click.prevent="reset">重置</el-button>
                    </el-form-item>
               </el-col>
            </el-form>
        </el-col>
        <!--列表 start-->
        <el-table :data="list" highlight-current-row v-loading="listLoading">
        <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
        <el-table-column prop="output_article_name" label="产出物名称"></el-table-column>
        <el-table-column prop="output_article_number" label="产出物编号"></el-table-column>
        <el-table-column prop="output_article_type" label="产出物类型"></el-table-column>
        <el-table-column prop="output_article_model" label="产出物型号"></el-table-column>
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
  queryOutPutArticle,
  importOutPutArticle,
  exportOutPutArticleUrl,
  importOutPutArticleUrl
} from "../../api/api.js";
export default {
  data() {
    return {
      filters: {
        outPutType: "成品",
        keyWord: "",
        page: 1,
        pageSize: 10,
        total: 0
      },
      list: [], //产出物
      fileList: [], //上传的列表
      options: [
        { title: "全部产出物类型", label: "全部产出物类型" },
        { title: "半成品", label: "半成品" },
        { title: "成品", label: "成品" }
      ],
      importOutPutArticleUrl: importOutPutArticleUrl,
      list: [],
      listLoading: false
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    // 列表
    getList() {
      this.listLoading = true;
      queryOutPutArticle(this.filters).then(res => {
        console.log(res);
        if (res.status == 0) {
          this.list = res.map.outputAtticleInfoDTOs;
          this.filters.total = res.map.line;
        } else if (res.status == 2) {
          this.list = [];
          this.filters.total = 0;
        } else {
          this.$message.error(res.msg);
        }
        this.listLoading = false;
      });
    },
    // 重置
    reset(){
      this.filters={
        outPutType: "成品",
        keyWord: "",
        page: 1,
        pageSize: 10,
        total: 0
      };
      this.getList()
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
      console.log(111)
      utils.downloadFile(exportOutPutArticleUrl);
    },
    // 导入
    handleImport() {
      console.log(this.fileList)
      let form = new FormData();
      for (let value of this.fileList) {
        form.append("file", value.raw);
      }
      // 打开权限确认弹窗
      this.$mesPermission
        .show("权限确认", {
          tips: "需要通过验证后才能继续"
        })
        .then(res => {
          if (res === "pass") {
            importOutPutArticle(form).then(res => {
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

