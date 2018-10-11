/*
 * @Author: liucz 
 * @Date: 2018-06-12 08:33:17 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-25 09:01:59
 */
<template>
  <section>
    <div class="nav-container" v-show="!visible.configNotCompleted">
      <!-- 常规导航菜单 -->
      <div class="text-center transparent flex-wrap nav-wrap">
        <div class="nav-item pointer select-none" v-for="(nav, index) in menus" :key="index" 
            @click="handleNavClick(nav)" v-loading="nav.loading">
          <img :src="nav.icon" alt="">
          <p> {{ nav.name }}</p>
        </div>

        <!-- 系统配置按钮 -->
        <div class="nav-item pointer sys-config-wrap select-none" :title="basicConfig.name"
            @click="handleNavClick(basicConfig)" v-loading="basicConfig.loading">
          <img :src="basicConfig.icon" alt="">
        </div>
      </div>
    </div>

    <!-- 空态页面 - 检查相应模块是否完成 -->
    <check-config-complete :visible.sync="visible.configNotCompleted"
      :tips="tips"
      @config-click="handleConfigClick"
      ></check-config-complete>
  </section>
</template>

<script>
  import utils from '../../common/js/utils'
  import { 
    queryWarningUnitType, querySceneModule,
    } from '../../api/api'
  import base64 from "../../assets/menuIcon/icon.jpg"
  import icon1 from "../../assets/home/avatar_icon_1.png"
  import icon2 from "../../assets/home/avatar_icon_2.png"
  import icon3 from "../../assets/home/avatar_icon_3.png"
  import icon4 from "../../assets/home/avatar_icon_4.png"
  import icon5 from "../../assets/home/avatar_icon_5.png"
  import icon6 from "../../assets/home/avatar_icon_6.png"
  import icon7 from "../../assets/home/avatar_icon_7.png"
  import { mapGetters, mapActions } from 'vuex'
  import CheckConfigComplete from './components/CheckConfigComplete.vue'
  export default {
    data () {
      return {
        menus: [
          {
            name: '监控报警',
            module: 'monitoringAlarm',
            icon: icon1,
            loading: false
          },
          {
            name: '现场管理',
            module: 'site',
            icon: icon2,
            loading: false
          },
          {
            name: '设备控制',
            module: 'device',
            icon: icon3,
            loading: false
          },
          {
            name: '报表',
            module: 'reports',
            icon: icon4,
            loading: false
          },
          {
            name: '追溯查询',
            module: 'trace',
            icon: icon5,
            loading: false
          },
          {
            name: '系统设置',
            module: 'sysConfig',
            icon: icon6,
            loading: false
          }
        ],
        basicConfig: {
          name: '基础数据',
          module: 'basic',
          icon: icon7,
          loading: false
        },
        visible: {
          configNotCompleted: false,
          checkLoading: []
        },
        tips: '该模块未配置完成，请在“系统管理”中进行配置',
        configNav: null,
        configUrl: '/'
      }
    },
    computed: {
      ...mapGetters(['getRoutesConfig','getMenuModule']),
    },
    components: { CheckConfigComplete },
    mounted () {
    },
    methods: {
      ...mapActions(['setMenuModule', 'setRoutes']),
      handleNavClick (nav) {
        this.visible.configNotCompleted = false
        switch (nav.module) {
          case 'monitoringAlarm':
            nav.loading = true
            this.configNav = this.menus[5]
            queryWarningUnitType({
              pageSize: 1000,
              page: 1
            }).then(res => {
              nav.loading = false
              if (res.status === 0) {
                res.map.unitType.forEach(item => {
                  if (item.view_status === '2') {
                    this.visible.configNotCompleted = false
                  }
                })
              } else {
                this.visible.configNotCompleted = true
                this.tips = '该模块未配置完成，请在“系统管理”中进行配置'
                this.configUrl = '/sysConfig/monitoringAlarm/perspective'
              }
              this.setModuleRoutes(nav)
            }).catch(() => {
              nav.loading = false
            })
          break
          case '__site':
            nav.loading = true
            this.configNav = this.menus[5]
            querySceneModule({
              type: '',
              warningUnitId: ''
            }).then(res => {
              nav.loading = false
              if (res.status === 0) {
                if (res.map.warningUnits.length > 0) {
                  this.visible.configNotCompleted = false
                } else {
                  this.visible.configNotCompleted = true
                  this.tips = '该模块未配置完成，请在“系统管理”中进行配置'
                  this.configUrl = '/sysConfig/siteMangement/overview'
                }
              } else {
                this.visible.configNotCompleted = true
                this.tips = '该模块未配置完成，请在“系统管理”中进行配置'
                this.configUrl = '/sysConfig/siteMangement/overview'
              }
              this.setModuleRoutes(nav)
            }).catch(() => {
              nav.loading = false
            })
          break
          case 'device':
            // 进入设备控制需要权限确认
            this.$mesPermission.show('权限确认', {
              tips: ''
            }).then(res => {
              if (res === 'pass') {
                this.setModuleRoutes(nav)
              }
            })
          break
          case '':
          break
          default:
            this.visible.configNotCompleted = false
            this.setModuleRoutes(nav)
        }
      },
      // 如果配置完成，则跳转路由
      setModuleRoutes (nav) {
        if (!this.visible.configNotCompleted) {
          // 设置当前菜单模块名称
          this.setMenuModule(nav.module)
          this.$router.options.routes = this.getRoutesConfig[nav.module]
          this.setRoutes(this.getRoutesConfig[nav.module])
          // 默认进入第一个非隐藏路由，且不是首页
          for (let i = 0; i < this.getRoutesConfig[nav.module].length; i++) {
            let item = this.getRoutesConfig[nav.module][i]
            if (item.path !== '/' && !item.hidden && item.children) {
              return this.$router.push({path: item.children[0].path})
            }
          }
        }
      },
      // 去配置
      handleConfigClick () {
        // 先确定进入那个模块
        this.visible.configNotCompleted = false
        this.setModuleRoutes(this.configNav)
        // 然后进入具体的路由
        setTimeout(() => {
          this.visible.configNotCompleted = true
          this.$router.push({path: this.configUrl})
        })
      }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
section{
  // overflow-y: auto;
}
.nav-container {
  // position: absolute;
  z-index: 2;
  // width: 90%;
  width: 1145px;
  // width: 1300px;
  // height: calc(90% - 40px);
  height: 600px;
  margin: 100px auto;
  // left: 5%;
  // top: calc(5% + 20px);
  background: url('../../assets/home/avatar_bg2.jpg') no-repeat center center;
  background-size: contain;
  position: relative;
  border-radius: 14px;
  .nav-wrap {
    width: 50%;
    max-width: 620px;
    position: absolute;
    right: -1%;
    top: 5%;
    background: violet;
    justify-content: right;
    .nav-item {
      width: 25%;
      margin-right: 5%;
      margin-top: 5%;
      position: relative;
      border-radius: 18px;
      transition: box-shadow .2s;
      overflow: hidden;
      &>img {
        display: block;
        width: 100%;
      }
      &>p{
        position: absolute;
        z-index: 2;
        bottom: .8rem;
        width: 100%;
        text-align: center;
        color: #fff;
        font-size: 160%;
        letter-spacing: .2rem;
      }
      &:hover{
        box-shadow: 0 5px 16px 0 rgba(0,0,0,.3);
      }
    }
    .sys-config-wrap {
      width: 20%;
      border-radius: 50%;
      margin-right: 17.5%;
      margin-left: auto;
    }
  }
}
@media screen and (min-width: 1600px) {
  .nav-container {
    width: 1336px;
    height: 700px;
    border-radius: 16px;
  }
}
@media screen and (max-width: 1300px) {
  .nav-container {
    width: 955px;
    height: 500px;
    .nav-wrap {
      .nav-item {
        &>p{
          font-size: 140%;
          bottom: .5rem;
        }
      }
    }
  }
}
</style>
