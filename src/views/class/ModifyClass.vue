<template>
	<el-dialog :title="title" :visible.sync="dialogVisible" :show-close="false" :close-on-click-modal="false"
	 :close-on-press-escape="false" @opened="opened">
		<el-form ref="form" :model="form" :rules="rules" label-width="80px">
			<el-form-item label="名称" prop="lectureName">
				<el-input class="input" v-model="form.lectureName"></el-input>
			</el-form-item>
			<el-form-item label="学科" prop="subjectName">
				<el-select v-model="form.subjectName" @change="subjectChange" placeholder="请选择">
					<el-option v-for="(item,index) in subjects" :key="index" :label="item.value" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="年级" prop="gradeName">
				<el-select v-model="form.gradeName" @change="gradeChange" placeholder="请选择">
					<el-option v-for="(item,index) in grades" :key="index" :label="item.gradeName" :value="item.gradeId"></el-option>
				</el-select>
			</el-form-item>
			<div class="classTime">
				<div class="label">
					<span>*</span>时长：
				</div>
				<div>
					时：
					<el-input class="timeSize" v-model="form.timeSizeHour" maxlength="2" @keyup.native="timeSizeS"></el-input>
				</div>
				<div>
					<el-form-item prop="timeSizeMinute">
						<div>
							分：
							<el-input class="timeSize" v-model="form.timeSizeMinute" maxlength="2" @keyup.native="timeSizeM"></el-input>
						</div>
					</el-form-item>
				</div>
			</div>
			<el-form-item label="课件：" prop="cwBind">
				<el-radio-group v-model="form.cwBind" @change="changeHandler">
					<el-radio v-for="(item,index) in radios" :key="index" :label="item.id" :value="item.id">{{item.value}}</el-radio>
				</el-radio-group>
			</el-form-item>
			<div class="ds-cwlist">
				<ul class="listBind">
					<li v-for="(item,index) in list" :key="index">
						<el-radio class="ds-isderault" v-if="item.fileType != 2" v-model="isDefault" @change="selectDefaultCwId.call(this,item)"
						 :label="item.cwId">设为主讲课件</el-radio>
						{{item.cwName}}
						<i class="el-icon-close" @click="deleteList(index, item.cwId)"></i>
					</li>
				</ul>
				<a href="javascript:;" @click="bindClass">绑定课件</a>
			</div>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button @click="onCancel()">取 消</el-button>
			<el-button type="primary" @click="onConfirm()">确 定</el-button>
		</div>
	</el-dialog>
</template>

