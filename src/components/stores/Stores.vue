<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>商户管理</el-breadcrumb-item>
        <el-breadcrumb-item>商户列表</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="24" class="warp-main"
            v-loading="loading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)">
      <!-- 查询 -->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" class="demo-form-inline">
            <el-input :placeholder="placeholder" v-model="keywords" style="width: 30%;">
              <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:110px">
                <el-option label="ID" value="id"></el-option>
                <el-option label="商户名称" value="name"></el-option>
                <el-option label="商户类型" value="type"></el-option>
                <el-option label="商户通道" value="channels"></el-option>
              </el-select>
              <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
            </el-input>
          <el-form-item>
            <div class="btn-edit">
              <el-button type="primary" icon="el-icon-plus" @click="dialogCreateVisible = true">添加</el-button>
              <el-button type="primary" icon="el-icon-delete" :disabled="selected.length==0">删除</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-col>

      <!-- 商户列表-->
      <el-table :data="stores"
                style="width: 100%"
                height="680"
                :default-sort = "{prop: 'id', order: 'descending'}"
                @selection-change="tableSelectionChange">
        <el-table-column sortable prop="id" label="ID"></el-table-column>
        <el-table-column prop="name" label="商户名称"></el-table-column>
        <el-table-column prop="code" label="code"></el-table-column>
        <el-table-column label="商户通道">
          <template slot-scope="scope">
            <el-button
              size="mini" type="primary"
              @click="handleView(scope.$index, scope.row)">查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="removeChannel(scope.$index, scope.row)">删除</el-button>
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
    "id":"请输入ID",
    "name":"请输入商户名称",
    "type":"请输入商户类型",
    "channels":"请输入商户通道"
  };

  export default {
    data: function() {

      return {
        stores: [],
        create: {
          id: '',
          name: '',
          code: '',
          is_active: true
        },
        currentId:'',
        update:{
          id: '',
          name: '',
          code: '',
          is_active: true
        },
        rules: {
          id: [
            { required: true, message: '请输入ID', trigger: 'blur' },
            { pattern:/^[0-9]*/, message: 'ID为数字'}
          ],
          name: [
            { required: true, message: '请输入商户名称', trigger: 'blur' },
          ],
          code: [
            { required: true, message: '请输入code', trigger: 'blur' },
          ]
        },
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          id:'',
          name:'',
          code:'',
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'id', //搜索框的搜索字段
        loading: true,
        selected: [], //已选择项
        dialogCreateVisible: false, //创建对话框的显示状态
        dialogUpdateVisible: false, //编辑对话框的显示状态
        createLoading: false,
        updateLoading: false,
        placeholder:placeholders["id"]
      };
    },
    mounted: function() {
      this.getStores();
    },
    methods: {
      tableSelectionChange(val) {
        this.selected = val;
      },
      searchFieldChange(val) {
        this.placeholder=placeholders[val];
        console.log(`搜索字段： ${val} `);
      },
      pageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.filter.per_page = val;
        this.getStores();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.page = val;
        this.getStores();
      },
      handleEdit(store){
        this.currentId = store.id;
        this.update.name = store.name;
        this.update.is_active=store.is_active;
        this.dialogUpdateVisible=true;
      },
      handleView(index,row){

      },
      // 重置表单
      reset() {
        this.$refs.create.resetFields();
      },
      //获取用户列表
      getStores() {
        this.loading = true;
        this.$http.get('http://106.14.47.193/xpay/admin/10/stores').then(res => {
          console.log(res.data.data);
          this.stores = res.data.data;
          //查询
          let queryData = [];
          if(this.keywords !==""){
            for (var i=0,lenI=this.stores.length;i<lenI;i++) {
              let reg = new RegExp(this.keywords);
              if(this.stores[i][this.select].match(reg)){
                queryData.push(this.stores[i]);
              }
            }
          }
          else queryData = this.stores;
          this.totalRows = queryData.length;
          //分页
          this.filter.beginIndex = (this.filter.currentPage-1)*10;
          this.stores = queryData.splice(this.filter.beginIndex,this.filter.pageSize);
          this.loading = false;
          this.selected.splice(0,this.selected.length);
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
  .btn-edit{
    float: right;
  }

</style>
