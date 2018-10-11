<template>
     <el-row class="transparent">
              <el-col :span="24" class="title-name mt-1 color-999">新增设备</el-col>
              <el-col :span="24">
                  <div class="flex-wrap">
                      <el-card class="perspective-card mr-2 mt-1" v-for="(item,index) in list" :key="index">
                          <div  class="pb-1" style="border-bottom:1px solid #eee">
                              <span>{{item.device_title}}</span>
                              <el-badge value="new" class="item py-1" style="float: right;">
                              </el-badge>
                          </div>
                          <div class="cen">
                              <div v-for="value in item.divice_number" :key="value" class="text item">
                                  <span class="mr-2">设备编号:</span>{{value}}
                              </div>
                          </div>
                          <div  class="bTop clearfix">
                              <el-col class="clearfix" type="flex" justify="space-between" >
                                  <el-col :span="10" class="text-left" >
                                      <el-dropdown size="small" trigger="click">
                                          <el-button type="primary" round  plain>
                                          参数管理<i class="el-icon-caret-bottom el-icon--right"></i>
                                          </el-button>
                                          <el-dropdown-menu slot="dropdown">
                                          <el-dropdown-item @click="handleDownload">导出excel</el-dropdown-item>
                                          <el-dropdown-item>
                                            <el-upload
                                              class="upload"
                                              :action="importWorkShopOrProcessUrl"
                                              :on-change="handleFileChange"
                                              :file-list="fileList"
                                              :show-file-list="false"
                                              :auto-upload="false"
                                              :multiple="false"
                                              accept=".xlsx, .xls">
                                              <el-tooltip class="item" effect="dark" content="仅支持.xlsx 和 .xls" placement="bottom">
                                                <span> 导入excel</span>
                                              </el-tooltip>
                                            </el-upload>
                                          </el-dropdown-item>
                                          </el-dropdown-menu>
                                      </el-dropdown>
                                  </el-col>
                                  <el-col :span="8" style="float:right;width:45%;" >
                                      <el-button type="primary" round  plain disabled  v-if="item.status==0" style="margin-bottom:10px;">
                                          查看参数 <i class="el-icon--right"></i>
                                      </el-button>
                                      <el-button type="primary" round  plain   v-else style="margin-bottom:10px" @click="WatchPara">
                                          查看参数 <i class="el-icon--right"></i>
                                      </el-button>
                                  </el-col>
                              </el-col>
                              <el-col :span="8" :offset="8" class="mt-2">
                                  <el-button type="primary" round plain disabled  v-if="item.status==0" >
                                      访问配置 <i class="el-icon--right"></i>
                                  </el-button>
                                  <el-button type="primary" round  v-else @click.prevent="AccessConfiguration">
                                      访问配置 <i class="el-icon--right"></i>
                                  </el-button> 
                            </el-col>
                          </div>
                      </el-card>
                  </div>
              </el-col>
              <!-- 设备参数 -->
              <device-para  :visible.sync="visible.ParaLoading"></device-para>
          </el-row>
</template>
<script>
import devicePara from "./DevicePara.vue";
import {
  queryWorkShopOrProcess,
  importWorkShopOrProcess,
  downloadExcelUrl,
  importWorkShopOrProcessUrl
} from "../../../api/api";
export default {
  data() {
    return {
      visible: {
        ParaLoading: false
      },
      fileList: [],
      importWorkShopOrProcessUrl: importWorkShopOrProcessUrl,
    };
  },
  props: {
    list: {
      type: Array
    }
  },
  methods: {
    WatchPara() {
        console.log(111)
      //   this.$emit('Watch',true)
      this.visible.ParaLoading = true;
    },
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
    // 文件改变就开始上传
    handleFileChange(file, fileList) {
      this.fileList = [file];
      this.handleImport();
    },
  },
  components: { devicePara }
};
</script>
<style>
.el-badge__content.is-fixed {
  position: absolute;
  top: 11px;
  -webkit-transform: translateY(-50%) translateX(100%);
  transform: translateY(-50%) translateX(100%);
}
</style>


<style lang="scss" scoped>
.bTop {
  border-top: 1px solid #eee;
  padding-top: 10px;
}
.cen {
  padding: 15px 0px;
}
.clearfix:after {
  content: "";
  display: block;
  clear: both;
  visibility: hidden;
  height: 0;
}
.perspective-card {
  width: 270px;
  overflow: hidden;
}
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