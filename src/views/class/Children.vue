<template>
	<div>
		<div calss="wrap">
			<div class="search">
				<div class="demo-input-suffix">
					次课名称：
					<el-input class="input" v-model="name" placeholder="请输入" clearable></el-input>
				</div>
				<div class="demo-input-suffix">
					次课编号：
					<el-input class="input" v-model="number" placeholder="请输入" clearable></el-input>
				</div>
				<div class="demo-input-suffix">
					学科：
					<el-select v-model="subject" placeholder="请选择" clearable>
						<el-option v-for="(item,index) in subjects" :key="index" :label="item.value" :value="item.id"></el-option>
					</el-select>
				</div>
				<div class="demo-input-suffix">
					年级：
					<el-select v-model="grade" placeholder="请选择" clearable>
						<el-option v-for="(item,index) in grades" :key="index" :label="item.gradeName" :value="item.gradeId"></el-option>
					</el-select>
				</div>
				<div class="demo-input-suffix">
					课件：
					<el-select v-model="courseware" placeholder="请选择" clearable>
						<el-option v-for="(item,index) in coursewares" :key="index" :label="item.value" :value="item.id"></el-option>
					</el-select>
				</div>
				<div class="btn">
					<el-button type="primary" @click="pageIndex = 1;search();">搜索</el-button>
					<el-button type="primary" @click="addClass">新增课次</el-button>
				</div>
			</div>
			<el-table :data="listData" :header-cell-style="tableHeaderStyle" :cell-style="tableCellStyle" stripe borderstyle="width: 100%">
				<el-table-column prop="lectureId" label="次课编号" min-width="120"></el-table-column>
				<el-table-column prop="lectureName" label="次课名称" min-width="120"></el-table-column>
				<el-table-column prop="subjectName" label="学科" min-width="120"></el-table-column>
				<el-table-column prop="gradeName" label="年级" min-width="120"></el-table-column>
				<el-table-column prop="timeSizeHour" label="时长" min-width="120">
					<template slot-scope="scope">
						{{scope.row.timeSizeHour + '小时'+ scope.row.timeSizeMinute +'分'}}
					</template>
				</el-table-column>
				<el-table-column prop="cwBind" label="课件有无" min-width="120" :formatter="hasClass"></el-table-column>
				<el-table-column flxed="right" label="操作" min-width="120">
					<template slot-scope="scope">
						<el-button type="text" size="medium" @click="clickModify(scope.row)">修改</el-button>
						<el-button type="text" size="medium" @click="clickDel(scope.row.lectureId)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination :page-size="pageSize" :current-page.sync="pageIndex" :total="total" layout="prev, pager, next, jumper"
				 @current-change="pageChanged" :fileId="secondId" />
			</div>
		</div>
		<modifyClass :dialog-visible="isModify" :title="title" :subjects="subjects" :grades="grades" :rows="rows" :secondRows="secondRows" :userInfo="rowsList" @cancel="cancelModifyClass" @confirm="newClass" @dialogHide="dialogHide" />
		<bindClass :dialog-visible="isBind" :title="title" :refresh="isBindRefresh" @uploadFilePop="uploadFilePop" @cancel="cancelBindClass" @childFile="bindSecond" @newlyBuildPop="newlyBuildPop" @confirm="confirmBindClass" />
		<Upload :dialog-visible='isUpload' :fileId="secondId" :childPop="true" :prevPage="prevPage" @cancel="cancelUpload" @ossSuccess="confirmUpload" />
		<newFiles :dialog-visible='isNew' :childPop="true" @cancel="cancelNewFiles" @confirm="newFile" />
	</div>
</template>

