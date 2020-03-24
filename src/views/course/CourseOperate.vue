<template>
	<div>
		<el-form class="form" ref="form" :model="form" :rules="rules" label-width="80px">
			<el-form-item label="年份" prop="year">
				<el-select v-model="form.year" placeholder="请选择年份" ref="firstel">
					<el-option v-for="(item,index) in years" :key="index" :label="item.value" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="年级" prop="grade">
				<el-select v-model="form.grade" placeholder="请选择年级">
					<el-option v-for="(item,index) in grades" :key="index" :label="item.gradeName" :value="item.gradeId"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="学科" prop="subjectId">
				<el-select v-model="form.subjectId" placeholder="请选择学科">
					<el-option v-for="(item,index) in subjects" :key="index" :label="item.value" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="名称" prop="courseName">
				<el-input class="input" v-model="form.courseName" maxlength="30"></el-input>
			</el-form-item>
			<el-form-item label="教材版本" prop="bookVer">
				<el-select v-model="form.bookVer" placeholder="请选择教材版本">
					<el-option v-for="(item,index) in bookVerTpye" :key="index" :label="item.name" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="学期" prop="termId">
				<el-select v-model="form.termId" placeholder="请选择学期" @change="termChanged">
					<el-option v-for="(item,index) in terms" :key="index" :label="item.termName" :value="item.termId"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="班型" prop="classType">
				<el-select v-model="form.classType" placeholder="请选择班型">
					<el-option v-for="(item,index) in classTypes[form.termId]" :key="index" :label="item.classTypeName" :value="item.classTpey" />
				</el-select>
			</el-form-item>
			<el-form-item label="课程类型" prop="courseType">
				<el-select v-model="form.courseType" :disabled="title == '修改课程'" placeholder="请选择类型">
					<el-option v-for="(item,index) in types" :key="index" :label="item.value" :value="item.id" />
				</el-select>
			</el-form-item>
			<el-form-item label="邮寄教具" prop="isMail">
				<el-radio-group v-model="form.isMail">
					<el-radio :label="1">是</el-radio>
					<el-radio :label="0">否</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="AI回放课" prop="isAi">
				<el-radio-group v-model="form.isAi">
					<el-radio :label="1">是</el-radio>
					<el-radio :label="0">否</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="课次" prop="class">
				<template>
					<div class="list">
						<el-button class="addClass" type="primary" @click="addClass">添加课次</el-button>
						<el-table :data="form.lectureList" :header-cell-style="tableHeaderStyle" :cell-style="tableCellStyle" stripe
						 borderstyle="width: 100%" border>
							<el-table-column type="index" align="center" label="序号" min-width="60"></el-table-column>
							<el-table-column prop="lectureId" align="center" label="次课编号" min-width="80"></el-table-column>
							<el-table-column prop="lectureName" align="center" label="课次名称" min-width="160" show-overflow-tooltip></el-table-column>
							<el-table-column label="操作" align="center" min-width="120">
								<div slot-scope="scope">
									<el-button type="text">删除</el-button>
								</div>
							</el-table-column>
						</el-table>
					</div>
				</template>
			</el-form-item>
			<el-form-item label="课程介绍" prop="introduce">
				<template>
					<div class="btn">
					            <!-- <showEditor :content="form.courseDesc" btn="预览" btntype="primary" place="right" /> -->
						<el-button type="primary">预览</el-button>
					</div>
					<div v-loading="quillFileLoading">
						<quill-editor v-model="form.courseDesc" ref="myQuillEditor" :options="editorOption" @blur="onEditorBlur($event)"
						 @focus="onEditorFocus($event)" @change="onEditorChange($event)"></quill-editor>
					</div>
					<span class="tips">已输入{{index}}字，还可以输入{{sum}}字</span>
				</template>
			</el-form-item>
			<el-form-item>
				<el-button type="primary">确定</el-button>
				<el-button >取消</el-button>
			</el-form-item>
		</el-form>
		<addClass :dialog-visible="isAdd" ></addClass>
	</div>
</template>

