<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>环迅易收付</el-breadcrumb-item>
        <el-breadcrumb-item>环迅开户</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="6" class="warp-main">
      <el-form ref="open" :model="open" label-width="100px">
        <el-form-item>
          <h2>环迅开户</h2>
        </el-form-item>
        <el-form-item label="通道名称">
          <el-select v-model="channelParam" placeholder="请选择通道" @change="setParam">
            <el-option
              v-for="item in channelList"
              :key="item.extStoreId"
              :label="item.extStoreName"
              :value="item.extStoreId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="3DES密钥">
          <el-input v-model="open.desKey" placeholder="请输入3DES密钥"></el-input>
        </el-form-item>
        <el-form-item label="3DES向量">
          <el-input v-model="open.desIv" placeholder="请输入3DES向量"></el-input>
        </el-form-item>
        <el-form-item label="客户号">
          <el-input v-model="open.customerCode" placeholder="请输入客户号"></el-input>
        </el-form-item>
        <el-form-item label="用户姓名">
          <el-input v-model="open.userName" placeholder="请输入用户姓名"></el-input>
        </el-form-item>
        <el-form-item label="身份证号码">
          <el-input v-model="open.identityNo" placeholder="请输入身份证号码"></el-input>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="open.mobileNo" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    data() {
      return {
        channelList:[],
        channelParam:'',
        extParam:{
          md5Signature: '',
          merCode: '',
          merAcctNo: ''
        },
        open: {
          desKey: '',
          desIv: '',
          customerCode: '',
          userName: '',
          identityNo: '',
          mobileNo: ''
        },
      }
    },
    mounted: function () {
      let userInfo = JSON.parse(sessionStorage.getItem('access-user'));
      this.$http.get(`/xpay/admin/${userInfo.id}/channels`).then(res=> {
        this.channelList = res.data.data;
      })
    },
    methods: {
      setParam() {
        this.extParam.md5Signature = this.channelParam.split(",")[2];
        this.extParam.merCode = this.channelParam.split(",")[0];
        this.extParam.merAcctNo = this.channelParam.split(",")[1];
      },
      onSubmit() {
        const md5Signature = this.extParam.md5Signature;
        const desKey = this.open.desKey;
        const desIv = this.open.desIv;
        const merCode = this.extParam.merCode;
        const merAcctNo = this.extParam.merAcctNo;
        const customerCode = this.open.customerCode;
        const identityNo = this.open.identityNo;
        const userName = this.open.userName;
        const mobileNo = this.open.mobileNo;
        window.open(`http://www.zmpay.top/xpay/h5/pay/ips/transfer?md5Signature=${md5Signature}&desKey=${desKey}&desIv=${desIv}&merCode=${merCode}&merAcctNo=${merAcctNo}&customerCode=${customerCode}&identityNo=${identityNo}&userName=${userName}&mobileNo=${mobileNo}`)
      }
    }
  }
</script>

<style>

</style>
