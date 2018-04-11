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
          <el-input placeholder="请输入订单号" v-model="orderNo" style="width: 450px; margin-right: 15px" @keyup.enter.native="query">
            <template slot="prepend">订单号</template>
            <el-button slot="append" icon="el-icon-search" @click="query">查询</el-button>
          </el-input>
          <el-form-item label="商户名称">
            <el-select v-model="filter.name" filterable placeholder="请选择商户名称">
              <el-option
                v-for="item in storesInfo"
                :key="item[2]"
                :label="item[1]"
                :value="item[2]">
              </el-option>
            </el-select>
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
                :show-summary="showSummary"
                :default-sort = "{prop: 'createDate', order: 'descending'}"
                @filter-change="filterTag">
        <el-table-column prop="name" label="商户名称" align="center"></el-table-column>
        <el-table-column prop="subject" label="商品名" align="center"></el-table-column>
        <el-table-column prop="orderNo" label="订单号" align="center"></el-table-column>
        <el-table-column prop="createDate" sortable label="下单时间" align="center"></el-table-column>
        <el-table-column prop="sellerOrderNo" label="卖家单号" align="center"></el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          align="center"
          :filters="[{ text: 'SUCCESS', value: 'SUCCESS' }, { text: 'NOTPAY', value: 'NOTPAY' }]"
          :filter-multiple="false"
          filter-placement="bottom-end"
          :column-key="'a'">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === 'SUCCESS' ? 'success' : 'danger'"
              close-transition>{{scope.row.status}}</el-tag>
          </template>
        </el-table-column>
        <template v-if="userInfo.role === 'ADMIN'">
          <el-table-column
            prop="payChannel"
            label="渠道"
            align="center"
            :filters="[{ text: '小微', value: 'XIAOWEI' }, { text: '支付宝', value: 'ALIPAY' }]"
            :filter-multiple="false"
            filter-placement="bottom-end"
            :column-key="'b'">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.payChannel === '小微' ? 'primary' : 'success'"
                close-transition>{{scope.row.payChannel}}</el-tag>
            </template>
          </el-table-column>
        </template>
        <el-table-column prop="totalFee" sortable  label="金额 （元）" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <template v-if="userInfo.role === 'ADMIN' && scope.row.status === 'SUCCESS'">
              <el-button
                size="mini" type="danger" plain
                @click="refund(scope.row)">退款
              </el-button>
            </template>
            <template v-if="scope.row.status === 'NOTPAY'">
              <el-button
                size="mini" type="primary" plain
                @click="replenishment(scope.row)">补单
              </el-button>
            </template>
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
  export default {
    data: function() {
      return {
        originalData:[],
        successVal: 0,
        showSummary: true,
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
        },
        orders: [],
        filter: {
          name:'',
          pageSize: 50,
          currentPage: 1,
          beginIndex: 0,
        },
        filterData: [],
        flag: false,
        orderNo: '',
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
      this.getOrders();
    },
    methods: {
      query() {
        let url = `/xpay/admin/${this.userInfo.id}/orders/${this.orderNo}`;
        //订单号查询
        this.$http.get(url).then(res =>{
          if(this.orderNo){
            this.orders = [];
            this.orders.push(res.data.data);
            this.orders[0].name = res.data.data.store.name;
            this.showSummary = false
          }
          else {
            this.$message.error("未找到该订单！")
          }
        }).catch(()=>{
          this.$message.error("未找到该订单！")
        })
      },
      filterTag(val) {
        //return row.status === value;
        this.flag = true;
        this.$http.get(sessionStorage.getItem('url')).then(res => {
          if(res.data.data){
            let orders = res.data.data.reverse();
            if (orders){
              orders.forEach((order) =>{
                let _order = order;

                this.storesInfo.forEach(info =>{
                  if(_order.storeId === info[0]){
                    _order.name = info[1];
                  }
                })
              });
              let filterData = [];
              if(val.a&&val.a !==""){
                for (var i=0,lenI=orders.length;i<lenI;i++) {
                  let reg = new RegExp(val.a[0]);
                  if(orders[i].status.match(reg)){
                    filterData.push(orders[i]);
                  }
                }
              }
              else if(val.b&&val.b !==""){
                for (var i=0,lenI=orders.length;i<lenI;i++) {
                  let reg = new RegExp(val.b[0]);
                  if(orders[i].payChannel.match(reg)){
                    filterData.push(orders[i]);
                  }
                }
              }
              else filterData = orders;
              console.log(filterData);
              filterData.forEach(order =>{
                if(order.payChannel === 'XIAOWEI'){
                  order.payChannel = '小微'
                }
                if(order.payChannel === 'ALIPAY'){
                  order.payChannel = '支付宝'
                }
              });
              this.totalRows = filterData.length;
              this.filterData = filterData;
              //分页
              this.filterPag()
            }
          }
          else {
            this.orders = [];
          }
          this.loading = false;
        })
      },
      filterPag(){
        let filterData =JSON.parse(JSON.stringify(this.filterData));
        this.filter.beginIndex = (this.filter.currentPage-1)*this.filter.pageSize;
        console.log(filterData);
        this.orders = filterData.splice(this.filter.beginIndex,this.filter.pageSize);
      },
      zeroFill(val){
        if(val >=0 && val<=9){
          return "0"+val;
        }
        else return val;
      },
      getSummaries(param) {
        const { columns,data } = param;
        const originalData = this.originalData;
        let successSum = 0;
        originalData.map(item =>{
          if(item.status === 'SUCCESS'){
            successSum += item.totalFee;
          }
        });
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '总计';
          }
          if (index === 5) {
            const counts = originalData.map(item => item[column.property]);
            let count = 0;
            counts.forEach(status => {
                if(status === "SUCCESS"){
                  count++
                }
              });
              sums[index] = `成功 ${count} 笔`;
          }
          if (index === 6) {
            sums[index] = successSum;
            sums[index] = Math.floor(sums[index]) + ' 元';
          }
        });
        return sums;
      },
      pageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.filter.pageSize = val;
        if(this.flag){
          this.filterPag()
        }
        else this.getOrders();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        if(this.flag){
          this.filterPag()
        }
        else this.getOrders();
      },
      getOrders() {
        this.flag = false;
        if(this.pickerTime){
          this.loading = true;
          let url;
          if(this.filter.name){
            this.storesInfo.forEach(info =>{
              if(this.filter.name === info[1]){
                this.filter.name = info[0]
              }
            });
            url = `/xpay/admin/${this.userInfo.id}/orders?storeId=${this.filter.name}&startDate=${this.pickerTime[0]}&endDate=${this.pickerTime[1]}`
          }
          else url = `/xpay/admin/${this.userInfo.id}/orders?startDate=${this.pickerTime[0]}&endDate=${this.pickerTime[1]}`;
          this.$http.get(url).then(res => {
            sessionStorage.setItem('url',url);
            if(res.data.data){
              if(this.originalData.length === 0){
                this.originalData = this.originalData.concat(res.data.data);
              }
              else {
                this.originalData = [];
                this.originalData = this.originalData.concat(res.data.data);
              }
              let orders = res.data.data;
              if(this.userInfo.role === 'H5PROVIDER'){
                orders.filter(v => {
                  if(v.payChannel === 'XIAOWEI_H5'){
                    return v
                  }
                })
              }
              if(url === `/xpay/admin/${this.userInfo.id}/orders?startDate=${this.pickerTime[0]}&endDate=${this.pickerTime[1]}`){
                orders.reverse();
              }
              if (orders){
                orders.forEach((order) =>{
                  let _order = order;
                  if(_order.payChannel === 'XIAOWEI'){
                    _order.payChannel = '小微'
                  }
                  if(_order.payChannel === 'ALIPAY'){
                    _order.payChannel = '支付宝'
                  }
                  this.storesInfo.forEach(info =>{
                    if(_order.storeId === info[0]){
                      _order.name = info[1];
                    }
                  })
                });
                this.totalRows = orders.length;
                //分页
                this.filter.beginIndex = (this.filter.currentPage-1)*this.filter.pageSize;
                this.orders = orders.splice(this.filter.beginIndex,this.filter.pageSize);
                //console.log(this.totalRows);
                //console.log(orders);
              }
            }
            else {
              this.orders = [];
              this.totalRows = this.orders.length;
            }
            this.loading = false;
          }).catch(() => {
            this.$message.error("未查询到有效订单 或 查询订单超过两天！");
            this.loading = false
          })
        }else this.$message.error("请选择查询日期")
      },
      refund(row){
        this.$confirm('此操作将对 ' + row.orderNo + ' 订单进行退款, 是否继续?', '提示', { type: 'warning' })
          .then(() => {
            this.$http.delete(`/xpay/admin/${this.userInfo.id}/orders/${row.orderNo}`).then(() => {
              this.$message.success("退款成功!");
              this.getOrders();
            })
              .catch(() => {
                this.$message.error('退款失败!');
              });
          })
          .catch(() => {
            this.$message.info('已取消操作!');
          });
      },
      replenishment(row){
        this.$prompt('请输入银行订单号', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          this.$http.post(`/xpay/admin/${this.userInfo.id}/orders/${row.orderNo}/remedy?extOrderNo=${value}`).then(()=>{
              this.$message.success('补单成功！');
              this.getOrders();
          }).catch(() => {
            this.$message.error('补单失败!');
          })
        }).catch(() => {
          this.$message.info('取消输入');
        })
      },
      handleDownload() {
        this.downloadLoading = true;
        require.ensure([], () => {
          const { export_json_to_excel } = require('@/utils/Export2Excel');
          const tHeader = ['商户名称','商品名', '订单号', '下单时间', '卖家单号','状态','金额'];
          const filterVal = ['name','subject','orderNo','createDate','sellerOrderNo','status','totalFee'];
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
</style>
