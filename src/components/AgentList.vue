<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>代理商列表</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="24" class="warp-main"
            v-loading="loading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)">
      <!-- 查询 -->
      <el-col :span="24" class="toolbar" style="padding-bottom: 10px;">
        <el-form :inline="true" class="demo-form-inline">
          <el-input :placeholder="placeholder" v-model="keywords" style="width: 28%">
            <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:100px">
              <el-option label="id" value="id"></el-option>
              <el-option label="账号" value="account"></el-option>
              <el-option label="用户名" value="name"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getAgents">查询</el-button>
          </el-input>
        </el-form>
      </el-col>

      <!-- 通道列表-->
      <el-table :data="agents"
                style="width: 100%"
                height="680"
                ref="table"
                :default-sort = "{prop: 'id', order: 'ascending'}"
                @selection-change="tableSelectionChange">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="密码：">
                <span>{{ props.row.password }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column sortable prop="id" label="id"></el-table-column>
        <el-table-column prop="name" label="用户名"></el-table-column>
        <el-table-column prop="account" label="账号"></el-table-column>
        <el-table-column prop="password" label="密码" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini" type="info" plain
              @click="viewPwd(scope.row)">查看密码
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

  </el-row>
</template>

<script>

  let placeholders = {
    "id": "请输入id",
    "account": "请输入账号",
    "name": "请输入用户名"
  };

  export default {
    data: function() {
      return {
        userInfo:{
          id:'',
          account:'',
          name:''
        },
        agents: [],
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          id: "",
          account: "",
          name: ""
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'id', //搜索框的搜索字段
        loading: true,
        selected: [], //已选择项
        placeholder:placeholders["id"]
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
      this.getAgents()
    },
    methods: {
      viewPwd(row){
        this.$refs.table.toggleRowExpansion(row);
      },
      filterRole(val,row){
        return row.role === val;
      },
      tableSelectionChange(val) {
        this.selected = val;
      },
      searchFieldChange(val) {
        this.select = val;
        console.log(this.select);
        this.placeholder = placeholders[val];
        console.log(`搜索字段： ${val} `);
      },
      pageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.filter.pageSize = val;
        this.getAgents();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        this.getAgents();
      },
      //获取代理商列表
      getAgents() {
        this.loading = true;
        this.$http.get(`http://www.wfpay.xyz/xpay/admin/agents`).then(res => {
          if(res.data.data){
            this.agents = res.data.data;
          }
          //查询
          let queryData = [];
          if(this.keywords !==""){
            for (var i=0,len=this.agents.length;i<len;i++) {
              let reg = new RegExp(this.keywords);
              if(this.agents[i][this.select].toString().match(reg)!==null){
                queryData.push(this.agents[i]);
              }
            }
          }
          else queryData = this.agents;
          this.totalRows = queryData.length;
          //分页
          this.filter.beginIndex = (this.filter.currentPage-1)*this.filter.pageSize;
          this.agents = queryData.splice(this.filter.beginIndex,this.filter.pageSize);
          this.loading = false;
          this.selected.splice(0,this.selected.length);
        }).catch(e => {
          console.log(e)
        })
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
