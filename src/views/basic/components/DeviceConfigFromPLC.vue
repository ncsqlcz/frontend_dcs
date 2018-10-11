/*
 * @Author: liucz 
 * @Date: 2018-09-25 14:14:58 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-28 10:21:26
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
      <el-table-column prop="data_type"
                       label="当前数据类型">
        <template slot-scope="scope">
          <el-select v-model="scope.row.data_type"
                     size="small"
                     placeholder="请选择数据类型">
            <el-option v-for="item in paramTypeList"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop=""
                       label="寄存器地址">
        <template slot-scope="scope">
          <el-input size="small"
                    placeholder="请输入寄存器地址"
                    v-model.trim="scope.row.register_address"></el-input>
        </template>
      </el-table-column>
    </el-table>

    <p class="mt-4">
      <el-button size="medium"
                 round
                 plain
                 @click="verify"
                 :loading="linkLoading"
                 :disabled="form.ip === ''">连接验证</el-button>
      <span class="pl-2"
            :class="[ linkStatus === 0 ? 'color-success' : 'color-warning']">{{ linkMsg }}</span>
    </p>
  </section>
</template>

<script>
import utils from '@/common/js/utils'
import { testConnectPLC, queryAccessConfig } from '@/api/api'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'DeviceConfigFromPLC',
  data() {
    return {
      filters: {
        deviceId: '',
        paramSource: 'PLC'
      },
      form: {
        ip: '',
        port: '',
        list: []
      },
      rules: {
        ip: [
          { required: true, message: '请输入ip', trigger: 'blur' },
          { validator: utils.checkIP, trigger: 'blur' }
        ],
        port: [{ required: true, message: '请输入端口', trigger: 'blur' }]
      },
      linkStatus: '',
      linkMsg: '',
      linkLoading: false,
      paramTypeList: [
        { label: 'byte', value: 'byte' },
        { label: 'word', value: 'word' },
        { label: 'dword', value: 'dword' },
        { label: 'float', value: 'float' },
        { label: 'double', value: 'double' }
      ]
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
          testConnectPLC({
            deviceIp: this.form.ip,
            port: this.form.port
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
