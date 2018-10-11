/*
 * @Author: liucz 
 * @Date: 2018-06-20 17:38:05 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-29 15:39:59
 */
<template>
  <section class="alarm-chart-section h-100"
           style="padding-bottom: 56px;">
    <slot name="top"></slot>
    <el-row class="h-100">
      <el-col :span="24"
              class="bar-chart-container h-100">
        <div class="bar-chart-wrap h-100">
          <div ref="lineChart"
               class="w-100 h-100"></div>
        </div>
      </el-col>
    </el-row>

    <el-row class="color-wrap">
      <el-col :span="24"
              class="bar-chart-container p-2">
        <!-- 报警颜色组件 -->
        <alarm-color @loaded=""></alarm-color>
      </el-col>
    </el-row>
  </section>
</template>

<script>
import loadjs from '@/common/js/loadjs'
import utils from '../../../common/js/utils'
import { mapGetters, mapActions } from 'vuex'
import AlarmColor from './AlarmColor.vue'
export default {
  name: 'Device-Collect-Data-Chart',
  data() {
    return {
      echartsjsLoaded: false,
      lastTime: '1',
      lineChart: null,
      options: [],
      parameterId: '',
      isInitLevel: true,
      levelData: {},
      dataZoomStart: 80,
      zoomFlag: false
    }
  },
  props: {
    title: String,
    resize: Number,
    data: {
      type: Object,
      default: () => {
        return {
          x: [],
          y: [],
          parameterUnit: ''
        }
      }
    },
    level: {
      type: Object,
      default: () => {
        return null
        // {"L1":"60.5","L2":"70.5","L3":"80.5","L4":"90.5","L5":"100.5","U1":"50.5","U2":"40.5","U3":"30.5","U4":"20.5","U5":"10.5"}
      }
    }
  },
  components: { AlarmColor },
  computed: {
    ...mapGetters(['getAlarmColorList', 'getAlarmColorDict'])
  },
  created() {
    // 加载echartsjs
    loadjs('echarts').then(() => {
      this.echartsjsLoaded = true
      this.lineChart = echarts.init(this.$refs.lineChart)
      let timer = null

      // 拖放dataZoom的事件
      this.lineChart.on('datazoom', val => {
        this.zoomFlag = true
        // console.log(val)
        this.dataZoomStart = val.start
        if (this.dataZoomStart < 30) {
          this.dataZoomStart = 30
        }
        clearTimeout(timer)
        timer = setTimeout(() => {
          this.zoomFlag = false
        }, 500)
      })
    })
  },
  mounted() {},
  methods: {
    ...mapActions(['initAlarmColorList', 'getEmptyLevelData']),
    initChartData() {
      if (!this.echartsjsLoaded || this.zoomFlag) return
      // if (!this.data || !this.data.x || this.data.x.length === 0) return

      // X轴数据 - 时间
      let xAxisData = this.data.x

      // this.levelData = this.level
      // levelData = {"L5":'',"L4":'230',"L3":'',"L2":'',"L1":'150',"U1":50,"U2":'',"U3":'',"U4":'',"U5":'1'}

      // 转换成数组, 数组才有顺序
      let levelDataList = this.getLevelDataList(this.levelData)

      // console.log(this.levelData, levelDataList)

      let colorList = []
      let yAxisSeries = []

      // 处理上限
      for (let i = 0; i < levelDataList.LArr.length; i++) {
        let item = levelDataList.LArr[i]
        let series = {
          name:
            item.name +
            '-' +
            this.getAlarmColorDict['L' + item.level.split('')[1]].label, // yname必须唯一哦
          type: 'line',
          level: item.name,
          levelName: item.level,
          areaColor: this.getAlarmColorDict['L' + item.level.split('')[1]]
            .color,
          markArea: {
            silent: true,
            data: null,
            itemStyle: {
              color: this.getAlarmColorDict['L' + item.level.split('')[1]]
                .color,
              normal: {
                color: this.getAlarmColorDict['L' + item.level.split('')[1]]
                  .color
              }
            }
          }
        }
        if (i === 0) {
          series.markArea.data = [[{ yAxis: 'min' }, { yAxis: item.value }]]
        } else {
          let lastItem = levelDataList.LArr[i - 1]
          series.markArea.data = [
            [{ yAxis: lastItem.value }, { yAxis: item.value }]
          ]
        }
        yAxisSeries.push(series)
      }

      // 处理下限
      for (let i = 0; i < levelDataList.UArr.length; i++) {
        let item = levelDataList.UArr[i]
        let series = {
          name:
            item.name +
            '-' +
            this.getAlarmColorDict['L' + item.level.split('')[1]].label, // yname必须唯一哦
          type: 'line',
          level: item.name,
          levelName: item.level,
          areaColor: this.getAlarmColorDict['L' + item.level.split('')[1]]
            .color,
          markArea: {
            silent: true,
            data: null,
            itemStyle: {
              color: this.getAlarmColorDict['L' + item.level.split('')[1]]
                .color,
              normal: {
                color: this.getAlarmColorDict['L' + item.level.split('')[1]]
                  .color
              }
            }
          }
        }
        if (i === 0) {
          series.markArea.data = [[{ yAxis: 'max' }, { yAxis: item.value }]]
        } else {
          let lastItem = levelDataList.UArr[i - 1]
          series.markArea.data = [
            [{ yAxis: lastItem.value }, { yAxis: item.value }]
          ]
        }
        yAxisSeries.push(series)
      }

      // 区域的颜色列表
      colorList = yAxisSeries.map(v => v.areaColor)
      // console.log(yAxisSeries, colorList)

      let option = {
        title: {
          // text: '设备阶段故障统计',
          // left:'50%',
          // top:'5%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'cross',
            lable: {},
            formatter: value => {
              return value + this.data.parameterUnit
            }
          }
        },
        // 设置区域缩放
        dataZoom: [
          {
            // 开始位置的百分比，0 - 100
            start: this.dataZoomStart > 50 ? this.dataZoomStart : 50
          },
          {
            type: 'inside'
          }
        ],
        color: colorList,
        grid: {
          top: '0%',
          right: '60px',
          bottom: '70px',
          left: '0%',
          containLabel: false
        },
        xAxis: {
          // nameLocation:'center',
          type: 'category',
          // boundaryGap: true,
          data: xAxisData,
          show: true,
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            interval: 0
            // rotate: -50
          }
        },
        yAxis: {
          // nameGap:35,
          // name:'',
          // min: function (value) {
          //   if (levelDataList.UArr.length > 0) {
          //     let min = levelDataList.UArr[0].value - (value.max - value.min) / levelDataList.UArr.length
          //     return value.min > min ? min : value.min - (value.max - value.min) / levelDataList.UArr.length
          //   }
          // },
          // max: function (value) {
          //   if (levelDataList.LArr.length > 0) {
          //     let max = levelDataList.LArr[0].value + (value.max - value.min) / levelDataList.LArr.length
          //     return value.max < max ? max : value.max + (value.max - value.min) / levelDataList.LArr.length
          //   }
          // },
          // splitNumber: 10,
          type: 'value',
          // axisLabel : {
          //   formatter : '{value}' + this.data.parameterUnit,
          // },
          axisTick: { show: false },
          splitLine: { show: false },
          show: false
        },
        series: [
          ...yAxisSeries,
          {
            data: this.data.y,
            type: 'line',
            itemStyle: {
              normal: {
                color: '#00CCFF'
              },
              color: '#00CCFF'
            },
            markPoint: {
              data: this.getMarkPointData(this.data.y)
            }
          }
        ]
      }
      this.lineChart.setOption(option)
    },
    // 转换成数组
    getLevelDataList(levelData) {
      let arr = []
      let LArr = [] // 上限数组
      let UArr = [] // 下限数组
      // 排序，从大到小
      Object.entries(levelData).forEach(([key, value]) => {
        let index = -1
        let name = ''
        if (key.toUpperCase().indexOf('L') > -1) {
          switch (key.toUpperCase()) {
            case 'L5':
              name = 'L5'
              index = 0
              break
            case 'L4':
              name = 'L4'
              index = 1
              break
            case 'L3':
              name = 'L3'
              index = 2
              break
            case 'L2':
              name = 'L2'
              index = 3
              break
            case 'L1':
              name = 'L1'
              index = 4
              break
          }
          LArr[index] = {
            name: name,
            level: key,
            value: value
          }
        } else {
          switch (key.toUpperCase()) {
            case 'U1':
              name = 'U1'
              index = 4
              break
            case 'U2':
              name = 'U2'
              index = 3
              break
            case 'U3':
              name = 'U3'
              index = 2
              break
            case 'U4':
              name = 'U4'
              index = 1
              break
            case 'U5':
              name = 'U5'
              index = 0
              break
          }
          UArr[index] = {
            name: name,
            level: key,
            value: value
          }
        }
      })

      for (let i = 0; i < LArr.length; i++) {
        // 去除没有value的数据
        if (LArr[i].value === '') {
          LArr.splice(i, 1)
          i--
        }
      }
      for (let i = 0; i < UArr.length; i++) {
        // 去除没有value的数据
        if (UArr[i].value === '') {
          UArr.splice(i, 1)
          i--
        }
      }
      return {
        LArr: LArr,
        UArr: UArr
      }
    },
    // 获取标注的点配置
    getMarkPointData(data) {
      let arr = []
      data.forEach((item, index) => {
        // 超出异常才标注出来
        if (item > this.level.L1 || item < this.level.U1) {
          arr.push({
            name: '参数值',
            value: item,
            xAxis: index,
            yAxis: item,
            itemStyle: {
              normal: {
                color: '#ff6666'
              },
              color: '#ff6666'
            }
          })
        }
      })
      return arr
    }
  },
  watch: {
    data(val) {
      if (!this.isInitLevel) {
        this.initChartData()
      }
    },
    level(val) {
      this.isInitLevel = true
      this.getEmptyLevelData().then(emptyLevelData => {
        // 加上没有的字段
        this.levelData = Object.assign({}, emptyLevelData, val)
        this.initChartData()
        this.isInitLevel = false
      })
    },
    resize(val) {
      this.lineChart.resize()
    }
  }
}
</script>

<style scoped lang="scss">
.alarm-chart-section {
  .bar-chart-wrap {
    & > div {
      min-height: 530px;
    }
  }
}
.color-wrap {
  float: left;
}
</style>
