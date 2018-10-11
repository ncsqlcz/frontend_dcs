/*
 * @Author: liucz 
 * @Date: 2018-07-23 17:56:25 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-09-08 16:03:26
 */
<template>
  <section class="bg-white" v-show="visibleSection">
    <div class="img-wrap">
      <div class="text-right">
        <!-- <el-button size="small" type="danger" @click="visibleSection = false" icon="el-icon-close" plain circle></el-button> -->
      </div>
      <img :src="iconEmpty" alt="">
      <p style="" class="color-active tips text-center">{{ tips }}</p>
      <div class="text-center">
        <el-button size="medium" class="btn-config" @click="handleConfig" plain>点击配置</el-button>
        <el-button size="small" type="text" @click="visibleSection = false">关闭</el-button>
      </div>
      <!-- <a href="javascript:" class="btn-config" @click="handleConfig">点击配置</a> -->
    </div>
  </section>
</template>

<script>
  // import utils from '../../../common/js/utils'
  import iconEmpty from "../../../assets/icon-empty.png"
  export default {
    name: 'Check-Config-Complete',
    data () {
      return {
        iconEmpty: iconEmpty,
        visibleSection: false
      }
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      tips: String
    },
    computed: {
    },
    mounted () {
    },
    methods: {
      handleConfig () {
        this.$emit('config-click')
      }
    },
    watch: {
      visible (val) {
        this.visibleSection = val
      },
      visibleSection (val) {
        this.$emit('update:visible', val)
      }
    }
  }
</script>

<style scoped lang="scss">
@import '~scss_vars';
section{
  padding: 100px 0;
  position: absolute;
  z-index: 3;
  left: 0; right: 0; top: 0; bottom: 0;
  .img-wrap {
    width: 800px;
    margin: 0 auto;
    &>img{
      display: block;
      margin: 0 auto;
    }
  }
  .tips {
    font-size: 180%;
    margin: 3rem 0;
  }
  .btn-config {
    width: 200px;
    height: 50px;
    border: none;
    color: #fff;
    background: linear-gradient(to right, #0EE5BC, $color-active);
    &:hover, &:active, &:focus{
      color: #fff;
      background: linear-gradient(to right, #0EE5BC, $color-active);
    }
    
    // display: block;
    
  }
}
</style>
