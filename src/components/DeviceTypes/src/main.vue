/*
 * @Author: liucz 
 * @Date: 2018-09-25 09:28:09 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-25 11:44:10
 */
<template>
  <el-dialog :title="title || '选择设备类型' " :visible.sync="visible" class="mes-dialog" width="40%">
    <el-row>
      <el-col class="toolbar">
        <el-form :inline="true" :model="params" @submit.native.prevent class="text-right">
          <el-form-item>
            <el-select v-model="value4" clearable placeholder="请选择">
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model.trim="params.keyword" placeholder="请输入设备类型关键字" clearable @clear="getList" @keyup.native.enter="getList" size="small">
              <el-button slot="append" icon="el-icon-search" @click.native="getList"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item>
            <!-- <el-button type="primary" @click.native="getList" icon="el-icon-search" size="small">查询</el-button> -->
            <el-button size="medium" @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <!-- 列表 start -->
    <el-row class="mt-0" style="min-height: 92px;" v-loading="listLoading">
      <table class="w-100 hidden">
        <tbody>
          <tr>
            <td v-for="(item, idx) in list" :key="idx" class="text-center pointer"> {{ item.device_type_name }} </td>
          </tr>
        </tbody>
      </table>

      <ul class="flex-wrap w-100">
        <li v-for="(item, idx) in searchList" :key="idx" class="w-33 text-center pointer" :class="{'active': selectedIdList.includes(item.device_type_id)}" @click="handleSelect(item)"> {{ item.device_type_name }} </li>

        <li v-show="searchList.length === 0" class="w-100 color-999 text-center no-data">暂无数据</li>
      </ul>
    </el-row>
    <!-- 列表 end -->

    <div class="clearfix mt-3 footer">
      <!--确认选择 start-->
      <el-col :span="24" class="text-right" v-if="multiple">
        <el-button type="success" size="medium" @click="confirmSelected" :__disabled="!selectedRows || selectedRows.length === 0">确认选择</el-button>
      </el-col>
      <!--确认选择 end-->
    </div>
  </el-dialog>
</template>

<script>
import utils from "@/common/js/utils";
import { queryDeviceType } from "@/api/api";
export default {
  name: "device-types",
  data() {
    return {
      params: {
        warnUnitTypeId: "", // 预警单元id
        keyword: ""
      },
      filters: {
        page: 1,
        pageSize: 99999,
        total: 0
      },
      action: "", // 动作
      visible: false,
      selectedRows: null,
      list: [],
      listLoading: false,
      callback: null,
      title: "",
      multiple: false,
      selectedIds: []
    };
  },
  computed: {
    searchList() {
      let arr = this.list.filter(item => {
        return item.device_type_name.indexOf(this.params.keyword) > -1;
      });
      return arr;
    },
    selectedIdList() {
      if (this.selectedRows) {
        return this.selectedRows.map(v => v.device_type_id);
      } else {
        return [];
      }
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    // 选择
    handleSelect(item) {
      this.selectedRows = this.selectedRows || [];
      let idx = this.selectedRows.findIndex(v => {
        return item.device_type_id === v.device_type_id;
      });
      if (this.multiple) {
        idx > -1
          ? this.selectedRows.splice(idx, 1)
          : this.selectedRows.push(item);
      } else {
        this.confirmSelected(item);
      }
    },
    // 确认选择
    confirmSelected(row) {
      this.visible = false;
      if (!this.multiple) {
        // 选择单行
        this.selectedRows = [row];
      }
      this.handleAction("selected");
    },
    handleAction(action) {
      this.action = action;
      // 手动触发instance的回调，用以resolve
      setTimeout(() => {
        if (this.action) this.callback(this.action, this);
      }, 0);
    },
    // 获取数据列表
    async getList() {
      // this.listLoading = true
      let para = Object.assign({}, this.filters, this.params);
      let res = await queryDeviceType(para);
      if (res.status === 0) {
        this.filters.total = res.map.line;
        this.list = res.map.deviceTypeDOs;
        this.checkSelectedIds();
      } else {
        this.filters.total = 0;
        this.list = [];
      }
      // this.listLoading = false
    },
    reset() {
      this.params.keyword = "";
      this.filters = {
        page: 1,
        pageSize: 10,
        total: 0
      };
      this.getList();
    },
    // 初始选择的行
    checkSelectedIds() {
      this.selectedRows = [];
      this.selectedIds.forEach(id => {
        let index = this.list.findIndex(item => {
          return item.device_type_id === id;
        });
        if (index > -1) {
          this.selectedRows.push(this.list[index]);
        }
      });
    },
    // 页码改变
    handlePageChange(val) {
      this.filters.page = val;
      this.getList();
    },
    // 每页数量改变
    handleSizeChange(val) {
      this.filters.pageSize = val;
      this.getList();
    }
  },
  watch: {}
};
</script>

<style scoped lang="scss">
@import "~scss_vars";
ul.flex-wrap {
  list-style: none;
  margin: 0 0;
  padding: 0 0;
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
  li {
    box-sizing: border-box;
    padding: 0.8rem;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    // 每行最后一个
    &:nth-child(3n) {
      border-right: none;
    }
    &.active {
      // border: 1px solid $color-active;
      background-color: $color-active;
      color: #fff;
      &:hover {
        background-color: mix(#fff, $color-active, 10%) !important;
      }
    }
    &:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
    &.no-data:hover {
      background-color: transparent;
      cursor: default;
    }
  }
}
.footer {
  margin-bottom: -0.8rem;
}
</style>
