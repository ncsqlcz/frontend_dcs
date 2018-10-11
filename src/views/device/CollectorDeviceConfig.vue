<template>
  <section>
    <el-col class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-col :span="8" class="text-left">
          <el-form-item>
            <el-button type="primary" size="medium" @click="handleDownload" icon="fa fa-reply"> 导出设备</el-button>
          </el-form-item>
          <el-form-item>
            <el-upload class="upload" :action="importWorkShopOrProcessUrl" :on-change="handleFileChange" :file-list="fileList" :show-file-list="false" :auto-upload="false" :multiple="false" accept=".xlsx, .xls">
              <el-tooltip class="item" effect="dark" content="仅支持.xlsx 和 .xls" placement="top">
                <el-button type="primary" size="medium" icon="fa fa-share"> 导入设备</el-button>
              </el-tooltip>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="16" class="text-right">
          <el-form-item>
            <el-select v-model="filters.type" placeholder="全部配置状态" size="medium" @change="getList" :disabled="status==0">
              <el-option v-for="item in configStatusList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model.trim="filters.keyword" size="medium" placeholder="请输入智能物联网关名称或编号或IP" @keyup.native.enter="getList" :disabled="status==0"></el-input>
          </el-form-item>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="medium" @click="getList" icon="el-icon-search" :disabled="status===0">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="medium" @click="reset" icon="el-icon-search" :disabled="status===0">重置</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-col>
    <!-- 说明 -->
    <el-col v-if="status == 0">
      <div class="operation-desc">
        <div class="description text-center">模板操作说明</div>
      </div>
    </el-col>
    <!--列表 start-->
    <el-table :data="list" highlight-current-row v-loading="visible.listLoading">
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="" label="智能物联网关名称"></el-table-column>
      <el-table-column prop="" label="智能物联网关编号"></el-table-column>
      <el-table-column prop="status" label="管理设备配置状态">
        <template slot-scope="scope">
          <span :class="{'color-active': parseInt(scope.row.status) === 1}">{{ getStatusName(scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="medium" @click="handleDevice(scope.row)">配置管理设备</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--列表 end-->

    <!--分页start -->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="total, sizes, prev, pager ,next" :page-size="filters.pageSize" :total="filters.total" @current-change="handlePageChange" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>
    <!--分页end -->
    <!-- 配置管理设备 -->
    <device-config :visible.sync="visible.DeviceLoading"></device-config>
  </section>
</template>
<script>
import utils from "../../common/js/utils";
import deviceConfig from "./components/DeviceConfig.vue";
import {
  queryWorkShopOrProcess,
  importWorkShopOrProcess,
  downloadExcelUrl,
  importWorkShopOrProcessUrl
} from "../../api/api";
export default {
  data() {
    return {
      status: 1,
      filters: {
        page: 1,
        pageSize: 10,
        keyword: "",
        total: 0
      },
      configStatusList: [
        { label: "全部智能物联网关", value: "all" },
        { label: "未配置管理设备", value: "0" },
        { label: "已配置管理设备", value: "1" }
      ],
      fileList: [],
      importWorkShopOrProcessUrl: importWorkShopOrProcessUrl,
      visible: {
        listLoading: false,
        DeviceLoading: false
      },
      list: []
    };
  },
  components: { deviceConfig },
  mounted() {
    this.handleDevice();
  },
  methods: {
    // 列表索引
    getIndex(index) {
      return utils.getHeadNumAdapter(
        this.filters.page,
        this.filters.pageSize,
        index
      );
    },
    getList() {},
    // 下载
    handleDownload() {
      utils.downloadFile(downloadExcelUrl + "?type=workshop");
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
            importWorkShopOrProcess(form).then(res => {
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
    // 配置管理设备
    handleDevice(val) {
      console.log(val);
      this.visible.DeviceLoading = true;
    },
    // 文件改变就开始上传
    handleFileChange(file, fileList) {
      this.fileList = [file];
      this.handleImport();
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
    reset() {
      this.filters = {
        page: 1,
        pageSize: 10,
        keyword: "",
        total: 0
      };
      this.getList();
    }
  }
};
</script>
<style scoped lang="scss">
.operation-desc {
  display: flex;
  align-items: center;
  justify-content: center;
  .description {
    width: 800px;
    height: 300px;
    line-height: 300px;
    margin-top: 100px;
    background-color: #eee;
    border: 1px solid #ccc;
  }
}
</style>

