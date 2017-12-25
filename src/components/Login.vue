<template>
  <el-form ref="AccountFrom" :model="userInfo" :rules="rules" label-position="left" label-width="0px"
           class="demo-ruleForm login-container">
    <h3 class="title">系统登录</h3>
    <el-form-item prop="account">
      <el-input type="text" v-model="userInfo.account" auto-complete="off" placeholder="账号"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" v-model="userInfo.password" auto-complete="off" placeholder="密码" @keyup.enter.native="handleLogin"></el-input>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="handleLogin" :loading="logining">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  import { getToken, setToken, removeToken } from '@/utils/auth'

  export default {
    data() {
      return {
        logining: false,
        userInfo:{
          account:'',
          password:''
        },
        rules: {
          account: [
            {required: true, message: '请输入账号', trigger: 'blur'},
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
          ]
        }
      };
    },
    methods: {
      handleLogin() {
        this.$refs.AccountFrom.validate((valid) => {
          if (valid) {
            this.logining = true;
            let loginParams = { account: this.userInfo.account, password: this.userInfo.password };
            this.$http.post('http://www.wfpay.xyz/xpay/admin/login',loginParams).then(res => {
              this.logining = false;
              setToken(res.data.data.token);
              let id = res.data.data.id;
              let role = res.data.data.role;
              let storeId = res.data.data.storeId;
              sessionStorage.setItem('access-user', JSON.stringify(res.data.data));
              sessionStorage.setItem('role', res.data.data.role);
              if(role === "ADMIN"){
                this.$http.get(`http://www.wfpay.xyz/xpay/admin/agents`).then(res =>{
                  let adminsInfo = res.data.data.map(val => [val.id,val.account,val.password,val.name,val.role]);
                  let agentsInfo = adminsInfo.filter(agent => {
                    if(agent[4] === 'AGENT'){
                      return agent
                    }
                  });
                  this.$http.get(`http://www.wfpay.xyz/xpay/admin/${id}/apps`).then(res =>{
                    let appsInfo = res.data.data;
                    sessionStorage.setItem('appsInfo',JSON.stringify(appsInfo));
                  });
                  sessionStorage.setItem('adminsInfo',JSON.stringify(adminsInfo));
                  sessionStorage.setItem('agentsInfo',JSON.stringify(agentsInfo));
                })
              }
              if(role === "AGENT"||role === "ADMIN"){
                this.$http.get(`http://www.wfpay.xyz/xpay/admin/${res.data.data.id}/stores`).then(res => {
                  if(res.data.data){
                    let storesInfo = res.data.data.map(val => [val.id,val.name,val.code,val.agentId]);
                    sessionStorage.setItem('storesInfo',JSON.stringify(storesInfo));
                  }
                })
              }
              if(role === "STORE"){
                this.$http.get(`http://www.wfpay.xyz/xpay/admin/${res.data.data.id}/stores`).then(res => {
                  let storesInfo = res.data.data.map(val => [val.id,val.name,val.code,storeId]);
                  sessionStorage.setItem('storesInfo',JSON.stringify(storesInfo));
                });
                this.$http.get(`http://www.wfpay.xyz/xpay/admin/${res.data.data.id}/apps`).then(res => {
                  if(res.data.data){
                    sessionStorage.setItem('key',res.data.data[0].key);
                    sessionStorage.setItem('secret',res.data.data[0].secret);
                  }
                });
                sessionStorage.setItem('storeId',res.data.data.storeId);
              }
              this.$router.push({ path: '/' });
              //this.$router.addRoutes(asyncRouterMap);
            }).catch(()=>{
              this.logining = false;
              this.$message.error("用户名或密码错误！")
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
    }
  }

</script>
<style>
  body{
    background: #DFE9FB;
  }
</style>
<style lang="scss" slot-scoped>
  .login-container {
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 160px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;

    background: -ms-linear-gradient(top, #fff, #6495ed);
    background:-moz-linear-gradient(top,#b8c4cb,#f6f6f8);
    background:-webkit-gradient(linear, 0% 0%, 0% 100%,from(#b8c4cb), to(#f6f6f8));
    background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#fff), to(#6495ed));
    background: -webkit-linear-gradient(top, #fff, #6495ed,#fff);
    background: -o-linear-gradient(top, #fff, #6495ed);

    .title {
      margin: 0px auto 40px auto;
      text-align: center;
      color: #505458;
    }
  }
</style>
