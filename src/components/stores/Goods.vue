<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <template v-if=" userInfo.role === 'ADMIN'">
          <el-breadcrumb-item>商户管理</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/store/storeAdmins'}">商户管理员列表</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/store/storeDetails'}">商户详情</el-breadcrumb-item>
        </template>
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
              <el-option label="金额" value="amount"></el-option>
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
                ref="table">
        <el-table-column prop="extStoreId" label="小微商户ID" align="center"></el-table-column>
        <el-table-column prop="name" label="商品名" align="center">
          <template slot-scope="scope">
            <el-button @click="viewDetail(scope.row,scope.column)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" align="center"></el-table-column>
        <el-table-column prop="desc" label="描述" align="center"></el-table-column>
        <template v-if="userInfo.role === 'ADMIN'">
          <el-table-column prop="number" label="商品个数" align="center"></el-table-column>
          <el-table-column prop="attachNumber" label="关联个数" align="center">
            <template slot-scope="scope">
              <el-button @click="viewDetail(scope.row,scope.column)" type="text" size="small">{{scope.row.attachNumber}}</el-button>
            </template>
          </el-table-column>
        </template>
        <el-table-column prop="url" label="支付链接" align="center"></el-table-column>
        <template v-if="this.userInfo.role === 'ADMIN'">
          <el-table-column label="操作" align="center" width="160px">
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
          <el-table-column label="商品关联/解除" align="center">
            <template slot-scope="scope">
              <el-tooltip :content="'商品状态: ' + goods[scope.$index].state" placement="top">
                <el-switch
                  v-model="goods[scope.$index].state"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  active-text="关联"
                  inactive-text="解除"
                  active-value="已关联"
                  inactive-value="未关联"
                  @change="switchState(scope.row)">
                </el-switch>
              </el-tooltip>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <template v-if="userInfo.role === 'ADMIN'">
        <!-- 新增商品-->
        <el-dialog title="新增商品" center v-model="dialogCreateVisible" :visible.sync="dialogCreateVisible" :close-on-click-modal="false" @close="reset" >
          <el-form id="#create" ref="create" :model="create" :rules="createRules"  label-width="150px">
            <el-form-item prop="extStoreId" label="小微商户ID">
              <el-input v-model="create.extStoreId"></el-input>
            </el-form-item>
            <el-form-item prop="name" label="商品名">
              <el-input v-model="create.name"></el-input>
            </el-form-item>
            <el-form-item prop="amount" label="金额">
              <el-input v-model="create.amount">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item prop="desc" label="描述">
              <el-input v-model="create.desc"></el-input>
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
            <!--<el-form-item
              v-for="(note, index) in create.extGoodsList"
              :label="'备注' + Number(index+1)"
              :prop="'extGoodsList.' + index + 'note'"
              :key="note.key">
              <el-input v-model="note.note"></el-input>
            </el-form-item>-->
            <el-button type="info" size="small" icon="el-icon-plus" plain class="right-float" @click="addCreateCode">添加二维码</el-button>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogCreateVisible = false">取 消</el-button>
            <el-button type="primary" plain :loading="createLoading" @click="handleCreate">提交</el-button>
          </div>
        </el-dialog>

        <el-dialog title="修改商品信息" center v-model="dialogUpdateVisible" :visible.sync="dialogUpdateVisible" :close-on-click-modal="false">
          <el-form ref="update" :model="update" :rules="updateRules" label-width="150px">
            <el-form-item prop="extStoreId" label="小微商户ID">
              <el-input v-model="update.extStoreId"></el-input>
            </el-form-item>
            <el-form-item prop="name" label="商品名">
              <el-input v-model="update.name"></el-input>
            </el-form-item>
            <el-form-item prop="amount" label="价格">
              <el-input v-model="update.amount">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item prop="desc" label="描述">
              <el-input v-model="update.desc"></el-input>
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
            <!--<el-form-item
              v-for="(note, index) in update.extGoodsList"
              :label="'备注' + Number(index+1)"
              :prop="'extGoodsList.' + index + 'note'"
              :key="note.key">
              <el-input v-model="note.note"></el-input>
            </el-form-item>-->
            <el-form-item prop="url" label="支付链接">
              <el-input v-model="url" disabled></el-input>
            </el-form-item>
            <el-button type="info" size="small" icon="el-icon-plus" plain class="right-float" @click="addUpdateCode">添加二维码</el-button>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogUpdateVisible = false">取 消</el-button>
            <el-button type="primary" plain :loading="createLoading" @click="handleUpdate">提交</el-button>
          </div>
        </el-dialog>

        <!--<el-dialog title="关联商品" center v-model="dialogAttachVisible" :visible.sync="dialogAttachVisible" :close-on-click-modal="false" @open="getStorePool">
          <el-form label-width="35%">
            <el-form-item label="商品名" prop="goodsId">
              <el-select v-model="attachGood" multiple placeholder="请选择商品">
                <el-option
                  v-for="item in goodsList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogAttachVisible = false">取 消</el-button>
            <el-button type="primary" plain @click="handleAttach">提交</el-button>
          </div>
        </el-dialog>

        <el-dialog title="解除关联" center v-model="dialogDetachVisible" :visible.sync="dialogDetachVisible" :close-on-click-modal="false" @open="getStorePool">
          <el-form label-width="35%">
            <el-form-item label="商品名" prop="goodsId">
              <el-select v-model="detachGood" multiple placeholder="请选择商品">
                <el-option
                  v-for="item in goodsList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogDetachVisible = false">取 消</el-button>
            <el-button type="primary" plain @click="handleDetach">提交</el-button>
          </div>
        </el-dialog>-->
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
        storeId: '',
        goods: [],
        create: {
          name: '',
          desc: '',
          amount: '',
          extStoreId: '',
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
          name: '',
          desc: '',
          amount: '',
          extStoreId: '',
          extGoodsList: [],
        },
        updateStorePool:{},
        updatePool:{
          id: '',
          name: '',
          amount: '',
          extGoodsList: [],
        },
        updatePoolExtStoreId: '',
        url: '',
        createRules: {
          extStoreId: [
            { required: true, message: '请输入小微商户ID', trigger: 'blur' },
          ],
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
        updateRules: {
          extStoreId: [
            { required: true, message: '请输入小微商户ID', trigger: 'blur' },
          ],
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
        currentExtStoreId: '',
        attachGood: [],
        detachGood: [],
        extGoodsIds: [],
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
        dialogAttachVisible: false,
        dialogDetachVisible: false,
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
        let url = `/xpay/admin/${this.userInfo.id}/stores/${this.storeId}/goods`;
        sessionStorage.setItem('getStateUrl',url);
        this.$http.get(url).then(res => {
          if (res.data.data) {
            res.data.data.forEach(row => {
              if(row.extGoodsList){
                row.number = row.extGoodsList.length;
              }
              else row.number = 0;
              if(row.storeExtGoodsList){
                row.state = '已关联';
                row.attachNumber = row.storeExtGoodsList.length;
              }
              else {
                row.state = '未关联';
                row.attachNumber = 0;
              }
              row.url = `http://www.zmpay.top/xpay/qrcode/${row.code}`;
              row.amount += '元';
            });
            this.goods = res.data.data;
          }
          else {
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
          if(this.goods[0]){
            this.create.extStoreId = this.goods[0].extStoreId
          }
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
            this.create.storeId = this.storeId;
            this.create.extGoodsList = this.create.extGoodsList.filter(q => {
              if(q.extQrCode&&q.note){return q}
            });
            this.$http.put(`/xpay/admin/${this.userInfo.id}/stores/${this.storeId}/goods`,this.create).then(() => {
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
      updateRow(row) {
        this.dialogUpdateVisible = true;
        this.goodsId = row.id;
        this.update.extStoreId = row.extStoreId;
        this.update.name = row.name;
        this.update.desc = row.desc;
        this.update.amount = parseFloat(row.amount);
        if(row.extGoodsList){
          this.update.extGoodsList = row.extGoodsList.filter(q => {
            if(q.extQrCode&& q.note){return q}
          });
        }
        else this.update.extGoodsList = [];
        this.url = row.url;
      },
      handleUpdate() {
        this.update.extGoodsList = this.update.extGoodsList.filter(q => {
          if(q.extQrCode&&q.note){return q}
        });
        this.$http.patch(`/xpay/admin/${this.userInfo.id}/stores/${this.storeId}/goods/${this.goodsId}`,this.update).then(() => {
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
        this.$confirm('此操作将删除商品\n' + row.name + ', 是否继续?', '提示', { type: 'warning' })
          .then(() => {
            let goodsId = row.id  ;
            this.$http.delete(`/xpay/admin/${this.userInfo.id}/stores/${this.storeId}/goods/${goodsId}`).then(() => {
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
      switchState(row){
        if(row.state === '已关联'){
          let storePool = [];
          let extGoodsIds = [];
          let count = 0;
          this.$http.get(`/xpay/admin/${this.adminId}/store_pool`).then(res=>{
            storePool = res.data.data;
            storePool.map(store=>{
              this.$http.get(`/xpay/admin/${this.adminId}/store_pool/${store.extStoreId}/goods`).then(info=>{
                let extGoods = info.data.data;
                extGoods.map(good=>{
                  if(parseInt(row.amount) === parseInt(good.amount)){
                    console.log(good);
                    extGoodsIds = extGoodsIds.concat(good.id);
                  }
                });
              }).then(()=>{
                count++;
                let attachParam = {
                  "goodsId": row.id,
                  "extGoodsIds": extGoodsIds
                };
                console.log(count);
                if(count === storePool.length){
                  this.$http.post(`/xpay/admin/${this.adminId}/store_pool/goods/attach`,attachParam).then(() => {
                    this.$message.success('关联成功!');
                    this.getGoods();
                  })
                }
              });
            });
          }).catch(() => {
            this.$message.error('关联失败!');
          });
        }

        if(row.state === '未关联'){
          let storePool = [];
          let extGoodsIds = [];
          let count = 0;
          this.$http.get(`/xpay/admin/${this.adminId}/store_pool`).then(res=>{
            storePool = res.data.data;
            storePool.map(store=>{
              this.$http.get(`/xpay/admin/${this.adminId}/store_pool/${store.extStoreId}/goods`).then(info=>{
                let extGoods = info.data.data;
                extGoods.map(good=>{
                  if(parseInt(row.amount) === good.amount){
                    console.log(good);
                    extGoodsIds = extGoodsIds.concat(good.id);
                  }
                });
              }).then(()=>{
                count++;
                let detachParam = {
                  "goodsId": row.id,
                  "extGoodsIds": extGoodsIds
                };
                console.log(count);
                if(count === storePool.length){
                  this.$http.post(`/xpay/admin/${this.adminId}/store_pool/goods/detach`,detachParam).then(() => {
                    this.$message.success('解除关联成功!');
                    this.getGoods();
                  })
                }
              });
            });
          }).catch(() => {
            this.$message.error('解除关联失败!');
          });
        }
      },
      viewDetail(row,column){
        if(this.userInfo.role === 'ADMIN'){
          if(row.extGoodsList){
            row.extGoodsList.forEach(v =>{
              v.name = row.name
            });
            if(column.property === 'attachNumber'){
              if(row.storeExtGoodsList){
                sessionStorage.setItem('storeExtGoodsList',JSON.stringify(row.storeExtGoodsList));
              }
              else {
                sessionStorage.removeItem('storeExtGoodsList');
              }
              this.$router.push({ path: '/AttachGoods' });
            }else {
              sessionStorage.setItem('extGoodsList',JSON.stringify(row.extGoodsList));
              sessionStorage.setItem('path',this.$route.path);
              this.$router.push({ path: '/GoodDetails' });
            }
          }
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
