<template>
  <el-row>
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>环迅易收付</el-breadcrumb-item>
        <el-breadcrumb-item>生成测试链接</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>

    <el-col :span="6">
      <el-form label-width="100px">
        <el-form-item>
          <h2>生成测试链接</h2>
        </el-form-item>
        <el-form-item label="子商户id">
          <el-input v-model="subId" placeholder="请输入子商户id"></el-input>
        </el-form-item>
        <el-form-item label="测试金额">
          <el-input v-model="totalFee" placeholder="请输入测试金额"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">生成测试支付链接</el-button>
        </el-form-item>
        <el-form-item label="起始id">
          <el-input-number v-model="startId" controls-position="right" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="终止id">
          <el-input-number v-model="endId" controls-position="right" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitMul">批量生成</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="24">
      {{result}}
    </el-col>
  </el-row>
</template>

<script>

  export default {
    data() {
      return {
        subId: '',
        totalFee: '',
        startId: '',
        endId: '',
        result: ''
      }
    },
    methods: {
      onSubmit() {
        let now = new Date();
        let month = now.getMonth()+1;
        let date = now.getDate();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        if(month.toString().length === 1){
          month = `0${month}`
        }
        if(date.toString().length === 1){
          date = `0${date}`
        }
        if(hours.toString().length === 1){
          hours = `0${hours}`
        }
        if(minutes.toString().length === 1){
          minutes = `0${minutes}`
        }
        if(seconds.toString().length === 1){
          seconds = `0${seconds}`
        }
        let orderTime = `${now.getFullYear()}${month}${date}${hours}${minutes}${seconds}`;
        let sellerOrderNo = new Date().getTime();
        let totalFee = this.totalFee;
        let subChannelId = this.subId;
        let userInfo = JSON.parse(sessionStorage.getItem('access-user'));
        let storeId = userInfo.account;
        this.$http.get("/xpay/tokens/7c7804cf-c549-4ac9-9643-a279c224e4f6").then((res)=>{
          let token = res.data.token;
          const body = {
            storeId: storeId,
            payChannel: "1",
            totalFee: totalFee,
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
      },
      onSubmitMul() {
        let userInfo = JSON.parse(sessionStorage.getItem('access-user'));
        let storeId = userInfo.account;
        let totalFee = this.totalFee;

        this.$http.get("/xpay/tokens/7c7804cf-c549-4ac9-9643-a279c224e4f6").then((res)=> {
          let token = res.data.token;

          for(let i=this.startId; i<this.endId; i++){
            let now = new Date();
            let month = now.getMonth()+1;
            let date = now.getDate();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            let seconds = now.getSeconds();
            if(month.toString().length === 1){
              month = `0${month}`
            }
            if(date.toString().length === 1){
              date = `0${date}`
            }
            if(hours.toString().length === 1){
              hours = `0${hours}`
            }
            if(minutes.toString().length === 1){
              minutes = `0${minutes}`
            }
            if(seconds.toString().length === 1){
              seconds = `0${seconds}`
            }
            let orderTime = `${now.getFullYear()}${month}${date}${hours}${minutes}${seconds}`;
            let sellerOrderNo = new Date().getTime();

            const body = {
              storeId: storeId,
              payChannel: "1",
              totalFee: totalFee,
              orderTime: orderTime-i,
              sellerOrderNo: sellerOrderNo+i,
              attach: "test",
              ip: "127.0.0.1",
              subject: "test",
              notifyUrl: "127.0.0.1",
              returnUrl: "127.0.0.1",
              subChannelId: i
            };
            fetch("http://www.zmpay.top/xpay/rest/v1/pay/unifiedorder",{
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
          }
        })
      }
    }
  }
</script>
