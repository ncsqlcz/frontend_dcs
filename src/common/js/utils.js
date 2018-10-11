let SIGN_REGEXP = /([yMdhsm])(\1*)/g;
let DEFAULT_PATTERN = 'yyyy-MM-dd';
function padding (s, len) {
  len = len - (s + '').length;
  for (let i = 0; i < len; i++) {
    s = '0' + s;
  }
  return s;
}

const utils = {
  // 获取url中的参数
  getQueryStringByName: function (name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    let r = window.location.search.substr(1).match(reg);
    let context = '';
    if (r != null) {
      context = r[2]
    }
    reg = null;
    r = null;
    return context == null || context === '' || context === 'undefined' ? '' : context;
  },
  // 格式化日期
  formatDate: {
    format: function (date, pattern) {
      pattern = pattern || DEFAULT_PATTERN;
      return pattern.replace(SIGN_REGEXP, function ($0) {
        switch ($0.charAt(0)) {
        case 'y':
          return padding(date.getFullYear(), $0.length);
        case 'M':
          return padding(date.getMonth() + 1, $0.length);
        case 'd':
          return padding(date.getDate(), $0.length);
        case 'w':
          return date.getDay() + 1;
        case 'h':
          return padding(date.getHours(), $0.length);
        case 'm':
          return padding(date.getMinutes(), $0.length);
        case 's':
          return padding(date.getSeconds(), $0.length);
        }
      });
    },
    parse: function (dateString, pattern) {
      let matchs1 = pattern.match(SIGN_REGEXP);
      let matchs2 = dateString.match(/(\d)+/g);
      if (matchs1.length === matchs2.length) {
        let _date = new Date(1970, 0, 1);
        for (let i = 0; i < matchs1.length; i++) {
          let _int = parseInt(matchs2[i]);
          let sign = matchs1[i];
          switch (sign.charAt(0)) {
          case 'y':
            _date.setFullYear(_int);
            break;
          case 'M':
            _date.setMonth(_int - 1);
            break;
          case 'd':
            _date.setDate(_int);
            break;
          case 'h':
            _date.setHours(_int);
            break;
          case 'm':
            _date.setMinutes(_int);
            break;
          case 's':
            _date.setSeconds(_int);
            break;
          }
        }
        return _date;
      }
      return null;
    }
  },
  // 延迟执行
  debounce (func, wait, immediate) {
    // immediate默认为false
    let timeout, args, context, timestamp, result;
    let later = function () {
      // 当wait指定的时间间隔期间多次调用_.debounce返回的函数，则会不断更新timestamp的值，导致last < wait && last >= 0一直为true，从而不断启动新的计时器延时执行func
      let last = Date.now() - timestamp;
      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };
    return function () {
      context = this;
      args = arguments;
      timestamp = Date.now();
      // 第一次调用该方法时，且immediate为true，则调用func函数
      let callNow = immediate && !timeout;
      // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }
      return result;
    };
  },
  // 判断是否是数组
  isArray (o) {
    return Object.prototype.toString.call(o) === '[object Array]'
  },
  // 深度拷贝
  deepCopy: function (o) {
    if (o instanceof Array) {
      let n = [];
      for (let i = 0; i < o.length; ++i) {
        n[i] = utils.deepCopy(o[i]);
      }
      return n;
    } else if (o instanceof Object) {
      let n = {}
      for (let i in o) {
        n[i] = utils.deepCopy(o[i]);
      }
      return n;
    } else {
      return o;
    }
  },
  // 加
  add (a, b) {
    let c, d, e;
    try {
      c = a.toString().split('.')[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split('.')[1].length;
    } catch (f) {
      d = 0;
    }
    e = Math.pow(10, Math.max(c, d))
    return (utils.mul(a, e) + utils.mul(b, e)) / e
  },
  // 减
  sub (a, b) {
    let c, d, e;
    try {
      c = a.toString().split('.')[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split('.')[1].length;
    } catch (f) {
      d = 0;
    }
    e = Math.pow(10, Math.max(c, d))
    return (utils.mul(a, e) - utils.mul(b, e)) / e
  },
  // 乘
  mul (a, b) {
    let c = 0
    let d = a.toString()
    let e = b.toString()
    try {
      c += d.split('.')[1].length;
    } catch (f) {
    }
    try {
      c += e.split('.')[1].length;
    } catch (f) {
    }
    return Number(d.replace('.', '')) * Number(e.replace('.', '')) / Math.pow(10, c);
  },
  // 除
  div (a, b) {
    let c, d
    let e = 0
    let f = 0
    try {
      e = a.toString().split('.')[1].length;
    } catch (g) {
    }
    try {
      f = b.toString().split('.')[1].length;
    } catch (g) {
    }
    c = Number(a.toString().replace('.', ''))
    d = Number(b.toString().replace('.', ''))
    return utils.mul(c / d, Math.pow(10, f - e))
  },
  // 获取分页索引
  getHeadNumAdapter (page = 1, pageSize = 0, index = 0) {
    return utils.mul(pageSize, page - 1) + index + 1
  },
  // 公用正则表达式
  reg: {
    telPhone: /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/,   // 固话
    // 手机号
    tel: /^1[34578]\d{9}$/,
    // 邮箱
    email: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
    // 密码：大小写字母、数字组成的6-16位字符,不能纯数字或字母
    password: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z.]{6,16}$/,
    // IP
    ip: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
  },
  // 验证手机号
  checkTel (rule, value, callback) {
    if (!value) {
      return callback(new Error('电话号码不能为空'))
    }
    if (!(utils.reg.tel.test(value))) {
      callback(new Error('手机号码格式有误'))
      return false
    } else {
      callback()
    }
  },
  // 验证固话
  checkTelPhone (rule, value, callback) {
    if (!value) {
      return callback(new Error('电话号码不能为空'))
    }
    if (!(utils.reg.telPhone.test(value))) {
      callback(new Error('电话号码格式有误'))
      return false;
    } else {
      callback()
    }
  },
  // 验证email
  checkEmail (rule, value, callback) {
    if (value === '') {
      return callback()
    }
    if (!(utils.reg.email.test(value))) {
      callback(new Error('邮箱格式有误'))
      return false
    } else {
      callback()
    }
  },
  checkPassword (rule, value, callback) {
    if (!value) {
      return callback(new Error('密码不能为空'))
    }
    if (!(utils.reg.password.test(value))) {
      callback(new Error('密码格式是大小写字母、数字组成的6-16位字符,不能纯数字或字母'))
      return false
    } else {
      callback()
    }
  },
  // 验证输入框是否可以为空
  checkNumber (rule, value, callback) {
    if (value === '') {
      return callback()
    }
    if (!(Number.isInteger(value))) {
      callback(new Error('必须是数字'))
      return false;
    } else {
      callback()
    }
  },
  checkIP (rule, value, callback) {
    if (value === '') {
      return callback()
    }
    if (!(utils.reg.ip.test(value))) {
      callback(new Error('IP格式有误'))
      return false;
    } else {
      callback()
    }
  },
  // dataPicker 选择今天之前的时间（包括今天）
  pickerOptionsBefore: {
    shortcuts: [
      {
        text: '今天',
        onClick (picker) {
          picker.$emit('pick', new Date())
        }
      },
      {
        text: '昨天',
        onClick (picker) {
          const date = new Date()
          date.setTime(date.getTime() - 3600 * 1000 * 24)
          picker.$emit('pick', date)
        }
      },
      {
        text: '一周前',
        onClick (picker) {
          const date = new Date()
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
          picker.$emit('pick', date)
        }
      },
      {
        text: '一个月前',
        onClick (picker) {
          const date = new Date()
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 30)
          picker.$emit('pick', date)
        }
      },
      {
        text: '三个月前',
        onClick (picker) {
          const date = new Date()
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 90)
          picker.$emit('pick', date)
        }
      }
    ],
    disabledDate (time) {
      return time.getTime() > Date.now() - 8.64e6
    }
  },
  // 时间选择器（开始和结束时间同时选择）
  pickerOptionsBefore2: {
    shortcuts: [{
      text: '昨天',
      onClick (picker) {
        const end = new Date(new Date().setHours(0, 0, 0, 0))
        const start = new Date(new Date().setHours(0, 0, 0, 0))
        start.setTime(start.getTime() - 86400000);
        end.setTime(end.getTime())
        picker.$emit('pick', [start, end])
      }
    }, {
      text: '最近一周',
      onClick (picker) {
        const end = new Date(new Date().setHours(0, 0, 0, 0))
        const start = new Date(new Date().setHours(0, 0, 0, 0))
        start.setTime(start.getTime() - 86400000 * 7)
        end.setTime(end.getTime())
        picker.$emit('pick', [start, end])
      }
    }, {
      text: '最近一个月',
      onClick (picker) {
        const end = new Date(new Date().setHours(0, 0, 0, 0))
        const start = new Date(new Date().setHours(0, 0, 0, 0))
        start.setTime(start.getTime() - 86400000 * 30)
        end.setTime(end.getTime())
        picker.$emit('pick', [start, end])
      }
    }]
  },
  // 根据数组的id, pId生成二叉树，调用示例
  getTree (rootId, list) {
    let arr = []
    for (let i = 0, len = list.length; i < len; i++) {
      if (list[i].pId === rootId) {
        list[i].children = this.getTree(list[i].id, list)
        arr.push(list[i])
      }
    }
    return arr
  },
  // 元素全屏
  requestFullScreen (element) {
    // 判断各种浏览器，找到正确的方法
    let requestMethod = element.requestFullScreen || // W3C
      element.webkitRequestFullScreen ||    // Chrome等
      element.mozRequestFullScreen || // FireFox
      element.msRequestFullScreen // IE11
    if (requestMethod) {
      requestMethod.call(element)
    } else if (typeof window.ActiveXObject !== 'undefined') {  // for Internet Explorer
      let wscript = new window.ActiveXObject('WScript.Shell')
      if (wscript !== null) {
        wscript.SendKeys('{F11}')
      }
    }
  },
  // 退出全屏 判断浏览器种类
  exitFullScreen () {
    // 判断各种浏览器，找到正确的方法
    let exitMethod = document.exitFullscreen || // W3C
      document.mozCancelFullScreen ||    // Chrome等
      document.webkitExitFullscreen || // FireFox
      document.webkitExitFullscreen; // IE11
    if (exitMethod) {
      exitMethod.call(document);
    } else if (typeof window.ActiveXObject !== 'undefined') { // for Internet Explorer
      var wscript = new window.ActiveXObject('WScript.Shell')
      if (wscript !== null) {
        wscript.SendKeys('{F11}')
      }
    }
  },
  // 是不是处于全屏状态
  checkFullScreen () {
    var isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled
    // to fix : false || undefined == undefined
    if (isFull === undefined) {
      isFull = false
    }
    return isFull
  },
  // 公用打印
  print (parent) {
    let el = document.createElement('div')
    el.classList.add('printable')
    el.style.width = '100%'
    el.innerHTML = parent.innerHTML
    // 小图标不打印
    el.querySelectorAll('.el-collapse-item__arrow').forEach(item => {
      item.classList.add('print-exclude')
    })
    el.querySelectorAll('.el-collapse-item__wrap').forEach(item => {
      item.style.border = 'none'
    })
    document.body.appendChild(el)
    window.print()
  },
  // 下载文件
  downloadFile (url) {
    let form = document.createElement('form')
    form.style.display = 'none'
    form.setAttribute('target', '')
    form.setAttribute('method', 'post')
    form.setAttribute('action', url)
    document.body.appendChild(form)
    form.submit()
  },
  // 对比id数组，找出新增和删除的ids
  // 举例
  // [1,2,3,4,5,6,7] [3,4,5,10,11,12]
  // return
  // {
  //   addIds: [10, 11, 12],
  //   delIds: [1,2,6,7]
  // }
  contrastIds (oldIds, newIds) {
    let obj = {
      addIds: [],
      delIds: []
    }
    newIds.forEach((newId, index) => {
      oldIds.forEach((oldId, i) =>{
        if (newId === oldId) {
          delete newIds[index]
          delete oldIds[i]
        }
      })
    })
    // 去掉 使用 delete 留下的 undefined 项
    newIds.forEach(id => {
      if (id) {
        obj.addIds.push(id)
      }
    })
    oldIds.forEach(id => {
      if (id) {
        obj.delIds.push(id)
      }
    })
    return obj
  },
  // 根据时间戳转换为 时:分:秒
  getBootTime (timestamp) {
    if (!timestamp) {
        return '00:00:00'
      } else {
        let zero = (n) => { return n >= 10 ? n : '0' + n }
        let h = zero(Math.floor(timestamp / 1000 / 3600))
        let m = zero(Math.floor((timestamp / 1000 - h * 3600) / 60))
        let s = zero(Math.floor(timestamp / 1000 - h * 3600 - m * 60))
        return (`${h}:${m}:${s}`)
    }
  },
  // 数据多层遍历时，根据下标返回当前遍历到第几次
  // 举个例子
  // [2, 3]
  // return 12
  getArraysIndex (indexs) {
    const arrIndex = indexs
    let num = 1
    arrIndex.forEach(index => {
      num = num * (index + 1)
    })
    return num - 1
  },
  // 增加天数
  addDateByDay (date, days = 0) {
    let timestamp = date.getTime() +　days * 1000 * 60 * 60 * 24
    return new Date(utils.formatDate.format(new Date(timestamp), 'yyyy-MM-dd 00:00:00'))
  },
  // 增加小时
  addDateByHour (date, hours = 0) {
    let timestamp = date.getTime() + hours * 1000 * 60 * 60
    return new Date(utils.formatDate.format(new Date(timestamp), 'yyyy-MM-dd hh:00:00'))
  },
  // 两个日期相差多少天
  getHowManyDays (date1 = new Date(), date2 = new Date()) {
    return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
  },
  // 保存参数到url
  saveToUrl (json) {
    let str = ''
    Object.entries(json).forEach(([key, value]) => {
      if (value) {
        str += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&'
      }
    })
    // 出去最后一个 & 符号
    str = str.substr(0, str.length - 1)
    // 原url已经有参数了
    let hash = ''
    if (location.hash.indexOf('?') > -1) {
      let index = location.hash.indexOf('?')
      hash = location.hash.substr(0, index)
    } else {
      hash = location.hash
    }
    location.replace(hash + '?' + str)
  },
  // 根据device_id去重，// 比如[{id: '1', name: '12'}, {name: '12', id: '1'}]
  uniqArrByKey(arr, key) {
    let keys = {}
    arr.forEach(item => {
      keys[item.device_id] = item
    })
    let results = []
    Object.values(keys).forEach(value => {
      results.push(value)
    })
    return results
  }
}

export default utils
