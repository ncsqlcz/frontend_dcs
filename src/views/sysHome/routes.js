// 避免循环引用 因为routes.js里面定义了sysHome, 而sysHome就不能再直接引用routes.js了
import routesConfig from '../../routes.js'
export default menuModule
