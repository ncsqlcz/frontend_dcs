/*
 * @Author: liucz 
 * @Date: 2018-06-15 15:08:46 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-29 16:26:15
 */
<template>
  <section class="alarm-unit-wrap bg-white w-100" :class="{'pointer hover-shadow': !isStatic}" @click="handleWrapClick">
    <!-- 不要设备数量了 -->
    <div class="total-number text-center hidden" v-if="total > 0 && alarmCount === 0">
      <h2>{{ total }}</h2>
      <span>设备数量</span>
    </div>
    <el-row class="alarm-unit text-center">
      <el-col :span="24" class="alarm-title">
        {{ title }}
      </el-col>

      <!-- 设备要显示台账信息 -->
      <el-col :span="24" class="text-center">
        <slot name="info"></slot>
      </el-col>

      <el-col :span="24" class="text-center">
        <p class="mt-4"> </p>
        <el-col :span="12" v-for="(item, index) in list" :key="index" style="height: 56px;">
          <div class="name color-666">{{ item.name }}</div>
          <i class="alarm-color" 
            :class="{'bling-bling animated fadeIn pointer': item.level !== 'L1'}"
            :title="item.level !== 'L1' ? '查看报警详情' : ''"
            :style="{backgroundColor: getAlarmColorDict[item.level].color}"
            @click.stop="handleColorClick(item)">
          </i>
        </el-col>
      </el-col>
    </el-row>
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  import { mapGetters } from 'vuex'
  export default {
    name: 'Alarm-Unit',
    data () {
      return {
        barChart: null,
        options: [],
        colorList: []
      }
    },
    props: {
      id: String,
      title: String,
      list: {
        type: Array,
        required: true,
        default: () => {
          return [
            // {id: '1', name: '离线报警', level: 'L1'}
          ]
        }
      },
      total: {
        type: Number,
        default: 0
      },
      // 是否是静态，如果是静态，就没有pointer和shadow效果
      isStatic: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ...mapGetters(['getAlarmColorList', 'getAlarmColorDict']),
      alarmCount () {
        let count = 0
        this.list.forEach(item => {
          if (item.level !== 'L1') {
            count++
          }
        })
        return count
      }
    },
    mounted () {},
    methods: {
      initPage () {},
      // 点击整个车间
      handleWrapClick () {
        this.$emit('WrapClick', this.id)
      },
      // 点击颜色
      handleColorClick (item) {
        this.$emit('ColorClick', this.id, item)
      }
    },
    watch: {
      list (list) {
        this.initPage()
      }
    }
  }
</script>

<style scoped lang="scss">
.alarm-unit-wrap {
  display: inline-block;
  position: relative;
  overflow: hidden;
  padding: 16px;
  .alarm-unit{
    .alarm-title{
      line-height: 20px;
      font-size: 16px;
    }
  }
  .name {
    display: inline-block;
    vertical-align: text-bottom;
    line-height: 20px;
    width: 40px;
    height: 40px;
    font-size: 16px;
    word-break: break-all;
    overflow: hidden;
  }
  .alarm-color{
    display: inline-block;
    width: 40px;
    height: 40px;
    vertical-align: text-bottom;
    border-radius: 4px;
  }
  .animated {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
  }
  .bling-bling{
    -webkit-animation-duration: 1.6s;
    animation-duration: 1.6s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: cubic-bezier(0.5, 0.5, 0.5, 0.5);
  }
  &:hover{
    .total-number{
      top: 0;
    }
  }
  .total-number {
    position: absolute;
    z-index: 2;
    top: 100%;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,156,200, 0.7);
    color: #fff;
    font-size: 18px;
    transition: top .3s;
    h2{
      margin-top: 5rem;
      font-size: 50px;
      margin-bottom: 1rem;
    }
  }
}
@-webkit-keyframes fadeIn {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
}
</style>
