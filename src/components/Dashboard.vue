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
            <el-input :placeholder="placeholder" v-model="keywords" style="width: 25%;">
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
                  ref="table"
                  @selection-change="tableSelectionChange">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item label="商户号">
                  <span>{{ props.row.code }}</span>
                </el-form-item>
                <el-form-item label="key">
                  <span>{{ props.row.app.key }}</span>
                </el-form-item>
                <el-form-item label="secret">
                  <span>{{ props.row.app.secret }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="channels[0].paymentGateway" label="网关类型" align="center"></el-table-column>
          <el-table-column prop="channelType" label="通道类型" align="center"></el-table-column>
          <el-table-column prop="name" label="商户名" align="center"></el-table-column>
          <el-table-column prop="bailPercentage" sortable label="费率" align="center"></el-table-column>
          <el-table-column prop="quota" sortable label="剩余交易额度" align="center"></el-table-column>
          <el-table-column prop="todayTradeAmount" sortable label="今日交易额度" align="center"></el-table-column>
          <el-table-column prop="lastTradeAmount" sortable label="昨日交易额度" align="center"></el-table-column>
          <el-table-column prop="lastRechargeAmount" sortable label="最近一笔充值" align="center"></el-table-column>
          <el-table-column prop="dailyLimit" sortable label="日交易额上限" align="center"></el-table-column>
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
              <el-input-number v-model="formRecharge.amount" :min="100" :step="100"></el-input-number>
            </el-form-item>
            <el-form-item label="支付方式">
              <el-select v-model="formRecharge.channel" placeholder="请选择支付方式">
                <el-option label="支付宝" value="ALIPAY"></el-option>
                <el-option label="微信" value="WECHAT"></el-option>
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
      this.$http.get(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores`).then(res => {
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
            val.quota += '元';
            val.todayTradeAmount += '元';
            val.lastTradeAmount += '元';
            val.lastRechargeAmount += '元';
            val.dailyLimit += '元';
          });
          this.rechargeInfo = res.data.data;
        }
      })
    },
    methods: {
      tableSelectionChange(val) {
        this.selected = val;
      },
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
        this.$http.get(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores`).then(res => {
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
              val.quota += '元';
              val.todayTradeAmount += '元';
              val.dailyLimit += '元';
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
          this.selected.splice(0,this.selected.length);
        })
      },
      view(row){
        this.$refs.table.toggleRowExpansion(row);
      },
      handleRecharge(row){
        this.outerVisible = true;
        this.storeId = row.id
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
      },
      recharge() {
        if (!this.formRecharge.channel){
          this.$message.error('请选择支付方式！');
          return false;
        }
        else {
          this.innerVisible = true;
          let userInfo = JSON.parse(sessionStorage.getItem('access-user'));
          let params = {amount:this.formRecharge.amount,channel:this.formRecharge.channel};
          this.$http.post(`http://www.wfpay.xyz/xpay/admin/${userInfo.id}/stores/${this.storeId}/recharge_order`,params).then(
            res => {
              this.result.qrcode = "http://pan.baidu.com/share/qrcode?w=200&h=200&url="+ res.data.data.codeUrl;
              this.result.closable = true;
              this.result.icon = true;
              this.result.title = "请扫描二维码完成支付";
              this.result.status = "info" ;
              sessionStorage.setItem("transactionId",res.data.data.transactionId);
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
    width: 90px;
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

