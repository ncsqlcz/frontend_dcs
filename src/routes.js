/* 定义所有异步组件 */

// 登录页面
const Login = () => import('@/views/Login')
// 404页面
const NotFound = () => import('@/views/404')
// 框架home页
const Home = () => import('@/views/Home')
// 首页
// const Index = () => import('@/views/Index')
// 空白页，为第三级菜单预留的
// const Blank = () => import('@/views/Blank')

/* 系统home页 */
const sysHome = () => import('@/views/sysHome/sysHome')

/* 监控报警 monitoring alarm */
const RealTimeAlarmOverview = () => import('@/views/alarm/RealTimeAlarmOverview')
const RealTimeAlarmUnit = () => import('@/views/alarm/RealTimeAlarmUnit')
const RealTimeAlarmDevices = () => import('@/views/alarm/RealTimeAlarmDevices')
const AlarmParams = () => import('@/views/alarm/AlarmParams')
const AlarmParamsNoLevel = () => import('@/views/alarm/AlarmParamsNoLevel')
const AlarmSwitch = () => import('@/views/alarm/AlarmSwitch')

/* 工序现场管理 Process site management */
const ProcessManagementLogin = () => import('@/views/site/ProcessManagementLogin')
const ProcessManagement = () => import('@/views/site/ProcessManagement')

/* 设备控制 device control */
const CollectorIPConfig = () => import('@/views/device/CollectorIPConfig')
const CollectorRedundancyConfig = () => import('@/views/device/CollectorRedundancyConfig')
const CollectorDeviceConfig = () => import('@/views/device/CollectorDeviceConfig')

/* 报表 reports */
const MonitoringAlarmLog = () => import('@/views/reports/MonitoringAlarmLog')
const AbnormalParameters = () => import('@/views/reports/children/AbnormalParameters')

/* 追溯查询 trace */
const ProcessTrace = () => import('@/views/trace/ProcessTrace')
const ProcessDetails = () => import('@/views/trace/children/ProcessDetails')

/* 基础数据 basic data */
const DeviceBasic = () => import('@/views/basic/Device')
const ProcessBasic = () => import('@/views/basic/Process')
const WorkShopBasic = () => import('@/views/basic/WorkShop')
const ProcessCommonParameters = () => import('@/views/basic/ProcessCommonParameters')
const OutputManagement = () => import('@/views/basic/OutputManagement')
const Badcode = () => import('@/views/basic/Badcode')
const DeviceManagement = () => import('@/views/basic/DeviceManagement')

/* 系统配置 sysConfig */
const AlarmLevelConfig = () => import('@/views/sysConfig/AlarmLevelConfig')
const DeviceAlarmLevel = () => import('@/views/sysConfig/DeviceAlarmLevel')
const DeviceAlarmLevelConfig = () => import('@/views/sysConfig/children/DeviceAlarmLevelConfig')
const DeviceAlarmWindow = () => import('@/views/sysConfig/DeviceAlarmWindow')
const DeviceAlarmWindowConfig = () => import('@/views/sysConfig/children/DeviceAlarmWindowConfig')
const MonitoringAlarmPerspective = () => import('@/views/sysConfig/MonitoringAlarmPerspective')
const MonitoringAlarmConfigStep = () => import('@/views/sysConfig/MonitoringAlarmConfigStep')
const MonitoringAlarmConfigView = () => import('@/views/sysConfig/MonitoringAlarmConfigView')
const SiteMangementConfigStep = () => import('@/views/sysConfig/SiteMangementConfigStep')
const SiteMangementConfigView = () => import('@/views/sysConfig/SiteMangementConfigView')

// for test
const Resizable = () => import('@/views/test/Resizable')

