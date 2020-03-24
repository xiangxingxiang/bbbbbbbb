<template>
	<div>
		<div class="search">
			<div class="demo-input-suffix">
				课程编号：
				<el-input class="input" v-model="number" placeholder="请输入" clearable></el-input>
			</div>
			<div class="demo-input-suffix">
				课程名称：
				<el-input class="input" v-model="name" placeholder="请输入" clearable></el-input>
			</div>
			<div class="demo-input-suffix">
				年份：
				<el-select v-model="year" placeholder="请选择" clearable>
					<el-option v-for="(item,index) in years" :key="index" :label="item.value" :value="item.id"></el-option>
				</el-select>
			</div>
			<div class="demo-input-suffix">
				学期：
				<el-select v-model="term" placeholder="请选择" @change="termChanged" clearable>
					<el-option v-for="(item,index) in terms" :key="index" :label="item.termName" :value="item.termId" />
				</el-select>
			</div>
			<div class="demo-input-suffix">
				年级：
				<el-select v-model="grade" placeholder="请选择" clearable>
					<el-option v-for="(item,index) in grades" :key="index" :label="item.gradeName" :value="item.gradeId"></el-option>
				</el-select>
			</div>
			<div class="demo-input-suffix">
				班型：
				<el-select v-model="classType" placeholder="请选择" clearable>
					<el-option v-for="(item,index) in classTypes[term]" :key="index" :label="item.classTypeName" :value="item.classTpey"></el-option>
				</el-select>
			</div>
			<div class="demo-input-suffix">
				教材版本：
				<el-select v-model="bookVer" placeholder="请选择" clearable>
					<el-option v-for="(item,index) in bookVers" :key="index" :label="item.name" :value="item.id"></el-option>
				</el-select>
			</div>
			<div class="btn">
				<el-button type="primary" @click="pageIndex = 1;search()">搜索</el-button>
				<el-button type="primary" @click="addClass">新增课程</el-button>
			</div>
		</div>
		<el-table :data="listData" :header-cell-style="tableHeaderStyle" :cell-style="tableCellStyle" stripe borderstyle="width: 100%">
			<el-table-column prop="courseId" align="center" label="课程编号" min-width="80"></el-table-column>
			<el-table-column prop="courseName" align="center" label="课程名称" min-width="150"></el-table-column>
			<el-table-column prop="bookVerName" align="center" label="教材版本" min-width="150"></el-table-column>
			<el-table-column prop="year" align="center" label="年份" min-width="80" show-overflow-tooltip></el-table-column>
			<el-table-column prop="termName" align="center" label="学期" min-width="80" show-overflow-tooltip></el-table-column>
			<el-table-column prop="gradeName" align="center" label="年级" min-width="80" show-overflow-tooltip></el-table-column>
			<el-table-column prop="lessonNums" align="center" label="课次数量" min-width="80" show-overflow-tooltip></el-table-column>
			<el-table-column prop="courseTypeName" align="center" label="课程类型" min-width="80" show-overflow-tooltip></el-table-column>
			<el-table-column prop="classTypeName" align="center" label="班型" min-width="80" show-overflow-tooltip></el-table-column>
			<el-table-column fixed="right" label="操作" align="center" min-width="100">
				<template slot-scope="scope">
					<el-button type="text" size="medium">修改</el-button>

				</template>
			</el-table-column>
		</el-table>
		<div class="pagination">
			<el-pagination :page-size="pageSize" :current-page.sync="pageIndex" :total="total" layout="prev, pager, next, jumper"
			 @current-change="pageChanged" />
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Course',
		data() {
			return {
				number: "",
				name: "",
				year: "",
				years: [],
				term: "",
				terms: [],
				grade: "",
				grades: [],
				classType: "",
				classTypes: {},
				bookVer: 99,
				bookVers: [{
						id: 0,
						name: "无"
					},
					{
						id: 1,
						name: "北师大版"
					},
					{
						id: 2,
						name: "人教版"
					},
					{
						id: 3,
						name: "苏教版"
					},
					{
						id: 99,
						name: "全部"
					}
				],
				listData: [],
				tableHeaderStyle: {
					background: "#efefef",
					color: "#333"
				},
				tableCellStyle: {
					padding: "6px 0"
				},
				pageIndex: 1,
				pageSize: 10,
				total: 0
			}
		},
		mounted() {
			this.getYears(),
				this.gettermList();
			this.getGradeList();
			this.getClassType();
			this.getList();
		},
		beforeRouteLeave(to, from, next) {
			if (to.name === "CourseOperate" && to.query.type === "create") {
				to.meta.title = "新增课程";
			} else if (to.name === "CourseOperate" && to.query.type === "modify") {
				to.meta.title = "修改课程";
			}
			next();
		},
		activated() {
			if (this.$route.query.reload) {
				this.getList();
			}
		},
		methods: {
			getYears() {
				let thisyear = new Date().getFullYear();
				let years = [];
				for (let i = 2019; i <= thisyear + 1; i++) {
					years.push({
						id: `${i}`,
						value: `${i}年`
					});
				}
				this.years = years;
			},
			gettermList() {
				this.$axios({
						method: "get",
						url: "http://zxxb-system-test.100daishu.com/platform/basics/gettermlist"
					})
					.then(res => {
						this.terms = res.list;
					})
					.catch(e => {
						this.$message.error(e.msg)
					})
			},
			getGradeList() {
				this.$axios({
						method: "get",
						url: "http://zxxb-system-test.100daishu.com/platform/user/gradelist"
					})
					.then(res => {
						this.grades = res.list;
					})
					.catch(e => {
						this.$message.error(e.msg)
					})
			},
			termChanged() {
				this.classType = ""
				let cts = this.classTypes[this.termId];
				if (!cts) {
					this.getClassType()
				}
			},
			getClassType() {
				var termId = this.term;
				this.$axios({
						method: "get",
						url: "http://zxxb-system-test.100daishu.com/platform/basics/getclasstype?termId=" + termId
					})
					.then(res => {
						this.$set(this.classTypes, termId, res.list);
					})
					.catch(e => {
						this.$message.error(e.msg)
					})
			},
			getList() {
				const data = {
					courseId: this.number,
					courseName: this.name,
					year: this.year,
					bookVer: this.bookVer,
					termId: this.term,
					gradeId: this.grade,
					classType: this.classType,
					page: this.pageIndex,
					pageSize: this.pageSize
				}
				this.$axios({
						method: "post",
						url: "http://zxxb-system-test.100daishu.com/platform/course/list",
						data
					})
					.then(res => {
						this.listData = res.list;
						this.total = res.total;
					})
					.catch(e => {
						this.$message.error(e.msg)
					})
			},
			pageChanged(idx) {
				this.pageIndex = idx;
				this.getList()
			},
			search() {
				this.getList()
			},
			addClass() {
				let o = {
					classTypes: this.classTypes,
					years: this.years,
					terms: this.terms,
					grades: this.grades
				};
				let children = encodeURIComponent(JSON.stringify(o));
				this.$router.push("/courseOperate?type=create&children=" + children);
			}
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

	.demo-input-suffix {
		margin: 10px;
		font-size: 14px;
	}

	.input {
		width: 194px;
		height: 40px;
	}

	.btn {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin-top: 20px;
	}

	.pagination {
		margin: 30px 10px;
		text-align: right;
	}
</style>
