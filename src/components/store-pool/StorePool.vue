<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>商户池管理</el-breadcrumb-item>
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
          <el-input :placeholder="placeholder" v-model="keywords" style="width: 400px;" @keyup.enter.native="getStores">
            <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:118px">
              <el-option label="管理员名称" value="name"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
          </el-input>
        </el-form>
      </el-col>

      <!-- 商户列表-->
      <el-table :data="stores"
                style="width: 100%"
                height="680"
                ref="table">
        <el-table-column prop="admin.name" label="管理员名称" align="center"></el-table-column>
        <el-table-column prop="admin.password" label="查看商户池" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini" type="info" plain
              @click="viewPoolList(scope.row)">查看详情
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
    "name":"请输入管理员名称",
  };

  export default {
    data: function() {
      return {
        userInfo:{
          id:'',
          account:'',
          name:'',
          role:''
        },
        stores: [],
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          name: '',
          bailPercentage: '',
          code: '',
          csrTel: '',
          proxyUrl: ''
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'name', //搜索框的搜索字段
        loading: true,
        //selected: [], //已选择项
        dialogCreateVisible: false, //创建对话框的显示状态
        dialogChangePwdVisible: false,
        createLoading: false,
        updateLoading: false,
        placeholder:placeholders["name"]
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
      this.getStores();
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
      //获取管理员列表
      getStores() {
        this.loading = true;
        this.$http.get(`/xpay/admin/${this.userInfo.id}/stores`).then(res => {
          if (res.data.data) {
            let tmpObj = {};
            let result = [];
            res.data.data.forEach(val =>{
              if (!tmpObj[val.admin.account]) {
                tmpObj[val.admin.account] = true;
                result.push(val);
              }
            });
            this.stores = result;
          }
          //查询
          let queryData = [];
          if(this.keywords !==""){
            for (var i=0,lenI=this.stores.length;i<lenI;i++) {
              let reg = new RegExp(this.keywords);
              if(this.stores[i].admin[this.select].toString().match(reg)){
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
      viewPoolList(row){
        if(row.id){
          sessionStorage.setItem('currentId',row.id);
        }
        if(row.admin){
          sessionStorage.setItem('currentAdminId',row.admin.id);
        }
        sessionStorage.setItem('details',JSON.stringify(row));
        this.$router.push({ path: '/storePool/poolList' });
      },
      /*getStorePool() {
        this.$http.get(`http://www.zmpay.xyz/xpay/admin/10/stores/298/goods`).then(res =>{
          console.log(res);
        })
      }*/
    }
  }
</script>

<style>
  .paging{
    text-align: center;
    margin:12px 0;
  }
</style>
