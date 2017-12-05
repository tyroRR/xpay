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
      <el-form ref="formCreate" :model="formCreate" label-width="100px">
        <el-form-item prop="account" label="账号">
          <el-input v-model="formCreate.account"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="formCreate.password"></el-input>
        </el-form-item>
        <el-form-item prop="name" label="商户名">
          <el-input v-model="formCreate.name"></el-input>
        </el-form-item>
        <el-form-item prop="role" label="权限">
          <el-select v-model="formCreate.role" placeholder="请选择商户名称">
            <el-option label="系统管理员" value="ADMIN"></el-option>
            <el-option label="代理商" value="AGENT"></el-option>
            <el-option label="商户管理员" value="STORE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">创建商户</el-button>
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
          password: '',
          name: '',
          role: ''
        },
      }
    },
    methods: {
      onSubmit() {
        let id = JSON.parse(sessionStorage.getItem('access-user')).id;
        this.$http.put(`http://106.14.47.193/xpay/admin/${id}/`,this.formCreate).then(() => {
          this.$message.success('创建成功！');
          this.$refs.formCreate.resetFields();
        }).catch(() => {
          this.$message.error('创建失败！');
          this.$refs.formCreate.resetFields();
        })
      }
    }
  }
</script>

<style>

</style>
