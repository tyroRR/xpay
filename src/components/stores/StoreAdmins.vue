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
      <el-col :span="24" class="toolbar">
        <el-form :inline="true" class="demo-form-inline" >
            <el-input :placeholder="placeholder" v-model="keywords" style="width: 400px;" @keyup.enter.native="getStores">
              <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:118px">
                <el-option label="商户名" value="name"></el-option>
                <el-option label="管理员账号" value="account"></el-option>
              </el-select>
              <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
            </el-input>
          <template v-if="userInfo.role === 'ADMIN'">
            <el-button type="info" plain icon="el-icon-plus" @click="dialogCreateVisible = true">创建商户</el-button>
          </template>
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
              <el-form-item label="密码：">
                <span>{{ props.row.admin.password }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商户名" align="center">
          <template slot-scope="scope">
            <el-button @click="viewDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="admin.account" label="管理员账号" align="center"></el-table-column>
        <el-table-column prop="admin.password" label="管理员密码" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini" type="info" plain
              @click="viewPwd(scope.row)">查看密码
            </el-button>
          </template>
        </el-table-column>
        <!--<el-table-column label="商户通道" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini" type="info" plain
              @click="viewChannel(scope.row)">查看
            </el-button>
          </template>
        </el-table-column>-->
        <el-table-column prop="channelType" label="已有通道类型" align="center"></el-table-column>
        <template v-if="this.userInfo.role === 'ADMIN'">
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini" type="danger" plain
                @click="handleChangePwd(scope.row)">修改密码
              </el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <template v-if="userInfo.role === 'ADMIN'">
        <!-- 创建商户-->
        <el-dialog title="创建商户" center v-model="dialogCreateVisible" :visible.sync="dialogCreateVisible" :close-on-click-modal="false" @close="reset" >
          <el-form id="#createAdmin" ref="createAdmin" :model="createAdmin" :rules="createAdminRules"  label-width="120px">
            <el-form-item prop="name" label="商户名">
              <el-input v-model="createAdmin.name"></el-input>
            </el-form-item>
            <el-form-item label="费率" prop="bailPercentage">
              <el-input v-model="createAdmin.bailPercentage">
                <template slot="append">%</template>
              </el-input>
            </el-form-item>
            <el-form-item label="代理商" prop="agentId">
              <el-select v-model="createAdmin.agentId" placeholder="请选择代理商(没有可不选)">
                <el-option
                  v-for="item in agentsInfo"
                  :key="item[0]"
                  :label="item[3]"
                  :value="item[0]">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="通道名称" prop="extStoreName">
              <el-input v-model="createAdmin.extStoreName"></el-input>
            </el-form-item>
            <el-form-item label="支付网关类型" prop="paymentGateway">
              <el-select v-model="createAdmin.paymentGateway" placeholder="请选择支付网关类型" @change="onChange">
                <el-option label="银商H5" value="CHINAUMSH5"></el-option>
                <el-option label="银商APP" value="CHINAUMSAPP"></el-option>
                <el-option label="环迅" value="IPSQUICK"></el-option>
              </el-select>
            </el-form-item>
            <template v-if="createAdmin.paymentGateway === 'CHINAUMSH5'||createAdmin.paymentGateway === 'CHINAUMSAPP'">
              <el-form-item label="通道ID" prop="extStoreId">
                <el-input v-model="createAdmin.extStoreId"></el-input>
              </el-form-item>
              <el-form-item label="终端号" prop="tid">
                <el-input v-model="createAdmin.chinaUmsProps.tid"></el-input>
              </el-form-item>
              <el-form-item label="消息源ID" prop="msgSrcId">
                <el-input v-model="createAdmin.chinaUmsProps.msgSrcId"></el-input>
              </el-form-item>
              <el-form-item label="消息源" prop="msgSrc">
                <el-input v-model="createAdmin.chinaUmsProps.msgSrc"></el-input>
              </el-form-item>
              <el-form-item label="签名秘钥" prop="signKey">
                <el-input v-model="createAdmin.chinaUmsProps.signKey"></el-input>
              </el-form-item>
              <el-form-item label="机构号" prop="InstMid">
                <el-input v-model="createAdmin.chinaUmsProps.InstMid"></el-input>
              </el-form-item>
            </template>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogCreateVisible = false">取 消</el-button>
            <el-button type="primary" plain :loading="createLoading" @click="handleCreateAdmin">提交</el-button>
          </div>
        </el-dialog>

        <el-dialog title="修改密码" v-model="dialogChangePwdVisible" :visible.sync="dialogChangePwdVisible" :close-on-click-modal="false">
          <el-form ref="formEdit" :model="formEdit" label-width="100px">
            <el-form-item label="商户名">
              <el-input v-model="formEdit.name" disabled></el-input>
            </el-form-item>
            <el-form-item prop="account" label="账号">
              <el-input v-model="formEdit.account" disabled></el-input>
            </el-form-item>
            <el-form-item prop="password" label="密码">
              <el-input v-model="formEdit.password"></el-input>
            </el-form-item>
            <el-form-item prop="role" label="权限">
              <el-select v-model="formEdit.role" placeholder="请选择用户权限">
                <el-option label="代理商" value="AGENT"></el-option>
                <el-option label="商户管理员" value="STORE"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogChangePwdVisible = false">取 消</el-button>
            <el-button type="primary" plain :loading="createLoading" @click="changePwd">提交</el-button>
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
    "adminId":"管理员ID",
    "adminName":"管理员姓名",
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
        createAdmin: {
          name: '',
          bailPercentage: '',
          dailyLimit: '',
          quota: '',
          agentId: "",
          extStoreId: "",
          extStoreName: "",
          paymentGateway: "",
          chinaUmsProps: {
            tid: "",
            msgSrcId: "",
            msgSrc: "",
            signKey: "",
            InstMid: ""
          },

        },
        tempStoresInfo:{},
        formEdit: {
          account: '',
          password: '',
          name: '',
          role: 'STORE'
        },
        createAdminRules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          bailPercentage: [
            { required: true, message: '请输入费率', trigger: 'blur' },
          ],
          extStoreId: [
            { required: true, message: '请输入通道ID'},
          ],
          extStoreName: [
            { required: true, message: '请输入通道名称', trigger: 'blur' },
          ],
          paymentGateway: [
            { required: true, message: '请选择支付网关类型', trigger: 'blur' },
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

      this.getStores();
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
      init() {
        this.steps.active = 0;
      },
      reset() {
        this.$refs.createAdmin.resetFields();
      },
      onChange(){
        this.createAdmin.channelId = 2253;
        this.createAdmin.dailyLimit = 10000000;
        this.createAdmin.quota = 10000000
      },
      //获取商户列表
      getStores() {
        this.loading = true;
        this.$http.get(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores`).then(res => {
          if (res.data.data) {
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
          this.filter.beginIndex = (this.filter.currentPage-1)*this.filter.pageSize;
          this.stores = queryData.splice(this.filter.beginIndex,this.filter.pageSize);
          this.loading = false;
          this.selected.splice(0,this.selected.length);
        })
      },
      viewPwd(row){
        this.$refs.table.toggleRowExpansion(row);
      },
      viewDetail(row){
        if(row.id){
          sessionStorage.setItem('currentId',row.id);
        }
        if(row.app){
          sessionStorage.setItem('currentAppId',row.app.id);
        }
        if(row.agent){
          sessionStorage.setItem('currentAgentId',row.agent.id);
        }
        if(row.admin){
          sessionStorage.setItem('currentAdminId',row.admin.id);
        }
        sessionStorage.setItem('details',JSON.stringify(row));
        this.$router.push({ path: '/store/storeDetails' });
      },
      handleCreateAdmin(){
        this.$refs.createAdmin.validate((valid) => {
          if (valid) {
            this.$http.put(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores/quick`,this.createAdmin).then(() => {
              this.$message.success('创建成功！');
              this.reset();
              this.dialogCreateVisible = false;
              this.getStores();
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
      handleChangePwd(row) {
        this.dialogChangePwdVisible = true;
        this.formEdit.name = row.name;
        this.formEdit.account = row.admin.account;
      },
      changePwd() {
        this.$http.patch(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/`,this.formEdit).then(() => {
          this.$message.success('修改成功！');
          this.$refs.formEdit.resetFields();
          this.dialogChangePwdVisible = false;
          this.getStores();
        }).catch(() => {
          this.$message.error('修改失败！');
          this.$refs.formEdit.resetFields();
        })
      },
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
