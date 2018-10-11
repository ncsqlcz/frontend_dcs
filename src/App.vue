<template>
    <div id="app">
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>
<script>
  export default {
    name: 'app',
    components: {}
  }
</script>
<style lang="scss">
    @import "styles/vars.scss";
    @import "styles/bootstrap-grid.css";
    @import "styles/common.css";
    // @import "styles/animate.css";
    body {
        margin: 0px;
        padding: 0px;
        height: 100%;
        font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
    }

    #app {
        position: absolute;
        top: 0px;
        bottom: 0px;
        width: 100%;
    }

    .el-submenu [class^=fa] {
        vertical-align: baseline;
        margin-right: 10px;
    }

    .el-menu-item [class^=fa] {
        vertical-align: baseline;
        margin-right: 10px;
    }

    .toolbar {
        background: #f2f2f2;
        padding: 10px;
        //border:1px solid #dfe6ec;
        margin: 10px 0px;
        .el-form-item {
            margin-bottom: 10px;
        }
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: all .2s ease;
    }

    .fade-enter,
    .fade-leave-active {
        opacity: 0;
    }

    /*解决提示框的蒙层不能遮住加载蒙层的bug*/
    .el-loading-mask {
        z-index: 2000 !important;
    }

    /*详情表格*/
    .detail-table {
      border: 1px solid #eee;
      border-radius: 10px;
      box-sizing: border-box;
      width: 100%;
      padding: 0 20px;
      background-color: #fff;
      .detail-table-row{
        display: inline-flex;
        width: 100%;
        &:last-child{
          border-bottom: none !important;
        }
        .detail-table-item {
          &>p {
            padding: 10px 0;
            margin: 0 0 !important;
            vertical-align: middle;
          }
          .th-name {
            display: inline-flex;
            flex: 0 0 30%;
            width: 30%;
            min-width: 80px;
            color: #333;
            font-weight: bold;
          }
          .td-value {
            display: inline-flex;
            flex: 0 0 65%;
            max-width: 65%;
            white-space: pre-wrap;
            word-break: break-all;
            word-wrap: break-word;
          }
        }
        border-bottom: 1px solid #eee;
      }
      label {
        width: 90px;
        color: #99a9bf;
      }
    }
</style>
