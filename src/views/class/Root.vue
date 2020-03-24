<!--根目录-->
<template>
  <div>
    <div class="wrap">
      <div class="search">
        <el-input v-model="name" class="text" placeholder="请输入文件名称" clearable></el-input>
        <el-button type="primary" @click="pageIndex = 1;search();">搜索</el-button>
      </div>
      <div class="operation">
        <el-button type="primary" @click="uploadFile">上传课件</el-button>
        <el-button class="newFile" type="primary" @click="newlyBuild">新建文件夹</el-button>
      </div>
    </div>
    <!--<el-button type="info" class="allDelete" @click="allDelete">删除</el-button>-->
    <el-table :data="listData" :header-cell-style="tableHeaderStyle" :cell-style="tableCellStyle" stripe
              borderstyle="width: 100%" @selection-change="selectionRowsChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="cwId"
        label="课件id"
        min-width="120">
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
        <!--<template slot-scope="scope">-->
        <!--<a href="javascript:;" v-if="scope.row.fileType === 0" @click="lookFile(scope.row.cwId,scope.row.cwName)">{{scope.row.cwName}}</a>-->
        <!--<span v-else>{{scope.row.cwName}}</span>-->
        <!--</template>-->
      </el-table-column>
      <el-table-column
        prop="fileSize"
        label="大小"
        min-width="120"
        :formatter="fileSize"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        min-width="200"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="120">
        <template slot-scope="scope">
          <div v-if="scope.row.fileType === 0" style="display:inline-block">
            <a style="text-decoration:none;color:#409EFF;font-weight:bold" href="javascript:;"
               @click="clickDetail(scope.row.fileType,scope.row.cwId,scope.row.cwName)">查看</a>
          </div>
          <div v-else style="display:inline-block">
            <a style="text-decoration:none;color:#409EFF;font-weight:bold" :href="scope.row.fileUrl">查看</a>
          </div>
          <el-button @click="clickModify(scope.row.cwId)" type="text" size="medium">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination :page-size="pageSize" :current-page.sync="pageIndex" :total="total"
                     layout="prev, pager, next, jumper" @current-change="pageChanged"/>
    </div>
    <!--上传文件-->
    <Upload :dialog-visible='isUpload' @ossSuccess="uploadFilePop" @cancel="cancelUpload"/>
    <!--新建文件夹-->
    <newFiles :dialog-visible='isNew' @confirm="addNewFile" @cancel="cancelNewFiles"/>
  </div>
</template>

<script>
  export default {
    name: "root",
    components: {
      Upload: () => import('./Upload'),
      newFiles: () => import('./NewFiles')
    },
    data() {
      return {
        pageSize: 10,
        pageIndex: 1,
        total: 0,
        tableHeaderStyle: {background: '#efefef', color: '#333'},
        tableCellStyle: {padding: '6px 0'},
        listData: [],
        name: "",//搜索文件名
        isUpload: false,//上传文件弹框
        isNew: false,//新建文件夹
        rows: [],//选中的数据
      }
    },
    mounted() {
      this.getList();//列表数据
    },
    methods: {
      fileSize(row) {
        //文件大小
        let size = "";
        if (row.fileSize < 0.1 * 1024) {                            //小于0.1KB，则转化成B
          size = row.fileSize.toFixed(2) + "B"
        } else if (row.fileSize < 0.1 * 1024 * 1024) {            //小于0.1MB，则转化成KB
          size = (row.fileSize / 1024).toFixed(2) + "KB"
        } else if (row.fileSize < 0.1 * 1024 * 1024 * 1024) {        //小于0.1GB，则转化成MB
          size = (row.fileSize / (1024 * 1024)).toFixed(2) + "MB"
        } else {                                            //其他转化成GB
          size = (row.fileSize / (1024 * 1024 * 1024)).toFixed(2) + "GB"
        }
        let sizeStr = size + "";                        //转成字符串
        let index = sizeStr.indexOf(".");                    //获取小数点处的索引
        let dou = sizeStr.substr(index + 1, 2)            //获取小数点后两位的值
        if (dou === "00") {                                //判断后两位是否为00，如果是则删除00
          return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
        }
        return size;
      },
      getList() {//根目录列表
        this.$axios({
          method: "post",
          url: 'http://zxxb-system-test.100daishu.com/platform/courseware/listcourseware',
          data: {
            cwName: this.name,
            page: this.pageIndex,
            pageSize: this.pageSize
          }
        }).then(res => {
          console.log(res)
          console.log(res.cwList)
          this.listData = res.cwList;
          this.total = res.total;
        }).catch(e => {
          this.$message.error(e.msg);
        })
      },
      search() {//搜索
        this.getList();
      },
      fileType(row) {//课件类型判断
        return row.fileType === 0 ? '文件夹' : row.fileType === 1 ? 'ppt' : row.fileType === 2 ? 'mp4' : '游戏课件'
      },
      deleteList(id) {//删除
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$axios({
            method: 'post',
            url: 'http://zxxb-system-test.100daishu.com/platform/courseware/deletecourseware',
            data: {cwId: id}
          }).then(res => {
            console.log(res)
            //TODO  没有返回值
            this.$message.success('删除成功');
            this.getList();
          }).catch(e => {
            this.$message.error(e.msg)
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      selectionRowsChange(row) {//选中的数据
        this.rows = row;
      },
      clickModify(id) {//删除一条数据
        this.deleteList(id);
      },
      allDelete() {//删除多条数据
        //TODO 没有多条删除接口？
        if (this.rows.length === 0) {
          this.$message.error('请选择要删除的数据');
          return false;
        }
        let idArr = [];
        this.rows.forEach(item => {
          idArr.push(item.cwId)
        });
        console.log(idArr)
        this.deleteList(idArr);
      },
      clickDetail(type, id, name) {//查看
        //打开文件夹
        this.$emit('childFile', name, id);
        return false;
        //下载其他文件
      },
      pageChanged(idx) {
        this.pageIndex = idx;
        this.getList();
      },
      uploadFile() {//上传文件
        this.isUpload = !this.isUpload;
      },
      uploadFilePop() {//上传文件成功
        this.isUpload = !this.isUpload;
        this.getList();//列表数据
      },
      cancelUpload() {//取消上传文件弹框
        this.isUpload = !this.isUpload;
      },
      newlyBuild() {//新建文件夹
        this.isNew = !this.isNew;
      },
      addNewFile() {//添加新文件夹
        this.isNew = !this.isNew;
        this.getList();
      },
      cancelNewFiles() {//取消新建弹框
        this.isNew = !this.isNew;
      },
    }
  }
</script>

<style scoped>
  li {
    list-style: none
  }

  .nav {
    display: flex;
    flex-wrap: nowrap
  }

  .wrap {
    margin: 16px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #FAFAFA;
    padding: 32px 0;
  }

  .search {
    margin-bottom: 80px;
  }

  .text {
    width: 300px;
    height: 40px;
    margin: 0 50px 0 120px;
  }

  .operation {
    display: flex;
    justify-content: flex-end
  }

  .newFile {
    margin: 0 16px 0 32px;
  }

  .allDelete {
    margin: 0 32px 10px 32px;
  }

  .pagination {
    margin: 30px 10px;
    text-align: right;
  }
</style>
