<template>
    <div class="login_start">
        <el-form :model="loginForm" :rules="loginRule" ref="loginForm" label-position="left" label-width="0px"
                 class="login-container">
            <h2 class="title"><img src="../assets/logo.jpg" alt="" class="logo" width="32" height="32"> MES用户登录</h2>
            <el-form-item prop="staffNumber">
                <el-input type="text" v-model="loginForm.staffNumber" auto-complete="off" placeholder="工号"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input type="password" v-model="loginForm.password" auto-complete="off" placeholder="密码"
                          @keyup.enter.native="staffLogin"></el-input>
            </el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item prop="loginVerifyCode">
                  <el-input type="text" v-model="loginForm.loginVerifyCode" auto-complete="off" placeholder="验证码" :maxlength="4"
                            @keyup.enter.native="staffLogin"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <img :src="loginVerifyCodeSrc" alt="" class="img-code pointer" @click="refreshVerifyCode">
              </el-col>
            </el-row>
            <el-checkbox v-model="checked" checked class="remember">记住我</el-checkbox>
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;" @click.native.prevent="staffLogin" :loading="logining">
                    登录
                </el-button>
                <!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->
            </el-form-item>
        </el-form>
        <footer>
            <p class="">版权所有：深圳市麦子科技有限公司</p>
            <p class="">电话：。。。 备案号：。。。</p>
        </footer>
    </div>
</template>

<script>
  import {toLogin} from '../api/api'
  import {mapActions, mapGetters} from 'vuex'
  import { base } from '../api/base'
  export default {
    data () {
      const checkVerifyCode = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入验证码'))
        }
        if (value.split('').length < 4) {
          callback(new Error('验证码不正确'))
          return false
        } else {
          callback()
        }
      }
      return {
        logining: false,
        loginForm: {
          staffNumber: '',
          password: '',
          loginVerifyCode: ''
        },
        loginRule: {
          staffNumber: [
            {required: true, message: '请输入账号', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'}
          ],
          loginVerifyCode: [
            {required: true, validator: checkVerifyCode, trigger: 'blur'}
          ]
        },
        checked: true,
        loginVerifyCodeSrc: ''
      }
    },
    computed: {
      ...mapGetters(['getReturnPath', 'getToken'])
    },
    mounted: function () {
      this.checked = !!localStorage.getItem('user')
      this.refreshVerifyCode()
      let useStr = localStorage.getItem('user')
      if (useStr !== null) {
        let user = JSON.parse(useStr)
        this.loginForm.staffNumber = user.staffNumber
        this.loginForm.password = user.password
      }
      if (this.getToken !== '') {
        this.tokenLogin()
      }
    },
    methods: {
      ...mapActions(['setToken']),
      refreshVerifyCode () {
        this.loginVerifyCodeSrc = base + '/verifyCode.do?type=login&x=' + Math.random()
      },
      handleReset2 () {
        this.$refs.loginForm.resetFields()
      },
      // 尝试用token登录
      tokenLogin () {
        this.logining = true
        this.loginToken({token: this.getToken}, this.loginForm)
      },
      // 账号密码登录
      staffLogin () {
        // 暂时绕过api登录
        // sessionStorage.setItem('user', JSON.stringify({staffNumber: 'mes', password: 'mes'}))
        // this.$router.push({path: '/index'})
        this.$refs.loginForm.validate((valid) => {
          if (valid) {
            this.logining = true
            // NProgress.start()
            this.loginCookie(this.loginForm, this.loginForm)
          } else {
            return false
          }
        })
      },
      loginCookie (params, user) {
        toLogin(params).then(res => {
          this.logining = false
          let {status} = res
          if (status === 0) {
            let u = {
              userId: this.$cookie.get('ID') || 'b55062f2016a4e6a8144f06f4f055067',
              staffNumber: user.staffNumber,
              password: user.password
            }
            // 保存用户名密码
            if (this.checked) {
              localStorage.setItem('user', JSON.stringify(u))
            } else {
              localStorage.removeItem('user')
            }
            sessionStorage.setItem('user', JSON.stringify(u))
            // 登录成功页面跳转
            if (this.getReturnPath === '' || this.getReturnPath === this.$router.history.current.fullPath) {
              this.$router.push({path: '/index'})
            } else {
              this.$router.push({path: this.getReturnPath})
            }
          } else {
            this.refreshVerifyCode()
            this.loginForm.loginVerifyCode = ''
            if (status === 3) {
              this.$message.error(res.msg || '验证码错误')
            } else {
              this.$message.error(res.msg || '账号、密码错误')
            }
          }
        }).catch(() => {
          this.logining = false
          this.loginForm.loginVerifyCode = ''
          this.refreshVerifyCode()
        })
      },
      loginToken (params, user) {
        toLogin(params).then(res => {
          this.logining = false
          let {status} = res
          if (status === 0) {
            // 保存用户名密码
            if (this.checked) {
              localStorage.setItem('user', JSON.stringify(user))
            } else {
              localStorage.removeItem('user')
            }
            sessionStorage.setItem('user', JSON.stringify(user))
            if (res.data.token !== undefined) {
              this.setToken(res.data.token)
            }
            // 登录成功页面跳转
            if (this.getReturnPath === '' || this.getReturnPath === this.$router.history.current.fullPath) {
              this.$router.push({path: '/index'})
            } else {
              this.$router.push({path: this.getReturnPath})
            }
          } else {
            this.refreshVerifyCode()
            this.loginForm.loginVerifyCode = ''
            this.$message.error(res.msg || '账号或密码错误')
            // if (params.token === undefined) {
            //   this.$message.error(res.msg || '账号或密码错误')
            // } else {
            //   this.$message.error('token失效')
            // }
          }
        })
      }
    },
    watch: {
    }
  }
</script>

<style lang="scss" scoped>
    .login_start {
        background: url("../assets/bg1.jpg") no-repeat;
        background-size: 100% 100%;
        height: 100%;
        width: 100%;
    }

    .login-container {
        .logo {
            vertical-align: -8px;
            margin-right: 4px;
        }
        /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        width: 350px;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
        position: relative;
        top: 180px;
        margin: auto;
        .title {
            margin: 0px auto 40px auto;
            text-align: center;
            color: #505458;
        }
        .remember {
            margin: 0px 0px 35px 0px;
        }
    }

    footer {
        position: absolute;
        width: 100%;
        top: 620px;
        text-align: center;
        p {
            color: #ccc;
            padding: 0;
            margin: 0;
            font-size: 12px;
        }
    }
  .img-code {
    height: 40px;
    width: 85%;
    border-radius: 4px;
    display: block;
    margin: 0 auto;
  }
</style>
