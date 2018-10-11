<!--框架首页 - 包括左侧导航栏的实现-->
<template>
	<el-row class="app-container">
		<el-col :span="24" class="header">
			<el-col :span="10" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
				{{ collapsed ? sysNameShort : sysName }}
			</el-col>
			<el-col :span="10">
				<div class="tools" @click.prevent="collapsed = !collapsed">
					<i class="fa fa-navicon" style="font-size: 150%"></i>
				</div>
			</el-col>
			<el-col :span="4" class="userinfo hidden">
				<el-dropdown trigger="click">
					<span class="el-dropdown-link userinfo-inner">{{ getUser.staffNumber }} <img src="../assets/bg1.jpg" /></span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item hidden><i class="fa fa-comment"></i> 消息</el-dropdown-item>
						<el-dropdown-item hidden><i class="fa fa-cog"></i> 设置</el-dropdown-item>
						<el-dropdown-item divided @click.native="logout"><i class="fa fa-sign-out"></i> 退出</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-col>
		</el-col>
		<el-col :span="24" class="main" :style="{top: !isIndexRoute ? '60px' : '0'}">
			<aside :class="collapsed ? 'collapsed' : '' " v-show="!isIndexRoute">
				<!--导航菜单 - 没有折叠-->
				<el-menu :default-active="this.$route.path || getRoutePath" class="el-menu-vertical normal" unique-opened router :collapse="collapsed">
          <!--首页-->
          <el-menu-item
            :index="'index'"
            :class="$route.path.indexOf('/index') > -1 ? 'is-active' : ''"
            @click.native="$router.push('/index')"
            hidden
          >
            <i class="fa fa-home"></i>
            <span slot="title">首页</span>
          </el-menu-item>

					<template
            v-for="(item,index) in getRoutes"
            v-if="!item.hidden"
          >
            <!--一级菜单 - 无子节点-->
            <el-menu-item
              v-if="item.leaf && item.children.length > 0"
              :index="item.children[0].path"
							:class="$route.path.indexOf(item.children[0].path) > -1 && item.children[0].path !== '/'? 'is-active' : '' "
            >
              <i :class="item.iconClass"></i>
              <span slot="title">{{ item.children[0].name }}</span>
            </el-menu-item>
						<el-submenu :index="index + '' " v-if="!item.leaf">
              <!--一级菜单 - 有子节点-->
							<template slot="title">
                <i :class="item.iconClass"></i>
                <span slot="title">{{ item.name }}</span>
              </template>
              <template
                v-for="(child, childIndex) in item.children"
                v-if="!child.hidden"
              >
                <!--二级菜单 - 无子节点-->
                <el-menu-item
                  v-if="!child.hidden && child.leaf"
                  :class="$route.path.indexOf(child.path) > -1 ? 'is-active' : '' "
                  :index="child.path"
                >
                  <template slot="title">
                    <i :class="child.iconClass"></i>{{ child.name }}
                  </template>
                </el-menu-item>

                <!--二级菜单 - 有子节点-->
                <el-submenu :index="index + '-' + childIndex" v-else>
                  <template slot="title">
                    <i :class="child.iconClass"></i>{{ child.name }}
                  </template>
                  <el-menu-item
                    v-for="(leaf, leafIndex) in child.children"
                    :index="leaf.path"
                    :class="$route.path.indexOf(leaf.path) > -1 ? 'is-active': '' "
                    :key="leaf.path"
                    v-if="!leaf.hidden"
                  >
                    <template slot="title"><i :class="leaf.iconClass"></i>{{ leaf.name }}</template>
                  </el-menu-item>
                </el-submenu>
              </template>
            </el-submenu>
					</template>
				</el-menu>
			</aside>
			<section class="content-container" :class="{'with-bg': isIndexRoute}">
				<div class="grid-content bg-purple-light">
					<el-col :span="24" class="breadcrumb-container" v-show="!isIndexRoute">
						<span>
							<strong class="title">{{ $route.name }}</strong>
							<a href="javascript:" class="ml-2 btn-back" onclick="window.history.back()"
									v-show="$route.meta.showBtnBack"><i class="fa fa-reply"></i> 返回
							</a>
						</span>
						<el-breadcrumb separator="/" class="breadcrumb-inner">
							<el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
								{{ item.name }}
							</el-breadcrumb-item>
						</el-breadcrumb>
					</el-col>
					<el-col :span="24" class="content-wrapper transparent">
						<transition name="fade" mode="out-in">
							<router-view></router-view>
						</transition>
					</el-col>
					<!--尾部-->
					<el-col :span="24" hidden>
						<footer>
							<p :span="24">版权所有：深圳市麦子科技有限公司</p>
							<p :span="24">电话：。。。 备案号：。。。</p>
						</footer>
					</el-col>

				</div>
			</section>
		</el-col>
	</el-row>
</template>

