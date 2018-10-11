import axios from 'axios'
import store from '../vuex/store'
import { MessageBox } from 'element-ui'
import qs from 'qs'
import { base } from './base.js'

// 带cookie请求
axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
//  request 请求拦截器 - 请求之前headers加token
axios.interceptors.request.use(
  config => {
    // 登录不用加token
    //  每次发送请求之前检测都vuex存有token,那么都要放在请求头发送给服务器
    if (config.url.indexOf('/tokens') < 0 && store.state.token) {
      config.headers.Authorization = `Bearer ${store.state.token}`
    }
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    return config
  },
  err => {
    return Promise.reject(err)
  }
)                                                                                                                                                                                                                                                                                                                                    
//  response 错误统一处理
axios.interceptors.response.use(
  res => {
    if (res.data.status === 9) {
      localStorage.removeItem('token')
      MessageBox.alert('需要重新登录', '提示', {
        type: 'warning',
        confirmButtonText: '重新登录'
      }).then(() => {
        window.location.href = 'http://www.imes-inc.ser:8082/mes/login.html'
      })
      return Promise.reject(res)
    }
    return res
  },
  err => {
    //  console.log(err)
    MessageBox.alert('网络错误', '提示', {
      type: 'error',
      closeOnClickModal: true,
      closeOnPressEscape: true
    }).then(() => {
    })
    return Promise.reject(err)
  }
)


/* 基础数据 */
export const queryStaff = params => { return axios.post(`${base}/system/alarmConfiguration/queryWarningLevel.do`, qs.stringify(params)).then(res => res.data) }
export const downloadExcelUrl = `${base}/basicData/deviceLedger/exportDeviceLedger.do`  // type：类型（workshop:导出车间模板 deviceL设备模板 process:工序模板）
export const importDeviceLedgerUrl = `${base}/basicData/deviceLedger/importDeviceLedger.do`
export const importWorkShopOrProcessUrl = `${base}/basicData/warningUnitType/importWorkShopOrProcess.do` // file:文件对象 type(类型)（workshop:导入车间  workstage:导入工序）
export const importDevice = form => { return axios.post(`${base}/basicData/deviceLedger/importDeviceLedger.do`, form).then(res => res.data) }
export const queryCollectorDevice = params => { return axios.post(`${base}/basicData/deviceLedger/queryCollectorDevice.do`, qs.stringify(params)).then(res => res.data) }
export const importWorkShopOrProcess = form => { return axios.post(`${base}/basicData/warningUnitType/importWorkShopOrProcess.do`, form).then(res => res.data) }
export const queryProcessParam = params => { return axios.post(`${base}/basicData/processParam/queryProcessParam.do`, qs.stringify(params)).then(res => res.data) }
export const saveProcessParam = params => { return axios.post(`${base}/basicData/processParam/saveProcessParam.do`, qs.stringify(params)).then(res => res.data) }
export const modifyProcessParam = params => { return axios.post(`${base}/basicData/processParam/modifyProcessParam.do`, qs.stringify(params)).then(res => res.data) }
export const queryDeviceType = params => { return axios.post(`${base}/basicData/processParam/queryDeviceType.do`, qs.stringify(params)).then(res => res.data) }
// 设备管理
export const queryEquipment = params => { return axios.post(`${base}/basicData/warningUnitType/queryEquipment.do`, qs.stringify(params)).then(res => res.data) }
export const exportEquipmenUrl = `${base}/basicData/warningUnitType/exportEquipment.do` //导出设备Url
export const importEquipmentUrl = `${base}/basicData/warningUnitType/importEquipment.do` //导入设备Url
export const exportEquipmentParamUrl = `${base}/basicData/warningUnitType/exportEquipmentParam.do` //导出设备参数Url
export const importEquipmentParamUrl = `${base}/basicData/warningUnitType/importEquipmentParam.do` //导入设备参数Url
export const importEquipment = form => { return axios.post(`${base}/basicData/warningUnitType/importEquipment.do`, form).then(res => res.data) }
export const importEquipmentParam = form => { return axios.post(`${base}/basicData/warningUnitType/importEquipmentParam.do`, form).then(res => res.data) }
export const queryEquipmentParam = params=> { return axios.post(`${base}/basicData/warningUnitType/queryEquipmentParam.do`, qs.stringify(params)).then(res => res.data) }
export const testConnectPLC = params => { return axios.post(`${base}/basicData/warningUnitType/testConnectPLC.do`, qs.stringify(params)).then(res => res.data) }
export const testConnectDataBase = params => { return axios.post(`${base}/basicData/warningUnitType/testConnectDataBase.do`, qs.stringify(params)).then(res => res.data) }
export const queryParamSources = params => { return axios.post(`${base}/basicData/warningUnitType/queryParamSources.do`, qs.stringify(params)).then(res => res.data) }
export const queryAccessConfig = params => { return axios.post(`${base}/basicData/warningUnitType/queryAccessConfig.do`, qs.stringify(params)).then(res => res.data) }
export const saveAccessConfig = params => { return axios.post(`${base}/basicData/warningUnitType/saveAccessConfig.do`, qs.stringify(params)).then(res => res.data) }
export const saveDeviceSend = params => { return axios.post(`${base}/basicData/warningUnitType/saveDeviceSend.do`, qs.stringify(params)).then(res => res.data) }
export const queryDeviceSend = params => { return axios.post(`${base}/basicData/warningUnitType/queryDeviceSend.do`, qs.stringify(params)).then(res => res.data) }
// 产出物
export const queryOutPutArticle = params => { return axios.post(`${base}/basicData/warningUnitType/queryOutPutArticle.do`, qs.stringify(params)).then(res => res.data) } //查询产出物信息
export const exportOutPutArticleUrl = `${base}/basicData/warningUnitType/exportOutPutArticle.do` //导出产出物信息Url
export const importOutPutArticleUrl = `${base}/basicData/warningUnitType/importOutPutArticle.do` //导入产出物信息Url
export const importOutPutArticle = form => { return axios.post(`${base}/basicData/warningUnitType/importOutPutArticle.do`, form).then(res => res.data) }
export const exportDeviceUrl = `${base}/basicData/warningUnitType/exportDevice.do`
// 不良品
export const queryBadCode = params => { return axios.post(`${base}/basicData/warningUnitType/queryBadCode.do`, qs.stringify(params)).then(res => res.data) }
export const importBadCodeUrl = `${base}/basicData/warningUnitType/importBadCode.do`
export const importBadCode = form => { return axios.post(`${base}/basicData/warningUnitType/importBadCode.do`, form).then(res => res.data) }
export const exportBadCodeUrl = `${base}/basicData/warningUnitType/exportBadCode.do`

