<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>商户管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/store/storeAdmins'}">商户列表</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/store/storeDetails'}">商户详情</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
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
          <el-input :placeholder="placeholder" v-model="keywords" style="width: 400px;" @keyup.enter.native="getGoods">
            <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:118px">
              <el-option label="商品名" value="name"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getGoods">查询</el-button>
          </el-input>
          <template v-if="userInfo.role === 'ADMIN'">
            <el-button type="info" plain icon="el-icon-plus" @click="dialogCreateVisible = true">新增商品</el-button>
          </template>
        </el-form>
      </el-col>

      <!-- 商品列表-->
      <el-table :data="goods"
                style="width: 100%"
                height="680"
                ref="table"
                :default-sort = "{prop: 'amount', order: 'ascending'}"
                @selection-change="tableSelectionChange">
        <el-table-column prop="extStoreId" label="小微商户ID" align="center"></el-table-column>
        <el-table-column prop="name" label="商品名" align="center"></el-table-column>
        <el-table-column prop="amount" label="金额" align="center"></el-table-column>
        <el-table-column prop="desc" label="描述" align="center"></el-table-column>
        <el-table-column prop="extQrCode" label="extQrCode" align="center"></el-table-column>
        <template v-if="this.userInfo.role === 'ADMIN'">
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini" type="danger" plain
                @click="handleDelete(scope.row)">删除
              </el-button>
              <el-button
                size="mini" type="info" plain
                @click="handleUpdate(scope.row)">编辑
              </el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <template v-if="userInfo.role === 'ADMIN'">
        <!-- 新增商品-->
        <el-dialog title="新增商品" center v-model="dialogCreateVisible" :visible.sync="dialogCreateVisible" :close-on-click-modal="false" @close="reset" >
          <el-form id="#create" ref="create" :model="create" :rules="createRules"  label-width="120px">
            <el-form-item prop="name" label="商品名">
              <el-input v-model="create.name"></el-input>
            </el-form-item>
            <el-form-item label="价格" prop="amount">
              <el-input v-model="create.amount"></el-input>
            </el-form-item>
            <el-form-item label="描述" prop="desc">
              <el-input v-model="create.desc"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogCreateVisible = false">取 消</el-button>
            <el-button type="primary" plain :loading="createLoading" @click="handleCreate">提交</el-button>
          </div>
        </el-dialog>

        <el-dialog title="修改商品信息" v-model="dialogUpdateVisible" :visible.sync="dialogUpdateVisible" :close-on-click-modal="false">
          <el-form ref="update" :model="update" :rules="updateRules" label-width="100px">
            <el-form-item label="商户名">
              <el-input v-model="update.name" disabled></el-input>
            </el-form-item>
            <el-form-item prop="amount" label="价格">
              <el-input v-model="update.amount" disabled></el-input>
            </el-form-item>
            <el-form-item prop="desc" label="描述">
              <el-input v-model="update.desc"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogUpdateVisible = false">取 消</el-button>
            <el-button type="primary" plain :loading="createLoading" @click="handleUpdate">提交</el-button>
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
    "name":"请输入商户名",

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
        storeId: '',
        goods: [],
        create: {
          name: '',
          desc: '',
          amount: '',
          extStoreId: '',
          extQrCode: ''
        },
        update: {
          name: '',
          desc: '',
          amount: '',
          extStoreId: '',
          extQrCode: ''
        },
        createRules: {
          name: [
            { required: true, message: '请输入商品名', trigger: 'blur' },
          ],
          amount: [
            { required: true, message: '请输入商品金额', trigger: 'blur' },
          ],
          desc: [
            { required: true, message: '请输入商品描述', trigger: 'blur' },
          ]
        },
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          name: ''
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'name', //搜索框的搜索字段
        loading: true,
        dialogCreateVisible: false, //创建对话框的显示状态
        dialogUpdateVisible: false,
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
      this.storeId = sessionStorage.getItem('currentStoreId');
      this.getGoods();
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
        this.getGoods();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        this.getGoods();
      },
      // 重置
      init() {
        this.steps.active = 0;
      },
      reset() {
        this.$refs.create.resetFields();
      },
      //获取商户列表
      getGoods() {
        this.loading = true;
        this.$http.get(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores/${this.storeId}/goods`).then(res => {
          if (res.data.data) {
            this.stores = res.data.data;
          }
          //查询
          let queryData = [];
          if(this.keywords !==""){
            for (var i=0,lenI=this.goods.length;i<lenI;i++) {
              let reg = new RegExp(this.keywords);
              if(this.goods[i][this.select].toString().match(reg)){
                queryData.push(this.goods[i]);
              }
            }
          }
          else queryData = this.goods;
          this.totalRows = queryData.length;
          //分页
          this.filter.beginIndex = (this.filter.currentPage-1)*this.filter.pageSize;
          this.goods = queryData.splice(this.filter.beginIndex,this.filter.pageSize);
          this.loading = false;
        })
      },

      handleCreate(){
        this.$refs.create.validate((valid) => {
          if (valid) {
            this.$http.put(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores/${this.storeId}/goods`,this.create).then(() => {
              this.$message.success('创建成功！');
              this.reset();
              this.dialogCreateVisible = false;
              this.getGoods();
            }).catch(() => {
              this.$message.error('创建失败！');
              this.reset();
            })
          }
          else {
            return false;
          }
        })
      },

      handleUpdate() {
        this.$http.patch(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/`,this.update).then(() => {
          this.$message.success('修改成功！');
          this.$refs.update.resetFields();
          this.dialogChangePwdVisible = false;
          this.getGoods();
        }).catch(() => {
          this.$message.error('修改失败！');
          this.$refs.update.resetFields();
        })
      },

      handleDelete(row) {
        this.$confirm('此操作将删除商品 ' + row.name + ', 是否继续?', '提示', { type: 'warning' })
          .then(() => {
            let goodsId = row.id  ;
            this.$http.delete(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores/${this.storeId}/goods/${goodsId}`).then(() => {
              this.$message.success('成功删除了商品' + row.name + '!');
              this.getGoods();
            })
              .catch(() => {
                this.$message.error('删除失败!');
              });
          })
          .catch(() => {
            this.$message.info('已取消操作!');
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
</style>
