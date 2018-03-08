<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/storePool' }">商户池管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/storePool/poolList' }">商户池列表</el-breadcrumb-item>
        <el-breadcrumb-item>商户池商品</el-breadcrumb-item>
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
              <el-option label="金额" value="amount"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getGoods">查询</el-button>
          </el-input>
          <template v-if="userInfo.role === 'ADMIN'">
            <el-button type="info" plain icon="el-icon-plus" @click="dialogCreateVisible = true">添加商品</el-button>
          </template>
        </el-form>
      </el-col>

      <!-- 商品列表-->
      <el-table :data="goods"
                style="width: 100%"
                height="680"
                ref="table">
        <el-table-column prop="extStoreId" label="小微商户ID" align="center"></el-table-column>
        <el-table-column prop="extStoreName" label="商户名" align="center"></el-table-column>
        <el-table-column prop="name" label="商品名" align="center">
          <template slot-scope="scope">
            <el-button @click="viewDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" align="center"></el-table-column>
        <el-table-column prop="number" label="商品个数" align="center"></el-table-column>
        <template v-if="this.userInfo.role === 'ADMIN'">
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini" type="info" plain
                @click="updateRow(scope.row)">编辑
              </el-button>
              <el-button
                size="mini" type="danger" plain
                @click="handleDelete(scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <template v-if="userInfo.role === 'ADMIN'">
        <!-- 新增商品-->
        <el-dialog title="添加商品" center v-model="dialogCreateVisible" :visible.sync="dialogCreateVisible" :close-on-click-modal="false" @close="reset" >
          <el-form id="#create" ref="create" :model="create" :rules="createRules"  label-width="150px">
            <el-form-item prop="name" label="商品名">
              <el-input v-model="create.name"></el-input>
            </el-form-item>
            <el-form-item prop="amount" label="金额">
              <el-input v-model="create.amount">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item
              v-for="(code, index) in create.extGoodsList"
              :label="'商品二维码&&备注' + Number(index+1)"
              :prop="'extGoodsList.' + index + '.extQrCode'"
              :key="code.key"
              :rules="{required: true, message: '商品二维码&&备注不能为空', trigger: 'blur' }">
              <el-input v-model="code.extQrCode" class="qrCode mb"></el-input>
              <el-button type="primary" size="small"  icon="el-icon-document" plain class="copy-btn right-float mb" data-clipboard-target=".qrCode">复制</el-button>
              <el-input v-model="code.note" class="mb"></el-input>
              <el-button type="danger" @click.prevent="removeCreateCode(code)" size="small"  icon="el-icon-delete" plain class="right-float">删除</el-button>
            </el-form-item>
            <el-button type="info" size="small" icon="el-icon-plus" plain class="right-float" @click="addCreateCode">添加二维码</el-button>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogCreateVisible = false">取 消</el-button>
            <el-button type="primary" plain :loading="createLoading" @click="handleCreate">提交</el-button>
          </div>
        </el-dialog>

        <el-dialog title="修改商品信息" center v-model="dialogUpdateVisible" :visible.sync="dialogUpdateVisible" :close-on-click-modal="false">
          <el-form ref="update" :model="update" :rules="updateRules" label-width="150px">
            <el-form-item prop="name" label="商品名">
              <el-input v-model="update.name"></el-input>
            </el-form-item>
            <el-form-item prop="amount" label="金额">
              <el-input v-model="update.amount">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item
              v-for="(code, index) in update.extGoodsList"
              :label="'商品二维码&&备注' + Number(index+1)"
              :prop="'extGoodsList.' + index + '.extQrCode'"
              :key="code.key"
              :rules="{required: true, message: '商品二维码&&备注不能为空', trigger: 'blur' }">
              <el-input v-model="code.extQrCode" class="mb"></el-input>
              <el-button type="primary" size="small" icon="el-icon-document" plain class="copy-btn right-float mb">复制</el-button>
              <el-input v-model="code.note" class="mb"></el-input>
              <el-button type="danger" @click.prevent="removeUpdateCode(code)" size="small"  icon="el-icon-delete" plain class="right-float">删除</el-button>
            </el-form-item>
            <el-button type="info" size="small" icon="el-icon-plus" plain class="right-float" @click="addUpdateCode">添加二维码</el-button>
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
  import Clipboard from 'clipboard'

  let placeholders = {
    "name":"请输入商品名",
    "amount":"请输入金额"
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
        extStoreId: '',
        goods: [],
        create: {
          name: '',
          amount: '',
          extGoodsList: [
            {
              extQrCode:'',
              note:''
            },
            {
              extQrCode:'',
              note:''
            },
            {
              extQrCode:'',
              note:''
            }
          ]
        },
        goodsId: '',
        update: {
          id: '',
          name: '',
          amount: '',
          extGoodsList: [],
        },
        createRules: {
          name: [
            { required: true, message: '请输入商品名', trigger: 'blur' },
          ],
          amount: [
            { required: true, message: '请输入商品金额', trigger: 'blur' },
          ]
        },
        updateRules: {
          name: [
            { required: true, message: '请输入商品名', trigger: 'blur' },
          ],
          amount: [
            { required: true, message: '请输入商品金额', trigger: 'blur' },
          ]
        },
        attachGoodsList: [],
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          name: ''
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'name', //搜索框的搜索字段
        loading: false,
        dialogCreateVisible: false, //创建对话框的显示状态
        dialogUpdateVisible: false,
        createLoading: false,
        updateLoading: false,
        placeholder:placeholders["name"]
      };
    },
    mounted: function() {
      const clipboard = new Clipboard('.copy-btn',{
        target: function(trigger) {
          return trigger.previousElementSibling;
        }
      });
      clipboard.on('success', function(e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger.nextElementSibling);
      });

      clipboard.on('error', function(e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
      });
      let userInfo = sessionStorage.getItem('access-user');
      if (userInfo) {
        userInfo = JSON.parse(userInfo);
        this.userInfo.id = userInfo.id;
        this.userInfo.account = userInfo.account;
        this.userInfo.name = userInfo.name;
        this.userInfo.role = userInfo.role;
      }
      this.adminId = sessionStorage.getItem('currentAdminId');
      this.extStoreId = sessionStorage.getItem('currentExtStoreId');
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
      reset() {
        this.$refs.create.resetFields();
        this.create.extGoodsList = [{
          extQrCode:'',
          note:''
        },
          {
            extQrCode:'',
            note:''
          },
          {
            extQrCode:'',
            note:''
          }]
      },
      getGoods() {
        this.loading = true;
        this.$http.get(`/xpay/admin/${this.adminId}/store_pool/${this.extStoreId}/goods`).then(res => {
          if(res.data.data){
            if (res.data.data[0].name) {
              res.data.data.forEach(row => {
                if(row.extGoodsList){
                  row.number = row.extGoodsList.length;
                }
                else row.number = 0;
                row.amount += '元';
              });
              this.goods = res.data.data;
            }
          }else {
            this.goods = []
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
      addCreateCode() {
        this.create.extGoodsList.push({
          extQrCode:'',
          note:''
        });
      },
      addUpdateCode() {
        this.update.extGoodsList.push({
          extQrCode:'',
          note:''
        });
      },
      removeCreateCode(code) {
        var index = this.create.extGoodsList.indexOf(code);
        if (index !== -1) {
          this.create.extGoodsList.splice(index, 1)
        }
      },
      removeUpdateCode(code) {
        var index = this.update.extGoodsList.indexOf(code);
        if (index !== -1) {
          this.update.extGoodsList.splice(index, 1)
        }
      },
      handleCreate(){
        this.$refs.create.validate((valid) => {
          if (valid) {
            this.create.extGoodsList = this.create.extGoodsList.filter(q => {
              if(q.extQrCode&&q.note){return q}
            });
            this.$http.post(`/xpay/admin/${this.adminId}/store_pool/${this.extStoreId}/goods`,this.create).then(() => {
              this.$message.success('添加成功！');
              this.getGoods();
              this.reset();
              this.dialogCreateVisible = false;
            }).catch(() => {
              this.$message.error('添加失败！');
              this.reset();
            })
          }
          else {
            return false;
          }
        })
      },
      updateRow(row) {
        this.dialogUpdateVisible = true;
        this.update.id = row.id;
        this.update.name = row.name;
        this.update.amount = parseFloat(row.amount);
        if(row.extGoodsList){
          this.update.extGoodsList = row.extGoodsList.filter(q => {
            if(q.extQrCode&& q.note){return q}
          });
        }
        else this.update.extGoodsList = [];
      },
      handleUpdate() {
        this.update.extGoodsList = this.update.extGoodsList.filter(q => {
          if(q.extQrCode&&q.note){return q}
        });
        this.$http.post(`/xpay/admin/${this.adminId}/store_pool/${this.extStoreId}/goods`,this.update).then(() => {
          this.$message.success('修改成功！');
          this.$refs.update.resetFields();
          this.dialogUpdateVisible = false;
          this.getGoods();
        }).catch(() => {
          this.$message.error('修改失败！');
          this.$refs.update.resetFields();
        })
      },
      handleDelete(row) {
        this.$confirm('此操作将从商户池中删除商品\n' + row.name + ', 是否继续?', '提示', { type: 'warning' })
          .then(() => {
            this.$http.delete(`/xpay/admin/${this.adminId}/store_pool/${row.extStoreId}/goods/${row.id}`).then(() => {
              this.$message.success('成功删除了商品\n' + row.name + '!');
              this.getGoods();
            })
              .catch(() => {
                this.$message.error('删除失败!');
              });
          })
          .catch(() => {
            this.$message.info('已取消操作!');
          });
      },
      viewDetail(row){
        if(this.userInfo.role === 'ADMIN'){
          if(row.extGoodsList){
            row.extGoodsList.forEach(v =>{
              v.name = row.name
            });
            sessionStorage.setItem('extGoodsList',JSON.stringify(row.extGoodsList));
          }
          sessionStorage.setItem('path',this.$route.path);
          this.$router.push({ path: '/GoodDetails' });
        }
      },
    }
  }
</script>

<style>
  .paging{
    text-align: center;
    margin:12px 0;
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
