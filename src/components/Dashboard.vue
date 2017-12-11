<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <template v-if="role === 'STORE'">
      <el-col :span="22" class="warp-main">
        <el-form ref="form" :model="form" label-width="100px">
          <el-form-item prop="appId" label="appId">
            <el-input v-model="form.appId" disabled></el-input>
          </el-form-item>
          <el-form-item prop="secret" label="secret">
            <el-input v-model="form.secret" disabled></el-input>
          </el-form-item>
        </el-form>
      </el-col>
    </template>
  </el-row>
</template>

<script>
  export default {
    data() {
      return {
        form: {
          appId: '',
          secret: '',
        },
        role:''
      }
    },
    mounted: function () {
      this.role = sessionStorage.getItem('role');
      this.form.appId = sessionStorage.getItem('key');
      this.form.secret = sessionStorage.getItem('secret')
    }
  }
</script>

<style>

</style>

