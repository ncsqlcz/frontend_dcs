import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import './styles/element-variables.scss'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import routesConfig from './routes'
import 'font-awesome/css/font-awesome.min.css'
// import {SET_TOKEN, SET_RETURN_PATH, SET_USER} from './vuex/mutation-types'
import MesUI from './components/index'
import VueCookie from 'vue-cookie'

// 本地模拟api
// import Mock from './mock'
// Mock.bootstrap()

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(ElementUI)
Vue.use(MesUI)
Vue.use(VueCookie)

NProgress.configure({ showSpinner: false })

// 实例化路由之前先读取路由配置，得到所有路由
let routes = []
Object.values(routesConfig).forEach(values => { routes = [...routes, ...values] })

store.state.routesConfig = routesConfig

const router = new VueRouter({
  // mode: 'history', // 去掉url后面的#
  routes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  // 设置token, 避免刷新丢失token
  if (localStorage.getItem('token')) {
    // store.commit(SET_TOKEN, localStorage.getItem('token'))
  }
  if (to.path === '/login') {
    sessionStorage.removeItem('user')
  }

  if (to.name === '工序生产执行') {
    const state = sessionStorage.getItem('isLogin')
    if (state === null) {
      next({path: '/site/process/login'})
    } else  next()
  } else next() // 暂时不验证权限  

  // let user = {}
  // try {
  //   user = JSON.parse(sessionStorage.getItem('user'))
  //   if (!user && to.path !== '/login') {
  //     next({path: '/login'})
  //   } else {
  //     store.commit(SET_USER, user)
  //     // 设置登录之后返回的路径
  //     if (to.fullPath !== '/login') {
  //       store.commit(SET_RETURN_PATH, to.fullPath)
  //     }
  //     next()
  //   }
  // } catch (e) {
  //   next({path: '/login'})
  // }
})

router.afterEach(transition => {
  NProgress.done()
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
