<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>交易查询</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="24" class="warp-main"
            v-loading="loading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)">
      <!-- 查询 -->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="商户ID">
            <el-input v-model="filter.storeId" placeholder="请输入商户ID"></el-input>
          </el-form-item>
          <el-form-item label="下单时间">
            <el-col :span="11">
              <el-date-picker
                v-model="pickerTime"
                type="daterange"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                align="right"
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd">
              </el-date-picker>
            </el-col>
          </el-form-item>
          <el-button type="info" icon="el-icon-search" @click="getOrders">查询</el-button>
          <el-form-item>
            <el-input style='width:240px; margin-left:15px' placeholder="请输入文件名(默认excel-list)" prefix-icon="el-icon-document" v-model="filename"></el-input>
            <el-button style='margin-left:10px' type="info" icon="document" @click="handleDownload" :loading="downloadLoading">导出excel</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!-- 商户列表-->
      <el-table :data="orders"
                style="width: 100%"
                height="680"
                :summary-method="getSummaries"
                show-summary
                :default-sort = "{prop: 'id', order: 'descending'}">
        <el-table-column sortable prop="storeId" label="storeId"></el-table-column>
        <el-table-column sortable prop="storeChannelId" label="storeChannelId"></el-table-column>
        <el-table-column prop="orderNo" label="订单号"></el-table-column>
        <el-table-column prop="orderTime" label="下单时间"></el-table-column>
        <el-table-column prop="sellerOrderNo" label="卖家单号"></el-table-column>
        <el-table-column prop="payChannel" label="支付方式"></el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>
        <el-table-column prop="returnUrl" label="returnUrl"></el-table-column>
        <el-table-column prop="totalFee" label="金额"></el-table-column>
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

  </el-row>
</template>

<script>
  import {count} from "../../../vuex/examples/counter-hot/store/getters";

  export default {
    data: function() {
      return {
        pickerOptions: {
          shortcuts: [{
            text: '最近两天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 2);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        pickerTime: '',
        userInfo:{
          id:'',
          account:'',
          name:''
        },
        orders: [],
        filter: {
          storeId:'',
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
        },
        totalRows: 0,
        loading: true,
        filename: '',
        downloadLoading: false
      };
    },
    mounted: function() {
      let userInfo = sessionStorage.getItem('access-user');
      if (userInfo) {
        userInfo = JSON.parse(userInfo);
        this.userInfo.id = userInfo.id;
        this.userInfo.account = userInfo.account;
        this.userInfo.name = userInfo.name;
      }
      let start = new Date();
      let end = new Date();
      end.setTime(start.getTime() + 3600 * 1000 * 24);
      let startTime = start.getFullYear()+'-'+this.zeroFill(start.getMonth()+1)+'-'+this.zeroFill(start.getDate());
      let endTime = end.getFullYear()+'-'+this.zeroFill(end.getMonth()+1)+'-'+this.zeroFill(end.getDate());
      this.pickerTime = [];
      this.pickerTime.push(startTime,endTime);
      this.getOrders();
    },
    methods: {
      zeroFill(val){
        if(val >=0 && val<=9){
          return "0"+val;
        }
        else return val;
      },
      getSummaries(param) {
        const { columns, data } = param;
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '总计';
          }
          if (index === 6) {
            const counts = data.map(item => item[column.property]);
            let count = 0;
            counts.forEach(status => {
                if(status === "SUCCESS"){
                  count++
                }
              });
              sums[index] = `成功${count}笔`;
          }
          const values = data.map(item => Number(item[column.property]));
          if (index === 8) {
            sums[index] = values.reduce( (prev, curr) => prev+curr, 0 );
            sums[index] += ' 元';
          }
        });

        return sums;
      },
      selected(data) {
        this.orders = data
      },
      pageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.filter.per_page = val;
        this.getOrders();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.page = val;
        this.getOrders();
      },
      getOrders() {
        if(this.pickerTime){
          this.loading = true;
          let url;
          if(this.filter.storeId){
            url = `http://106.14.47.193/xpay/admin/${this.userInfo.id}/orders?storeId=${this.filter.storeId}&startDate=${this.pickerTime[0]}&endDate=${this.pickerTime[1]}`
          }
          else url = `http://106.14.47.193/xpay/admin/${this.userInfo.id}/orders?startDate=${this.pickerTime[0]}&endDate=${this.pickerTime[1]}`;
          this.$http.get(url).then(res => {
            //分页
            if (res.data.data){
              this.filter.beginIndex = (this.filter.currentPage-1)*10;
              this.orders = res.data.data.splice(this.filter.beginIndex,this.filter.pageSize);
            }
            else this.orders = [];
            this.loading = false;
          }).catch(() => {
            this.$message.error("未查询到有效订单 或 查询订单超过两天！");
            this.loading = false
          })
        }else this.$message.error("请选择查询日期")
      },
      handleDownload() {
        this.downloadLoading = true;
        require.ensure([], () => {
          const { export_json_to_excel } = require('@/utils/Export2Excel');
          const tHeader = ['id', 'appId', 'storeId', 'storeChannelId', 'orderNo', 'orderTime','sellerOrderNo','payChannel','totalFee','ip','createDate','notifyUrl','returnUrl','codeUrl','status','settle','remoteQueralbe','subject','refundable'];
          const filterVal = ['id', 'appId', 'storeId', 'storeChannelId', 'orderNo', 'orderTime','sellerOrderNo','payChannel','totalFee','ip','createDate','notifyUrl','returnUrl','codeUrl','status','settle','remoteQueralbe','subject','refundable'];
          const list = this.orders;
          const data = this.formatJson(filterVal, list);
          export_json_to_excel(tHeader, data, this.filename);
          this.downloadLoading = false;
        })
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      }
    }
  }
</script>

<style>
  .paging{
    text-align: center;
    margin:12px 0;
  }
  .demo-table-expand label {
    width: 150px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
