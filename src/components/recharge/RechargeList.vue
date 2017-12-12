<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>充值记录</el-breadcrumb-item>
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
          <template v-if="userInfo.role !== 'STORE'">
            <el-form-item label="商户名称">
              <el-select v-model="filter.name" filterable placeholder="请选择商户名称">
                <el-option
                  v-for="item in storesInfo"
                  :key="item[0]"
                  :label="item[1]"
                  :value="item[0]">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
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
          <el-button type="info" icon="el-icon-search" @click="getRecharges">查询</el-button>
          <el-form-item>
            <el-input style='width:240px; margin-left:15px' placeholder="请输入文件名(默认excel-list)" prefix-icon="el-icon-document" v-model="filename"></el-input>
            <el-button style='margin-left:10px' type="info" icon="document" @click="handleDownload" :loading="downloadLoading">导出excel</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!-- 充值记录列表-->
      <el-table :data="recharges"
                style="width: 100%"
                height="680"
                :summary-method="getSummaries"
                show-summary
                :default-sort = "{prop: 'orderNo', order: 'descending'}">
        <el-table-column prop="name" label="商户名称"></el-table-column>
        <el-table-column prop="orderNo" sortable  label="订单号"></el-table-column>
        <el-table-column prop="quota" sortable label="交易额度"></el-table-column>
        <el-table-column prop="bailPercentage" sortable label="费率"></el-table-column>
        <el-table-column prop="createDate" sortable label="交易时间"></el-table-column>
        <el-table-column prop="operation" label="操作类型"></el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>
        <el-table-column prop="amount" sortable label="金额"></el-table-column>
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
          name:'',
          role:''
        },
        storesInfo:{
          id:'',
          name:''
        },
        recharges: [],
        filter: {
          name:'',
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
        this.userInfo.role = userInfo.role;
      }
      let start = new Date();
      let end = new Date();
      end.setTime(start.getTime() + 3600 * 1000 * 24);
      let startTime = start.getFullYear()+'-'+this.zeroFill(start.getMonth()+1)+'-'+this.zeroFill(start.getDate());
      let endTime = end.getFullYear()+'-'+this.zeroFill(end.getMonth()+1)+'-'+this.zeroFill(end.getDate());
      this.pickerTime = [];
      this.pickerTime.push(startTime,endTime);
      this.storesInfo = JSON.parse(sessionStorage.getItem('storesInfo'));
      //console.log(this.storesInfo);
      this.getRecharges();
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
            sums[index] = `成功 ${count} 笔`;
          }
          const values = data.map(item => Number(item[column.property]));
          if (index === 7) {
            sums[index] = values.reduce( (prev, curr) => prev+curr, 0 );
            sums[index] += ' 元';
          }
        });

        return sums;
      },
      selected(data) {
        this.recharges = data
      },
      pageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.filter.pageSize = val;
        this.getRecharges();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        this.getRecharges();
      },
      getRecharges() {
        if(this.pickerTime){
          this.loading = true;
          let url;
          if(this.filter.name){
            this.storesInfo.forEach(info =>{
              if(this.filter.name === info[1]){
                this.filter.name = info[0]
              }
            });
            url = `http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/transactions?storeId=${this.filter.name}&startDate=${this.pickerTime[0]}&endDate=${this.pickerTime[1]}`
          }
          else url = `http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/transactions?startDate=${this.pickerTime[0]}&endDate=${this.pickerTime[1]}`;
          this.$http.get(url).then(res => {
            let orders = res.data.data;
            if (orders){
              orders.forEach((order) =>{
                let _order = order;
                this.storesInfo.forEach(info =>{
                  if(_order.storeId === info[0]){
                    _order.name = info[1];
                  }
                })
              });
              //分页
              this.filter.beginIndex = (this.filter.currentPage-1)*10;
              this.recharges = orders.splice(this.filter.beginIndex,this.filter.pageSize);
            }
            else this.recharges = [];
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
          const tHeader = ['商户名称', '订单号', '交易额度', '费率', '交易时间', '操作类型','状态','金额'];
          const filterVal = ['name', 'orderNo', 'quota', 'bailPercentage', 'createDate', 'operation','status','amount'];
          const list = this.recharges;
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
