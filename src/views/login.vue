<template>
  <div class="wrap">
    <div class="login" v-if="isChrome">
      <img :src="logo" alt class="login_logo" />
      <div class="login_res">
        <div class="login_tip">
          <span>袋鼠小班后台系统</span>
        </div>
        <div class="login_box">
          <div class="login_input">
            <el-input v-model="userName" clearable placeholder="输入账号" v-on:focus="toClearError"></el-input>
          </div>
          <div class="login_input">
            <el-input
              v-model="passWord"
              clearable
              placeholder="输入密码"
              type="password"
              v-on:focus="toClearError"
            ></el-input>
          </div>
          <span class="find_pass" @click="findPass">找回密码</span>
          <div class="login_error">
            <span :hidden="error === ''">{{error}}</span>
          </div>
          <el-button
            type="primary"
            class="login_btn"
            @click="loginIndex"
            :loading="loading"
            :disabled="userName === '' || passWord === ''"
          >登录</el-button>
        </div>
      </div>
    </div>
    <div v-else class="no-chrome">
      <h2>请使用谷歌浏览器访问，其他浏览器暂不支持</h2>
      <a href="https://www.google.cn/chrome/" class="btn" target="_blank">下载谷歌浏览器</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "login_page",
  data() {
    return {
      menuItems: [],
      userName: "",
      passWord: "",
      error: "",
      loading: false,
      logo: require("@/assets/logo.png"),
      isChrome: false
    };
  },
  mounted(){
    // console.log("window.navigator.userAgent",window.navigator.userAgent)
    if(window.navigator.userAgent.indexOf("Chrome") > -1){
      this.isChrome = true;
    }
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
          if (res.length) {
            let path = "";
            if (res[0].children) {
              path = res[0].children[0].moduleName;
            } else {
              path = res[0].moduleName;
            }
            this.$router.replace(path);
          } else {
            this.$router.replace("noRight");
          }
        })
        .catch(e => {
          this.$message.error(e.msg);
        });
    },
    loginIndex() {
      this.loading = true;
      //登录
      this.$axios({
        method: "post",
        url: "http://zxxb-system-test.100daishu.com/platform/staff/login",
        data: {
          email: this.userName,
          password: this.passWord
        }
      })
        .then(res => {
          console.log(res);
          this.loading = false;
          let token = res.token;
          localStorage.setItem("TOKEN", token);
          localStorage.setItem("UNAME", res.name);
          localStorage.setItem("isAdmin", res.isAdmin);
          localStorage.setItem("userId", res.id);

          if (res.changeNum === 0) {
            this.$router.push("/passUpdate?changeNum=0");
            return;
          }
          this.getMenuList();
        })
        .catch(e => {
          this.loading = false;
          if (e.code === 401) {
            this.error = "您填写的帐号或密码不正确";
          } else {
            this.$message.error(e.msg);
          }
        });
    },

    toClearError() {
      this.error = "";
    },
    findPass() {
      this.$router.push("findPass");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.wrap {
  height: 100%;
}
.login {
  height: 100%;
  background-color: #474c5f;
  position: relative;
  min-height: 400px;
}

.login_logo {
  width: 160px;
  height: 39px;
  margin: 30px 40px;
}

.login_res {
  width: 530px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.login_box {
  width: 530px;
  height: 300px;
  background: #fff;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 50px 90px;
}

.login_tip {
  display: inline-block;
  height: 35px;
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
  vertical-align: middle;
}

.login_tip span {
  color: #fff;
  font-size: 20px;
  font-family: PingFangSC-Semibold;
  vertical-align: middle;
}

.login_title {
  font-size: 20px;
  font-family: PingFangSC-Semibold;
  height: 50px;
  display: flex;
  align-items: center;
}

.login_btn {
  width: 100%;
}

.login_input + .login_input {
  margin-top: 30px;
  align-items: center;
}

.login_error {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #ff0000;
  height: 45px;
  padding: 5px 0 0 15px;
}
.find_pass {
  float: right;
  padding-top: 5px;
  cursor: pointer;
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


