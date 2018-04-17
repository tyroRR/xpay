<template>
  <el-row>
    <el-col :span="6">
      <el-form label-width="100px">
        <el-form-item label="子商户id">
          <el-input v-model="subId" placeholder="请输入子商户id"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">生成测试支付链接</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="24">
      {{result}}
    </el-col>
  </el-row>
</template>

<script>
  import {userInfo} from "../../../../vue-mall/src/api/index";

  export default {
    data() {
      return {
        subId: '',
        result: ''
      }
    },
    methods: {
      onSubmit() {
        let now = new Date();
        let orderTime = `${now.getFullYear()}${now.getMonth()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
        let sellerOrderNo = new Date().getTime();
        let subChannelId = this.subId;
        let userInfo = JSON.parse(sessionStorage.getItem('access-user'));
        let storeId = userInfo.account;
        console.log(orderTime,sellerOrderNo,subChannelId);
        this.$http.get("/xpay/tokens/7c7804cf-c549-4ac9-9643-a279c224e4f6").then((res)=>{
          let token = res.data.token;
          const body = {
            storeId: storeId,
            payChannel: "1",
            totalFee: "50",
            orderTime: orderTime,
            sellerOrderNo: sellerOrderNo,
            attach: "test",
            ip: "127.0.0.1",
            subject: "test",
            notifyUrl: "127.0.0.1",
            returnUrl: "127.0.0.1",
            subChannelId: subChannelId
          };
          fetch("/xpay/rest/v1/pay/unifiedorder",{
            headers:{
              'content-type':'application/json',
              'Access_token': token
            },
            method:'POST',
            body: JSON.stringify(body)
          }).then(response =>
            response.json().then(json => ({ json, response }))
          ).then(({ json, response }) => {
            if (!response.ok) {
              return Promise.reject(json);
            }
            return json;
          }).then(
            response => {
              console.log(response.data);
              this.result = response.data.codeUrl;
            },
            error => error
          );
        })
      }
    }
  }
</script>
