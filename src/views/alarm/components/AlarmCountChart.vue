/*
 * @Author: liucz
 * @Date: 2018-06-15 11:00:50
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-29 15:39:09
 */
<template>
  <section class="text-center alarm-chart-section">
    <el-col :span="titlePosition === 'left' ? 6 : 24"
            :class="{'mt-75': titlePosition === 'left'}">
      <h2>{{ total }}</h2>
      <span>{{ title }}</span>
    </el-col>
    <el-col :span="titlePosition === 'left' ? 18 : 24"
            class="bar-chart-container">
      <div class="bar-chart-wrap">
        <div ref="barChart"
             class="w-100 h-100"></div>
      </div>
    </el-col>
  </section>
</template>

<script>
import loadjs from '@/common/js/loadjs'
import utils from '../../../common/js/utils'
import { mapGetters } from 'vuex'
export default {
  name: 'Alarm-Count-Chart',
  data() {
    return {
      echartsjsLoaded: false,
      barChart: null,
      total: 0,
      options: [],
      colorList: []
    }
  },
  props: {
    title: String,
    titlePosition: {
      type: String,
      default: 'left'
    },
    data: {
      type: Object,
      required: true,
      default: () => {
        return {
          L2: 0,
          L3: 0,
          L4: 0,
          L5: 0
        }
      }
    },
    resize: Number
  },
  computed: {
    ...mapGetters(['getAlarmColorList'])
  },
  created() {
    // 加载echartsjs
    loadjs('echarts').then(() => {
      this.echartsjsLoaded = true
      this.barChart = echarts.init(this.$refs.barChart)
      this.initChartData(this.data)
    })
  },
  mounted() {},
  methods: {
    initChartData(data) {
      if (!this.echartsjsLoaded) return
      this.colorList = this.getAlarmColorList.map(v => v.color).reverse()
      this.colorList.shift()

      this.total = 0
      let xNames = []
      let xNameValues = []
      Object.entries(data).forEach(([key, value]) => {
        xNames.push(key)
        this.total += parseInt(value)
        xNameValues.push(parseInt(value))
      })

      this.barChart.setOption({
        // tooltip: {},
        legend: {
          // data:[this.title]
        },
        xAxis: {
          data: xNames,
          axisTick: {
            show: false
          }
        },
        yAxis: {
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          },
          interval: 0
        },
        grid: {
          top: '10%',
          right: '0%',
          bottom: '10%',
          left: '0%'
        },
        series: [
          {
            name: '',
            type: 'bar',
            data: xNameValues,
            itemStyle: {
              color: params => {
                return this.colorList[params.dataIndex]
              },
              label: {
                show: true,
                position: 'top'
              },
              normal: {
                color: params => {
                  return this.colorList[params.dataIndex]
                },
                label: {
                  show: true,
                  position: 'top'
                }
              }
            }
          }
        ]
      })
    }
  },
  watch: {
    data: {
      handler: function(data) {
        if (data) {
          this.initChartData(data)
        }
      },
      deep: true
    },
    resize(val) {
      this.barChart.resize()
    }
  }
}
</script>

<style scoped lang="scss">
.alarm-chart-section {
  height: 160px;
  h2 {
    margin: 0 0;
  }
  .mt-75 {
    margin-top: 75px !important;
  }
  .bar-chart-container {
    position: relative;
    height: 230px;
    .bar-chart-wrap {
      position: absolute;
      z-index: 2;
      right: 0;
      // top: -45px;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
}
</style>
