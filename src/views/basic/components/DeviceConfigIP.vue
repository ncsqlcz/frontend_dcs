/*
 * @Author: liucz 
 * @Date: 2018-09-25 14:14:58 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-09-28 14:48:04
 */
<template>
  <section class="px-3">
    <p class="color-666 mt-0 mb-2">即设备主动向系统发送数据，需要依据如下配置来判断采集到的参数属于哪台设备</p>

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
    </el-form>

    <p class="my-2 hidden">
      <el-button size="medium"
                 round
                 @click="verify"
                 :disabled="form.ip === ''">连接验证</el-button>
      <span class="pl-2"
            :class="[linkStatus === 0 ? 'color-success' : 'color-warning']">{{ linkMsg }}</span>
    </p>
  </section>
</template>

<script>
import utils from '@/common/js/utils'
import { queryDeviceSend, saveDeviceSend } from '@/api/api'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'DeviceConfigFromPLC',
  data() {
    return {
      deviceSendId: '',
      filters: {
        deviceId: ''
      },
      form: {
        ip: ''
      },
      rules: {
        ip: [
          { required: true, message: '请输入ip', trigger: 'blur' },
          { validator: utils.checkIP, trigger: 'blur' }
        ]
      },
      ipCopy: '', // 用于判断ip有没有被修改过
      linkStatus: '',
      linkMsg: ''
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
      this.form.ip = val.ip
    },
    responseNext(val) {
      this.handleNext()
    }
  },
  methods: {
    ...mapActions([]),
    // 初始化页面
    initPage() {
      this.$refs.ruleForm.resetFields()
      queryDeviceSend(this.filters).then(res => {
        if (res.status === 0) {
          this.$emit('verify', true)
          this.deviceSendId = res.map.deviceSend.device_send_id
          this.form.ip = res.map.deviceSend.send_ip
          this.ipCopy = this.form.ip
        }
      })
    },
    // 下一步
    handleNext() {
      this.$refs.ruleForm.validate(valid => {
        this.$emit('verify', valid)
        if (valid) {
          if (this.form.ip === this.ipCopy) {
            this.$emit('next', valid, this.form)
          } else {
            saveDeviceSend({
              deviceSendId: this.deviceSendId,
              deviceId: this.deviceId,
              deviceIp: this.form.ip
            }).then(res => {
              this.$emit('next', valid, this.form)
              if (res.status === 0) {
                this.$message.success('已保存')
                this.ipCopy = this.form.ip
              } else {
                this.$message.error(res.msg)
              }
            })
          }
        } else {
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
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
</style>
