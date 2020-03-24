<template>
  <el-dialog
    title="添加次课"
    :visible.sync="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @opened="opened"
  >
    <div class="search">
      <div class="demo-input-suffix">
        次课名称：
        <el-input v-model="lectureName" class="name" placeholder="请输入名称" maxlength="20"></el-input>
      </div>
      <div class="demo-input-suffix">
        学科：
        <el-select class="select" v-model="subjectId" placeholder="请选择">
          <el-option
            v-for="(item,index) in subjects"
            :key="index"
            :label="item.value"
            :value="item.id"
          />
        </el-select>
      </div>
      <div class="demo-input-suffix">
        年级：
        <el-select class="select" v-model="gradeId" placeholder="请选择">
          <el-option
            v-for="(item,index) in grades"
            :key="index"
            :label="item.gradeName"
            :value="item.gradeId"
          />
        </el-select>
      </div>
      <div class="btn">
        <el-button type="primary" @click="pageIndex = 1;search();">搜索</el-button>
      </div>
    </div>
    <el-table
      :data="listData"
      :header-cell-style="tableHeaderStyle"
      :cell-style="tableCellStyle"
      stripe
      borderstyle="width: 100%"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="lectureId" label="次课编号" min-width="80"></el-table-column>
      <el-table-column prop="lectureName" label="次课名称" min-width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="subjectName" label="学科" min-width="80" show-overflow-tooltip></el-table-column>
      <el-table-column prop="gradeName" label="年级" min-width="80" show-overflow-tooltip></el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        :page-size="pageSize"
        :current-page.sync="pageIndex"
        :total="total"
        layout="prev, pager, next, jumper"
        @current-change="pageChanged"
      />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel()">取消</el-button>
      <el-button type="primary" @click="onConfirm()">添加</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: ["dialogVisible", "subjects", "grades"],
  name: "AddClass",
  data() {
    return {
      pageSize: 10,
      pageIndex: 1,
      total: 0,
      tableHeaderStyle: { background: "#efefef", color: "#333" },
      tableCellStyle: { padding: "6px 0" },
      selectListData: [],
      listData: [],
      subjectId: '',
      lectureName: '',
      gradeId: ''
    };
  },
  methods: {
    opened() {
      this.search();
    },
    // 搜索课次
    search() {
      const data = {
        lectureName: this.lectureName, //次课名称
        subjectId: this.subjectId, //学科id
        gradeId: this.gradeId, //年级id
        page: this.pageIndex,
        pageSize: this.pageSize
      };
      this.$axios({
        method: "post",
        url: "/platform/lecture/listlecture",
        data
      })
        .then(res => {
          this.listData = res.lectureList;
          this.page = res.pageIndex;
          this.pageSize = +res.pageSize;
          this.total = res.total;
        })
        .catch(e => {
          this.$message.error(e.msg);
        });
    },
    //  选择切换时触发的事件
    selectionChange(val) {
      this.selectListData = val;
    },
    // 添加
    onConfirm() {
      this.$emit('selectListData', JSON.stringify(this.selectListData));
      this.$emit("cancel");
    },
    pageChanged(idx) {
      this.pageIndex = idx;
      this.search();
    },
    onCancel() {
      //关闭弹框
      this.$emit("cancel");
    }
  }
};
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
  margin-left: 20px;
}

.select {
  width: 100px;
}

.name {
  width: 150px;
}

.demo-input-suffix {
  margin-right: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}

.pagination {
  margin: 30px 10px;
  text-align: right;
}
</style>
