// 报警类型
export const getAlarmType = state => {
  return state.alarmType
}
// 菜单展开状态
export const getCollapsed = state => {
  return state.collapsed
}
// 获取 deviceTypes
export const getDeviceTypes = state => {
  return state.deviceTypes
}
// 获取 deviceRunningStatus
export const getDeviceRunningStatus = state => {
  return state.deviceRunningStatus
}
// 获取 AcquisitionParameterStatus
export const getAcquisitionParameterStatus = state => {
  return state.acquisitionParameterStatus
}

// 获取 routes
export const getRoutes = state => {
  // state.routes = JSON.parse(localStorage.getItem('routes')) || []
  return state.routes
}
// 获取 routesConfig
export const getRoutesConfig = state => {
  return state.routesConfig
}
// 获取 deviceTypeList
export const getDeviceTypeList = state => {
  return state.deviceTypeList
}
// 获取 processStatusList
export const getProcessStatusList = state => {
  return state.processStatusList
}
// 获取 perspectiveList
export const getPerspectiveList = state => {
  return state.perspectiveList
}
// 获取 alarmColorList
export const getAlarmColorList = state => {
  return state.alarmColorList
}
// 获取 alarmColorDict
export const getAlarmColorDict = state => {
  return state.alarmColorDict
}
// 获取 alarmTypeList
export const getAlarmTypeList = state => {
  return state.alarmTypeList
}
// 获取 menuModule
export const getMenuModule = state => {
  return state.menuModule
}
// 获取 现场管理unitTypeId
export const getSiteUnitTypeId = state => {
  return state.siteUnitTypeId
}
