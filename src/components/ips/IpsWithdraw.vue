<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>环迅易收付</el-breadcrumb-item>
        <el-breadcrumb-item>环迅提现</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>

    <el-col :span="6" class="warp-main">
      <el-form ref="withdraw" :model="withdraw" label-width="100px">
        <el-form-item>
          <h2>环迅提现</h2>
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
          <el-input v-model="withdraw.customerCode" placeholder="请输入客户号"></el-input>
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="withdraw.bankCard" placeholder="请输入银行卡号"></el-input>
        </el-form-item>
        <el-form-item label="银行类型">
          <el-select v-model="withdraw.bankCode" placeholder="请选择银行类型" @change="setParam">
            <el-option
              v-for="item in bankCode"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
        withdraw: {
          customerCode: '',
          bankCard: '',
          bankCode: ''
        },
        bankCode:[
          {
            label: '中国工商银行',
            value: 1100
          },
          {
            label: '中国农业银行',
            value: 1101
          },
          {
            label: '招商银行',
            value: 1102
          },
          {
            label: '兴业银行',
            value: 1103
          },
          {
            label: '中信银行',
            value: 1104
          },
          {
            label: '中国建设银行',
            value: 1106
          },
          {
            label: '中国银行',
            value: 1107
          },
          {
            label: '交通银行',
            value: 1108
          },
          {
            label: '浦东发展银行',
            value: 1109
          },
          {
            label: '民生银行',
            value: 1110
          },
          {
            label: '华夏银行',
            value: 1111
          },
          {
            label: '光大银行',
            value: 1112
          },
          {
            label: '北京银行',
            value: 1113
          },
          {
            label: '广发银行',
            value: 1114
          },
          {
            label: '上海银行',
            value: 1116
          },
          {
            label: '中国邮政储蓄银行',
            value: 1119
          },
          {
            label: '浙商银行',
            value: 1120
          },
          {
            label: '平安银行',
            value: 1121
          },
          {
            label: '渤海银行',
            value: 1123
          },
          {
            label: '恒丰银行',
            value: 1827
          }
        ]
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
      },
      onSubmit() {
        const md5Signature = this.extParam.md5Signature;
        const merCode = this.extParam.merCode;
        const desKey = this.extParam.desKey;
        const desIv = this.extParam.desIv;
        const customerCode = this.withdraw.customerCode;
        const bankCard = this.withdraw.bankCard;
        const bankCode = this.withdraw.bankCode;
        window.open(`http://www.zmpay.top/xpay/h5/pay/ips/withdraw?md5Signature=${md5Signature}&desKey=${desKey}&desIv=${desIv}&merCode=${merCode}&customerCode=${customerCode}&bankCard=${bankCard}&bankCode=${bankCode}`)
      }
    }
  }
</script>

<style>

</style>
