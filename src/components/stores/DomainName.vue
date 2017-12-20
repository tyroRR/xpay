<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>域名报备</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>

    <el-col :span="24" class="warp-main">
      <!-- 查询 -->
      <el-col :span="24" class="toolbar">
        <el-form :inline="true" class="demo-form-inline" >
          <el-input :placeholder="placeholder" v-model="keywords" style="width: 30%;">
            <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:130px">
              <el-option label="商户ID" value="id"></el-option>
              <el-option label="商户名称" value="name"></el-option>
              <el-option label="域名" value="domainName"></el-option>
              <el-option label="状态" value="status"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
          </el-input>
          <el-button type="info" plain icon="el-icon-plus" @click="dialogCreateVisible = true">添加</el-button>
          <el-button type="info" plain icon="el-icon-plus" @click="dialogCreateVisible = true">批量导入</el-button>
        </el-form>
      </el-col>

      <el-table :data="rechargeInfo"
                style="width: 100%"
                height="680"
                ref="table">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column prop="id" label="商户ID"></el-table-column>
        <el-table-column prop="name" label="商户名称"></el-table-column>
        <el-table-column prop="domainName" label="域名"></el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>

        <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini" type="primary"
                @click="view(scope.row)">修改
              </el-button>
              <el-button
                size="mini" type="primary"
                @click="view(scope.row)">驳回
              </el-button>
              <el-button
                size="mini" type="primary"
                @click="view(scope.row)">提交
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
      :visible.sync="DialogVisible"
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
        <el-form-item>
          <el-button type="primary">立即充值</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </el-row>
</template>

<script>
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
        rechargeInfo: [{
          name: 'www',
          channelType: '王小虎'
        }, {
          name: 'www',
          channelType: '王小虎'
        }],
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          name: '',
          bailPercentage: '',
        },
        totalRows: 0,
        DialogVisible: false
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
    },
    methods: {
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
      view(row){
        this.$refs.table.toggleRowExpansion(row);
      },
      recharge(row){
        this.DialogVisible = true
      },
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
    width: 50%;
  }
  .el-dialog__body{
    margin: 0 20%;
  }
</style>

