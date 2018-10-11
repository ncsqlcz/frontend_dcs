/*
 * @Author: liucz 
 * @Date: 2018-08-27 19:32:09 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-09-03 15:06:58
 */
// 专门处理报警逻辑
import SocketService from '@/common/js/websocket'
export default {
  data () {
    return {
      alarmSocketService: null
    }
  },
  methods: {
    // 报警SocketService相关
    initAlarmSocketService (data) {
      if (this.alarmSocketService) {
        this.alarmSocketService.close()
      }
      this.alarmSocketService = SocketService()
      // socketService初始化
      this.alarmSocketService.connect('/webSocket')
      this.alarmSocketService.on('socket_opened', socket => {
        console.log('socket_opened:', socket)
        if (data) {
          socket.send(data)
        }
      })
      // 重连
      this.alarmSocketService.on('socket_reconnect', () => {
        console.log('socket_reconnect')
        this.initAlarmSocketService()
      })

      // 报警单元异常数据
      this.alarmSocketService.on('warningUnitDataError', map => {
        this.setUnitAlarmLevel(map)
      })
      // 报警单元恢复正常
      this.alarmSocketService.on('warningUnitDataNormal', map => {
        this.setUnitAlarmLevel(map)
      })
    },
    setUnitAlarmLevel (map, level = 'L1') {}
  },
  destroyed () {
    this.alarmSocketService.close()
  }
}