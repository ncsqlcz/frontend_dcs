<template>
  <el-dialog title="选择设备" :visible.sync="DeviceVisible" width="50%">
    <el-row>
      <el-col class="toolbar">
        <el-form :inline="true" :model="filters" @submit.native.prevent class="text-right">
          <el-form-item>
            <el-select v-model="filters.type" placeholder="全部设备类型" size="small"></el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model.trim="filters.keyword" placeholder="请输入设备名称、编号、类型关键字" clearable @clear="getList" @keyup.native.enter="getList" size="small">
              <el-button slot="append" icon="el-icon-search" @click.native="getList"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small">完成</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <!-- 列表开始 -->
    <el-table :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="index" :index="getIndex" label="序号" width="60"></el-table-column>
      <el-table-column prop="name" label="设备名称"></el-table-column>
      <el-table-column prop="number" label="设备编号"></el-table-column>
      <el-table-column prop="type" label="设备类型"></el-table-column>
      <el-table-column  label="全选">
        <!-- <template> -->
          <el-table-column type="selection" width="55">
            <span>选择</span>
          </el-table-column>
        <!-- </template> -->
      </el-table-column>
    </el-table>
    <!-- 列表完成 -->
  </el-dialog>
</template>
<script>
import utils from "../../../common/js/utils.js";
export default {
  data() {
    return {
      DeviceVisible: false,
      filters: {
        type:'',
        keyword: "",
        page: 1,
        pageSize: 10,
        total: 0
      },
      checked: false,
      list: [
        {
          name: 1,
          number: 2,
          type: 10
        },
         {
          name: 1,
          number: 2,
          type: 10
        },
         {
          name: 1,
          number: 2,
          type: 10
        }
      ]
    };
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible(val) {
      this.DeviceVisible = val;
    },
    DeviceVisible(val) {
      this.$emit("update:visible", val);
    }
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
    getList(){

    },
    handleSelectionChange(val){
      console.log(val)
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