/* 系统配置 */
export const queryWorkShopOrProcess = params => { return axios.post(`${base}/basicData/warningUnitType/queryWorkShopOrProcess.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarningLevel = params => { return axios.post(`${base}/system/alarmConfiguration/queryWarningLevel.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarningCategory = params => { return axios.post(`${base}/system/alarmConfiguration/queryWarningCategory.do`, qs.stringify(params)).then(res => res.data) }
export const modifyWarningLevel = params => { return axios.post(`${base}/system/alarmConfiguration/modifyWarningLevel.do`, qs.stringify(params)).then(res => res.data) }
export const saveWarningCategory = params => { return axios.post(`${base}/system/alarmConfiguration/saveWarningCategory.do`, qs.stringify(params)).then(res => res.data) }
export const modifyWarningCategory = params => { return axios.post(`${base}/system/alarmConfiguration/modifyWarningCategory.do`, qs.stringify(params)).then(res => res.data) }
export const modifyToDefault = params => { return axios.post(`${base}/system/alarmConfiguration/modifyToDefault.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarningDeviceParamLevel = params => { return axios.post(`${base}/system/parameterWarningLevelConf/queryWarningDeviceParamLevel.do`, qs.stringify(params)).then(res => res.data) }
export const saveWarningDeviceParamLevel = params => { return axios.post(`${base}/system/parameterWarningLevelConf/saveWarningDeviceParamLevel.do`, qs.stringify(params)).then(res => res.data) }
export const queryParamTemplate = params => { return axios.post(`${base}/system/parameterWarningLevelConf/queryParamTemplate.do`, qs.stringify(params)).then(res => res.data) }
export const modifyParamTemplate = params => { return axios.post(`${base}/system/parameterWarningLevelConf/modifyParamTemplate.do`, qs.stringify(params)).then(res => res.data) }
export const removeParamTemplate = params => { return axios.post(`${base}/system/parameterWarningLevelConf/removeParamTemplate.do`, qs.stringify(params)).then(res => res.data) }
export const saveTemplateWarningParamLevel = params => { return axios.post(`${base}/system/parameterWarningLevelConf/saveTemplateWarningParamLevel.do`, qs.stringify(params)).then(res => res.data) }
export const queryDeviceParam = params => { return axios.post(`${base}/system/parameterWarningLevelConf/queryDeviceParam.do`, qs.stringify(params)).then(res => res.data) }
export const queryDeviceParamConf = params => { return axios.post(`${base}/system/parameterWarningLevelConf/queryDeviceParamConf.do`, qs.stringify(params)).then(res => res.data) }
export const queryTemplateBasic = params => { return axios.post(`${base}/system/parameterWarningLevelConf/queryTemplateBasic.do`, qs.stringify(params)).then(res => res.data) }
export const modifyWarningUnitTypeCategory = params => { return axios.post(`${base}/system/parameterWarningLevelConf/modifyWarningUnitTypeCategory.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarningUnitTypeCategory = params => { return axios.post(`${base}/system/parameterWarningLevelConf/queryWarningUnitTypeCategory.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarningUnitType = params => { return axios.post(`${base}/system/warningUnitType/queryWarningUnitType.do`, qs.stringify(params)).then(res => res.data) }
export const modifyCategoryStatus = params => { return axios.post(`${base}/system/warningUnitType/modifyCategoryStatus.do`, qs.stringify(params)).then(res => res.data) }
export const modifyLevelEmailStatus = params => { return axios.post(`${base}/system/warningUnitType/modifyLevelEmailStatus.do`, qs.stringify(params)).then(res => res.data) }
export const modifyLevelEmail = params => { return axios.post(`${base}/system/warningUnitType/modifyLevelEmail.do`, qs.stringify(params)).then(res => res.data) }
export const queryLevelEmail = params => { return axios.post(`${base}/system/warningUnitType/queryLevelEmail.do`, qs.stringify(params)).then(res => res.data) }
export const queryProcessExecuteConf = params => { return axios.post(`${base}/sceneManage/processexecute/queryProcessExecuteConf.do`, qs.stringify(params)).then(res => res.data) }
export const queryDevice = params => { return axios.post(`${base}/system/sceneConf/queryDevice.do`, qs.stringify(params)).then(res => res.data) }
export const queryTimeConf = params => { return axios.post(`${base}/system/warningUnitType/queryTimeConf.do`, qs.stringify(params)).then(res => res.data) }
export const modifyTimeConf = params => { return axios.post(`${base}/system/warningUnitType/modifyTimeConf.do`, qs.stringify(params)).then(res => res.data) }
export const saveModuleUnitOne = params => { return axios.post(`${base}/system/warningUnitType/saveModuleUnitOne.do`, qs.stringify(params)).then(res => res.data) }
export const saveModuleUnitTwo = params => { return axios.post(`${base}/system/warningUnitType/saveModuleUnitTwo.do`, qs.stringify(params)).then(res => res.data) }
export const queryModuleUnitTwo = params => { return axios.post(`${base}/system/warningUnitType/queryModuleUnitTwo.do`, qs.stringify(params)).then(res => res.data) }
export const saveModuleConfDevices = params => { return axios.post(`${base}/system/warningUnitType/saveModuleConfDevices.do`, qs.stringify(params)).then(res => res.data) }
export const queryConfDevice = params => { return axios.post(`${base}/system/warningUnitType/queryConfDevice.do`, qs.stringify(params)).then(res => res.data) }
export const saveWarningUnitType = params => { return axios.post(`${base}/system/warningUnitType/saveWarningUnitType.do`, qs.stringify(params)).then(res => res.data) }
export const permissionsToConfirm = params => { return axios.post(`${base}/system/warningUnitType/permissionsToConfirm.do`, qs.stringify(params)).then(res => res.data) }
export const modifyWarningUnitType = params => { return axios.post(`${base}/system/warningUnitType/modifyWarningUnitType.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarnUnit = params => { return axios.post(`${base}/system/warningUnitType/queryWarnUnit.do`, qs.stringify(params)).then(res => res.data) }
export const removeWarningUnitTypeConf = params => { return axios.post(`${base}/system/warningUnitType/removeWarningUnitTypeConf.do`, qs.stringify(params)).then(res => res.data) }
export const querySceneModule = params => { return axios.post(`${base}/system/sceneConf/querySceneModule.do`, qs.stringify(params)).then(res => res.data) }
export const saveProcessTwoChoiceUnit = params => { return axios.post(`${base}/system/sceneConf/saveProcessTwoChoiceUnit.do`, qs.stringify(params)).then(res => res.data) }
export const saveModuleUnitThree = params => { return axios.post(`${base}/system/warningUnitType/saveModuleUnitThree.do`, qs.stringify(params)).then(res => res.data) }
export const queryModuleUnit = params => { return axios.post(`${base}/system/warningUnitType/queryModuleUnit.do`, qs.stringify(params)).then(res => res.data) }
export const queryAlreadyConParam = params => { return axios.post(`${base}/system/warningUnitType/queryAlreadyConParam.do`, qs.stringify(params)).then(res => res.data) }
export const queryProcessTwoChoiceUnits = params => { return axios.post(`${base}/system/sceneConf/queryProcessTwoChoiceUnits.do`, qs.stringify(params)).then(res => res.data) }
export const saveProcessTwoChoiceUnitParam = params => { return axios.post(`${base}/system/sceneConf/saveProcessTwoChoiceUnitParam.do`, qs.stringify(params)).then(res => res.data) }
export const saveProcessTwoChoiceUnitCode = params => { return axios.post(`${base}/system/sceneConf/saveProcessTwoChoiceUnitCode.do`, qs.stringify(params)).then(res => res.data) }
export const saveProcessTwoChoiceUnitModuleDevice = params => { return axios.post(`${base}/system/sceneConf/saveProcessTwoChoiceUnitModuleDevice.do`, qs.stringify(params)).then(res => res.data) }
export const sceneConfQueryDevices = params => { return axios.post(`${base}/system/sceneConf/queryDevices.do`, qs.stringify(params)).then(res => res.data) }
export const saveProcessFour = params => { return axios.post(`${base}/system/sceneConf/saveProcessFour.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarningUnits = params => { return axios.post(`${base}/system/sceneConf/queryWarningUnits.do`, qs.stringify(params)).then(res => res.data) }
export const modifyLoginStatus = params => { return axios.post(`${base}/system/warningUnitType/modifyLoginStatus.do`, qs.stringify(params)).then(res => res.data) }
export const modifyWarnUnitTypeConfStatus = params => { return axios.post(`${base}/system/warningUnitType/modifyWarnUnitTypeConfStatus.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarnUnit2 = params => { return axios.post(`${base}/system/warnUnitType/queryWarnUnit.do`, qs.stringify(params)).then(res => res.data) }
export const modifyWarnUnitCreateType = params => { return axios.post(`${base}/system/warnUnitType/modifyWarnUnitCreateType.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarnUnitByCreateType = params => { return axios.post(`${base}/system/warnUnitType/queryWarnUnitByCreateType.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarnUnitCreateType = params => { return axios.post(`${base}/system/warnUnitType/queryWarnUnitCreateType.do`, qs.stringify(params)).then(res => res.data) }
export const saveDevicesMonitor = params => { return axios.post(`${base}/system/warnUnitType/saveDevicesMonitor.do`, qs.stringify(params)).then(res => res.data) }


/* 监控报警 */
export const queryWarningUintType = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/queryWarningUintType.do`, qs.stringify(params)).then(res => res.data) }
export const queryAllWarningUnit = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/queryAllWarningUnit.do`, qs.stringify(params)).then(res => res.data) }
export const queryalertStatistic = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/queryalertStatistic.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarnUnitSwitch = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/queryWarnUnitSwitch.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarnUnitDevice = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/queryWarnUnitDevice.do`, qs.stringify(params)).then(res => res.data) }
export const modifyWarningConfUnitTypeCategoryIsOn = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/modifyWarningConfUnitTypeCategoryIsOn.do`, qs.stringify(params)).then(res => res.data) }
export const modifyWarningConfModuleUnitDevicePara = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/modifyWarningConfModuleUnitDevicePara.do`, qs.stringify(params)).then(res => res.data) }
export const modifyWarningConfModuleUnitDevice = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/modifyWarningConfModuleUnitDevice.do`, qs.stringify(params)).then(res => res.data) }
export const queryDeviceInfo = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/queryDeviceInfo.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarningDeviceNum = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/queryWarningDeviceNum.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarnUnitByUnitTypeId = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/queryWarnUnitByUnitTypeId.do`, qs.stringify(params)).then(res => res.data) }
export const realTimeAlarmSendFileToCustomer = `${base}/monitorAlarm/realTimeAlarm/sendFileToCustomer.do?fileName=`
export const queryEnvironmentDevice = params => { return axios.post(`${base}/monitorAlarm/realTimeAlarm/queryEnvironmentDevice.do`, qs.stringify(params)).then(res => res.data) }

/* 现场管理 */
export const sceneManageLogin = params => { return axios.post(`${base}/sceneManage/login/login.do`, qs.stringify(params)).then(res => res.data) }
export const saveProcessStartTime = params => { return axios.post(`${base}/sceneManage/processexecute/saveProcessStartTime.do`, qs.stringify(params)).then(res => res.data) }
export const modifyProcessEndTime = params => { return axios.post(`${base}/sceneManage/processexecute/modifyProcessEndTime.do`, qs.stringify(params)).then(res => res.data) }
export const modifyProcessExecuteStatus = params => { return axios.post(`${base}/sceneManage/processexecute/modifyProcessExecuteStatu.do`, qs.stringify(params)).then(res => res.data) }
export const saveProcessForAuto = params => { return axios.post(`${base}/sceneManage/processexecute/saveProcessForAuto.do`, qs.stringify(params)).then(res => res.data) }
export const queryWarningConfUnitWorkingStatus = params => { return axios.post(`${base}/sceneManage/processexecute/queryWarningConfUnitWorkingStatus.do`, qs.stringify(params)).then(res => res.data) }
export const saveProcessParameter = params => { return axios.post(`${base}/sceneManage/processexecute/saveProcessParameter.do`, qs.stringify(params)).then(res => res.data) }

/* 报表 */
export const queryWarnStatistic =  params => { return axios.post(`${base}/report/warnLog/queryWarnStatistic.do`, qs.stringify(params)).then(res => res.data) }
export const queryAbnormalParam =  params => { return axios.post(`${base}/report/warnLog/queryAbnormalParam.do`, qs.stringify(params)).then(res => res.data) }
export const abnormalParamExcelUrl = `${base}/report/warnLog/queryAbnormalParam.do`  //导出表格
export const abnormalParametersExcelUrl = `${base}/monitorAlarm/realTimeAlarm/queryWarnUnitByUnitTypeId.do`  //导出报警异常参数表格
export const processExportParamValueUrl = `${base}/report/process/exportParamValue.do`

/* 追溯查询 */
export const queryTranceProcess = params => { return axios.post(`${base}/trace/process/queryTranceProcess.do`, qs.stringify(params)).then(res => res.data) }
export const queryTranceAbnormalById = params => { return axios.post(`${base}/trace/process/queryTranceAbnormalById.do`, qs.stringify(params)).then(res => res.data) }
export const exportParamValue = `${base}/trace/process/exportParamValue.do`  //导出工序查询异常参数表格
export const downloadDeviceParamUrl = `${base}/trace/process/queryTranceAbnormalById.do`
export const queryDeviceProcess = params => { return axios.post(`${base}/trace/process/queryDeviceProcess.do`, qs.stringify(params)).then(res => res.data) }
export const queryTraceProcessParam = params => { return axios.post(`${base}/trace/process/queryProcessParam.do`, qs.stringify(params)).then(res => res.data) }

/* 设备控制 */
export const queryIpConf = params => { return axios.post(`${base}/deviceControl/ipConf/queryIpConf.do`, qs.stringify(params)).then(res => res.data) }
export const modifyCollectorIp = params => { return axios.post(`${base}/deviceControl/ipConf/modifyCollectorIp.do`, qs.stringify(params)).then(res => res.data) }
export const queryCollector = params => { return axios.post(`${base}/deviceControl/ipConf/queryCollector.do`, qs.stringify(params)).then(res => res.data) }
export const queryCollectorBackup = params => { return axios.post(`${base}/deviceControl/collectorBackup/queryCollectorBackup.do`, qs.stringify(params)).then(res => res.data) }
export const saveCollectorBackup = params => { return axios.post(`${base}/deviceControl/collectorBackup/saveCollectorBackup.do`, qs.stringify(params)).then(res => res.data) }

/* 可视化设置 */
export const queryWorkShopInfos = params => { return axios.post(`${base}/queryWorkShopInfos.do`, qs.stringify(params)).then(res => res.data) }
export const queryDevicesTeam = params => { return axios.post(`${base}/queryDevicesTeam.do`, qs.stringify(params)).then(res => res.data) }
export const queryDevicesParameterById = params => { return axios.post(`${base}/queryDevicesParameterById.do`, qs.stringify(params)).then(res => res.data) }

/* 可视化 */
export const toLogin = params => { return axios.post(`${base}/toLogin.do`, qs.stringify(params)).then(res => res.data) }

/* 以下是RESTful api 示例 （可能以后api会支持） */
// 新增用户
// export const addUser = params => { return axios.post(`${base}/users`, qs.stringify(params)).then(res => res.data) }
// 删除用户
// export const removeUser = id => { return axios.delete(`${base}/users/${id}`).then(res => res.data) }
// 修改用户
// export const editUser = params => { return axios.put(`${base}/users/${params.user_id}`, qs.stringify(params)).then(res => res.data) }
// 获取用户列表
// export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }) }
