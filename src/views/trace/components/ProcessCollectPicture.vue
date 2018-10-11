<template>
	<section>
    <div class="acquisition-img-wrap col-12">
      <transition-group name="scale" mode="out-in">
        <img v-for="(item,index) in deviceImage" :key="index"
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
export default {
  name: 'Process-Collect-Picture',
  data () {
    return {
      dialogVisible: false,
      src: ''
    }
  },
  props: {
    deviceImage: Array
  },
  watch: {
    deviceImage (newVel) {
    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
    handlePictureClick (item) {
      this.src = item
      this.dialogVisible = true
    }
  }
}
</script>


<style scoped lang="scss">
  .picture-section{
    overflow-y: auto;
  .acquisition-img-wrap{
    min-height: 300px;
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