<script>
import routesConfig from '../routes.js'
import {mapGetters, mapActions} from 'vuex'
export default {
  data () {
    return {
			sysName: 'iMES',
			sysNameShort: 'iMES',
			collapsed: sessionStorage.getItem('collapsed') === 'true',
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      getUser: {}
    }
  },
  computed: {
    ...mapGetters({
      getCollapsed: 'getCollapsed',
      getRoutes: 'getRoutes',
      getMenuModule: 'getMenuModule'
		}),
		// 是否是首页路由
		isIndexRoute () {
			return this.$route.path === '/home' || this.$route.path === '/'
		},
    // 由于不支持三级路径，所以三级路径要转成二级路径
    getRoutePath: function () {
      let paths = this.$route.path.split('/')
      if (paths.length >= 4) {
        return '/' + paths[0] + '/' + paths[1]
      } else {
        return this.$route.path
      }
    }
  },
  created () {
    // 判断用户cookie是否失效
    // let user = {
    //   userId: this.$cookie.get('ID'),
    //   staffNumber: this.$cookie.get('userName'),
    //   password: ''
    // }
    // console.log(this.setUser, user);
  },
  mounted () {
    let user = sessionStorage.getItem('user')
    if (user) {
      user = JSON.parse(user)
		}
		this.initRoutes()
  },
  methods: {
		...mapActions(['setUser', 'setCollapsed', 'setRoutes']),
		initRoutes () {
			// 跳转路由，避免刷新之后路由丢失
			// this.$router.push(this.getReturnPath)

			// 初始化要显示的路由
			this.$router.options.routes = routesConfig[this.getMenuModule]
			this.setRoutes(routesConfig[this.getMenuModule])
		},
    onSubmit () {
			console.log('submit!')
    },
    // 退出登录
    logout: function () {
      this.$confirm('确认退出吗?', '提示', {
        // type: 'warning'
      }).then(() => {
        localStorage.removeItem('token')
        sessionStorage.removeItem('user')
        this.$router.push('/login')
      }).catch(() => {

      })
    },
    showMenu (i, status) {
      this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-' + i)[0].style.display = status ? 'block' : 'none'
    },
    // 获取有三级节点的数据
    getHasChildItems (item) {
      let arr = []
      item.map(child => {
        if (child.children && child.children.length > 0) {
          arr.push(child)
        }
      })
      return arr
    }
  },
  watch: {
    collapsed (val) {
      // 记住展开折叠的状态
      sessionStorage.setItem('collapsed', val)
    }
  }
}
</script>

<style>
</style>
<style scoped lang="scss">
	@import '~scss_vars';
	.app-container {
		position: absolute;
		top: 0px;
		bottom: 0px;
		width: 100%;
		.header {
			height: 60px;
			line-height: 60px;
			background: $color-primary;
			color:#fff;
			.userinfo {
				text-align: right;
				padding-right: 35px;
				float: right;
				.userinfo-inner {
					cursor: pointer;
					color:#fff;
					img {
						width: 40px;
						height: 40px;
						border-radius: 20px;
						margin: 10px 0px 10px 10px;
						float: right;
					}
				}
			}
			.logo {
				//width:230px;
				height:60px;
				font-size: 22px;
				padding-left:20px;
				padding-right:20px;
				border-color: rgba(238,241,146,0.3);
				border-right-width: 1px;
				border-right-style: solid;
				img {
					width: 40px;
					float: left;
					margin: 10px 10px 10px 18px;
				}
				.txt {
					color:#fff;
				}
			}
			.logo-width{
				width:230px;
			}
			.logo-collapse-width{
        width:65px;
        padding-left: 8px;
        padding-right: 8px;
			}
			.tools{
				padding: 0px 23px;
				width:14px;
				height: 60px;
				line-height: 60px;
				cursor: pointer;
			}
		}
		.main {
			display: flex;
			// background: #324057;
			position: absolute;
			top: 60px;
			bottom: 0px;
			overflow: hidden;
			aside {
				flex:0 0 230px;
				width: 230px;
        &.collapsed{
          flex:0 0 66px;
          width: 66px;
        }
				.el-menu{
					height: 100%;
				}
				.el-menu-vertical.normal{
					overflow-y: auto;
				}
			}
			.content-container {
				background: #f6fafd;
				&.with-bg{		
					background: url('../assets/home/avatar_bg.jpg') no-repeat;
					background-size: cover;
					overflow: auto;
				}
				overflow: auto;
				flex:1;
				padding: 20px;
				.breadcrumb-container {
					//margin-bottom: 15px;
					.title {
						// width: 200px;
						float: left;
						color: #475669;
					}
					.breadcrumb-inner {
						float: right;
					}
					.btn-back {
						display: inline-block;
						padding-top: 2px;
						font-size: 80%;
						text-decoration: none;
						opacity: .6;
						color: $color-active;
						&:hover{
							opacity: 1;
						}
						.fa {
							font-size: 80%;
						}
					}
				}
				.content-wrapper {
					background-color: #f6fafd;
					box-sizing: border-box;
				}
				footer{
					p{
						margin: 0;
						text-align: center;
						color: #bbb;
						font-size: 13px;
					}
				}
			}
		}

    /*解决导航菜单折叠后icon不居中的问题*/
    .el-menu.el-menu-vertical.normal.el-menu--collapse .el-menu-item [class^=fa],
    .el-menu.el-menu-vertical.normal.el-menu--collapse .el-submenu__title [class^=fa]{
      margin-left: 5px;
    }
	}

	/*滚动条样式*/
	::-webkit-scrollbar {
		width:10px;
		height:10px;
		background-color:#F8F8F8;
		border:none
	}
	::-webkit-scrollbar-track {
		/*background: url("/static/images/loading.gif");*/
		/*box-shadow: 1px 1px 5px rgba(0,0,0,.2) inset;*/
	}
	::-webkit-scrollbar-thumb {
		background-color:#cdcdcd;
		border:0px solid #f0f0f0;
		border-radius: 12px;
	}
	::-webkit-scrollbar-thumb:hover {
		background-color:#afafaf
	}
	::-webkit-scrollbar-thumb:active {
		/*background-color:#606060*/
		background-color:#afafaf
	}
	::-webkit-scrollbar-thumb:disabled {
		background-color:#f9f9f9
	}
	::-webkit-scrollbar-corner {
		background-color:#f0f0f0
	}
	::-webkit-scrollbar-button:vertical {
		/*height:33px*/
		height:0
	}
	::-webkit-scrollbar-button:horizontal {
		/*width:33px*/
		width:0
	}
</style>
