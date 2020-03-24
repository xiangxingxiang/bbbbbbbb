<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="次课管理" name="first">
      <Children v-if="isChildFirst"></Children>
    </el-tab-pane>

    <el-tab-pane label="课件管理" name="second">
      <Courseware v-if="!isChildFirst"></Courseware>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  export default {
    name: "Class",
    components: {
      Children: () => import('./Children'),
      Courseware: () => import('./Courseware')
    },
    data() {
      return {
        activeName: "first",
        isChildFirst:true,
      }
    },
    methods:{
      handleClick(tab) {
        if (tab.index === '0'){
          this.isChildFirst = true;
        } else {
          this.isChildFirst = false;
        }
      }
    }
  }
</script>

<style scoped>

</style>
