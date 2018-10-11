<template>
	<section>
		<el-card class="box-card mt-5 mx-auto">
			<el-row class="p-3">
				<el-col :span="24">
					<h2 class="mb-4">登录到工序生产执行</h2>
					<!-- <el-button style="float: right; padding: 3px 0" type="text"><i class="el-icon-close"></i></el-button> -->
				</el-col>
				<el-col :span="24">
					<div>
						<el-input class="mb-3" type="text" v-model.trim="processUserName" @keyup.enter.native="loginPrompt" placeholder="请输入用户名"></el-input>
						<el-input class="mb-3" type="password" v-model.trim="processPasword" @keyup.enter.native="loginPrompt" placeholder="请输入密码"></el-input>
					</div>
				</el-col>
				<el-col :span="24" class="text-center mt-2">
					<el-button type="primary" @click="loginPrompt" class="w-100" :loading="isLoading">确定</el-button>
				</el-col>
				<el-col :span="12" class="text-center hidden">
					<el-button style="width: 150px">取消</el-button>
				</el-col>
			</el-row>
		</el-card>
	</section>
</template>

<script>
	import utils from '../../common/js/utils'
	import { sceneManageLogin } from '../../api/api'
	export default {
		name: 'Process-Management-Login',
		data () {
			return {
				processUserName: '',
				processPasword: '',
				isLoading: false
			}
		},
		methods: {
			loginPrompt () {
				this.isLoading = true
				// 验证方法
				const test = {
					userName: (rule, name) => {
						if (!rule.test(name)) {
							this.alertPrompt('用户名即工序名称小写全拼', '登录错误')
							return false
						} else return true
					},
					password: (rule, password) => {
						if (!rule.test(password)) {
							this.alertPrompt('密码错误', '登录错误')
							return false
						} else return true
					}
				}
				// 开始验证
				if (
					test.userName(/^[0-9a-zA-Z\-\_]+$/, this.processUserName) &&
					test.password(/^[0-9a-zA-Z\-\_]{1,16}$/, this.processPasword)
				) {
					sceneManageLogin({
						username: this.processUserName,
						password: this.processPasword
					}).then(res => {
						if (res.status === 0) {
							// 登录成功
							this.isLoading = false
							sessionStorage.setItem('isLogin', 'isLogin')
							this.$router.push({
								path: '/site/process/execution',
								query: {
									unitId: res.map.warning_uint_id
								}
							})
						} else {
							// 登录失败
							this.isLoading = false
							this.alertPrompt('认证失败', '登录错误')
						}
					})
				} else this.isLoading = false
			},
			alertPrompt (data, title) {
				this.$alert(data, title, {
					confirmButtonText: '确定',
					type: 'warning'
				})
			}
		}
	}
</script>


<style scoped lang="scss">
.box-card {
	width: 480px;
	h2 {
		margin: 0;
	}
}
</style>
