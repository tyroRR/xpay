<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>环迅易收付</el-breadcrumb-item>
        <el-breadcrumb-item>更新用户信息</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="6" class="warp-main">
      <el-form ref="update" :model="update" label-width="100px">
        <el-form-item>
          <h2>更新用户信息</h2>
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
          <el-input v-model="update.customerCode" placeholder="请输入客户号"></el-input>
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
          desKey: '',
          desIv: ''
        },
        update: {
          customerCode: ''
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
        this.extParam.desKey = this.channelParam.split(",")[3];
        this.extParam.desIv = this.channelParam.split(",")[4];
        console.log(this.extParam.md5Signature);
        console.log(this.extParam.merCode);
        console.log(this.extParam.desKey);
        console.log(this.extParam.desIv);
      },
      onSubmit() {
        console.log(this.channelList[0].extStoreId.split(",")[2]);
        const md5Signature = this.extParam.md5Signature;
        const merCode = this.extParam.merCode;
        const desKey = this.extParam.desKey;
        const desIv = this.extParam.desIv;
        const customerCode = this.update.customerCode;
        window.open(`http://www.zmpay.top/xpay/h5/pay/ips/withdraw?md5Signature=${md5Signature}&desKey=${desKey}&desIv=${desIv}&merCode=${merCode}&customerCode=${customerCode}`)
      }
    }
  }
</script>

<style>

</style>
