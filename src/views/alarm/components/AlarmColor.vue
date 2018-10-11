/*
 * @Author: liucz 
 * @Date: 2018-06-15 14:52:32 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-06-29 10:43:17
 */
<template>
  <section>
    <div v-for="item in getAlarmColorList" :key="item.color" class="alarm-type">
      <span class="color-666">{{ item.label }}: </span>
      <i :style="{backgroundColor: item.color}"></i>
    </div>
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    name: 'Alarm-Color',
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
      ...mapGetters(['getAlarmColorList'])
    },
    mounted () {
      if (this.getAlarmColorList.length === 0) {
        this.initAlarmColorList().then(() => {
          this.$emit('loaded')
        })
      } else {
        this.$emit('loaded')
      }
    },
    methods: {
      ...mapActions(['initAlarmColorList'])
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