<script>
	export default {
		props: [
			"dialogVisible",
			"title",
			"subjects",
			"grades",
			"rows",
			"secondRows",
			"userInfo",
		],
		name: 'ModifyClass',
		data() {
			return {
				cwloading: 0,
				isDefault: 0, //主讲课件cwId
				form: {
					subjectName: 1
				},
				rules: {
					lectureName: {
						required: true,
						message: "请输入名称"
					},
					subjectName: {
						required: true,
						message: "请选择学科"
					},
					gradeName: {
						required: true,
						message: "请选择年级"
					},
					timeSizeMinute: {
						required: true,
						message: "请输入分钟"
					},
					cwBind: {
						required: true,
						message: "请选择课件"
					}
				},
				getUserInfo: {},
				subjectId: 1,
				gradeId: "",
				hourId: "",
				minuteId: "",
				list: [],
				oldList: [],
				hour: [{
						id: 1,
						value: 1
					},
					{
						id: 2,
						value: 2
					},
					{
						id: 3,
						value: 3
					},
					{
						id: 4,
						value: 4
					},
					{
						id: 5,
						value: 5
					},
					{
						id: 6,
						value: 6
					},
					{
						id: 7,
						value: 7
					},
					{
						id: 8,
						value: 8
					},
					{
						id: 9,
						value: 9
					},
					{
						id: 10,
						value: 10
					}
				],
				minute: [{
						id: 0,
						value: 0
					},
					{
						id: 10,
						value: 10
					},
					{
						id: 20,
						value: 20
					},
					{
						id: 30,
						value: 30
					},
					{
						id: 40,
						value: 40
					},
					{
						id: 50,
						value: 50
					}
				],
				radios: [{
						id: 0,
						value: "无"
					},
					{
						id: 1,
						value: "有"
					}
				]
			};
		},
		methods: {
			subjectChange(id) {
				this.subjectId = id;
			},
			gradeChange(id) {
				this.gradeId = id;
			},
			timeSizeS() {
				this.form.timeSizeHour = this.form.timeSizeHour.replace(/[^\.\d]/g, "");
			},
			timeSizeM() {
				this.form.timeSizeMinute = this.form.timeSizeMinute.replace(/[^\.\d]/g, "");
			},
			onCancel() {
				//关闭弹框
				this.$set(this.form, "avatar", "");
				this.$set(this.form, "timeSizeHour", "");
				this.oldList = this.list = [];
				this.isDefault = 0;
				this.$refs["form"].resetFields();
				this.$emit("cancel");
			},
			onConfirm() {
				let params = {},
					url = "";
				if (this.form.cwBind === 1 && this.list.length === 0) {
					this.$message.error("请选择要绑定的课件");
					return
				};
				if (
					this.form.cwBind === 1 &&
					this.list.filter(item => {
						return item.fileType != 2;
					}).length &&
					this.isDefault == 0
				) {
					this.$message.error("请设置主讲课件");
					return;
				}
				if (this.userInfo.lectureId) {
					url = "http://zxxb-system-test.100daishu.com/platform/lecture/editlecture";
					params = {
						lectureId: this.userInfo.lectureId,
						lectureName: this.form.lectureName ?
							this.form.lectureName : this.getUserInfo.lectureName ?
							this.getUserInfo.lectureName : "",
						subjectId: this.subjectId ?
							this.subjectId : this.getUserInfo.subjectId ?
							this.getUserInfo.subjectId : 1,
						gradeId: this.gradeId ?
							this.gradeId : this.getUserInfo.gradeId ?
							this.getUserInfo.gradeId : 0,
						timeSizeHour: this.hourId ?
							this.hourId : this.getUserInfo.timeSizeHour ?
							this.getUserInfo.timeSizeHour : 0,
						timeSizeMinute: this.minuteId ?
							this.minuteId : this.getUserInfo.timeSizeMinute ?
							this.getUserInfo.timeSizeMinute : 0,
						cwList: this.form.cwBind === 1 ?
							this.list.length > 0 ?
							this.list : [] : []
					};
				} else {
					url = "http://zxxb-system-test.100daishu.com/platform/lecture/addlecture";
					params = {
						lectureName: this.form.lectureName ? this.form.lectureName : "",
						subjectId: this.subjectId ? this.subjectId : 1,
						gradeId: this.gradeId ? this.gradeId : 0,
						timeSizeHour: this.form.timeSizeHour,
						timeSizeMinute: this.form.timeSizeMinute,
						cwList: this.form.cwBind === 1 ?
							this.list.length > 0 ?
							this.list : [] : []
					};
				}
				this.$axios({
						method: "post",
						url: url,
						data: params
					})
					.then(() => {
						if (this.userInfo.lectureId) {
							this.$message.success("修改成功")
						} else {
							this.$message.success("新增成功")
						}
						this.$emit(
							"confirm",
							this.form.lectureName,
							this.form.subjectName,
							this.form.gradeName,
							this.form.timeSizeHour,
							this.form.timeSizeMinute,
							this.form.cwBind
						);
						this.oldList = this.list = [];
						this.$set(this.form, "timeSizeHour", "");
						this.$set(this.form, "avatar", "");
						this.$refs["form"].resetFields();
						this.isDefault = 0;
					})
					.catch(e => {
						this.$message.error(e.msg)
					})
			},
			selectDefaultCwId(item) {
				this.isDefault = item.cwId;
				let list = [];
				this.list.forEach(self => {
					let obj = self;
					if (self.cwId == item.cwId) {
						obj.isDefault = 1;
					} else {
						obj.isDefault = 0;
					}
					list.push(obj);
				});
				this.list = list;
			},
			bindClass() {
				if (this.form.cwBind !== 1) {
					this.$message.error("请选择有课件");
					return;
				}
				this.$emit("dialogHide");
			},
			opened() {
				this.isDefault = this.isDefault || 0;
				if (this.rows.length > 0) {
					//合并绑定课件列表
					if (this.list.length > 0) {
						let newArr = this.rows.concat(this.secondRows);
						let newList = this.list.concat(newArr);
						this.oldList = this.list = this.listRemoveRepeat(newList);
					} else {
						let newRows = this.rows.concat(this.secondRows);
						this.oldList = this.list = this.listRemoveRepeat(newRows);
					}
					if (this.isDefault == 0) {
						for (let i = 0; i <= this.list.length; i++) {
							if (this.list[i]["fileType"] != 2) {
								this.isDefault = this.list[i]["cwId"];
								this.list[i]["isDefault"] = 1;
								break;
							}
						}
					}
					return;
				} else if (this.secondRows.length > 0) {
					let newRows = this.secondRows;
					this.oldList = this.list = this.listRemoveRepeat(newRows);
					if (this.isDefault == 0) {
						for (let i = 0; i <= this.list.length; i++) {
							if (this.list[i]["fileType"] != 2) {
								this.isDefault = this.list[i]["cwId"];
								this.list[i]["isDefault"] = 1;
								break;
							}
						}
					}
					return;
				}

				if (this.userInfo.lectureId) {
					//修改接口
					this.cwloading = 1;
					this.$axios({
							method: "post",
							url: "http://zxxb-system-test.100daishu.com/platform/lecture/editlectureinfo",
							data: {
								lectureId: this.userInfo.lectureId
							}
						})
						.then(res => {
							this.cwloading = 0;
							this.oldList = this.list = res.cwList;
							this.getUserInfo = this.form = res;
							this.list.sort(function() {
								return -1;
							});
							for (let i = 0; i < this.list.length; i++) {
								if (this.list[i]["fileType"] != 2 && this.list[i]["isDefault"]) {
									this.isDefault = this.list[i]["cwId"];
									break;
								}
							}
						})
						.catch(e => {
							this.$message.error(e.msg);
						});
				}
			},
			listRemoveRepeat(item) {
				//去重
				let result = [];

				for (let i = 0; i < item.length; i++) {
					let flag = true;
					let temp = item[i];
					for (let j = 0; j < result.length; j++) {
						// 普通数组 (temp === result[j])
						if (temp.cwId === result[j].cwId) {
							flag = false;
							break;
						}
					}
					if (flag) {
						result.push(temp);
					}
				}
				return result;
			},
			deleteList(index, cwId){
				this.list.splice(index,1);
				if (cwId === this.isDefault){
					if(!this.list.length){
						this.isDefault = 0;
						return;
					}
					for (let i = 0; i < this.list,length; i++){
						if (this.list[i]["fileType"] != 2){
							this.list[i]["isDefault"] = 1;
							this.isDefault = this.list[i]["cwId"];
							break;
						}
					}
				}
			},
			changeHandler(value){
				if(value){
					this.list = this.oldList;
				} else {
					this.list = ""
				}
			}
		}
	}
