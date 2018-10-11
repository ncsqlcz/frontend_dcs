<!-- 刘川中 2018.3.29 -->
<template>
  <el-dialog :title="title || '详细信息' " :visible.sync="visible" class="mes-dialog" width="45%">
    <!--详情 start-->
    <div class="detail-table">
      <div class="w-100 detail-table-row"
        v-for="(value, index) in getLoopTimes"
        :key="index"
      >
        <div class="w-50 detail-table-item">
          <p class="th-name">{{ table.props[value] }}</p>
          <p class="td-value">{{ table.values[value] }}</p>
        </div>
        <div class="w-50 detail-table-item">
          <p class="th-name">{{ table.props[value + 1] }}</p>
          <p class="td-value">{{ table.values[value + 1] }}</p>
        </div>
      </div>
    </div>
    <!--详情 end-->
  </el-dialog>
</template>

<script>
  export default {
    name: 'basic-info-table',
    data () {
      return {
        visible: false,
        title: '',
        table: {
          props: [],
          values: []
        }
      }
    },
    computed: {
      getLoopTimes () {
        let arr = []
        this.table.props.forEach((item, index) => {
          if (index % 2 === 0) {
            arr.push(index)
          }
        })
        return arr
      }
    },
    mounted () {
    },
    methods: {
    },
    watch: {
    }
  }
</script>

<style scoped lang="scss">

</style>
