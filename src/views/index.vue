<template>
  <div class="container">
    <el-container style="height: 100%;">
      <!-- HEADER -->
      <el-header>
        <i class="el-icon-menu highlight" @click="toggleMenu" />
        <span>袋鼠小班后台系统</span>
        <el-dropdown @command="handleDropdown">
          <span class="username-link">
            {{uname}}
            <i class="el-icon-caret-bottom" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>

      <el-container v-if="isChrome">
        <!-- SideBar -->
        <template v-if="!noRight">
          <el-aside width="auto" hight="100%" style="background-color: rgb(238, 241, 246)">
            <el-menu
              class="sidebar-menu"
              :default-active="$route.path"
              router
              :collapse="menuCollapsed"
            >
              <template v-for="item in menuItems">
                <!-- 如果有子菜单 -->
                <template v-if="item.children">
                  <el-submenu :index="item.moduleName" :key="item.moduleName">
                    <template slot="title">
                      <i :class="item.icon" />
                      <span slot="title">{{ item.label }}</span>
                    </template>
                    <el-menu-item
                      v-for="(subItem,i) in item.children"
                      :key="i"
                      :index="subItem.moduleName"
                    >{{ subItem.label }}</el-menu-item>
                  </el-submenu>
                </template>
                <!-- 没有子菜单 -->
                <template v-else>
                  <el-menu-item :index="item.moduleName" :key="item.moduleName">
                    <i :class="item.icon" />
                    <span slot="title">{{ item.label }}</span>
                  </el-menu-item>
                </template>
              </template>
              <i
                :class="menuCollapsed?'el-icon-d-arrow-right arrow':'el-icon-d-arrow-left arrow'"
                @click="toggleMenu"
              />
            </el-menu>
          </el-aside>
          <!-- 主内容区域 -->
          <el-main>
            <div class="breadcrumb-group">
              <span>当前位置：</span>
              <el-breadcrumb separator="/">
                <el-breadcrumb-item
                  :to="{ path: item.path }"
                  v-for="(item, index) in $route.meta.breadcrumb"
                  :key="index"
                >{{item.name}}</el-breadcrumb-item>
                <el-breadcrumb-item
                  v-if="$route.meta.parentname"
                  :to="{name: $route.meta.parentname}"
                >{{$route.meta.parenttitle}}</el-breadcrumb-item>
                <el-breadcrumb-item>{{$route.meta.title}}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <!-- 这些页面需要被缓存 -->
            <keep-alive
              :include="['Class', 'Course', 'Teacher', 'UserCenter', 'ClassManagement', 'UserDetail', 'ChangeClass']"
            >
              <router-view />
            </keep-alive>
          </el-main>
        </template>
        <template v-else>
          <div class="tip-right">暂无权限，请联系部门主管开通</div>
        </template>
      </el-container>
      <div v-else class="no-chrome">
        <h2>请使用谷歌浏览器访问，其他浏览器暂不支持</h2>
        <a href="https://www.google.cn/chrome/" class="btn" target="_blank">下载谷歌浏览器</a>
      </div>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      isAdmin: 0,
      menuCollapsed: true,
      noRight: false,
      menuItems: [],
      uname: localStorage.getItem("UNAME"),
      isChrome: false
    };
  },
  watch: {
    $route: function(v) {
      // if (v.meta.keepAlive) {
      //   let shouldAdd = true;
      //   for(let i in this.incList) {
      //     if (this.incList[i].name === v.name) {
      //       shouldAdd = false;
      //     }
      //   }
      //   if (shouldAdd) this.incList.push(v.name);
      //   console.log(this.incList);
      // }
    }
  },
  mounted() {
    // console.log("window.navigator.userAgent",window.navigator.userAgent)
    if (window.navigator.userAgent.indexOf("Chrome") > -1) {
      this.toggleMenu();
      this.getMenuList();
      this.isChrome = true;
    }
    this.isAdmin = localStorage.getItem("isAdmin") || 0;
  },
  methods: {
    getMenuList() {
      const data = {
        type: 1
      };
      this.$axios({
        method: "POST",
        url: "http://zxxb-system-test.100daishu.com/platform/role/mylist",
        data
      })
        .then(res => {
          // console.log(res);
          this.menuItems = res;
          if (this.menuItems.length === 0) {
            this.noRight = true;
          } else {
            this.noRight = false;
          }
        })
        .catch(e => {
          this.$message.error(e.msg);
        });
    },
    toggleMenu() {
      this.menuCollapsed = !this.menuCollapsed;
    },
    handleDropdown(cmd) {
      switch (cmd) {
        case "logout":
          localStorage.removeItem("TOKEN");
          this.$router.replace("/");
          break;
        default:
          break;
      }
    }
  }
};
</script>

<style scoped>
.el-header {
  color: white;
  background: #474c5f;
  display: flex;
  align-items: center;
  font-size: 22px;
  height: 70px !important;
}

.tip-right {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.highlight,
.arrow {
  line-height: 34px;
  text-align: center;
  width: 34px;
  height: 34px;
}

.highlight:hover {
  background: rgba(255, 255, 255, 0.3);
}
.arrow {
  float: right;
  margin-right: 16px;
}
.arrow:hover {
  background: rgba(0, 0, 0, 0.3);
}
.el-header span:first-of-type {
  flex-grow: 1;
  margin-left: 10px;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}
.sidebar-menu {
  height: 100%;
}
.el-main {
  width: 100%;
  height: 100%;
}

.username-link {
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
}

.breadcrumb-group {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
}

.breadcrumb-group > span:first-child {
  font-size: 14px;
  color: #999;
  margin-right: 10px;
}

.breadcrumb-group .el-breadcrumb {
  display: inline-block;
}
.no-chrome {
  padding-top: 120px;
  text-align: center;
}
.no-chrome h2 {
  margin-bottom: 100px;
}
.no-chrome a {
  padding: 10px 30px;
  background-color: #409eff;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
}
</style>
