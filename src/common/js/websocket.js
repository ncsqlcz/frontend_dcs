import { wsBase } from '../../api/base'

// websocket服务
let SocketService = function () {
  /**********************************************************/
  /*                                                        */
  /*                       事件处理器                       */
  /*                                                        */
  /**********************************************************/
  function EventEmitter () {
    this.events = {};
  }
  // 绑定事件函数
  EventEmitter.prototype.on = function (eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
  };
  // 触发事件函数
  EventEmitter.prototype.emit = function (eventName, _) {
    let events = this.events[eventName]
    let args = Array.prototype.slice.call(arguments, 1)
    let i
    let m
    if (!events) {
      return;
    }
    for (i = 0, m = events.length; i < m; i++) {
      events[i].apply(null, args);
    }
  };

/* ******************基础部分*********************/
  function SocketService () {
    this.server = '';
    this.socket = null;
  }

// 继承自事件处理器，提供绑定事件和触发事件的功能
  SocketService.prototype = new EventEmitter();

  /* ************************服务器连接部分***************************/
  SocketService.prototype.connect = function (server) {
    /* socket readyState 状态码 */
    /*
      0        CONNECTING      连接尚未建立
      1        OPEN            WebSocket的链接已经建立
      2        CLOSING         连接正在关闭
      3        CLOSED          连接已经关闭或不可用
     */

    server = wsBase + server
    let socket = null;
    let that = this;
    let timer = null; // 心跳包计时器
    socket = this.socket = new WebSocket(server);
    socket.onopen = function () {
      that.emit('socket_opened', socket);
      // 不断发心跳，保持连接，不然不到1分钟ws会自动断开
      timer = setInterval(function () {
        if (socket !== undefined && socket.readyState !== 3) {
          socket.send('');
        } else {
          that.emit('socket_reconnect');
        }
        // console.log(socket.readyState, 'heartbeat')
      }, 5000);
    };
    socket.onmessage = function (message) {
      // console.info(message)
      let json = JSON.parse(message.data);
      if (json.eventName) {
        that.emit(json.eventName, json.data);
      } else {
        console.log(json);
        that.emit('socket_receive_message', socket, json);
      }
    };
    socket.onerror = function (error) {
      that.emit('socket_error', error);
    };
    socket.onclose = function () {
      console.log(server + ' socket_closed')
      that.emit('socket_closed');
      clearInterval(timer)
    };

    // 退出信令
    this.on('_logout', function () {
      that.emit('logout');
    })

    // 主动关闭socket
    SocketService.prototype.close = function () {
      if (socket.readyState === 1) {
        socket.close()
      }
    }
    // 登出
    SocketService.prototype.logout = function (args) {
      let _args = Object.assign({
        'eventName': '__logout__',
        'uid': 0,
        'data': {
          logout_device_id: args.device_id
        }
      }, args || {});
      console.log(_args);
      socket.send(JSON.stringify(_args));
    }
    // 发送
    SocketService.prototype.send = function (args) {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify(args));
      }
    }
    // 发送
    SocketService.prototype.initSend = function (args) {
      let _args = Object.assign({
        'eventName': '__initial__',
        'uid': 0,
        'data': {}
      }, args || {});
      socket.send(JSON.stringify(_args));
      console.log('__initial__');
    }
  }
  return new SocketService();
}

// 获取ws服务器
// function getServer () {
//   let server = '';
//   if (document.location.protocol === 'https:') {
//     server = 'wss://' + window.location.host + '/api/global/ws';
//   } else {
//     // server = 'ws://' + window.location.host + '/api/global/ws';
//     server = wsBase;
//   }
//   return server;
// }

// let socketService = SocketService();
// socketService.connect(getServer());
// socketService.on('socket_opened', function (socket) {
//   console.log('socket 连接成功');
//   console.log(socket);
//   // 不断发心跳，保持连接，不然不到1分钟ws会自动断开
//   setInterval(function () {
//     if (socket !== undefined && socket.readyState !== 3) {
//       socket.send('');
//     }
//   }, 5000);
// });
// socketService.on('logout', function () {
//   // logout();
// })

export default SocketService