// 分模块配置菜单
let menuModule = {
  // 所有模块都有的基础路由
  base: [
    { path: '/login', component: Login, name: '', hidden: true },
    { path: '/404', component: NotFound, name: '', hidden: true },
    { path: '*', hidden: true, redirect: {path: '/home'} }, // 默认跳转到home页，如有需求可以改为404
    {
      path: '/',
      component: Home,
      name: '首 页',
      iconClass: 'fa fa-home',
      leaf: true,
      hidden: false,
      children: [
        {path: '/', component: sysHome, name: '首页', leaf: true},
        {path: '/home', component: sysHome, name: '首页', leaf: true},
        {path: '/test/resizable', component: Resizable, name: '可调整大小', leaf: true},
      ]
    }
  ],
  // 监控报警模块
  monitoringAlarm: [
    {path: '/monitoringAlarm/realTime', component: RealTimeAlarmOverview, name: '实时监控报警', leaf: true},
    {path: '/monitoringAlarm/alarmSwitch', component: AlarmSwitch, name: '监控报警开关', leaf: true},
    {path: '/monitoringAlarm/realTime/unit/:id', component: RealTimeAlarmUnit, name: '报警单元详情', leaf: true, hidden: true, meta: { showBtnBack: true }},
    {path: '/monitoringAlarm/realTime/device/:id', component: RealTimeAlarmDevices, name: '设备采集参数详情', leaf: true, hidden: true},
    {path: '/monitoringAlarm/realTime/device/noAlarmLevel/:id', component: AlarmParamsNoLevel, name: '报警参数-全局-无报警级别', leaf: true, hidden: true, meta: { showBtnBack: true }},
    {path: '/monitoringAlarm/realTime/alarmLevel', component: AlarmParams, name: '报警参数-全局-有报警级别', leaf: true, hidden: true, meta: { showBtnBack: true }},
    {path: '/monitoringAlarm/realTime/device/details', component: RealTimeAlarmDevices, name: '设备详情', leaf: true, hidden: true, meta: { showBtnBack: true }}
  ],
  // 现场管理模块
  site: [
    {path: '/site/process/login', component: ProcessManagementLogin, name: '登录', leaf: true, hidden: true},
    {path: '/site/process/execution', component: ProcessManagement, name: '工序生产执行', leaf: true}
  ],
  // 设备控制模块
  device: [
    {path: '/device/CollectorDeviceConfig', component: CollectorDeviceConfig, name: '智能物联网关设备配置', leaf: true},
    {path: '/device/collectorIPConfig', component: CollectorIPConfig, name: '智能物联网关IP配置', leaf: true},
    {path: '/device/collectorRedundancyConfig', component: CollectorRedundancyConfig, name: '智能物联网关冗余配置', leaf: true},
  ],
  // 报表模块
  reports: [
    {path: '/reports/monitoringAlarmLog', component: MonitoringAlarmLog, name: '监控报警日志', leaf: true},
    {path: '/reports/AbnormalParameters', component: AbnormalParameters, name: '报警窗口异常值详情', leaf: true, hidden: true, meta: { showBtnBack: true }},
  ],
  // 追溯模块
  trace: [
    {path: '/trace/process', component: ProcessTrace, name: '工序查询', leaf: true},
    {path: '/trace/process/details/:id', component: ProcessDetails, name: '工序详情', leaf: true, hidden: true, meta: { showBtnBack: true }}
  ],
  // 基础数据模块
  basic: [
    {path: '/basic/DeviceManagement', component: DeviceManagement, name: '设备管理', leaf: true},
    // {path: '/basic/device', component: DeviceBasic, name: '设备台账', leaf: true},
    {path: '/basic/workShop', component: WorkShopBasic, name: '车间管理', leaf: true},
    {path: '/basic/process', component: ProcessBasic, name: '现场执行单元管理', leaf: true},
    {path: '/basic/commonParametersProcess', component: ProcessCommonParameters, name: '现场录入参数管理', leaf: true},
    {path: '/basic/OutputManagement', component: OutputManagement, name: '产出物管理', leaf: true},
    {path: '/basic/Badcode', component: Badcode, name: '不良代号管理', leaf: true},
  ],
  // 系统配置模块
  sysConfig: [
    {path: '/sysConfig/alarmLevel', component: AlarmLevelConfig, name: '全局报警配置', leaf: true},
    {path: '/sysConfig/deviceAlarmLevel', component: DeviceAlarmLevel, name: '采集参数报警等级配置', leaf: true},
    {path: '/sysConfig/deviceAlarmLevel/:id', component: DeviceAlarmLevelConfig, name: '配置参数', leaf: true, hidden: true, meta: { showBtnBack: true }},
    {path: '/sysConfig/deviceAlarmWindow', component: DeviceAlarmWindow, name: '采集参数报警窗口配置', leaf: true},
    {path: '/sysConfig/deviceAlarmWindow/:id', component: DeviceAlarmWindowConfig, name: '配置报警窗口', leaf: true, hidden: true, meta: { showBtnBack: true }},
    {path: '/sysConfig/monitoringAlarm/overview/:id', component: MonitoringAlarmConfigView, name: '监控报警模块配置', leaf: true, hidden: true, meta: { showBtnBack: true }},
    {path: '/sysConfig/monitoringAlarm/perspective', component: MonitoringAlarmPerspective, name: '监控报警视角配置', leaf: true},
    {path: '/sysConfig/monitoringAlarm/perspective/step/:id', component: MonitoringAlarmConfigStep, name: '配置参数', leaf: true, hidden: true, meta: { showBtnBack: true }},
    {path: '/sysConfig/siteMangement/overview', component: SiteMangementConfigView, name: '现场管理模块配置', leaf: true},
    {path: '/sysConfig/siteMangement/overview/step', component: SiteMangementConfigStep, name: '配置参数', leaf: true, hidden: true, meta: { showBtnBack: true }}
  ]
}

