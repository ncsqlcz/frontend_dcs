/*
 * @Author: liucz 
 * @Date: 2018-09-29 10:32:18 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-29 16:29:15
 */
<template>
  <el-dialog :visible.sync="dialogVisible"
             class="mes-dialog"
             title="冗余拓扑图"
             width="80%">
    <div v-loading="dataLoading">
      <div ref="topoChart"
           class="w-100"
           style="height: 600px"></div>
    </div>

    <div slot="footer">
      <el-button type=""
                 size="medium"
                 @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import utils from '@/common/js/utils'
import loadjs from '@/common/js/loadjs'
import {} from '@/api/api'
export default {
  name: 'DeviceTopoDialog',
  data() {
    return {
      dialogVisible: false,
      chart: null,
      dataLoading: true,
      allDevices: null
    }
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      required: true
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initChart()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  mounted() {},
  methods: {
    // 初始化图表
    initChart() {
      // 加载echartsjs
      loadjs('echarts').then(() => {
        this.chart = echarts.init(this.$refs.topoChart)
        this.initChartData(this.data)
      })
    },
    // 初始化数据
    initChartData(data) {
      let result = (this.allDevices = this.getData(data))
      let links = this.getLinks(data, result)
      let option = {
        series: {
          type: 'sankey',
          layout: 'none',
          data: result,
          links: links,
          draggable: true,
          label: {
            position: 'right',
            offset: [-50, 0],
            formatter(value) {
              let str = `
                  ${value.data.device_id}
                  ${value.data.device_name}
                  ${value.data.device_number}
                `
              return str
            },
            normal: {
              position: 'right',
              offset: [-50, 0],
              formatter(value) {
                let str = `
                  ${value.data.device_id}
                  ${value.data.device_name}
                  ${value.data.device_number}
                `
                return str
              }
            }
          }
        }
      }
      this.chart.setOption(option)
      this.dataLoading = false
    },
    // 根据id，获取name
    getNameById(id) {
      let index = this.allDevices.findIndex(item => {
        return item.device_id === id
      })
      return this.allDevices[index].name
    },
    getData(data) {
      let allDevices = []
      data.forEach((arr, idx) => {
        arr.forEach(item => {
          item.pIndex = idx // 建立索引
        })
        // 转换为一维数组（可能会有重复数据）
        allDevices = [...allDevices, ...arr]
      })
      allDevices = utils.uniqArrByKey(allDevices, 'device_id')

      allDevices.forEach((item, idx) => {
        item.name = idx + 1 + ''
      })
      return allDevices
    },
    // 拓扑关系
    getLinks(data, result) {
      let [links, len] = [[], data.length]
      data.forEach((item, idx) => {
        if (item.length > 1) {
          let link = {
            source: this.getNameById(item[0].device_id),
            target: this.getNameById(item[1].device_id),
            value: 1
          }
          links.push(link)
        }
      })
      return links
    }
  }
}
</script>

<style scoped>
</style>