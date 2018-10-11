/*
 * @Author: liucz 
 * @Date: 2018-09-25 14:14:58 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-28 10:22:43
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
      <el-form-item label="数据库类型"
                    prop="dbType">
        <el-radio v-model="form.dbType"
                  label="0"
                  border>MySQL</el-radio>
        <el-radio v-model="form.dbType"
                  label="1"
                  border>SQL Server</el-radio>
        <el-radio v-model="form.dbType"
                  label="2"
                  border>Oracle</el-radio>
      </el-form-item>
      <el-form-item label="数据库名称"
                    prop="dbName">
        <el-input v-model="form.dbName"
                  placeholder="请输入数据库名称"></el-input>
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
      <el-form-item label="表名"
                    prop="tableName">
        <el-input v-model="form.tableName"
                  placeholder="请输入表名"></el-input>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table :data="form.list">
      <el-table-column type="index"
                       width="60"></el-table-column>
      <el-table-column prop="parameter_name"
                       label="参数名称"></el-table-column>
      <el-table-column prop="parameter_unit"
                       label="参数单位"></el-table-column>
      <el-table-column prop="sample_period"
                       label="参数采集频率"></el-table-column>
      <el-table-column prop="data_field"
                       label="字段名">
        <template slot-scope="scope">
          <el-input size="small"
                    v-model="scope.row.data_field"
                    placeholder="请输入字段名"></el-input>
        </template>
      </el-table-column>
    </el-table>

    <p class="mt-4">
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
  name: 'DeviceConfigFromDB',
  data() {
    return {
      filters: {
        deviceId: '',
        paramSource: '数据库'
      },
      form: {
        ip: '',
        port: '',
        dbType: 'mysql',
        dbName: '',
        username: '',
        password: '',
        tableName: '',
        list: []
      },
      rules: {
        ip: [
          { required: true, message: '请输入ip', trigger: 'blur' },
          { validator: utils.checkIP, trigger: 'blur' }
        ],
        port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
        dbName: [
          { required: true, message: '请输入数据库名称', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        tableName: [{ required: true, message: '请输入表名', trigger: 'blur' }]
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
            this.form.dbType = this.form.list[0].database_type
            this.form.dbName = this.form.list[0].database_name
            this.form.username = this.form.list[0].user_name
            this.form.password = this.form.list[0].password
            this.form.tableName = this.form.list[0].table_name
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
            tableName: this.form.tableName,
            'list[]': this.form.list.map(v => v.data_field).toString()
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