// 每一个路由配置都包含基础路由
for (let key in menuModule) {
  if (key !== 'base') {
    for (let i = 0; i < menuModule[key].length; i++) {
      let item = menuModule[key][i]
      item = {path: '/' + key, component: Home, name: item.name, iconClass: '', leaf: true, hidden: item.hidden, children: [item]}
      menuModule[key].splice(i, 1, item)
    }
    // 所有模块都有基础模块哦
    menuModule[key] = [...menuModule['base'], ...menuModule[key]]
  }
}

// 一次性加载所有菜单 - 暂时不用了
let routes = [
  {
    path: '/login',
    component: Login,
    name: '',
    hidden: true
  },
  {
    path: '/404',
    component: NotFound,
    name: '',
    hidden: true
  },
  {
    path: '/',
    component: Home,
    name: '首 页',
    iconClass: 'fa fa-home',
    leaf: true,
    hidden: false,
    children: [
      {path: '/home', component: sysHome, name: '首页', leaf: true}
    ]
  },
  {
    path: '/monitoringAlarm',
    component: Home,
    name: '监控报警',
    iconClass: 'fa fa-thermometer-half',
    children: [
      {path: '/monitoringAlarm/realTime', component: RealTimeAlarmOverview, name: '实时监控报警', leaf: true},
      {path: '/monitoringAlarm/alarmSwitch', component: AlarmSwitch, name: '监控报警开关', leaf: true},
      {path: '/monitoringAlarm/realTime/unit/:id', component: RealTimeAlarmUnit, name: '报警单元详情', leaf: true, hidden: true},
      {path: '/monitoringAlarm/realTime/device/:id', component: RealTimeAlarmDevices, name: '设备采集参数详情', leaf: true, hidden: true},
      {path: '/monitoringAlarm/realTime/device/noAlarmLevel/:id', component: AlarmParamsNoLevel, name: '报警参数-全局-无报警级别', leaf: true, hidden: true},
      {path: '/monitoringAlarm/realTime/alarmLevel', component: AlarmParams, name: '报警参数-全局-有报警级别', leaf: true, hidden: true},
      {path: '/monitoringAlarm/realTime/device/details', component: RealTimeAlarmDevices, name: '设备详情', leaf: true, hidden: true}
    ]
  },
  {
    path: '/site',
    component: Home,
    name: '现场管理',
    iconClass: 'fa fa-tasks',
    children: [
      {path: '/site/process/login', component: ProcessManagementLogin, name: '登录', leaf: true, hidden: true},
      {path: '/site/process/execution', component: ProcessManagement, name: '工序生产执行', leaf: true}
    ]
  },
  {
    path: '/device',
    component: Home,
    name: '设备控制',
    iconClass: 'fa fa-link',
    children: [
      {path: '/device/CollectorDeviceConfig', component: CollectorDeviceConfig, name: '智能物联网关设备配置', leaf: true},
      {path: '/device/collectorIPConfig', component: CollectorIPConfig, name: '智能物联网关IP配置', leaf: true},
      {path: '/device/collectorRedundancyConfig', component: CollectorRedundancyConfig, name: '智能物联网关冗余配置', leaf: true}
    ]
  },
  {
    path: '/reports',
    component: Home,
    name: '报表',
    iconClass: 'fa fa-file-text-o',
    children: [
      {path: '/reports/monitoringAlarmLog', component: MonitoringAlarmLog, name: '监控报警日志', leaf: true},
      {path: '/reports/abnormalParameters', component: AbnormalParameters, name: '报警窗口异常值详情', leaf: true, hidden: true},

    ]
  },
  {
    path: '/trace',
    component: Home,
    name: '追溯查询',
    iconClass: 'fa fa-share',
    children: [
      {path: '/trace/process', component: ProcessTrace, name: '工序查询', leaf: true},
      {path: '/trace/process/details/:id', component: ProcessDetails, name: '工序详情', leaf: true, hidden: true}
    ]
  },
  {
    path: '/basic',
    component: Home,
    name: '基础数据',
    iconClass: 'fa fa-database',
    children: [
      {path: '/basic/DeviceManagement', component: DeviceManagement, name: '设备管理', leaf: true},
      {path: '/basic/device', component: DeviceBasic, name: '设备台账', leaf: true},
      {path: '/basic/workShop', component: WorkShopBasic, name: '车间管理', leaf: true},
      {path: '/basic/process', component: ProcessBasic, name: '现场执行单元管理', leaf: true},
      {path: '/basic/commonParametersProcess', component: ProcessCommonParameters, name: '现场录入参数管理', leaf: true},
      {path: '/basic/OutputManagement', component: OutputManagement, name: '产出物管理', leaf: true},
      {path: '/basic/Badcode', component: Badcode, name: '不良代号管理', leaf: true},
    ]
  },
  {
    path: '/sysConfig',
    component: Home,
    name: '系统配置',
    iconClass: 'fa fa-cog',
    children: [
      {path: '/sysConfig/alarmLevel', component: AlarmLevelConfig, name: '报警配置', leaf: true},
      {path: '/sysConfig/deviceAlarmLevel', component: DeviceAlarmLevel, name: '采集参数报警等级配置', leaf: true},
      {path: '/sysConfig/deviceAlarmLevel/:id', component: DeviceAlarmLevelConfig, name: '配置参数', leaf: true, hidden: true},
      {path: '/sysConfig/deviceAlarmWindow', component: DeviceAlarmWindow, name: '采集参数报警窗口配置', leaf: true},
      {path: '/sysConfig/deviceAlarmWindow/:id', component: DeviceAlarmWindowConfig, name: '配置报警窗口', leaf: true, hidden: true},
      {path: '/sysConfig/monitoringAlarm/overview/:id', component: MonitoringAlarmConfigView, name: '监控报警模块配置', leaf: true, hidden: true},
      {path: '/sysConfig/monitoringAlarm/perspective', component: MonitoringAlarmPerspective, name: '监控报警视角配置', leaf: true},
      {path: '/sysConfig/monitoringAlarm/perspective/step/:id', component: MonitoringAlarmConfigStep, name: '配置参数', leaf: true, hidden: true},
      {path: '/sysConfig/siteMangement/overview', component: SiteMangementConfigView, name: '现场管理模块配置', leaf: true},
      {path: '/sysConfig/siteMangement/overview/step', component: SiteMangementConfigStep, name: '配置参数', leaf: true, hidden: true}
    ]
  },
  {
    path: '*',
    hidden: true,
    redirect: {path: '/404'}
  }
]

export default menuModule
