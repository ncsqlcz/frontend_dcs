<template>
  <section>
    <div v-for="item in getAlarmTypeList" :key="item.value" class="alarm-type">
      <span class="color-666">{{ item.label }}: </span>
      <i :style="{backgroundColor: getAlarmColor}"></i>
    </div>
  </section>
</template>

<script>
  import utils from './../../../common/js/utils'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    name: 'Process-Alarm',
    data () {
      return {
        barChart: null,
        total: 0,
        options: [],
        colorList: []
      }
    },
    props: {},
    computed: {
      ...mapGetters(['getAlarmColorList', 'getAlarmTypeList']),
      getAlarmColor () {
        return '#dcdfe6'
      }
    },
    mounted () {
      if (this.getAlarmTypeList.length === 0) {
        this.initAlarmTypeList().then(() => {
          if (this.getAlarmColorList.length === 0) {
            this.initAlarmColorList().then(() => {
              this.$emit('loaded')
            })
          } else {
            this.$emit('loaded')
          }
        })
      } else {
        this.$emit('loaded')
      }
    },
    methods: {
      ...mapActions(['initAlarmColorList', 'initAlarmTypeList'])
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
.alarm-type{
  display: inline-block;
  // span{
  // }
  i{
    display: inline-block;
    vertical-align: middle;
    width: 40px;
    height: 40px;
    margin-left: 8px;
    margin-right: 8px;
    border-radius: 4px;
  }
}
</style>
