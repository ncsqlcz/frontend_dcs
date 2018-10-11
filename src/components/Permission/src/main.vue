/*
 * @Author: liucz 
 * @Date: 2018-07-11 17:23:13 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-07-25 14:16:23
 */
<template>
  <el-dialog :title="title || '权限确认' " :visible.sync="visible" width="450px">
    <p class="color-666 mt-0" v-if="tips !== ''"><span class="el-icon el-icon-warning" style="color: #E6A23C;"></span> {{ tips }}</p>
    <!-- 表单 -->
    <el-form :inline="false" :model="userForm" :rules="rules" ref="userForm">
      <el-form-item label="请输入配置用户的密码" prop="password">
        <el-input type="password" v-model.trim="userForm.password" @keyup.enter.native="handleConfirm" ref="passwordInput"></el-input>
      </el-form-item>
    </el-form>

    <!--确认选择 start-->
    <div slot="footer">
      <el-button type="" size="medium" @click="visible = false">取消</el-button>
      <el-button type="primary" size="medium" @click="handleConfirm">确定</el-button>
    </div>
    <!--确认选择 end-->
  </el-dialog>
</template>

<script>
  import utils from '../../../common/js/utils'
  import { permissionsToConfirm } from '../../../api/api'
  export default {
    name: 'device',
    data () {
      const validatePassword = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('密码不能为空'))
        }
        permissionsToConfirm({
          passWord: value
        }).then(res => {
          if (res.status === 0) {
            callback()
          } else {
            this.userForm.password = ''
            return callback(new Error(res.msg || '失败'))
          }
        })
      }
      return {
        params: {
        },
        filters: {
        },
        action: '', // 动作
        visible: false,
        selectedRows: null,
        list: [],
        listLoading: false,
        callback: null,
        title: '',
        selectedIds: [],
        tips: '',
        userForm: {
          password: ''
        },
        rules: {
          password: [{ validator: validatePassword, trigger: 'blur' }]
        }
      }
    },
    mounted () {

    },
    methods: {
      // 确认选择
      handleConfirm (row) {
        this.$refs.userForm.validate(valid => {
          if (valid) {
            this.visible = false
            this.handleAction('pass')
          }
        })
      },
      handleAction (action) {
        this.action = action
        // 手动触发instance的回调，用以resolve
        if (this.action) this.callback(this.action, this)
      },
      // 初始化
      getDataList () {
        setTimeout(() => {
          this.$refs.userForm.resetFields()
          this.$refs.passwordInput.$el.querySelector('input').focus()
        })
      },
      reset () {
        this.params = {
        }
        this.getDataList()
      },
      // 初始选择的行
      checkSelectedIds () {
      }
    },
    watch: {
    }
  }
</script>

<style scoped lang="scss">

</style>
