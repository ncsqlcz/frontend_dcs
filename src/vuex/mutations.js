import * as types from './mutation-types'
// import utils from '../common/js/utils'

export default {
  // 设置 alarmType
  [types.SET_ALARM_TYPE] (state, type) {
    state.alarmType = type
  },
  // 设置 collapsed
  [types.SET_COLLAPSED] (state, bool) {
    state.collapsed = bool
  },
  // 设置 collapsed
  [types.SET_DEVICE_TYPES] (state, list) {
    state.deviceTypeList = list
  },
  // 设置 routes
  [types.SET_ROUTES] (state, arr) {
    // localStorage.setItem('routes', JSON.stringify(arr))
    state.routes = arr
  },
  // 设置 alarmColorList 以及 alarmColorDict
  [types.SET_ALARM_COLOR_LIST] (state, arr) {
    let dict = {}
    arr.forEach(item => {
      dict[item.value] = item
    })
    state.alarmColorList = arr
    state.alarmColorDict = dict
  },
  // 设置 perspectiveList
  [types.SET_PERSPECTIVE_LIST] (state, arr) {
    state.perspectiveList = arr
  },
  // 设置 alarmTypeList
  [types.SET_ALARM_TYPE_LIST] (state, arr) {
    state.alarmTypeList = arr
  },
  // 设置 menuModule
  [types.SET_MENU_MODULE] (state, str) {
    state.menuModule = str
  }
}
