/*
 * @Author: liucz 
 * @Date: 2018-08-21 16:14:28 
 * @Last Modified by: liucz
 * @Last Modified time: 2018-08-21 17:47:51
 */
<template>
  <el-dialog :title="title || '创建报警单元' " :visible.sync="visibleDialog" class="mes-dialog" width="30%">
    <el-row>
      <el-col :span="24" class="py-3">
        <p class="color-999">报警单元可选选择车间创建或自定义输入名称创建</p>
        <el-radio v-model="type" label="workshop">从车间中创建</el-radio>
        <p> </p>
        <el-radio v-model="type" label="custom">自定义报警单元</el-radio>
      </el-col>
    </el-row>

    <el-row v-if="type === 'custom'">
      <el-col :span="24" class="color-999">{{ tip || '多个报警单元名称请用转行区分（一行一个单元名称）' }}</el-col>
      <el-col :span="24" class="mt-3">
        <el-input type="textarea" v-model.trim="textValue" :autosize="{ minRows: 10 }" spellcheck="false" style="font-size: 16px;"></el-input>
      </el-col>
    </el-row>

    <div slot="footer">
      <el-button type="" size="medium" @click="visibleDialog = false">关闭</el-button>
      <el-button type="primary" size="medium" @click="confirmSelected">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import utils from '../../../common/js/utils'
  export default {
    name: 'New-Warning-Unit-Dialog',
    data () {
      return {
        title: '',
        list: [],
        textValue: '',
        action: '',
        type: '',  // workshop, custom
        tip: '',
        visibleDialog: false,
        typeCheckList: ['email'],
        typeCheckDict: [
          {
            fn: utils.checkEmail,
            name: '邮箱',
            maxLength: 30
          }
        ],
      }
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      createType: {
        type: String,
        default: 'workshop'
      },
      textList: {
        type: Array,
        default: []
      }
    },
    mounted () {},
    methods: {
      // 确认选择
      confirmSelected () {
        if (this.textValue === '' || (this.type === 'workshop')) {
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
              // if (this.checkData(i) === false) {
              //   return false
              // }
            }
          }
          if (this.checkMaxLength(this.list) === false) {
            return false
          }
        }
        this.visibleDialog = false
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
        let data = {
          type: this.type
        }
        if (this.type === 'custom') {
          data.data = this.list
        }
        this.$emit('change', data)
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
      visible (val) {
        this.visibleDialog = val
      },
      visibleDialog (val) {
        this.$emit('update:visible', val)
        if (!val) {
          setTimeout(() => {
            this.textValue = ''
          }, 500)
        }
      },
      createType (val) {
        this.type = val
      },
      type (val) {
        this.$emit('update:createType', val)
      },
      textList (val) {
        this.getDataList()
      }
    }
  }
</script>

<style scoped lang="scss">

</style>
