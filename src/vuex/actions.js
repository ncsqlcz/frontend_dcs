import * as types from './mutation-types'
import {
  queryWarningLevel, queryWarningCategory,
  queryWarningUintType, queryDeviceType
} from '../api/api'

export const setCollapsed = ({commit}, bool) => {
  commit(types.SET_COLLAPSED, bool)
}

// 设置当前菜单模块
export const setMenuModule = ({commit}, str) => {
  sessionStorage.menuModule = str
  commit(types.SET_MENU_MODULE, str)
}
// 初始化DeviceTypes
export const initDeviceTypeList = ({commit}, para) => {
  return new Promise((resolve, reject) => {
    queryDeviceType(para).then(res => {
      if (res.status === 0) {
        let typeList = []
        res.map.deviceTypeDOs.forEach(item => {
          item.label = item.device_type_name
          item.value = item.device_type_id
          typeList.push(item)
        })
        commit(types.SET_DEVICE_TYPES, typeList)
        resolve()
      } else {
        reject()
      }
    })
  })
}
// 设置 routes
export const setRoutes = ({commit}, arr) => {
  commit(types.SET_ROUTES, arr)
}
// 初始化 alarmColorList
export const initAlarmColorList = ({commit}, para) => {
  return new Promise((resolve, reject) => {
    queryWarningLevel(para).then(res => {
      if (res.status === 0) {
        let alarmColorList = []
        res.map.warningLevels.forEach(item => {
          // item.status = '0' 表示它是默认，不是用户自定义
          item.label = item.warning_level_name
          item.value = item.warning_level
          item.color = item.warning_color
          alarmColorList.push(item)
        })
        commit(types.SET_ALARM_COLOR_LIST, alarmColorList)
        resolve()
      } else {
        reject()
      }
    })
  })
}
// 初始化 perspectiveList
export const initPerspectiveList = ({commit}, para) => {
  return new Promise((resolve, reject) => {
    let perspectiveList = []
    queryWarningUintType(para).then(res => {
      if (res.status === 0) {
        res.map.warningUnitTypeDOs.forEach(item => {
          if (item.status === '0') {
            item.label = item.warning_unit_type_name
            item.value = item.warning_uint_type_id
            perspectiveList.push(item)
          }
        })
        commit(types.SET_PERSPECTIVE_LIST, perspectiveList)
        resolve()
      } else {
        reject()
      }
    })
  })
}
// 初始化 alarmTypeList
export const initAlarmTypeList = ({commit}, para) => {
  return new Promise((resolve, reject) => {
    queryWarningCategory(para).then(res => {
      if (res.status === 0) {
        let alarmTypeList = []
        res.map.warningCategorys.forEach(item => {
          item.label = item.warning_category_name
          item.value = item.warning_category_id
          item.alarm_level = {'L5': '0', 'L4': '0', 'L3': '0', 'L2': '0', 'L1': '1'}
          item.warningLevels.forEach(val => {
            item.alarm_level[val.warning_level] = '1'
          })
          alarmTypeList.push(item)
        })
        commit(types.SET_ALARM_TYPE_LIST, alarmTypeList)
        resolve()
      } else {
        reject()
      }
    })
  })
}
// 获取一个空的报警参数对象
export const getEmptyLevelData = () => {
  return {'L5': '', 'L4': '', 'L3': '', 'L2': '', 'L1': '', 'U1': '', 'U2': '', 'U3': '', 'U4': '', 'U5': ''}
}
// 获取一个空的窗口参数对象
export const getEmptyWindowData = () => {
  return {'L5': '', 'L4': '', 'L3': '', 'L2': ''}
}