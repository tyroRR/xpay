<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>环迅易收付</el-breadcrumb-item>
        <el-breadcrumb-item>环迅转账</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="6" class="warp-main">
      <el-form ref="transfer" :model="transfer" label-width="100px">
        <el-form-item>
          <h2>环迅转账</h2>
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
        <el-form-item label="客户号">
          <el-input v-model="transfer.customerCode" placeholder="请输入客户号"></el-input>
        </el-form-item>
        <el-form-item label="转账金额">
          <el-input v-model="transfer.transferAmount" placeholder="请输入转账金额"></el-input>
        </el-form-item>
        <el-form-item label="付款项目">
          <el-input v-model="transfer.collectionItemName" placeholder="请输入付款项目"></el-input>
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
          merAcctNo: '',
          desKey: '',
          desIv: ''
        },
        transfer: {
          desKey: '',
          desIv: '',
          customerCode: '',
          transferAmount: '',
          collectionItemName: ''
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
        this.extParam.desKey = this.channelParam.split(",")[3];
        this.extParam.desIv = this.channelParam.split(",")[4];
      },
      onSubmit() {
        const md5Signature = this.extParam.md5Signature;
        const merCode = this.extParam.merCode;
        const merAcctNo = this.extParam.merAcctNo;
        const desKey = this.extParam.desKey;
        const desIv = this.extParam.desIv;
        const customerCode = this.transfer.customerCode;
        const transferAmount = this.transfer.transferAmount;
        let collectionItemName;
        if(this.transfer.collectionItemName){
          collectionItemName = this.transfer.collectionItemName;
        }
        else {
          collectionItemName = "货款";
        }
        window.open(`http://www.zmpay.top/xpay/h5/pay/ips/transfer?md5Signature=${md5Signature}&desKey=${desKey}&desIv=${desIv}&merCode=${merCode}&merAcctNo=${merAcctNo}&customerCode=${customerCode}&transferAmount=${transferAmount}&collectionItemName=${collectionItemName}`)
      }
    }
  }
</script>

<style>

</style>
