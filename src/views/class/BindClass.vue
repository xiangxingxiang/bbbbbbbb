<!--绑定课件-->
<template>
  <el-dialog title="绑定课件" :visible.sync="dialogVisible" :show-close='false' :close-on-click-modal='false'
             :close-on-press-escape='false'>
    <div class="upload-file">
      <el-input v-model="fileName" class="name" placeholder="请输入文件名称" maxlength="20"></el-input>
      <el-button @click="pageIndex = 1;search();">搜索</el-button>
    </div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item><a href="javascript:;">全部文件</a></el-breadcrumb-item>
    </el-breadcrumb>
    <div class="btn">
      <a href="javascript:;" @click="uploadFile">上传课件</a>
      <a href="javascript:;" @click="newlyBuild">新建文件夹</a>
    </div>
    <el-table :data="listData" :header-cell-style="tableHeaderStyle" :cell-style="tableCellStyle" ref="multipleTable"
              stripe
              borderstyle="width: 100%" @selection-change="selectionRowsChange">
      <el-table-column
        type="selection"
        width="55"
        :selectable='selectable'>
      </el-table-column>
      <el-table-column
        prop="fileType"
        label="类型"
        min-width="120"
        :formatter="fileType">
      </el-table-column>
      <el-table-column
        prop="cwName"
        label="文件名称"
        min-width="200"
        show-overflow-tooltip>
        <template slot-scope="scope">
        <a href="javascript:;" v-if="scope.row.fileType === 0" @click="lookFile(scope.row.fileType,scope.row.cwId,scope.row.cwName)">{{scope.row.cwName}}</a>
        <span v-else>{{scope.row.cwName}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination :page-size="pageSize" :current-page.sync="pageIndex" :total="total"
                     layout="prev, pager, next, jumper" @current-change="pageChanged"/>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel()">返回</el-button>
      <el-button type="primary" @click="onConfirm()">绑定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    props: ['dialogVisible', 'title', 'refresh'],
    name: "bindClass",
    data() {
      return {
        secondLevel:true,
        pageSize: 10,
        pageIndex: 1,
        total: 0,
        tableHeaderStyle: {background: '#efefef', color: '#333'},
        tableCellStyle: {padding: '6px 0'},
        fileName: "",
        listData: [],
        rows: [],//课件id
      }
    },
    watch: {
      refresh(val) {//是否需要刷新绑定次课页面列表
        if (val) {
          this.getList();
        }
      }
    },
    mounted() {
      this.getList();
    },
    methods: {
      getList() {//根目录列表
        this.$axios({
          method: "post",
          url: 'http://zxxb-system-test.100daishu.com/platform/courseware/listcourseware',
          data: {
            cwName: this.fileName,
            page: this.pageIndex,
            pageSize: this.pageSize
          }
        }).then(res => {
          this.listData = res.cwList;
          this.total = res.total;
        }).catch(e => {
          this.$message.error(e.msg);
        })
      },
      selectable(row){
        if (row.fileType === 0){
          return false
        }else{
          return true;
        }
      },
      selectionRowsChange(row) {//选中的数据
        this.rows = row;
      },
      search() {
        this.getList();
      },
      onConfirm() {
          let idArr = [];
          this.rows.forEach(item => {
            idArr.push({
              cwId: item.cwId,
              cwName: item.cwName,
              fileType: item.fileType
            })
          });
          this.$emit('confirm', idArr);
          this.rows = [];
          idArr = [];
        this.$refs['multipleTable'].clearSelection();
        // this.$axios({
        //   method: 'post',
        //   url: '',
        //   data: {}
        // }).then(res => {
        //   this.$refs['multipleTable'].clearSelection();
        //   this.fileName = '';
        //   this.$emit('confirm');
        // }).catch(e => {
        //   this.$message.error(e.msg)
        // });
      },
      fileType(row) {//课件类型判断
        return row.fileType === 0 ? '文件夹' : row.fileType === 1 ? 'ppt' : row.fileType === 2 ? 'mp4' : '游戏课件'
      },
      pageChanged(idx) {
        this.pageIndex = idx;
        this.getList();
      },
      uploadFile() {
        this.fileName = '';
        this.$emit("uploadFilePop")
      },
      newlyBuild() {
        this.fileName = "";
        this.$emit("newlyBuildPop")
      },
      onCancel() {//关闭弹框
        this.$refs['multipleTable'].clearSelection();
        this.rows = [];
        this.fileName = '';
        this.$emit('cancel')
      },
      lookFile(type,id,name){//查看
        //打开文件夹
        if (type === 0) {
          this.$emit('childFile',name,id);
          return false;
        }
        //下载其他文件
      },

    }
  }
</script>

<style scoped>
  .upload-file {
    margin-bottom: 20px;
  }

  .name {
    width: 194px;
  }

  .btn {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }

  .btn a {
    margin: 0 10px;
  }

  .pagination {
    margin: 30px 10px;
    text-align: right;
  }
</style>
