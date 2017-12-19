<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>商户管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/store/storeAdmins' }">商户列表</el-breadcrumb-item>
        <el-breadcrumb-item>商户详情</el-breadcrumb-item>
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
            <el-input :placeholder="placeholder" v-model="keywords" style="width: 30%;">
              <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:130px">
                <el-option label="商户ID" value="code"></el-option>
                <el-option label="商户名称" value="name"></el-option>
                <el-option label="费率" value="bailPercentage"></el-option>
                <el-option label="客服联系方式" value="csrTel"></el-option>
                <el-option label="同步异步地址" value="proxyUrl"></el-option>
              </el-select>
              <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
            </el-input>
        </el-form>
      </el-col>

      <!-- 商户列表-->
      <el-table :data="stores"
                style="width: 100%"
                height="680"
                ref="table"
                :default-sort = "{prop: 'bailPercentage', order: 'descending'}"
                @selection-change="tableSelectionChange">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="code">
                <span>{{ props.row.code }}</span>
              </el-form-item>
              <el-form-item label="key">
                <span>{{ props.row.key }}</span>
              </el-form-item>
              <el-form-item label="secret">
                <span>{{ props.row.secret }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商户名" align="center"></el-table-column>
        <el-table-column prop="channelType" label="通道类型" align="center"></el-table-column>
        <el-table-column prop="bailPercentage" sortable label="费率" align="center"></el-table-column>
        <el-table-column prop="quota" sortable label="剩余交易额度" align="center"></el-table-column>
        <el-table-column prop="todayTradeAmount" sortable label="今日交易额度" align="center"></el-table-column>
        <el-table-column prop="quota" sortable label="昨日交易额度" align="center"></el-table-column>
        <el-table-column prop="quota" sortable label="最近一笔充值" align="center"></el-table-column>
        <el-table-column prop="dailyLimit" sortable label="日交易额上限" align="center"></el-table-column>
        <el-table-column label="查看参数" align="center">
          <template slot-scope="scope">
            <el-button @click="view(scope.row)" type="text" size="small">查看</el-button>
          </template>
        </el-table-column>




        
        <!-- 权限-->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button class="handle"
              size="mini" type="info" plain
              @click="setCurrent(scope.row)">编辑
            </el-button>
            <el-button class="handle"
              size="mini" type="danger" plain
              @click="IncreaseQuota(scope.row)">增加额度
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 更新商户信息-->
      <el-dialog title="修改商户信息" v-model="dialogUpdateVisible" :visible.sync="dialogUpdateVisible" :close-on-click-modal="false">
        <el-form id="#update" :model="update" :rules="updateRules" ref="update" label-width="120px">
          <el-form-item label="商户名称" prop="name">
            <el-input v-model="update.name"></el-input>
          </el-form-item>
          <el-form-item label="费率" prop="bailPercentage">
            <el-input v-model="update.bailPercentage"></el-input>
          </el-form-item>
          <el-form-item label="日限额" prop="dailyLimit">
            <el-input v-model="update.dailyLimit"></el-input>
          </el-form-item>
          <el-form-item label="客服联系方式" prop="csrTel">
            <el-input v-model="update.csrTel"></el-input>
          </el-form-item>
          <el-form-item label="异步通知地址" prop="proxyUrl">
            <el-input v-model="update.proxyUrl"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogUpdateVisible = false">取 消</el-button>
          <el-button type="primary" :loading="updateLoading" @click="updateStore">确 定</el-button>
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
    "code":"请输入商户ID",
    "csrTel":"请输入客服联系方式",
    "proxyUrl":"请输入异步通知地址",
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
        agentsInfo:{},
        stores: [],
        update:{
          name: '',
          appId: '',
          bailPercentage: '',
          code: '',
          csrTel: '',
          proxyUrl: '',
          dailyLimit: ''
        },
        steps: {
          active: 0,
          finishStatus: 'success'
        },
        createStore: {
          name: '',
          channelType: '',
          bailPercentage: '',
          code: '',
          csrTel: '',
          adminName: '',
          agentId: ''
        },
        createAdmin: {
          account: '',
          password: '123456',
          name: '',
          agentId: '',
          storeId: '',
          role: ''
        },
        createChannel: {
          extStoreId: "",
          extStoreName: "",
          paymentGateway: "",
          chinaUmsProps: {
            tid: "",
            msgSrcId: "",
            msgSrc: "",
            signKey: ""
          },
          InstMid: ""
        },
        tempStoresInfo:{},
        formEdit: {
          account: '',
          password: '',
          name: '',
          role: ''
        },
        createAdminRules: {
          account: [
            { required: true, message: '请输入账号', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
          ],
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          role: [
            { required: true, message: '请选择权限', trigger: 'blur' },
          ]
        },
        createStoreRules: {
          name: [
            { required: true, message: '请输入商户名称', trigger: 'blur' },
          ],
          channelType: [
            { required: true, message: '请输入通道类型', trigger: 'blur' },
          ],
          bailPercentage: [
            { required: true, message: '请输入费率', trigger: 'blur' },
          ],
          csrTel: [
            { required: true, message: '请输入客服联系方式', trigger: 'blur' },
          ],
          adminName: [
            { required: true, message: '请输入管理员姓名', trigger: 'blur' },
          ]
        },
        createChannelRules: {
          extStoreId: [
            { required: true, message: '请输入通道ID', trigger: 'blur' },
          ],
          extStoreName: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          paymentGateway: [
            { required: true, message: '请输入通道类型', trigger: 'blur' },
          ],
          tid: [
            { required: true, message: '请输入终端号', trigger: 'blur' },
          ],
          msgSrcId: [
            { required: true, message: '请输入消息源ID', trigger: 'blur' },
          ],
          msgSrc: [
            { required: true, message: '请输入消息源', trigger: 'blur' },
          ],
          signKey: [
            { required: true, message: '请输入消息源', trigger: 'blur' },
          ],
          agent: [
            { required: true, message: '请输入代理商', trigger: 'blur' },
          ]
        },
        updateRules: {
          name: [
            { required: true, message: '请输入商户名称', trigger: 'blur' },
          ],
          bailPercentage: [
            { required: true, message: '请输入费率', trigger: 'blur' },
          ],
          csrTel: [
            { required: true, message: '请输入客服联系方式', trigger: 'blur' },
          ],
          proxyUrl: [
            { required: true, message: '请输入异步通知地址', trigger: 'blur' },
          ],
          dailyLimit: [
            { required: true, message: '请输入日限额', trigger: 'blur' },
            { pattern:/^[0-9]*$/, message: '日限额为数字'}
          ],
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
        dialogUpdateVisible: false, //修改对话框的显示状态
        dialogChangePwdVisible: false,
        createLoading: false,
        updateLoading: false,
        placeholder:placeholders["name"]
      };
    },
    mounted: function() {
      this.agentsInfo = JSON.parse(sessionStorage.getItem('agentsInfo'));
      console.log(this.agentsInfo);
      if(this.createAdmin.agentId === ''){
        this.tempStoresInfo = JSON.parse(sessionStorage.getItem('storesInfo'));
        console.log(this.tempStoresInfo);
      }

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
        this.getStores();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        this.getStores();
      },
      // 重置
      reset() {
        this.steps.active = 0;
      },
      //获取商户列表
      getStores() {
        this.loading = true;
        this.$http.get(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores`).then(res => {
          if(res.data.data){
            res.data.data.forEach(val =>{
              if(val.channelType === 'WECHAT'){
                val.channelType = '微信公众号'
              }
              if(val.channelType === 'ALIPAY'){
                val.channelType = '支付宝'
              }
              if(val.channelType === 'BANK'){
                val.channelType = '银联快捷'
              }
              val.bailPercentage += '%';
              val.quota += '元';
              val.todayTradeAmount += '元';
              val.dailyLimit += '元';
            });
            this.stores = res.data.data;
          }
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
      view(row){
        this.$refs.table.toggleRowExpansion(row);
      },
      // 新增商户
      /*onChange() {
        let storesInfo = JSON.parse(sessionStorage.getItem('storesInfo'));
        this.tempStoresInfo = storesInfo.filter(info => {
          if(this.formCreate.agentId === info[3]){
            return info;
          }
        });
        console.log(this.tempStoresInfo);
      },*/
      next(){
        if(this.steps.active === 0){
          this.handleCreateStore();
          return true
        }
        if(this.steps.active === 1){
          this.handleCreateAdmin();
          return true
        }
        if(this.steps.active === 2){
          this.handleCreateChannel()
        }
      },
      setCurrent(row){
        console.log(row);
        this.update.id=row.id;
        this.update.name=row.name;
        this.update.bailPercentage=row.bailPercentage;
        this.update.code=row.code;
        this.update.csrTel=row.csrTel;
        this.update.proxyUrl=row.proxyUrl;
        this.update.dailyLimit=row.dailyLimit;
        this.dialogUpdateVisible=true;
      },
      //修改商户信息
      updateStore(){
        this.$refs.update.validate((valid) => {
          if (valid) {
            this.updateLoading=true;
            this.$http.patch(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores/${this.update.id}`,this.update).then(res => {
              this.$message.success('修改商户信息成功！');
              this.dialogUpdateVisible = false;
              this.updateLoading = false;
              this.getStores();
            }).catch(() =>{
              this.$message.error('修改商户信息失败！');
              this.dialogUpdateVisible = false;
              this.updateLoading = false;
            })
          }
          else {
            return false;
          }
        });
      },
      handleChangePwd() {
        this.dialogChangePwdVisible=true;
      },
      //查看商户通道列表
      viewChannel(row){
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
  .handle{
    margin: 5px auto;
  }
</style>
