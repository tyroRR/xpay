<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>商户管理</el-breadcrumb-item>
        <el-breadcrumb-item>App列表</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="24" class="warp-main"
            v-loading="loading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)">
      <!-- 查询 -->
      <el-col :span="24" class="toolbar">
        <el-form :inline="true" class="demo-form-inline">
          <el-input :placeholder="placeholder" v-model="keywords" style="width: 30%;">
            <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:130px">
              <el-option label="App名称" value="name"></el-option>
              <el-option label="key" value="key"></el-option>
              <el-option label="secret" value="secret"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getApps">查询</el-button>
          </el-input>
          <template v-if="userInfo.role === 'ADMIN'">
            <el-button type="primary" icon="el-icon-plus" @click="dialogCreateVisible = true">添加</el-button>
          </template>
        </el-form>
      </el-col>

      <!-- 商户列表-->
      <el-table :data="apps"
                style="width: 100%"
                height="680"
                @selection-change="tableSelectionChange">
        <el-table-column prop="name" label="App名称"></el-table-column>
        <el-table-column prop="key" label="key"></el-table-column>
        <el-table-column prop="secret" label="secret"></el-table-column>
      </el-table>

      <template v-if="userInfo.role === 'ADMIN'">
        <el-dialog title="新增App" center v-model="dialogCreateVisible" :visible.sync="dialogCreateVisible" :close-on-click-modal="false" @close="reset" >
          <el-form id="#create" :model="create" :rules="rules" ref="create" label-width="120px">
            <el-form-item label="App名称" prop="name">
              <el-input v-model="create.name"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogCreateVisible = false">取 消</el-button>
            <el-button type="primary" :loading="createLoading" @click="createApp">确 定</el-button>
          </div>
        </el-dialog>
      </template>

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
    "name":"请输入App名称",
    "key":"请输入key",
    "secret":"请输入secret"
  };

  export default {
    data: function() {
      return {
        userInfo:{
          id:'',
          account:'',
          name:''
        },
        apps: [],
        create: {
          name: ''
        },
        rules: {
          name: [
            { required: true, message: '请输入商户名称', trigger: 'blur' },
          ]
        },
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          name: '',
          key: '',
          secret: ''
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'name', //搜索框的搜索字段
        loading: true,
        selected: [], //已选择项
        dialogCreateVisible: false,
        createLoading: false,
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
      }
      this.getApps()
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
        this.getApps();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        this.getApps();
      },
      // 重置表单
      reset() {
        this.$refs.create.resetFields();
      },
      //获取商户列表
      getApps() {
        this.loading = true;
        this.$http.get(`http://106.14.47.193/xpay/admin/${this.userInfo.id}/apps`).then(res => {
          console.log(res.data.data);
          if(res.data.data){
            this.apps = res.data.data;
          }
          //查询
          let queryData = [];
          if(this.keywords !==""){
            for (var i=0,lenI=this.apps.length;i<lenI;i++) {
              let reg = new RegExp(this.keywords);
              if(this.apps[i][this.select].toString().match(reg)){
                queryData.push(this.apps[i]);
              }
            }
          }
          else queryData = this.apps;
          this.totalRows = queryData.length;
          //分页
          this.filter.beginIndex = (this.filter.currentPage-1)*10;
          this.apps = queryData.splice(this.filter.beginIndex,this.filter.pageSize);
          this.loading = false;
          this.selected.splice(0,this.selected.length);
        })
      },

      // 新增App
      createApp(){
        this.$refs.create.validate((valid) => {
          if (valid) {
            this.createLoading = true;
            this.$http.put(`http://106.14.47.193/xpay/admin/${this.userInfo.id}/apps`,this.create).then(res => {
              this.$message.success('创建用户成功！');
              this.dialogCreateVisible = false;
              this.createLoading = false;
              this.reset();
              this.getApps();
            }).catch(() =>{
              this.$message.error('创建用户失败！');
              this.reset();
              this.createLoading = false;
            })
          }
          else {
            return false;
          }
        });
      }

    }
  }
</script>

<style>
  .paging{
    text-align: center;
    margin:12px 0;
  }
  .btn-edit{
    float: right;
  }

</style>
