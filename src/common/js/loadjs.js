/*
 * @Author: liucz 
 * @Date: 2018-08-30 09:10:48 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-29 10:55:28
 */
import * as urls from '@/api/cdn.js'

// 根据url加载script
const loadjs = (url, resolve, reject) => {
  let exist = false
  Array.prototype.slice.call(document.getElementsByTagName('script')).forEach(item => {
    if (item.src === url) {
      resolve()
      exist = true
    }
  })
  // 不存在才加载script
  if (!exist) {
    let script = document.createElement('script')
    script.type = 'text/Javascript'
    script.charset = 'UTF-8'
    script.async = 'true'
    script.src = url
    document.body.appendChild(script)
    if (document.all) { //如果是IE
      script.onreadystatechange = () => {
        if (script.readyState == 'loaded' || script.readyState == 'complete') {
          resolve()
        }
      }
    } else {
      script.onload = () => {
        resolve()
      }
    }
  }
}

// 可以异步加载cdn的js，这样避免如echartsjs打包在项目里面，彻底和项目分离
// type: module src
export default (name, type='module') => {
  return new Promise((resolve, reject) => {
    if (type === 'module') {
      if (Object.keys(urls).indexOf(name) > -1) {
        loadjs(urls[name], resolve, reject)
      } else {
        reject('此模块未在cdn.js中定义：' + name)
      }
    } else if (type === 'src') {
      loadjs(name, resolve, reject)
    }
  })
}
