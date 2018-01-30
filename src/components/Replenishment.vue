<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>丢单查询</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="24" class="warp-main"
            v-loading="loading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)">
      <!-- 查询 -->
      <el-col :span="24" class="toolbar">
        <el-form :inline="true" class="demo-form-inline" >
          <el-input :placeholder="placeholder" v-model="keywords" style="width: 400px;" @keyup.enter.native="getOrders">
            <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:118px">
              <el-option label="商户号" value="extStoreId"></el-option>
              <el-option label="商品名" value="subject"></el-option>
              <el-option label="订单号" value="orderNo"></el-option>
              <el-option label="下单时间" value="createTime"></el-option>
              <el-option label="支付时间" value="payTime"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getOrders">查询</el-button>
          </el-input>
          <el-input style='width:240px; margin-left:15px' placeholder="请输入文件名(默认excel-list)" prefix-icon="el-icon-document" v-model="filename"></el-input>
          <el-button style='margin-left:10px' type="info" icon="document" @click="handleDownload" :loading="downloadLoading">导出excel</el-button>
        </el-form>
      </el-col>
      <!-- 商户列表-->
      <el-table :data="orders"
                style="width: 100%"
                height="680"
                :default-sort = "{prop: 'payTime', order: 'descending'}">
        <el-table-column prop="extStoreId" label="商户号" align="center"></el-table-column>
        <el-table-column prop="subject" label="商品名" align="center"></el-table-column>
        <el-table-column prop="orderNo" label="订单号" align="center"></el-table-column>
        <el-table-column prop="createTime" sortable label="下单时间" align="center"></el-table-column>
        <el-table-column prop="payTime" sortable label="支付时间" align="center"></el-table-column>
        <el-table-column prop="amount" sortable  label="金额 （元）" align="center"></el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          align="center"
          :filters="[{ text: '补单成功', value: '补单成功' }, { text: '尚未补单', value: '尚未补单' }]"
          :filter-multiple="false"
          :filter-method="filterTag"
          filter-placement="bottom-end">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '补单成功' ? 'success' : 'danger'"
              close-transition>{{scope.row.status}}</el-tag>
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

  </el-row>
</template>

<script>
  let placeholders = {
    "extStoreId":"请输入商户号",
    "subject":"请输入商品名",
    "orderNo":"请输入订单号",
    "createTime":"请输入下单时间",
    "payTime":"请输入支付时间"
  };

  export default {
    data: function() {
      return {
        originalData:[],
        userInfo:{
          id:'',
          account:'',
          name:'',
          role:''
        },
        orders: [],
        filter: {
          extStoreId:'',
          subject:'',
          orderNo:'',
          createTime:'',
          payTime:'',
          pageSize: 50,
          currentPage: 1,
          beginIndex: 0,
        },
        orderNo: '',
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'subject', //搜索框的搜索字段
        placeholder:placeholders["subject"],
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
        this.userInfo.role = userInfo.role;
      }
      this.getOrders();
    },
    methods: {
      filterTag(value, row) {
        return row.status === value;
      },
      searchFieldChange(val) {
        this.select = val;
        this.placeholder=placeholders[val];
        console.log(`搜索字段： ${val} `);
      },
      pageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.filter.pageSize = val;
        this.getOrders();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        this.getOrders();
      },
      getOrders() {
          this.loading = true;
          this.$http.get(`/xpay/admin/${this.userInfo.id}/orders/missed`).then(res => {
            if(res.data.data) {
              if(this.originalData.length === 0){
                this.originalData = this.originalData.concat(res.data.data);
              }
              else {
                this.originalData = [];
                this.originalData = this.originalData.concat(res.data.data);
              }
              this.orders = res.data.data.reverse();
              this.orders.forEach(order=>{
                if(order.status === 0){
                  order.status = '尚未补单'
                }
                if(order.status === 1){
                  order.status = '补单成功'
                }
              })
            }
            //查询
            let queryData = [];
            if(this.keywords !==""){
              for (var i=0,lenI=this.orders.length;i<lenI;i++) {
                let reg = new RegExp(this.keywords);
                if(this.orders[i][this.select].toString().match(reg)){
                  queryData.push(this.orders[i]);
                }
              }
            }
            else {
              queryData = this.orders;
            }
            this.totalRows = queryData.length;
            //分页
            this.filter.beginIndex = (this.filter.currentPage-1)*this.filter.pageSize;
            this.orders = queryData.splice(this.filter.beginIndex,this.filter.pageSize);
            this.loading = false;
          }).catch(() => {
            this.$message.error("未查询到有效订单 或 查询订单超过两天！");
            this.loading = false
          })
      },
      handleDownload() {
        this.downloadLoading = true;
        require.ensure([], () => {
          const { export_json_to_excel } = require('@/utils/Export2Excel');
          const tHeader = ['商户号', '商品名', '订单号', '下单时间', '支付时间', '金额 （元）'];
          const filterVal = ['extStoreId', 'subject', 'orderNo', 'createTime', 'payTime', 'amount'];
          console.log(this.originalData);
          const list = this.originalData;
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
