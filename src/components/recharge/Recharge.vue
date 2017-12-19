<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>交易额度管理</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="6" class="warp-main">
      <el-form ref="formRecharge" :model="formRecharge" label-width="100px">
        <el-form-item>
          <p>交易额度管理</p>
        </el-form-item>
        <el-form-item label="剩余交易额度">
          <el-input v-model="formRecharge.quota" disabled></el-input>
        </el-form-item>
        <el-form-item label="充值金额">
          <el-input-number v-model="formRecharge.amount" :min="100" :step="100"></el-input-number>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="formRecharge.channel" placeholder="请选择支付方式">
            <el-option label="支付宝" value="ALIPAY"></el-option>
            <el-option label="微信" value="WECHAT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">立即充值</el-button>
        </el-form-item>
      </el-form>
      <el-col :span="12" class="show-result">
        <el-col :span="24">
          <img :src="result.qrcode">
        </el-col>
        <el-col :span="24">
          <el-alert
            :closable="result.closable"
            :show-icon="result.icon"
            :title="result.title"
            :type="result.status"
            center>
          </el-alert>
        </el-col>
      </el-col>
    </el-col>

  </el-row>

</template>

<script>
  export default {
    data() {
      return {
        formRecharge: {
          amount: '',
          channel: '',
          quota: 0
        },
        result: {
          title: '',
          status: '',
          qrcode: '',
          icon: false,
          closable: false
        },
        intervalId:''
      }
    },
    mounted: function () {
      this.formRecharge.quota = sessionStorage.getItem('quota');
    },
    destroyed: function () {
      clearInterval(this.intervalId);
    },
    methods: {
      onSubmit() {
        let storeId = sessionStorage.getItem('storeId');
        let userInfo = JSON.parse(sessionStorage.getItem('access-user'));
        let params = {amount:this.formRecharge.amount,channel:this.formRecharge.channel};
        if (!this.formRecharge.channel){
          this.$message.error('请选择支付方式！');
          return false;
        }
        this.$http.post(`http://www.wfpay.xyz/xpay/admin/${userInfo.id}/stores/${storeId}/recharge_order`,params).then(
          res => {
            this.result.qrcode = "http://pan.baidu.com/share/qrcode?w=200&h=200&url="+ res.data.data.codeUrl;
            this.result.closable = true;
            this.result.icon = true;
            this.result.title = "请扫描二维码完成支付";
            this.result.status = "info" ;
            sessionStorage.setItem("transactionId",res.data.data.transactionId);
            this.intervalId = setInterval(this.validate,10000);
          })
      },
      validate() {
        let transactionId = sessionStorage.getItem("transactionId");
        if(transactionId){
          this.$http.get(`http://www.wfpay.xyz/xpay/admin/${JSON.parse(sessionStorage.getItem('access-user')).id}/transactions/${transactionId}`).then(
            res =>  {
              if(res.data.data.status === "SUCCESS"){
                clearInterval(this.intervalId);
                this.result.title = "支付成功";
                this.result.status = "success" ;
                this.formRecharge.quota = res.data.data.quota;
                let profile ={quota:res.data.data.quota, bailPercentage:res.data.data.bailPercentage};
                sessionStorage.setItem('profile',profile)
              }
              console.log(res.data.data.status)
            }
          )
        }
      }
    }
  }
</script>

<style>
  .show-result{
    margin-left: 60px;
  }
</style>
