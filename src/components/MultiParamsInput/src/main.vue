/*
 * @Author: liucz 
 * @Date: 2018-06-14 14:59:38 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-07-09 18:01:40
 */
<template>
  <el-dialog :title="title || '工序参数' " :visible.sync="visible" class="mes-dialog" width="30%">
    <el-row v-if="type === 'email'">
      <el-col :span="24" class="py-3">
        <el-radio v-model="isIntranet" label="0">内网/局域网发送 (邮件发送对象、范围受限)</el-radio>
        <p> </p>
        <el-radio v-model="isIntranet" label="1">外网发送 (自定义邮箱发送，通知范围不受限)</el-radio>
      </el-col>
    </el-row>

    <el-row v-if="(type === 'email' && isIntranet === '1') || type === ''">
      <el-col :span="24" class="color-999">{{ tip }}</el-col>
      <el-col :span="24" class="mt-3">
        <el-input type="textarea" v-model.trim="textValue" :autosize="{ minRows: 10 }" spellcheck="false" style="font-size: 16px;"></el-input>
      </el-col>
    </el-row>

    <el-row v-if="isIntranet === '0' && type === 'email'">
      <div class="p-3" style="height: 100px; font-size: 16px;">
        内网发送邮件将发送至邮件客户端，相关人员需询问管理员邮件账号及密码。
      </div>
    </el-row>

    <div slot="footer">
      <el-button type="" size="medium" @click="visible = false">关闭</el-button>
      <el-button type="primary" size="medium" @click="confirmSelected">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import utils from '../../../common/js/utils'
  export default {
    name: 'Battery',
    data () {
      return {
        title: '',
        list: [],
        textList: [],
        textValue: '',
        visible: false,
        action: '',
        type: '',
        tip: '',
        typeCheckList: ['email'],
        typeCheckDict: [
          {
            fn: utils.checkEmail,
            name: '邮箱',
            maxLength: 30
          }
        ],
        // 是否是局域网
        isIntranet: '0'
      }
    },
    mounted () {},
    methods: {
      // 确认选择
      confirmSelected () {
        if (this.textValue === '' || (this.type === 'email' && this.isIntranet === '0')) {
          this.list = []
        } else {
          this.list = this.textValue.split('\n')
          // 去除空数据
          for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].trim() === '') {
              this.list.splice(i, 1)
              i--
            } else {
              this.list[i] = this.list[i].trim()
              if (this.checkData(i) === false) {
                return false
              }
            }
          }
          if (this.checkMaxLength(this.list) === false) {
            return false
          }
        }
        this.visible = false
        this.handleAction('confirm')
      },
      // 数据校验
      checkData (i) {
        let index = this.typeCheckList.indexOf(this.type)
        if (index > -1) {
          let checked = false
          this.typeCheckDict[index].fn(null, this.list[i], (err) => {
            checked = err === undefined ? true : false
          })
          if (!checked) {
            this.$message.warning(`第${i + 1}个${this.typeCheckDict[index].name}格式不正确`)
            return false
          }
        } else {
          return true
        }
      },
      // 最多输入多少行
      checkMaxLength (list) {
        let index = this.typeCheckList.indexOf(this.type)
        if (index > -1) {
          if (this.list.length > this.typeCheckDict[index].maxLength) {
            this.$message.warning(`最多不超过${this.typeCheckDict[index].maxLength}行数据`)
            return false
          }
        } else {
          if (this.list.length > 30) {
            this.$message.warning(`最多不超过30行数据`)
            return false
          }
          return true
        }
      },
      handleAction (action) {
        this.action = action
        // 手动触发instance的回调，用以resolve
        setTimeout(() => {
          if (this.action) this.callback(this.action, this)
        }, 0)
      },
      // 初始化
      getDataList () {
        this.textValue = ''
        this.textList.forEach(val => {
          this.textValue += val + '\n'
        })
      }
    },
    watch: {
    }
  }
</script>

<style scoped lang="scss">

</style>
