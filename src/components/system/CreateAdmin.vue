<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>系统管理</el-breadcrumb-item>
        <el-breadcrumb-item>创建商户管理员</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="22" class="warp-main">
      <el-form ref="formCreate" :model="formCreate" :rules="rules"  label-width="100px">
        <el-form-item prop="account" label="账号">
          <el-input v-model="formCreate.account"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input type="password" v-model="formCreate.password" placeholder="默认密码为123456"></el-input>
        </el-form-item>
        <el-form-item prop="name" label="用户名">
          <el-input v-model="formCreate.name"></el-input>
        </el-form-item>
        <el-form-item prop="agent" label="代理商">
          <el-select v-model="formCreate.agentId" @change="onChange" placeholder="请选择代理商">
            <el-option
              v-for="item in agentsInfo"
              :key="item[0]"
              :label="item[3]"
              :value="item[0]">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="store" label="商户">
          <el-select v-model="formCreate.storeId" placeholder="请选择商户">
            <el-option
              v-for="item in tempStoresInfo"
              :key="item[0]"
              :label="item[1]"
              :value="item[0]">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="role" label="权限">
          <el-select v-model="formCreate.role" placeholder="请选择用户权限">
            <el-option label="代理商" value="AGENT"></el-option>
            <el-option label="商户管理员" value="STORE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">创建商户管理员</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    data() {
      return {
        formCreate: {
          account: '',
          password: '123456',
          name: '',
          agentId: '',
          storeId: '',
          role: ''
        },
        agentsInfo:{},
        tempStoresInfo:{},
        rules: {
          account: [
            { required: true, message: '请输入账号', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
          ],
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          role: [
            { required: true, message: '请选择权限', trigger: 'blur' },
          ]
        },
      }
    },
    mounted: function(){
      this.agentsInfo = JSON.parse(sessionStorage.getItem('agentsInfo'));
      console.log(this.agentsInfo);
      if(this.formCreate.agentId === ''){
        this.tempStoresInfo = JSON.parse(sessionStorage.getItem('storesInfo'));
        console.log(this.tempStoresInfo);
      }
    },
    methods: {
      onSubmit() {
        this.$refs.formCreate.validate((valid) => {
          if (valid) {
            let id = JSON.parse(sessionStorage.getItem('access-user')).id;
            this.$http.put(`http://www.wfpay.xyz/xpay/admin/${id}/`,this.formCreate).then(() => {
              this.$message.success('创建成功！');
              this.$refs.formCreate.resetFields();
            }).catch(() => {
              this.$message.error('创建失败！');
              this.$refs.formCreate.resetFields();
            })
          }
        })
      },
      onChange() {
        let storesInfo = JSON.parse(sessionStorage.getItem('storesInfo'));
        this.tempStoresInfo = storesInfo.filter(info => {
          if(this.formCreate.agentId === info[3]){
            return info;
          }
        });
        console.log(this.tempStoresInfo);
      }
    }
  }
</script>

<style>

</style>
