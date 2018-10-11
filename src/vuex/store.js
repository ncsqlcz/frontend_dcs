import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import mutations from './mutations'
Vue.use(Vuex)

// 应用初始状态
const state = {
  routesConfig: null, // 路由模块配置信息
  routes: [], // 当前显示的路由信息
  menuModule: sessionStorage.menuModule || 'base', // 当前菜单模块
  collapsed: sessionStorage.getItem('collapsed') === 'true',
  // 所有设备类型
  deviceTypeList: [
    { label: '采集设备', value: '采集设备' },
    { label: '生产设备', value: '生产设备' },
    { label: '检测设备', value: '检测设备' },
    { label: '其他配套设备', value: '其他配套设备' }
  ],
  // 视角
  perspectiveList: [],
  // 报警颜色
  alarmColorList: [],
  // 报警颜色字典
  alarmColorDict: {},
  // 工序状态
  processStatusList: [
    { label: '进行中', value: '0' },
    { label: '已完成', value: '1' }
  ],
  // 报警种类
  alarmTypeList: [],
  // 现场管理是特殊视角，id是固定
  siteUnitTypeId: 'system0908ff324ac749a992ca67a00c5727887',

  alarmType: {
    'normal': { name: 'normal', bgColor: 'transparent', color: '', text: '正常' },
    'exceptionData': { name: 'exceptionData', bgColor: 'rgba(255,255,110,.8)', color: '', text: '数据采集异常' },
    'offline': { name: 'offline', bgColor: 'rgba(255,185,85,.8)', color: '', text: '离线' },
    'halt': { name: 'halt', bgColor: 'rgba(255,90,90,.8)', color: '', text: '停机' }
  },
  deviceRunningStatus: {
    'running': {name: 'running', bgColor: '', color: '#00CCFF', text: '运行'},
    'offline': {name: 'offline', bgColor: '', color: 'rgba(255,185,85,1)', text: '离线'},
    'halt': {name: 'halt', bgColor: '', color: 'rgba(255,90,90,1)', text: '停机'}
  },
  acquisitionParameterStatus: {
    'normal': {name: 'normal', bgColor: '', color: '#666', text: '正常'},
    'outOfMax': {name: 'outOfMax', bgColor: '', color: 'rgba(255,185,85,1)', text: '超出上限'},
    'outOfMin': {name: 'outOfMin', bgColor: '', color: 'rgba(255,90,90,1)', text: '超出下限'}
  },
  deviceTypes: []
}

// 创建 store 实例
export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations
})
