/*
 * @Author: liucz 
 * @Date: 2018-09-25 14:14:58 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-28 10:23:16
 */
<template>
  <section class="px-3">
    <p class="color-666 mt-0 mb-2">即系统从设备中读取数据的方式是设备的PLC，需要进行如下访问配置</p>

    <el-form :model="form"
             :rules="rules"
             ref="ruleForm"
             label-width="100px"
             label-position="top"
             :inline="true"
             size="medium">
      <el-form-item label="IP"
                    prop="ip">
        <el-input v-model="form.ip"
                  placeholder="请输入有效IP"></el-input>
      </el-form-item>
      <el-form-item label="网络端口"
                    prop="port">
        <el-input v-model="form.port"
                  :controls="false"
                  placeholder="请输入端口"></el-input>
      </el-form-item>
      <el-form-item label="用户名"
                    prop="username">
        <el-input v-model="form.username"
                  placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码"
                    prop="password">
        <el-input v-model="form.password"
                  placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item label="文件夹路径"
                    prop="folderPath">
        <el-input v-model="form.folderPath"
                  placeholder="请输入文件夹路径"></el-input>
      </el-form-item>
    </el-form>

    <p class="mt-4 hidden">
      <el-button size="medium"
                 round
                 :loading="linkLoading"
                 @click="verify"
                 :disabled="form.ip === ''">连接验证</el-button>
      <span class="pl-2"
            :class="[linkStatus === 0 ? 'color-success' : 'color-warning']">{{ linkMsg }}</span>
    </p>
  </section>
</template>

<script>
import utils from '@/common/js/utils'
import { queryAccessConfig, testConnectDataBase } from '@/api/api'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'DeviceConfigFromFolder',
  data() {
    return {
      filters: {
        deviceId: '',
        paramSource: '文件夹'
      },
      form: {
        ip: '',
        port: '',
        username: '',
        password: '',
        folderPath: '',
        list: []
      },
      rules: {
        ip: [
          { required: true, message: '请输入ip', trigger: 'blur' },
          { validator: utils.checkIP, trigger: 'blur' }
        ],
        port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        folderPath: [
          { required: true, message: '请输入文件夹路径', trigger: 'blur' }
        ]
      },
      linkStatus: '',
      linkMsg: '',
      linkLoading: false
    }
  },
  props: {
    deviceId: {
      type: String,
      required: true
    },
    data: Object,
    responseNext: Number
  },
  components: {},
  computed: {
    ...mapGetters([])
  },
  mounted() {
    this.form = this.data
  },
  watch: {
    deviceId(val) {
      this.filters.deviceId = val
      this.initPage()
    },
    data(val) {
      this.$refs.ruleForm.resetFields()
      Object.keys(this.form).forEach(key => {
        this.form[key] = val[key]
      })
    },
    responseNext(val) {
      this.handleNext()
    }
  },
  methods: {
    ...mapActions([]),
    // 初始化页面
    initPage() {
      queryAccessConfig(this.filters).then(res => {
        if (res.status === 0) {
          this.$emit('verify', true)
          this.form.list = res.map.config
          if (this.form.list.length > 0) {
            this.form.ip = this.form.list[0].device_ip
            this.form.port = this.form.list[0].access_port
            this.form.username = this.form.list[0].user_name
            this.form.password = this.form.list[0].password
            this.form.folderPath = this.form.list[0].file_path
          }
        } else {
          this.form.list = []
          this.$refs.ruleForm.resetFields()
        }
      })
    },
    // 下一步
    handleNext() {
      this.$refs.ruleForm.validate(valid => {
        this.$emit('next', valid, this.form)
        if (!valid) {
          this.$confirm('该页面有数据未校验成功, 是否继续?', '提示', {
            type: 'warning'
          })
            .then(action => {
              if (action === 'confirm') {
                this.$emit('next', valid, this.form)
              }
            })
            .catch(() => {})
        }
      })
    },
    // 连接验证
    verify() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.linkLoading = true
          this.linkMsg = ''
          testConnectDataBase({
            type: this.form.dbType,
            deviceIp: this.form.ip,
            port: this.form.port,
            userName: this.form.username,
            password: this.form.password,
            dataBaseName: this.form.dbName,
            tableName: this.form.tableName
            // 'list[]': this.form.list.map(v => v.data_field).toString()
          })
            .then(res => {
              this.linkStatus = res.status
              if (res.status === 0) {
                this.linkMsg = ''
                this.linkMsg = '连接成功'
              } else {
                this.linkMsg = res.msg
              }
              this.linkLoading = false
            })
            .catch(() => {
              this.linkLoading = false
            })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
</style>
