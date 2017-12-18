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
          <template v-if="userInfo.role === 'ADMIN'">
            <el-button type="info" plain icon="el-icon-plus" @click="dialogCreateVisible = true">添加</el-button>
          </template>
        </el-form>
      </el-col>

      <!-- 商户列表-->
      <el-table :data="stores"
                style="width: 100%"
                height="680"
                :default-sort = "{prop: 'bailPercentage', order: 'descending'}"
                @selection-change="tableSelectionChange">
        <el-table-column prop="name" label="商户名称"></el-table-column>
        <el-table-column prop="name" label="管理员ID"></el-table-column>
        <el-table-column prop="name" label="管理员姓名"></el-table-column>
        <el-table-column prop="name" label="管理员密码"></el-table-column>
        <el-table-column prop="name" label="通道类型"></el-table-column>
        <el-table-column label="商户通道">
          <template slot-scope="scope">
            <el-button
              size="mini" type="info" plain
              @click="viewChannel(scope.row)">查看
            </el-button>
          </template>
        </el-table-column>
        <template v-if="userInfo.role === 'ADMIN'">
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini" type="primary" plain
                @click="setCurrent(scope.row)">编辑
              </el-button>
              <el-button
                size="mini" type="danger" plain
                @click="handleChangePwd(scope.row)">修改密码
              </el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <template v-if="userInfo.role === 'ADMIN'">
        <!-- 新增商户-->
        <el-dialog title="新增商户" center v-model="dialogCreateVisible" :visible.sync="dialogCreateVisible" :close-on-click-modal="false" @close="reset" >
          <el-steps :active="steps.active" :finish-status="steps.finishStatus" align-center>
            <el-step title="步骤1" description="创建商户"></el-step>
            <el-step title="步骤2" description="创建商户管理员"></el-step>
            <el-step title="步骤3" description="创建通道"></el-step>
          </el-steps>
          <br>
          <template v-if="steps.active === 0">
            <!-- step 1-->
            <el-form id="#createStore" :model="createStore" :rules="createStoreRules" ref="createStore" label-width="120px">
              <el-form-item label="商户名称" prop="name">
                <el-input v-model="createStore.name"></el-input>
              </el-form-item>
              <el-form-item label="通道类型" prop="channelType">
                <el-select v-model="createStore.channelType" placeholder="请选择通道类型">
                  <el-option label="微信公众号" value="WECHAT"></el-option>
                  <el-option label="支付宝" value="ALIPAY"></el-option>
                  <el-option label="H5" value="H5"></el-option>
                  <el-option label="APP" value="APP"></el-option>
                  <el-option label="银联快捷" value="BANK"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="费率" prop="bailPercentage">
                <el-input v-model="createStore.bailPercentage"></el-input>
              </el-form-item>
              <el-form-item label="管理员姓名" prop="adminName">
                <el-input v-model="createStore.adminName"></el-input>
              </el-form-item>
              <el-form-item label="管理员电话" prop="csrTel">
                <el-input v-model="createStore.csrTel"></el-input>
              </el-form-item>
              <el-form-item label="代理商" prop="agent">
                <el-select v-model="createStore.agentId" placeholder="请选择代理商">
                  <el-option
                    v-for="item in agentsInfo"
                    :key="item[0]"
                    :label="item[3]"
                    :value="item[0]">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </template>
          <template v-if="steps.active === 1">
            <!-- step 2-->
            <el-form ref="createAdmin" :model="createAdmin" :rules="createAdminRules"  label-width="100px">
              <el-form-item prop="account" label="账号">
                <el-input v-model="createAdmin.account"></el-input>
              </el-form-item>
              <el-form-item prop="password" label="密码">
                <el-input type="password" v-model="createAdmin.password" placeholder="默认密码为123456"></el-input>
              </el-form-item>
              <el-form-item prop="name" label="用户名">
                <el-input v-model="createAdmin.name"></el-input>
              </el-form-item>
              <el-form-item prop="agent" label="代理商">
                <el-select v-model="createAdmin.agentId" @change="onChange" placeholder="请选择代理商">
                  <el-option
                    v-for="item in agentsInfo"
                    :key="item[0]"
                    :label="item[3]"
                    :value="item[0]">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="store" label="商户">
                <el-select v-model="createAdmin.storeId" placeholder="请选择商户">
                  <el-option
                    v-for="item in tempStoresInfo"
                    :key="item[0]"
                    :label="item[1]"
                    :value="item[0]">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="role" label="权限">
                <el-select v-model="createAdmin.role" placeholder="请选择用户权限">
                  <el-option label="代理商" value="AGENT"></el-option>
                  <el-option label="商户管理员" value="STORE"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </template>
          <template v-if="steps.active === 2">
            <!-- step 3-->
            <el-form id="#create" :model="createChannel" :rules="createChannelRules" ref="createChannel" label-width="120px">
              <el-form-item label="通道ID" prop="extStoreId">
                <el-input v-model="createChannel.extStoreId"></el-input>
              </el-form-item>
              <el-form-item label="通道名称" prop="extStoreName">
                <el-input v-model="createChannel.extStoreName"></el-input>
              </el-form-item>
              <el-form-item label="支付网关类型" prop="paymentGateway">
                <el-select v-model="createChannel.paymentGateway" placeholder="请选择支付网关类型">
                  <el-option label="银商H5" value="CHINAUMSH5"></el-option>
                  <el-option label="银商APP" value="CHINAUMSAPP"></el-option>
                  <el-option label="环迅" value="IPS"></el-option>
                </el-select>
              </el-form-item>
              <template v-if="createChannel.paymentGateway === 'CHINAUMSH5'||createChannel.paymentGateway === 'CHINAUMSAPP'">
                <el-form-item label="终端号" prop="tid">
                  <el-input v-model="createChannel.chinaUmsProps.tid"></el-input>
                </el-form-item>
                <el-form-item label="消息源ID" prop="msgSrcId">
                  <el-input v-model="createChannel.chinaUmsProps.msgSrcId"></el-input>
                </el-form-item>
                <el-form-item label="消息源" prop="msgSrc">
                  <el-input v-model="createChannel.chinaUmsProps.msgSrc"></el-input>
                </el-form-item>
                <el-form-item label="签名秘钥" prop="signKey">
                  <el-input v-model="createChannel.chinaUmsProps.signKey"></el-input>
                </el-form-item>
              </template>
              <el-form-item label="机构号" prop="InstMid">
                <el-input v-model="createChannel.InstMid"></el-input>
              </el-form-item>
              <!--<el-form-item label="代理商" prop="agent">
                <el-select v-model="createChannel.agent" placeholder="请选择代理商">
                  <el-option
                    v-for="item in agentsInfo"
                    :key="item[0]"
                    :label="item[3]"
                    :value="item[0]">
                  </el-option>
                </el-select>
              </el-form-item>-->
            </el-form>
          </template>
          <div slot="footer" class="dialog-footer">
            <el-button plain @click="dialogCreateVisible = false">取 消</el-button>
            <el-button type="primary" plain :loading="createLoading" @click="next">下一步</el-button>
          </div>
        </el-dialog>

        <!-- 修改商户信息-->
        <el-dialog title="修改商户信息" v-model="dialogUpdateVisible" :visible.sync="dialogUpdateVisible" :close-on-click-modal="false">
          <el-form id="#update" :model="update" :rules="updateRules" ref="update" label-width="120px">
            <el-form-item label="商户名称" prop="name">
              <el-input v-model="update.name"></el-input>
            </el-form-item>
            <el-form-item label="key" prop="appId">

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

        <el-dialog title="修改商户管理员信息" v-model="dialogChangePwdVisible" :visible.sync="dialogChangePwdVisible" :close-on-click-modal="false">
          <el-form ref="formEdit" :model="formEdit" label-width="100px">
            <el-form-item prop="account" label="账号">
              <el-input v-model="formEdit.account" disabled></el-input>
            </el-form-item>
            <el-form-item prop="password" label="密码">
              <el-input v-model="formEdit.password"></el-input>
            </el-form-item>
            <el-form-item label="用户名">
              <el-select v-model="formEdit.name" placeholder="请选择用户名">
              </el-select>
            </el-form-item>
            <el-form-item prop="role" label="权限">
              <el-select v-model="formEdit.role" placeholder="请选择用户权限">
                <el-option label="代理商" value="AGENT"></el-option>
                <el-option label="商户管理员" value="STORE"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">修改信息</el-button>
            </el-form-item>
          </el-form>
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
          appId: [
            { required: true, message: '请选择key'},
          ],
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
      handleCreateStore(){
        this.steps.active ++;
        /*this.$refs.createStore.validate((valid) => {
          if (valid) {
            this.createLoading = true;
            this.$http.put(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/stores`,this.createStore).then(res => {
              this.$message.success('创建商户成功！');
              this.createLoading = false;
              this.$refs.createStore.resetFields();
              this.steps.active ++;
            }).catch(() =>{
              this.$message.error('创建商户失败！');
              this.$refs.createStore.resetFields();
              this.createLoading = false;
            })
          }
          else {
            return false;
          }
        });*/
      },
      handleCreateAdmin(){
        this.steps.active ++;
        /*this.$refs.createAdmin.validate((valid) => {
          if (valid) {
            let id = JSON.parse(sessionStorage.getItem('access-user')).id;
            this.$http.put(`http://www.wfpay.xyz/xpay/admin/${id}/`,this.createAdmin).then(() => {
              this.$message.success('创建商户管理员成功！');
              this.$refs.createAdmin.resetFields();
              this.steps.active ++
            }).catch(() => {
              this.$message.error('创建商户管理员失败！');
              this.$refs.createAdmin.resetFields();
            })
          }
          else {
            return false;
          }
        })*/
      },
      handleCreateChannel(){
        /*this.$http.get(`http://www.wfpay.xyz/xpay/admin/${this.userInfo.id}/channels`).then(() => {
          this.$message.success('创建成功！');
          this.$refs.CreateChannel.resetFields();
          this.reset();
          this.dialogCreateVisible = false
        }).catch(() => {
          this.$message.error('创建失败！');
          this.$refs.CreateChannel.resetFields();
        });*/
        this.reset();
        this.dialogCreateVisible = false
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

</style>
