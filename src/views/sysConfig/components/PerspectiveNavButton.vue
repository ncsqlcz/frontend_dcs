/*
 * @Author: Zhangshitu 
 * @Date: 2018-06-30 09:23:58 
 * @Last Modified by: Zhangshitu
 * @Last Modified time: 2018-07-04 11:26:33
 */
<template>
  <section>
    <el-row class="transparent">
        <el-col class="mb-5" :span="24">
            <span>状态提示：</span>
            <el-button class="perspective-button active" size="mini" type="info" round disabled>
                当前选中
            </el-button>
            <el-button class="perspective-button" size="mini" type="info" round disabled>
                未配置
            </el-button>
            <el-button class="perspective-button" size="mini" type="" round disabled>
                部分配置
            </el-button>
            <el-button class="perspective-button" size="mini" type="primary" round disabled>
                全部配置
            </el-button>
        </el-col>
        <el-col class="mb-3" :span="24">
            <div class="perspective-nav">
                <div class="perspective-button" v-for="(data, index) in alarmUnit" :key="index" v-if="alarmUnit.length !== 0">
                    <el-button 
                        :class="[{ active: isActive(data) }, 'perspective-button']"
                        size="small" 
                        :type="getButtonType(data.conf_status)"
                        round
                        @click="setAlarmUnitId(data)">
                        {{ index + 1 }}
                    </el-button>
                    <div class="alarm-name" :style="{'top': getPadding(index)}"><p>{{ data.warning_unit_name }}</p></div>
                </div>
            </div>
        </el-col>
    </el-row>
  </section>
</template>

<script>
  export default {
    name: 'perspective-nav-button',
    data () {
        return {
            activeId: ''
        }
    },
    props: ['alarmUnit'],
    computed: {
    },
    mounted () {
    },
    methods: {
        getButtonType (state) {
            switch (state) {
                case '0':
                    return 'info'
                break
                case '1':
                    return ''
                break
                case '2':
                    return 'primary'
                break
                default:
                    return 'info'
                break
            }
        },
        isActive (data) {
            this.activeId = this.activeId === '' ? this.alarmUnit[0].warning_uint_id : this.activeId
            if (this.activeId === data.warning_uint_id) return true
        },
        getPadding (index) {
            return (index % 2) ? '-35px' : '20px'
        },
        setAlarmUnitId (data) {
            this.activeId = data.warning_uint_id
            this.$emit('alarmUnit', data)
        }
    },
    watch: {}
  }
</script>

<style scoped lang="scss">
.perspective-nav {
    .perspective-button {
        float: left;
        position: relative;
        min-width: 60px;
        margin-bottom: 35px;
    }
    .alarm-name {
        position: absolute;
        width: 110px;
        left: -25px;
        text-align: center;
        color: #a6a9ad;
    }
}
.active {
    background: #17C9A7;
    border: none
}
</style>