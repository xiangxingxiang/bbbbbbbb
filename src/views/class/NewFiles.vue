<!--新建文件夹-->
<template>
  <el-dialog title="新建文件夹" :visible.sync="dialogVisible" :show-close='false' :close-on-click-modal='false'
             :close-on-press-escape='false'>
    <div class="upload-file">
      <span>文件夹名称：</span>
      <el-input v-model="fileName" class="name" placeholder="1~20个字母/汉字" maxlength="20"></el-input>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="childPop" @click="onCancel()">返 回</el-button>
      <el-button v-else @click="onCancel()">取 消</el-button>
      <el-button type="primary" @click="onConfirm()">确 定</el-button>
    </div>
  </el-dialog>


</template>

<script>
  export default {
    props: ['dialogVisible','childPop'],
    name: "newFiles",
    data() {
      return {
        fileName: "",//文件名称
      }
    },
    methods: {
      onConfirm(){//提交文件夹
        this.$axios({
          method: "post",
          url: 'http://zxxb-system-test.100daishu.com/platform/courseware/createdir',
          data: {
            cwName: this.fileName
          }
        }).then(res => {
          console.log(res)
          //TODO 没有返回值？
          this.$message.success('新建成功');
          this.fileName = "";
          this.$emit('confirm');
        }).catch(e => {
          this.$message.error(e.msg);
        })
      },
      onCancel() {//关闭弹框
        this.fileName = "";
        this.$emit('cancel');
      },

    }
  }
</script>

<style scoped>
  .name {
    width: 240px;
    margin-left: 20px;
  }
</style>
