<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>系统管理</el-breadcrumb-item>
        <el-breadcrumb-item>增加商户额度</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="24" class="warp-main">
      <el-form ref="formIncrease" :model="formIncrease" label-width="80px">
        <el-form-item label="增加额度">
          <el-input-number v-model="formIncrease.amount" :min="100" :step="100"></el-input-number>
        </el-form-item>
        <el-form-item label="商户名">
          <el-select v-model="formIncrease.name" placeholder="请选择商户名">
            <el-option
              v-for="item in storesInfo"
              :key="item[0]"
              :label="item[1]"
              :value="item[0]">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="交易类型">
          <el-select v-model="formIncrease.transaction_type" placeholder="请选择交易类型">
            <el-option label="OFFLINE" value="OFFLINE"></el-option>
            <el-option label="FREE" value="FREE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">增加额度</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>


<script>
  export default {
    data() {
      return {
        formIncrease: {
          name:'',
          amount: '',
          transaction_type: ''
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
        this.$http.post(`http://106.14.47.193/xpay/admin/${id}/stores/${this.formIncrease.name}/quota`,this.formIncrease).then(() => {
          this.$message.success('增加额度成功！');
        }).catch(() => {
          this.$message.error('增加额度失败！');
        })
      },
    }
  }
</script>

<style>

</style>
