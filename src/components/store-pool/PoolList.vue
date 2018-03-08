<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/storePool' }">商户池管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/storePool/poolList' }">商户池列表</el-breadcrumb-item>
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
            <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:130px">
              <el-option label="小微商户ID" value="extStoreId"></el-option>
              <el-option label="商户名" value="extStoreName"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
          </el-input>
          <template v-if="userInfo.role === 'ADMIN'">
            <el-button type="info" plain icon="el-icon-plus" @click="dialogCreateStoreVisible = true">添加</el-button>
          </template>
        </el-form>
      </el-col>

      <!-- 商户列表-->
      <el-table :data="stores"
                style="width: 100%"
                height="680"
                ref="table">
        <el-table-column prop="extStoreId" label="小微商户ID" align="center"></el-table-column>
        <el-table-column prop="extStoreName" label="商户名" align="center">
          <template slot-scope="scope">
            <el-button @click="viewGood(scope.row)" type="text" size="small">{{scope.row.extStoreName}}</el-button>
          </template>
        </el-table-column>
        <template v-if="this.userInfo.role === 'ADMIN'">
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button class="handle"
                         size="mini" type="danger" plain
                         @click="deleteStore(scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <el-dialog title="添加轮询商户" center v-model="dialogCreateStoreVisible" :visible.sync="dialogCreateStoreVisible" @open="getExtStore" @close="resetCreateStore">
        <el-form id="#createStore" :model="createStore" :rules="createStoreRules" ref="createStore" label-width="120px">
          <el-form-item label="小微商户ID" prop="extStoreId">
            <el-input v-model="createStore.extStoreId" placeholder="请输入小微商户ID"></el-input>
          </el-form-item>
          <el-form-item label="商户名" prop="extStoreName">
            <el-select v-model="createStore.extStoreName" placeholder="请选择商户">
              <el-option
                v-for="item in extStore"
                :key="item.id"
                :label="item.name"
                :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button plain @click="dialogCreateStoreVisible = false">取 消</el-button>
          <el-button type="primary" plain :loading="createLoading" @click="handleCreateStore">提交</el-button>
        </div>
      </el-dialog>

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
    "extStoreId":"小微商户ID",
    "extStoreName":"商户名",
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
        adminId: '',
        storeId: '',
        stores: [],
        createStore: {
          extStoreId: '',
          extStoreName: '',
        },
        extStore: [],
        createStoreRules: {
          extStoreId: [
            { required: true, message: '请输入小微商户ID', trigger: 'blur' },
          ],
          extStoreName: [
            { required: true, message: '请选择商户', trigger: 'blur' },
          ]
        },
        currentExtStoreId: '',
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          extStoreId: '',
          extStoreName: ''
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'extStoreId', //搜索框的搜索字段
        loading: true,
        dialogCreateStoreVisible: false,
        createLoading: false,
        placeholder:placeholders["extStoreId"]
      };
    },
    mounted: function() {
      this.adminId = sessionStorage.getItem('currentAdminId');
      this.storeId = sessionStorage.getItem('currentId');
      let userInfo = sessionStorage.getItem('access-user');
      if (userInfo) {
        userInfo = JSON.parse(userInfo);
        this.userInfo.id = userInfo.id;
        this.userInfo.account = userInfo.account;
        this.userInfo.name = userInfo.name;
        this.userInfo.role = userInfo.role;
      }
      this.getStores()
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
      // 重置表单
      resetCreateStore() {
        this.$refs.createStore.resetFields();
      },
      //获取商户列表
      getStores() {
        this.loading = true;
        this.$http.get(`/xpay/admin/${this.adminId}/store_pool`).then(res => {
          if(res.data.data){
            if(res.data.data.constructor !== Array){
              this.stores = [];
              this.stores.push(res.data.data);
            }
            else this.stores = res.data.data;
          }
          else this.stores = [];
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
      handleCreateStore(){
        this.$refs.createStore.validate((valid) => {
          if (valid) {
            this.createLoading=true;
            this.$http.put(`/xpay/admin/${this.adminId}/store_pool/`,this.createStore).then(() => {
              this.$message.success('添加成功！');
              this.resetCreateStore();
              this.getStores();
              this.createLoading=false;
              this.dialogCreateStoreVisible = false;
            }).catch(() => {
              this.$message.error('添加失败！');
              this.resetCreateStore();
            })
          }
          else {
            return false;
          }
        })
      },
      deleteStore(row){
        this.$confirm(`此操作将把商户：${row.extStoreName} 从商户池中删除，是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete(`/xpay/admin/${this.adminId}/store_pool/${row.extStoreId}`).then(()=> {
              this.$message.success('删除成功!');
              this.getStores()
            }
          ).catch(()=>{
              this.$message.error('删除失败!')
          }
          )
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除!'
          });
        });
      },
      viewGood(row){
        sessionStorage.setItem('currentExtStoreId',row.extStoreId);
        this.$router.push({ path: '/storePool/poolList/poolGoods' });
      },
      getExtStore(){
        this.$http.get(`/xpay/admin/${this.adminId}/stores`).then(res =>{
          this.extStore = res.data.data;
        })
      }
    }
  }
</script>

<style slot-scoped>
  .paging{
    text-align: center;
    margin:12px 0;
  }
  .handle{
    margin: 8px auto;
  }
  .right-float{
    float: right;
  }
  .mb{
    margin-bottom: 10px;
  }
  .el-dialog__body{
    margin: 0 10%!important;
  }
  @media screen and (max-width: 1440px){
    .el-dialog{
      width: 88%;
    }
  }
</style>
