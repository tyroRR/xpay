<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <template v-if=" userInfo.role === 'STORE'">
      <el-col :span="24" class="warp-main">
        <!-- 查询 -->
        <el-col :span="24" class="toolbar">
          <el-form :inline="true" class="demo-form-inline" >
            <el-input :placeholder="placeholder" v-model="keywords" style="width: 450px;">
              <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:130px">
                <el-option label="商户名" value="name"></el-option>
                <el-option label="通道类型" value="channelType"></el-option>
                <el-option label="费率" value="bailPercentage"></el-option>
              </el-select>
              <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
            </el-input>
          </el-form>
        </el-col>

        <el-table :data="rechargeInfo"
                  style="width: 100%"
                  height="680"
                  ref="table">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item label="storeId">
                  <span>{{ props.row.code }}</span>
                </el-form-item>
                <el-form-item label="appId">
                  <span>{{ props.row.app.key }}</span>
                </el-form-item>
                <el-form-item label="appSecret">
                  <span>{{ props.row.app.secret }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="paymentGateway" label="网关类型" align="center"></el-table-column>
          <el-table-column prop="channelType" label="通道类型" align="center"></el-table-column>
          <el-table-column prop="name" label="商户名" align="center">
            <template slot-scope="scope">
              <el-button @click="viewGood(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="bailPercentage" sortable label="费率" align="center"></el-table-column>
          <el-table-column prop="quota" label="剩余交易额度" align="center"></el-table-column>
          <el-table-column prop="todayTradeAmount" label="今日交易额" align="center"></el-table-column>
          <el-table-column prop="lastTradeAmount" label="昨日交易额" align="center"></el-table-column>
          <el-table-column prop="lastRechargeAmount" label="最近一笔充值" align="center"></el-table-column>
          <el-table-column prop="dailyLimit" label="日交易额上限" align="center"></el-table-column>
          <el-table-column prop="notifyUrl" label="通知地址" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button class="handle"
                size="mini" type="info" plain
                @click="view(scope.row)">查看参数
              </el-button>

                  <el-button class="handle"
                             size="mini" type="primary" plain
                             @click="handleRecharge(scope.row)">充值
                  </el-button>

            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="paging"
                       :current-page="filter.currentPage"
                       :page-sizes="[10, 20, 50, 100]"
                       :page-size="filter.pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="totalRows"
                       @size-change="pageSizeChange"
                       @current-change="pageCurrentChange">
        </el-pagination>
      </el-col>
      <el-dialog
        title="充值"
        :visible.sync="outerVisible"
        width="35%"
        center>
          <el-form ref="formRecharge" :model="formRecharge" label-width="100px">
            <el-form-item label="充值金额">
              <el-select v-model="formRecharge.amount" placeholder="请选择充值金额">
                <el-option label="100元" value='100'></el-option>
                <el-option label="300元" value='300'></el-option>
                <el-option label="500元" value='500'></el-option>
                <el-option label="1000元" value='1000'></el-option>
                <el-option label="2000元" value='2000'></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <el-dialog
            width="23%"
            title="扫码支付"
            :visible.sync="innerVisible"
            center
            append-to-body
            @close="destroy">
            <img :src="result.qrcode">
            <el-alert
              :closable="result.closable"
              :show-icon="result.icon"
              :title="result.title"
              :type="result.status"
              center>
            </el-alert>
          </el-dialog>
          <div slot="footer" class="dialog-footer">
            <el-button @click="outerVisible = false">取 消</el-button>
            <el-button type="primary" @click="recharge">立即充值</el-button>
          </div>
      </el-dialog>
    </template>
  </el-row>
</template>

<script>
  import QRCode from 'qrcode'

  let placeholders = {
    "name":"请输入商户名",
    "channelType":"请输入通道类型",
    "bailPercentage":"请输入费率",
  };

  export default {
    data() {
      return {
        userInfo:{
          id:'',
          account:'',
          name:'',
          role:''
        },
        formRecharge: {
          amount: ''
        },
        result: {
          title: '',
          status: '',
          qrcode: '',
          icon: false,
          closable: false
        },
        storeId:'',
        intervalId:'',
        rechargeInfo: [],
        filter: {
          name: '',
          channelType: '',
          bailPercentage: '',
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'name', //搜索框的搜索字段
        placeholder:placeholders["name"],
        outerVisible: false,
        innerVisible: false
      }
    },
    created: function () {
      let userInfo = sessionStorage.getItem('access-user');
      if (userInfo) {
        userInfo = JSON.parse(userInfo);
        this.userInfo.id = userInfo.id;
        this.userInfo.account = userInfo.account;
        this.userInfo.name = userInfo.name;
        this.userInfo.role = userInfo.role;
      }
    },
    mounted: function () {
      this.$http.get(`/xpay/admin/${this.userInfo.id}/stores`).then(res => {
        if (res.data.data) {
          res.data.data.forEach(val =>{
            if(val.channelType === 'WECHAT'){
              val.channelType = '微信公众号'
            }
            if(val.channelType === 'ALIPAY'){
              val.channelType = '支付宝'
            }
            if(val.channelType === 'BANK'){
              val.channelType = '银联快捷'
            }
            val.bailPercentage += '%';
            val.quota -= val.todayTradeAmount;
            val.quota += '元';
            val.todayTradeAmount += '元';
            val.lastTradeAmount += '元';
            val.lastRechargeAmount += '元';
            val.dailyLimit += '元';
            if(val.channels){
              if(val.channels[0].paymentGateway === 'IPSQUICK'){
                val.dailyLimit = '不限';
                val.quota = '不限';
              }
            }
            else {
              val.paymentGateway = 'CHINAUMS'
            }
          });
          this.rechargeInfo = res.data.data;
        }
      })
    },
    methods: {
      searchFieldChange(val) {
        this.select = val;
        this.placeholder=placeholders[val];
        console.log(`搜索字段： ${val} `);
      },
      pageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.filter.pageSize = val;
        this.getStores();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        this.getStores();
      },
      getStores() {
        this.loading = true;
        this.$http.get(`/xpay/admin/${this.userInfo.id}/stores`).then(res => {
          if(res.data.data){
            res.data.data.forEach(val =>{
              if(val.channelType === 'WECHAT'){
                val.channelType = '微信公众号'
              }
              if(val.channelType === 'ALIPAY'){
                val.channelType = '支付宝'
              }
              if(val.channelType === 'BANK'){
                val.channelType = '银联快捷'
              }
              val.bailPercentage += '%';
              val.quota -= val.todayTradeAmount;
              val.quota += '元';
              val.todayTradeAmount += '元';
              val.dailyLimit += '元';
              if(val.channels){
                if(val.channels[0].paymentGateway === 'IPSQUICK'){
                  val.dailyLimit = '不限';
                  val.quota = '不限';
                }
                val.paymentGateway = val.channels[0].paymentGateway;
              }
              else {
                val.paymentGateway = 'CHINAUMS'
              }
            });
            this.stores = res.data.data;
          }
          //查询
          let queryData = [];
          if(this.keywords !==""){
            for (var i=0,lenI=this.stores.length;i<lenI;i++) {
              let reg = new RegExp(this.keywords);
              if(this.stores[i][this.select].toString().match(reg)){
                queryData.push(this.stores[i]);
              }
            }
          }
          else queryData = this.stores;
          this.totalRows = queryData.length;
          //分页
          this.filter.beginIndex = (this.filter.currentPage-1)*this.filter.pageSize;
          this.stores = queryData.splice(this.filter.beginIndex,this.filter.pageSize);
          this.loading = false;
        })
      },
      view(row){
        this.$refs.table.toggleRowExpansion(row);
      },
      viewGood(row){
        if(row.id){
          sessionStorage.setItem('currentStoreId',row.id);
        }
        this.$router.push({ path: '/store/Goods' });
      },
      handleRecharge(row){
        this.outerVisible = true;
        this.storeId = row.id
      },
      validate() {
        let orderNo = sessionStorage.getItem("orderNo");
        if(orderNo){
          this.$http.get(`/xpay/admin/${this.userInfo.id}/transactions/orders/${orderNo}`).then(
            res =>  {
              if(res.data.data.status === "SUCCESS"){
                clearInterval(this.intervalId);
                this.result.title = "支付成功";
                this.result.status = "success" ;
                this.formRecharge.quota = res.data.data.quota;
                let profile ={quota:res.data.data.quota, bailPercentage:res.data.data.bailPercentage};
                sessionStorage.setItem('profile',profile);
                sessionStorage.removeItem('orderNo');
              }
              console.log(res.data.data.status)
            }
          )
        }
      },
      recharge() {
        if (!this.formRecharge.amount){
          this.$message.error('请选择充值金额！');
          return false;
        }
        else {
          this.innerVisible = true;
          let url;
          if(Number(this.formRecharge.amount) === 100){
            url = 'http://www.zmpay.top/xpay/qrcode/G2018011715245861872'
          }
          if(Number(this.formRecharge.amount) === 300){
            url = 'http://www.zmpay.top/xpay/qrcode/G2018011715255378614'
          }
          if(Number(this.formRecharge.amount) === 500){
            url = 'http://www.zmpay.top/xpay/qrcode/G2018011715263969406'
          }
          if(Number(this.formRecharge.amount) === 1000){
            url = 'http://www.zmpay.top/xpay/qrcode/G2018011715272586496'
          }
          if(Number(this.formRecharge.amount) === 2000){
            url = 'http://www.zmpay.top/xpay/qrcode/G2018011715275924714'
          }
          let params = {codeUrl:url};
          this.$http.post(`http://www.zmpay.top/xpay/admin/${this.userInfo.id}/stores/${this.storeId}/recharge_order`,params).then(
            res => {
              QRCode.toDataURL(res.data.data.codeUrl).then(url=>{
                this.result.qrcode = url
              }).catch(err=>{
                console.log(err)
              });
              this.result.closable = true;
              this.result.icon = true;
              this.result.title = "请扫描二维码完成支付";
              this.result.status = "info" ;
              sessionStorage.setItem("orderNo",res.data.data.orderNo);
              this.intervalId = setInterval(this.validate,10000);
            })
        }
      },
      destroy() {
        clearInterval(this.intervalId);
      }
    }
  }
</script>

<style>
  .paging{
    text-align: center;
    margin:12px 0;
  }
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 5%;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 100%;
  }
  .el-dialog__body{
    margin: 0 20%;
  }
  .handle{
    margin: 5px auto;
  }
</style>

