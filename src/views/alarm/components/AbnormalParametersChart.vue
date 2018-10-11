/*
 * @Author: liucz
 * @Date: 2018-06-19 15:30:58
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-29 15:38:41
 */
<template>
  <el-row class="alarm-chart-section p-3">
    <slot name="top"></slot>
    <el-col :span="24"
            class="bar-chart-container">
      <div class="bar-chart-wrap h-100">
        <div ref="lineChart"
             class="w-100 h-100 bar-chart"></div>
      </div>
    </el-col>
    <slot name="bottom"></slot>
  </el-row>
</template>

<script>
import loadjs from '@/common/js/loadjs'
import utils from '../../../common/js/utils'

export default {
  name: 'Abnormal-Parameters-Chart',
  data() {
    return {
      echartsjsLoaded: false,
      lineChart: null,
      options: [],
      colorList: [],
      filters: {},
      visible: {
        listLoading: false
      },
      list: [],
      markPointData: []
    }
  },
  props: {
    title: String,
    parameter: {
      type: Object,
      required: true,
      default: {
        // parameter_name: '温度',
        // parameter_unit: '℃',
        // parameter_up: 20,
        // parameter_down: 10,
        // data: [
        //   {time: '2018-06-19 16:05:06', value: 45.12}
        // ]
      }
    },
    reRender: Number,
    resize: Number
  },
  computed: {},
  created() {
    // 加载echartsjs
    loadjs('echarts').then(() => {
      this.echartsjsLoaded = true
      this.lineChart = echarts.init(this.$refs.lineChart)
      this.initChartData(this.parameter)
    })
  },
  mounted() {},
  methods: {
    initChartData(parameter) {
      if (!this.echartsjsLoaded) return
      // console.log(parameter, this.lineChart)
      parameter.parameter_up = parseFloat(parameter.parameter_up)
      parameter.parameter_down = parseFloat(parameter.parameter_down)
      parameter.data.forEach(item => {
        item.value = parseFloat(item.value)
      })
      let markLineStyle = {
        color: '#ff0000',
        width: 1,
        opacity: 0.5,
        normal: {
          color: '#ff0000',
          width: 1,
          opacity: 0.5
        }
      }
      this.lineChart.setOption({
        xAxis: {
          data: this.parameter.data.map(v => v.time),
          axisTick: { show: false },
          axisLabel: {
            interval: 0
            // rotate: -50
          }
        },
        yAxis: {
          type: 'value',
          name: this.parameter.parameter_name,
          axisLabel: {
            formatter: '{value}' + (this.parameter.parameter_unit || '°C')
          },
          axisTick: { show: false },
          splitLine: { show: false }
        },
        // 设置区域缩放
        dataZoom: [
          {
            // 结束位置的百分比，0 - 100
            end: 20
          },
          {
            type: 'inside'
          }
        ],
        tooltip: {
          trigger: 'axis'
          // formatter: (e) => {
          //   // console.log(e)
          //   let timeHtml = ''
          //   if (e.componentType === 'markPoint') {
          //     timeHtml = `<p>时间: ${this.markPointData[e.dataIndex].time}</p>`
          //     } else if (e.componentType === 'series') {
          //     timeHtml = `<p>时间: ${this.parameter.data[e.dataIndex].time}</p>`
          //   }
          //   let limitHtml = ''
          //   if (e.value > this.parameter.parameter_up) {
          //     limitHtml = `<p>超出上限: ${utils.sub(e.value, this.parameter.parameter_up)}</p>`
          //   }
          //   if (e.value < this.parameter.parameter_down) {
          //     limitHtml = `<p>超出下限: ${utils.sub(this.parameter.parameter_down, e.value)}</p>`
          //   }
          //   return `
          //     ${timeHtml}
          //     <p>${this.parameter.parameter_name}: ${e.value}</p>
          //     ${limitHtml}
          //   `
          // },
          // // position: [500, 10],
          // triggerOn: 'mousemove'
        },
        grid: {
          top: '10%',
          left: '5%',
          bottom: '35%',
          right: '5%'
        },
        series: [
          {
            type: 'line',
            name: this.parameter.parameter_name,
            data: this.parameter.data,
            markPoint: {
              data: this.getMarkPointData(this.parameter.data)
            },
            itemStyle: {
              normal: {
                color: '#00CCFF'
              },
              color: '#00CCFF'
            }
          },
          {
            name: '参数下限',
            type: 'line',
            markPoint: {},
            markLine: {
              data: [
                { name: '参数下限', yAxis: this.parameter.parameter_down }
              ],
              lineStyle: markLineStyle
            }
          },
          {
            name: '参数上限',
            type: 'line',
            markPoint: {},
            markLine: {
              data: [{ name: '参数下限', yAxis: this.parameter.parameter_up }],
              lineStyle: markLineStyle
            }
          }
        ]
      })
    },
    // 超过上下限，会标注出来
    getMarkPointData(data) {
      let arr = []
      data.forEach((item, index) => {
        if (
          item.value > this.parameter.parameter_up ||
          item.value < this.parameter.parameter_down
        ) {
          arr.push({
            name: '超出界限',
            value: item.value,
            xAxis: index,
            yAxis: item.value,
            itemStyle: {
              normal: {
                color: '#ff6666'
              },
              color: '#ff6666'
            }
          })
          this.markPointData.push(item)
        }
      })
      return arr
    }
  },
  watch: {
    refresh(val) {},
    resize(val) {
      this.lineChart.resize()
    },
    parameter(val) {}
  }
}
</script>

<style scoped lang="scss">
.alarm-chart-section {
  position: relative;
  h2 {
    margin: 0 0;
    margin-top: 75px;
  }
  .bar-chart-container {
    position: relative;
    .bar-chart-wrap {
      .bar-chart {
        min-height: 400px;
      }
    }
  }
}
</style>
