import Device from './Device/index.js'
import Workstage from './Workstage/index.js'
import Collector from './Collector/index.js'
import MultiParamsInput from './MultiParamsInput/index.js'
import WorkShop from './WorkShop/index.js'
import CommonProcessParameters from './CommonProcessParameters/index.js'
import WorkstageParameters from './WorkstageParameters/index.js'
import DeviceParameters from './DeviceParameters/index.js'
import Permission from './Permission/index.js'
import WarningUnit from './WarningUnit/index.js'
import DeviceTypes from './DeviceTypes/index.js'

const components = [
  Device,
  Workstage,
  Collector,
  MultiParamsInput,
  WorkShop,
  CommonProcessParameters,
  WorkstageParameters,
  DeviceParameters,
  Permission,
  WarningUnit,
  DeviceTypes
]

const install = function (Vue, opts = {}) {
  components.map(component => {
    Vue.component(component.name, component)
  })
  // 选择设备
  Vue.prototype.$mesDevice = Device
  // 选择工序
  Vue.prototype.$mesWorkstage = Workstage
  // 选择智能物联网关
  Vue.prototype.$mesCollector = Collector
  // 多行输入框
  Vue.prototype.$mesMultiParamsInput = MultiParamsInput
  // 选择车间
  Vue.prototype.$mesWorkShop = WorkShop
  // 选择工序参数
  Vue.prototype.$mesCommonProcessParameters = CommonProcessParameters
  // 选择某个工序下面的所有工序参数
  Vue.prototype.$mesWorkstageParameters = WorkstageParameters
  // 选择设备参数
  Vue.prototype.$mesDeviceParameters = DeviceParameters
  // 权限确认
  Vue.prototype.$mesPermission = Permission
  // 选择单元
  Vue.prototype.$mesWarningUnit = WarningUnit
  // 选择设备类型
  Vue.prototype.$mesDeviceTypes = DeviceTypes
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

const modules = {
  version: '1.0.0',
  author: 'liuchuanzhong',
  install,
  Device,
  Workstage,
  Collector,
  MultiParamsInput,
  WorkShop,
  CommonProcessParameters,
  WorkstageParameters,
  DeviceParameters,
  Permission,
  WarningUnit,
  DeviceTypes
}

export default modules
