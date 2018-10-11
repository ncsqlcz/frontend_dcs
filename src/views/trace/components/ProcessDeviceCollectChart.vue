<template>
	<section class="h-100">
    <el-col class="device-chart h-100">
      <div class="bar-chart-wrap h-100">
        <div ref="barChart" class="w-100 h-100"></div>
      </div>
    </el-col>
	</section>
</template>

<script>
import loadjs from '@/common/js/loadjs'
export default {
  name: 'process-device-collect-chart',
  data () {
    return {
      echartsjsLoaded: false,
      barChart: null
    }
  },
  props: ['parameter', 'resize'],
  components: {},
  watch: {
    parameter (newVal) {
      this.initChartData(newVal)
    },
    resize () {
      this.barChart.resize()
    }
  },
  computed: {
  },
  created () {
    // 加载echartsjs
    loadjs('echarts').then(() => {
      this.echartsjsLoaded = true
      this.barChart = echarts.init(this.$refs.barChart)
      this.initChartData(this.parameter)
    })
  },
  mounted () {
  },
  methods: {
    initChartData (data) {
      if (!this.echartsjsLoaded) return
      data = data || []
      let xData = []
      let values = []
      data.forEach(item => {
        xData.push(item.time)
        values.push(item.value)
      })
      this.barChart.setOption({
        xAxis: {
          data: xData
        },
        // animation: false,
        yAxis: {},
        grid: {
          left: '5%',
          top: '6%',
          right: '0%',
          bottom: '10%'
        },
        series: [{
          type: 'line',
          data: values
        }]
      })
    }
  }
}
</script>


<style scoped lang="scss">
  .device-chart {
    position: relative;
    min-height: 300px;
    .bar-chart-wrap {
      position: absolute;
      z-index: 2;
      right: 0;
      /*top: -45px;*/
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
</style>
