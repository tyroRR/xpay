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
              <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:130px">
                <el-option label="商户名称" value="name"></el-option>
                <el-option label="费率" value="bailPercentage"></el-option>
                <el-option label="code" value="code"></el-option>
                <el-option label="客服联系方式" value="csrTel"></el-option>
                <el-option label="同步异步地址" value="proxyUrl"></el-option>
              </el-select>
              <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
            </el-input>
          <el-form-item>
            <el-button type="primary" icon="el-icon-plus" @click="dialogCreateVisible = true">添加</el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <!-- 商户列表-->
      <el-table :data="stores"
                style="width: 100%"
                height="680"
                :default-sort = "{prop: 'bailPercentage', order: 'descending'}"
                @selection-change="tableSelectionChange">
        <el-table-column prop="name" label="商户名称"></el-table-column>
        <el-table-column sortable prop="bailPercentage" label="费率"></el-table-column>
        <el-table-column prop="code" label="code"></el-table-column>
        <el-table-column prop="csrTel" label="客服联系方式"></el-table-column>
        <el-table-column prop="proxyUrl" label="同步异步地址"></el-table-column>
        <el-table-column label="商户通道">
          <template slot-scope="scope">
            <el-button
              size="mini" type="primary"
              @click="viewChannel(scope.$index, scope.row)">查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 新增商户-->
      <el-dialog title="新增商户" center v-model="dialogCreateVisible" :visible.sync="dialogCreateVisible" :close-on-click-modal="false" @close="reset" >
        <el-form id="#create" :model="create" :rules="rules" ref="create" label-width="120px">
          <el-form-item label="商户名称" prop="name">
            <el-input v-model="create.name"></el-input>
          </el-form-item>
          <el-form-item label="appId" prop="appId">
            <el-input v-model="create.appId"></el-input>
          </el-form-item>
          <el-form-item label="费率" prop="bailPercentage">
            <el-input v-model="create.bailPercentage"></el-input>
          </el-form-item>
          <el-form-item label="客服联系方式" prop="csrTel">
            <el-input v-model="create.csrTel"></el-input>
          </el-form-item>
          <el-form-item label="同步异步地址" prop="proxyUrl">
            <el-input v-model="create.proxyUrl"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogCreateVisible = false">取 消</el-button>
          <el-button type="primary" :loading="createLoading" @click="createStore">确 定</el-button>
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
    "name":"请输入商户名称",
    "bailPercentage":"请输入费率",
    "code":"请输入code",
    "csrTel":"请输入客服联系方式",
    "proxyUrl":"请输入同步异步地址",
  };

  export default {
    data: function() {

      return {
        userInfo:{
          id:'',
          account:'',
          name:''
        },
        stores: [],
        create: {
          name: '',
          bailPercentage: '',
          code: '',
          csrTel: '',
          proxyUrl: ''
        },
        currentId:'',
        update:{
          name: '',
          bailPercentage: '',
          code: '',
          csrTel: '',
          proxyUrl: '',
          is_active: true
        },
        rules: {
          appId: [
            { required: true, message: '请输入appId', trigger: 'blur' },
            { pattern:/^[0-9]*$/, message: 'appId为数字'}
          ],
          name: [
            { required: true, message: '请输入商户名称', trigger: 'blur' },
          ],
          bailPercentage: [
            { required: true, message: '请输入费率', trigger: 'blur' },
            { pattern:/^[0-9]*$/, message: '费率为数字'}
          ],
          code: [
            { required: true, message: '请输入code', trigger: 'blur' },
          ],
          csrTel: [
            { required: true, message: '请输入客服联系方式', trigger: 'blur' },
          ],
          proxyUrl: [
            { required: true, message: '请输入同步异步地址', trigger: 'blur' },
          ]
        },
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
        selected: [], //已选择项
        dialogCreateVisible: false, //创建对话框的显示状态
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
      this.getStores()
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
      // 重置表单
      reset() {
        this.$refs.create.resetFields();
      },
      //获取商户列表
      getStores() {
        this.loading = true;
        this.$http.get(`http://106.14.47.193/xpay/admin/${this.userInfo.id}/stores`).then(res => {
          console.log(res.data.data);
          this.stores = res.data.data;
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
          this.filter.beginIndex = (this.filter.currentPage-1)*10;
          this.stores = queryData.splice(this.filter.beginIndex,this.filter.pageSize);
          this.loading = false;
          this.selected.splice(0,this.selected.length);
        })
      },

      // 新增商户
      createStore(){
        this.$refs.create.validate((valid) => {
          if (valid) {
            this.createLoading = true;
            this.$http.put(`http://106.14.47.193/xpay/admin/${this.userInfo.id}/stores`,this.create).then(res => {
              this.$message.success('创建商户成功！');
              this.dialogCreateVisible = false;
              this.createLoading = false;
              this.reset();
              this.getStores();
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
      },

     //查看商户通道列表
     viewChannel(index,row){
        if(row.channels){
          sessionStorage.setItem('channelData', JSON.stringify(row.channels));
          this.$router.push({ path: '/store/storeChannels' });
        }
        else {
          this.$message.error('尚未对该商户分配通道！')
        }
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