<script>
	import {
		quillEditor
	} from "vue-quill-editor";
	export default {
		components: {
			quillEditor,
			addClass: () => import("./AddClass"),
		},
		name: 'CourseOperate',
		data() {
			return {
				isAdd:false,
				years: [],
				grades: [],
				terms: [],
				classTypes: {},
				title: "新增课程",
				subjects: [{
					id: 1,
					value: "数学"
				}],
				form: {
					bookVer: 0,
					isAi: 0
				},
				rules: {
					year: {
						required: true,
						message: "请选择年份",
						trigger: "blur"
					},
					grade: {
						required: true,
						message: "请选择年级",
						trigger: "blur"
					},
					subjectId: {
						required: true,
						message: "请选学科",
						trigger: "blur"
					},
					courseName: {
						required: true,
						message: "请输入名称",
						trigger: "blur"
					},
					termId: {
						required: true,
						message: "请选择学期",
						trigger: "blur"
					},
					classType: {
						required: true,
						message: "请选择班型",
						trigger: "blur"
					},
					courseType: {
						required: true,
						message: "请选择课程类型",
						trigger: "blur"
					},
					isMail: {
						required: true,
						message: "请选择是否邮寄",
						trigger: "blur"
					},
					isAi: {
						required: true,
						message: "请选择AI回放课",
						trigger: "blur"
					}
				},
				bookVerTpye: [{
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
					}
				],
				type: "", //课程类型
				types: [{
						id: 0,
						value: "测试"
					},
					{
						id: 1,
						value: "正式"
					},
					{
						id: 2,
						value: "体验"
					}
				],
				lectureList: [],
				tableHeaderStyle: {
					background: "#efefef",
					color: "#333",
					padding: "6px 0",
					height: "26px"
				},
				tableCellStyle: {
					padding: "6px 0"
				},
				quillFileLoading: false,
				editorOption: {
					modules: {
						toolbar: {
							container: [
								["bold", "italic", "underline", "strike"],
								["blockquote", {
									header: 1
								}, {
									header: 2
								}],
								[{
									list: "ordered"
								}, {
									list: "bullet"
								}],
								[{
									script: "sub"
								}, {
									script: "super"
								}],
								[{
									indent: "-1"
								}, {
									indent: "+1"
								}, {
									align: []
								}],
								[{
									size: ["small", false, "large", "huge"]
								}],
								[{
									color: []
								}, {
									background: []
								}],
								["clean"],
								["link", "image", "video"]
							],
							handlers: {
								image: value => {
									if (value) {
										this.$refs.uploadImg.click();
									}
								},
								video: value => {
									if (value) {
										this.$refs.uploadVid.click();
									}
								}
							}
						}
					},
					placeholder: "请输入内容 ..."
				},
				index: "0",
				sum: "500",
			}
		},
		mounted() {
			const query = this.$route.query;
			// console.log(query)
			let children = JSON.parse(decodeURIComponent(query.children));
			this.years = children.years;
			this.grades = children.grades;
			this.terms = children.terms;
			this.classTypes = children.classTypes;
			if (query.type === "create") {
				this.title = "新建课程";
				this.init();
			} else {
				this.title = "修改课程";
				this.courseId = query.courseId;
				this.getCourseDetails(query.courseId);
				// 调用获取详情接口
			}
			// let content = ""; // 请求后台返回的内容字符串
			// this.str = this.escapeStringHTML(content);
		},
		methods: {
			init() {
				this.form.subjectId = this.subjects[0].id;
			},
			termChanged() {
				// 学期变化，清空班型
				this.$set(this.form, "classType", "");
				let cts = this.classTypes[this.form.termId];
				if (!cts) {
					this.getClassType();
				}
			},
			getClassType() {
				var termId = this.form.termId;
				this.$axios({
						method: "get",
						url: "http://zxxb-system-test.100daishu.com/platform/basics/getclasstype?termId=" + termId
					})
					.then(res => {
						// console.log(res);
						this.$set(this.classTypes, termId, res.list);
					})
					.catch(e => {
						this.$message.error(e.msg);
				});
			},
			onEditorBlur($event){
				//失去焦点
			},
			onEditorFocus($event){
				//获取焦点
			},
			onEditorChange({ quill, html, text }){
				let textLength = text.length;
				this.index = textLength - 1;
				this.sum = 500 - textLength + 1;
				if (textLength > 500) {
				        this.$message.error("最多输入500个字符");
				        quill.deleteText(500, 1);
				      }
			}
		}
	}
</script>

<style scoped>
	.form {
		margin-top: 20px;
	}

	.quill-editor .ql-container .ql-editor p {
		font-size: 0px;
	}

	.input {
		width: 194px;
	}

	.lesson-input {
		width: 90px;
	}

	.lesson-input>>>.el-input__inner {
		height: 36px;
	}

	.lesson-input1 {
		width: 130px;
	}

	.lesson-input1>>>.el-input__inner {
		height: 36px;
	}

	.list {
		position: relative;
		min-width: 680px;
	}

	.ai-info {
		position: absolute;
		left: 20px;
	}

	.addClass {
		float: right;
		margin-bottom: 15px;
	}

	.btn {
		margin-bottom: 15px;
	}

	.tips {
		float: right;
	}

	.mce-content-body {
		font-size: 30px;
	}

	.prompt {
		height: 10px;
		float: right;
	}

	.el-form-item {
		min-width: 800px;
		width: 75%;
	}

	.upload-btn {
		display: none;
	}

	.el-button {
		margin-top: 5px;
		margin-left: 0;
		margin-right: 10px;
		margin-bottom: 5px;
	}
</style>
