<template>
	<div class="wrap">
		<el-upload :class="question ? 'avatar-uploader my-uploader' : 'avatar-uploader'" ref="upload" action v-loading="loading"
		 :on-error="onError" :on-progress="onProgress" :http-request="fnUploadRequest" :show-file-list="false" :before-upload="beforeAvatarUpload">
			<img v-if="imageUrl" :src="imageUrl" class="avatar" />
			<img v-else-if="modifyUrl && !imageUrl" :src="modifyUrl" class="avatar" />
			<i v-else class="el-icon-plus avatar-uploader-icon"></i>
			<span class="buttomStyle" v-if="title === 'PPT' || title === 'MP4' || title === '游戏课件'">{{`只能上传`+title}}</span>
		</el-upload>
		<div class="progress" v-if="progress">{{progressNum+'%'}}</div>
	</div>
</template>

<script>
	import oss from "../utils/aliOss";
	export default {
		props: ["title", "modifyUrl", "fileId", "teacher", "question"],
		name: "UploadFile",
		data() {
			return {
				imageUrl: "",
				size: "",
				name: "",
				loading: false,
				progress: false,
				progressNum: 0
			};
		},
		watch: {
			imageUrl(val) {
				//关闭弹框清楚图片
				if (val) {
					this.imageUrl = this.size = this.name = "";
				}
			}
		},
		methods: {
			/**
			 * @description [fnUploadRequest 覆盖默认的上传行为，实现自定义上传]
			 * @param    {object}   option [上传选项]
			 * @return   {null}   [没有返回]
			 */
			async fnUploadRequest(option) {
				let file = option.file;
				let extensionName = file.name
					.substr(file.name.lastIndexOf("."))
					.toUpperCase(); // 文件扩展名
				if (
					this.title === "PPT" &&
					extensionName !== ".PPT" &&
					extensionName !== ".PPTX"
				) {
					this.$message.error("只能上传ppt文件");
					return;
				} else if (this.title === "MP4" && extensionName !== ".MP4") {
					this.$message.error("只能上传mp4格式");
					return;
				} else if (this.title === "游戏课件" && extensionName !== ".ZIP") {
					this.$message.error("只能上传zip文件");
					return;
				} else if (this.title === "上传头像" || this.title === "上传题干") {
					//jpeg','bmp','gif','jpg'
					if (
						extensionName !== ".JPEG" &&
						extensionName !== ".BMP" &&
						extensionName !== ".JPG" &&
						extensionName !== ".PNG"
					) {
						this.$message.error("只能上传jpeg,bmp,jpg,png");
						return;
					}
				} else if (this.title === "上传海报" && extensionName !== ".PNG") {
					this.$message.error("只能上传png格式");
					return;
				}
				this.loading = true;
				this.progress = true;
				oss
					.ossUploadFile(option)
					.then(result => {
						// 上传老师头像或上传题干
						if (this.teacher || this.question) {
							if (result) {
								this.progress = false;
								this.loading = false;
								this.imageUrl = result.fileUrl;
								this.$emit(
									"ossArgs",
									result.fileUrl,
									result.fileName,
									result.fileSize
								);
								this.$message.success("上传成功");
								// this.$refs.upload.clearFiles();
							} else {
								this.progress = false;
								this.loading = false;
								this.$message.error("上传失败");
							}
							return;
						}
						//上传课件
						let params = {};
						if (
							this.fileId !== undefined &&
							this.fileId !== "" &&
							this.fileId !== null
						) {
							params = {
								cwId: this.fileId,
								cwName: file.name,
								fileType: this.title === "PPT" ? 1 : this.title === "MP4" ? 2 : 3,
								fileSize: result.fileSize,
								fileUrl: result.fileUrl
							};
						} else {
							params = {
								cwName: file.name,
								fileType: this.title === "PPT" ? 1 : this.title === "MP4" ? 2 : 3,
								fileSize: result.fileSize,
								fileUrl: result.fileUrl
							};
						}
						this.$axios({
								method: "post",
								url: "platform/courseware/uploadcourseware",
								data: params
							})
							.then(() => {
								this.progress = false;
								this.loading = false;
								this.$message.success("上传成功");
								this.$emit("confirm");
							})
							.catch(e => {
								//loading.close();
								this.progress = false;
								this.loading = false;
								this.$message.error(e.msg);
							});
					})
					.catch(e => {
						this.progress = false;
						this.loading = false;
						this.$message.error(e);
					});
			},
			onProgress(e) {
				this.progressNum = e.percent.toFixed(1);
				if (this.progressNum === 100) {
					setTimeout(() => {
						this.progress = false;
					}, 100);
				}
			},
			// 上传前
			beforeAvatarUpload(file) {
				// 限制上传头像大小不超过2M
				const isLt = file.size / 1024 < 50;
				if (this.title === "上传头像" && !isLt) {
					this.$message.error("上传头像图片大小不能超过 50KB!");
					return false;
				}

				if (this.title === "上传海报" && file.size / 1000 >= 1000) {
					this.$message.error("上传海报大小不能超过1M!");
					return false;
				}

				if (this.title === "秒杀分享图片" && file.size / 1000 >= 200) {
					this.$message.error("图片大小不能超过200k!");
					return false;
				}
			},
			// 上传成功后
			handleVideoSuccess(response, file, fileList) {
				//TODO  上传接口400
			},
			// 添加多个文件事件
			beyondFile(files, fileList) {
				//todo
			},
			onError() {
				this.loading = false;
			}
		}
	};
</script>

<style scoped>
	.avatar-uploader {
		width: 150px;
		height: 150px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		border: 1px dashed #d9d9d9;
		border-radius: 6px;
		cursor: pointer;
	}

	.wrap .my-uploader {
		width: auto;
		height: auto;
		min-width: 150px;
		min-height: 150px;
		max-width: 500px;
		max-height: 500px;
	}

	.avatar-uploader .el-upload {
		border: 1px dashed #d9d9d9;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
	}

	.avatar-uploader .el-upload:hover {
		border-color: #409eff;
	}

	.el-icon-plus {
		width: 150px;
		height: 150px;
		line-height: 150px;
	}

	.avatar {
		width: 150px;
		height: 150px;
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 10;
	}

	.my-uploader .avatar {
		width: auto;
		height: auto;
		min-width: 150px;
		min-height: 150px;
		max-width: 500px;
		max-height: 500px;
		position: static;
	}

	.buttomStyle {
		width: 150px;
		text-align: center;
		display: block;
		position: absolute;
		bottom: -30px;
		left: 0;
	}

	.wrap {
		display: inline-block;
		position: relative;
	}

	.progress {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 99999;
		width: 100%;
		height: 100%;
		color: #000;
		font-size: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
