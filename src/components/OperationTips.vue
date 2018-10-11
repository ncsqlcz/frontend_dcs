<template>
  <div class="color-999 p-3">
    <p class="no-margin"> <i class="fa fa-question-circle-o color-active"></i> DCS小麦：</p>
    <p class="no-margin" style="text-indent: 30px;">
      <slot></slot>
      <el-button v-if="video" size="small" type="text" @click="visible = true">视频教程</el-button>
    </p>

    <!-- 视频弹窗 -->
    <el-dialog title="视频教程" :visible.sync="visible" class="mes-dialog" width="70%">
      <video :src="video" autoplay controls class="w-100">你的浏览器不支持video标签</video>
      <div slot="footer">
        <el-button size="medium" type="" @click="visible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import utils from '../common/js/utils'
  export default {
    name: 'operation-tips',
    data () {
      return {
        visible: false
      }
    },
    props: {
      video: String
    },
    mounted () {

    }
  }
</script>

<style scoped>

</style>