</script>

<style scoped>
	.listBind,
	.listBind li {
		margin: 0;
		padding: 0;
	}

	.listBind li {
		list-style: none;
	}

	.input {
		width: 194px;
	}

	.duration {
		display: flex;
		width: 300px;
		justify-content: space-between;
	}

	.select {
		width: 100px;
	}

	.timeSize {
		width: 100px;
	}

	.classTime {
		display: flex;
		align-items: center;
		margin-bottom: 22px;
	}

	.label {
		display: block;
		width: 80px;
		text-align: right;
		padding: 0 12px 0 0;
		box-sizing: border-box;
	}

	.label span {
		color: #f56c6c;
		margin-right: 4px;
	}

	.classTime .el-form-item {
		margin: 0;
	}

	.ds-cwlist {
		padding: 5px 30px;
		min-height: 80px;
	}

	.ds-cwlist li {
		padding: 5px 0;
		line-height: 1.4;
		overflow: hidden;
	}

	.ds-cwlist li:hover {
		background-color: #f0f0f0;
	}

	.ds-isderault {
		line-height: 1.4;
		float: right;
		margin: 0;
	}

	.el-icon-close {
		display: inline-block;
		padding: 1px;
		border-radius: 3px;
		width: 13px;
		height: 13px;
		cursor: pointer;
		border: 1px solid #d0d0d0;
	}

	.classTime>>>.el-form-item__content {
		margin-left: 20px !important;
	}
</style>
