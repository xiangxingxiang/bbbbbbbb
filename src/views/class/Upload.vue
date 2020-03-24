<!--上传文件-->
<template>
  <el-dialog title="上传文件" :visible.sync="dialogVisible" :show-close='false' :close-on-click-modal='false'
             :close-on-press-escape='false'>
    <span>选择课件类型</span>
    <div class="upload-file">
      <uploadFile :title="`PPT`" :modifyUrl="pptUrl" :fileId="fileId" @confirm="ossSuccess"/>
      <uploadFile :title="`MP4`" :modifyUrl="videoUrl" :fileId="fileId" @confirm="ossSuccess"/>
      <uploadFile :title="`游戏课件`"  :modifyUrl="otherUrl" :fileId="fileId" @confirm="ossSuccess"/>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="childPop" @click="onCancel()">返 回</el-button>
      <el-button v-else @click="onCancel()">取 消</el-button>
      <!--<el-button type="primary" @click="onConfirm()">确 定</el-button>-->
    </div>
  </el-dialog>

</template>

<script>

  export default {
    props: ["dialogVisible",'fileId','prevPage','childPop'],
    name: "upload",
    components: {
      uploadFile: () => import('../common/UploadFile')
    },
    data() {
      return {
        pptUrl: "",
        pptName: "",
        pptSize: "",
        videoUrl: "",
        videoName: "",
        videoSize: "",
        otherUrl: "",
        otherName: "",
        otherSize: "",
        type:0,
      }
    },
    methods: {
      ossSuccess(){
        this.$emit('ossSuccess');

      },
      onCancel() {//关闭上传弹框
        //this.$refs['foorm'].resetFields();
        this.$emit('cancel',this.prevPage);
        /*this.pptUrl = this.pptName = this.pptSize = '';
        this.videoUrl = this.videoName = this.videoSize = '';
        this.otherUrl = this.otherName = this.otherSize = '';*/
      },
    }
  }
</script>

<style scoped>


  .upload-file {
    display: flex;
    justify-content: space-between;
    padding: 32px 10px;
  }

</style>
