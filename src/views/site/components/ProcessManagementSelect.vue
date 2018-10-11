<template>
  <section>
    <el-col :span="24">
      <span style="font-size: 16px;">{{ selectData.title }}</span>
    </el-col>
    <el-col :span="22">
      <el-select
        :disabled="selectData.lock"
        class="w-100"
        v-model="selectData.value"
        multiple
        filterable
        allow-create
        default-first-option
        @change="handleSelectChange"
        placeholder="激活输入框，录入参数">
        </el-option>
      </el-select>
    </el-col>
    <el-col class="locking text-center" :span="2">
      <i v-if="selectData.lock"  class="fa fa-lock lock ml-2" @click="changeState('unlock')"></i>
      <i v-else class="fa fa-unlock-alt unlock ml-2" @click="changeState('lock')"></i>
    </el-col>
  </section>
</template>

<script>

  export default {
    name: 'Process-Management-Select',
    data () {
      return {
      }
    },
    props: {
      id: String,
      selectData: Object,
      processState: String
    },
    computed: {
    },
    mounted () {
      // 
      const state = localStorage.getItem(this.id)
      // 获取本地数据
      const key = this.id + state
      if (state === 'lock') {
        this.selectData.lock = true
        this.selectData.value = localStorage.getItem(key).split('-')
      }
      else return
    },
    methods: {
      changeState (state) {
        // 改变锁定状态
        this.selectData.lock = !this.selectData.lock
        // 本地保存加锁状态
        localStorage.setItem(this.id, state)
        // 本地保存加锁数据
        const key = this.id + state
        if (state === 'lock') {
          const str = this.selectData.value.join('-')
          localStorage.setItem(key, str)
        } else {
          localStorage.removeItem(key);
        }
      },
      handleSelectChange (values) {
        this.$emit('change', {
          id: this.id,
          values: values
        })
      }
    },
    watch: {
      processState (val) {
        if (val === 'start') {
          // 工序开始
        } else {
          // 工序结束
          if (!this.selectData.lock) {
            this.selectData.value = []
          } else return
        }
      }
    }
  }
</script>

<style scoped lang="scss">
.locking {
  font-size: 2em;
  cursor: pointer;
  .unlock {
    color: #409EFF;
  }
  .lock {
    color: #67C23A;
  }
}
</style>
