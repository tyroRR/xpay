<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>系统管理</el-breadcrumb-item>
        <el-breadcrumb-item>修改商户管理员信息</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="22" class="warp-main">
      <el-form ref="formEdit" :model="formEdit" label-width="100px">
        <el-form-item prop="account" label="账号">
          <el-input v-model="formEdit.account" disabled></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="formEdit.password"></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-select v-model="formEdit.name" @change="onChange" placeholder="请选择用户名">
            <el-option
              v-for="item in storesInfo"
              :key="item[0]"
              :label="item[1]"
              :value="item[0]">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="role" label="权限">
          <el-select v-model="formEdit.role" placeholder="请选择用户权限">
            <el-option label="系统管理员" value="ADMIN"></el-option>
            <el-option label="代理商" value="AGENT"></el-option>
            <el-option label="商户管理员" value="STORE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">修改信息</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    data() {
      return {
        formEdit: {
          account: '',
          password: '',
          name: '',
          role: ''
        },
        storesInfo:{}
      }
    },
    mounted: function(){
      this.storesInfo = JSON.parse(sessionStorage.getItem('storesInfo'));
      console.log(this.storesInfo);
    },
    methods: {
      onSubmit() {
        let id = JSON.parse(sessionStorage.getItem('access-user')).id;
        this.$http.patch(`http://106.14.47.193/xpay/admin/${id}/`,this.formEdit).then(() => {
          this.$message.success('修改成功！');
          this.$refs.formEdit.resetFields();
        }).catch(() => {
          this.$message.error('修改失败！');
          this.$refs.formEdit.resetFields();
        })
      },
      onChange() {
        this.formEdit.account = JSON.parse(sessionStorage.getItem('access-user')).account;
      }
    }
  }
</script>

<style>

</style>
