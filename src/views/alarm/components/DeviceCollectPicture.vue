/*
 * @Author: liucz
 * @Date: 2018-06-21 15:15:38
 * @Last Modified by: liucz
 * @Last Modified time: 2018-07-21 08:49:34
 */
<template>
  <section class="picture-section h-100 bg-white">
    <div class="acquisition-img-wrap col-12">
      <transition-group name="scale" mode="out-in">
        <img v-for="(item, index) in acquisitionImgs" :key="index"
              class="col-4 p-3 pointer hover-shadow" :src="item" alt="" v-if="item" @click="handlePictureClick(item)">
      </transition-group>
    </div>

    <!-- 点击查看大图 -->
    <el-dialog title="采集图片" :visible.sync="dialogVisible" width="80%" class="mes-dialog">
      <img :src="src" alt="" style="display: block; width: 100%;">
      <div slot="footer" class="dialog-footer mt-3">
        <el-button size="medium" @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  import utils from '../../../common/js/utils'
  export default {
    name: 'Device-Collect-Picture',
    data () {
      return {
        acquisitionImgs: [],
        dialogVisible: false,
        src: ''
      }
    },
    props: {
      title: String,
      pictureList: Array,
      max: {
        type: Number,
        default: 30
      },
      resize: Number
    },
    components: {},
    computed: {
    },
    mounted () {
    },
    methods: {
      handleParameterChange () {
        this.initChartData()
      },
      // 采集图像
      acquisition () {
        // 超过设置的最大值，则删除前面的图片
        this.acquisitionImgs = this.pictureList
      },
      handlePictureClick (item) {
        this.src = item
        this.dialogVisible = true
      }
    },
    watch: {
      pictureList (val) {
        this.acquisition()
      }
    }
  }
</script>

<style scoped lang="scss">
.picture-section{
  overflow-y: auto;
  .acquisition-img-wrap{
    min-height: 250px;
    // max-height: 600px;
    overflow-x: hidden;
    overflow-y: auto;
    img{
      border-radius: 4px;
    }
  }
}
// 动画
.scale-enter-active,
.scale-leave-active {
  transition: all .5s;
}
.scale-enter,
.scale-leave-active {
  /*opacity: 0;*/
  transform: scale(.5);
}
</style>