<script>
	export default {
		components: {
			modifyClass: () => import('./ModifyClass'),
			bindClass: () => import('./BindClass'),
			Upload: () => import('./Upload'),
			newFiles: () => import('./NewFiles')
		},
		name: 'Children',
		data() {
			return {
				name: "",
				number: "",
				subject: 1,
				subjects: [{
					id: 1,
					value: "数学"
				}],
				grade: "",
				grades: [],
				courseware: "",
				coursewares: [{
					id: 1,
					value: "有"
				}, {
					id: 0,
					value: "无"
				}],
				listData: [],
				tableHeaderStyle: {
					background: '#efefef',
					color: '#333'
				},
				tableCellStyle: {
					padding: '6px 0'
				},
				pageSize: 10,
				pageIndex: 1,
				total: 0,
				isModify: false,
				title: "",
				rows: [],
				secondRows: [],
				rowsList: [],
				isBind: false,
				isBindRefresh: false,
				isUpload: false,
				secondId: "",
				prevPage: 1,
				isNew: false
			}
		},
		mounted() {
			this.getGrade();
			this.getList();
		},
		methods: {
			getGrade() {
				this.$axios({
						method: "get",
						url: "http://zxxb-system-test.100daishu.com/platform/user/gradelist"
					})
					.then(res => {
						this.grades = res.list
					})
					.catch(e => {
						this.$message.error(e.msg)
					})
			},
			getList() {
				this.$axios({
						method: "post",
						url: 'http://zxxb-system-test.100daishu.com/platform/lecture/listlecture',
						data: {
							lectureName: this.name,
							lectureId: this.number,
							subjectId: this.subject,
							gradeId: this.grade,
							cwBind: this.courseware,
							page: this.pageIndex,
							pageSize: this.pageSize
						}
					})
					.then(res => {
						this.listData = res.lectureList,
							this.total = res.total
					})
					.catch(e => {
						this.$message.error(e.msg)
					})
			},
			hasClass(row) {
				return row.cwBind === 1 ? '有' : '无'
			},
			pageChanged(idx) {
				this.pageIndex = idx;
				this.getList();
			},
			search() {
				this.getList();
			},
			addClass() { //新增课次
				this.title = "新增次课";
				this.isModify = !this.isModify
			},
			newClass(name, subject, grade, hour, minute, course) { //新增次课数据
				this.title = '';
				this.rows = this.rowsList = [];
				this.isModify = !this.isModify;
				this.getList();
			},
			dialogHide() {
				this.isModify = !this.isModify;
				this.isBind = !this.isBind;
			},
			cancelModifyClass() { //关闭修改次课弹框
				this.title = '';
				this.rows = this.rowsList = this.secondRows = [];
				this.isModify = !this.isModify;
				this.rowsList = {};
			},
			clickModify(rows) {
				this.title = "修改次课";
				this.rowsList = rows;
				this.isModify = !this.isModify;
			},
			uploadFilePop() {
				//一级目录上传文件
				this.secondId = '';
				this.isBind = !this.isBind; //关闭绑定课件弹框
				this.isUpload = !this.isUpload; //打开上传文件弹框
				this.isBindRefresh = false;
				this.prevPage = 1;
			},
			cancelBindClass() {
				this.isBind = !this.isBind;
				this.isModify = !this.isModify;
			},
			bindSecond(name, id) {
				this.isBind = !this.isBind;
				this.isBindRefresh = true;
			},
			newlyBuildPop() {
				this.isBind = !this.isBind;
				this.isBindRefresh = false;
				this.isNew = !this.isNew;
			},
			confirmBindClass(rows) {
				this.isBind = !this.isBind;
				this.isModify = !this.isModify;
				this.rows = rows;
			},
			cancelNewFiles(){
				this.isNew = !this.isNew;
				this.isBind = !this.isBind;
			},
			newFile(){
				this.isNew = !this.isNew;
				this.isBind = !this.isBind;
			},
			clickDel(id) {
				this.$confirm('此操作将永久删除该次课, 是否继续?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
					.then(() => {
						this.$axios({
								method: "post",
								url: 'http://zxxb-system-test.100daishu.com/platform/lecture/deletelecture',
								data: {
									lectureId: id
								}
							})
							.then(res => {
								this.$message.success('删除成功');
								this.getList();
							})
							.catch(e => {
								this.$message.error(e.msg)
							})
					})
					.catch(() => {
						this.$message({
							type: 'info',
							message: '已取消删除'
						})
					})
			},
			cancelUpload(prev) {
				console.log(prev)
				if (prev === 1) {
					this.isBind = !this.isBind; //打开绑定课件弹框
				} else {
					this.isSecond = !this.isSecond;
				}
				this.isUpload = !this.isUpload; //关闭上传文件弹框
				this.isBindRefresh = false;
			},
			uploadSecLev() { //二级目录上传功能
				this.isSecond = !this.isSecond;
				this.isUpload = !this.isUpload; //关闭上传文件弹框
				this.isBindRefresh = false;
				this.prevPage = 2;
			},
			confirmUpload() {
				this.getList();
				if (this.secondId !== "" && this.secondId !== undefined && this.secondId !== null) {
					this.isSecond = !this.isSecond;
				} else {
					this.isBind = !this.isBind; //打开绑定课件弹框
				}
				this.isUpload = !this.isUpload; //关闭上传文件弹框
				this.isBindRefresh = true;
			},
		}
	}
</script>

<style scoped>
	.search {
		display: flex;
		flex-wrap: wrap;
		border: 1px solid #ccc;
		border-radius: 10px;
		padding: 10px;
		margin-bottom: 25px;
	}

	.btn {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin-top: 20px;
	}

	.demo-input-suffix {
		margin-right: 10px;
		font-size: 14px;
	}

	.input {
		width: 194px;
		height: 40px;
	}

	.pagination {
		margin: 30px 10px;
		text-align: right;
	}
</style>
