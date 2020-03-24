<!--课件管理-->
<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item><a href="javascript:;" @click="allFile">全部文件</a></el-breadcrumb-item>
      <el-breadcrumb-item v-if="!root">{{fileName}}</el-breadcrumb-item>
    </el-breadcrumb>
    <Root v-if="root" @childFile="childFile"/>
    <secondLevel v-if="!root" :id="id"/>
  </div>
</template>

<script>
  export default {
    name: "Courseware",
    components: {
      Root: () => import('./Root')
    },
    data() {
      return {
        root: true,
        fileName:"",
        id:"",
      }
    },
    methods: {
      allFile() {
        this.root = true;
      },
      childFile(name,id){
        this.fileName = name;
        this.id = id;
        this.root = false;
      }
    }
  }
</script>

<style scoped>

</style>
