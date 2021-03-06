<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>商户管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/store/storeAdmins' }">商户管理员列表</el-breadcrumb-item>
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
            <el-input :placeholder="placeholder" v-model="keywords" style="width: 400px;" @keyup.enter.native="getStores">
              <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:110px">
                <el-option label="商户名" value="name"></el-option>
                <el-option label="通道类型" value="channelType"></el-option>
                <el-option label="费率" value="bailPercentage"></el-option>
              </el-select>
              <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
            </el-input>
            <template v-if="userInfo.role === 'ADMIN'">
              <el-button type="info" plain icon="el-icon-plus" @click="dialogCreateStoreVisible = true">添加</el-button>
              <el-button type="info" plain icon="el-icon-plus" @click="dialogCreateChannelVisible = true">创建通道</el-button>
            </template>
        </el-form>
      </el-col>

      <!-- 商户列表-->
      <el-table :data="stores"
                style="width: 100%"
                height="680"
                ref="table">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="right" inline class="demo-table-expand">
              <el-form-item label="storeId">
                <span>{{ props.row.code }}</span>
              </el-form-item>
              <el-form-item label="appKey">
                <template v-if="props.row.app">
                  <span>{{ props.row.app.key }}</span>
                </template>
              </el-form-item>
              <el-form-item label="appSecret">
                <template v-if="props.row.app">
                  <span>{{ props.row.app.secret }}</span>
                </template>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="paymentGateway" label="网关类型" align="center"></el-table-column>
        <el-table-column prop="channelType" label="通道类型" align="center"></el-table-column>
        <el-table-column prop="name" label="商户名" align="center">
          <template slot-scope="scope">
            <el-button @click="viewGood(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="bailPercentage" sortable label="费率" align="center"></el-table-column>
        <el-table-column prop="quota" sortable label="剩余交易额度" align="center"></el-table-column>
        <el-table-column prop="todayTradeAmount" sortable label="今日交易额" align="center"></el-table-column>
        <el-table-column prop="dailyLimit" sortable label="日交易额上限" align="center"></el-table-column>
        <el-table-column prop="notifyUrl" label="通知地址" align="center"></el-table-column>
        <el-table-column prop="returnUrl" label="回调地址" align="center"></el-table-column>
        <el-table-column label="对接参数" align="center">
          <template slot-scope="scope">
            <el-button @click="view(scope.row)" type="text" size="small">查看</el-button>
          </template>
        </el-table-column>
        <template v-if="this.userInfo.role === 'ADMIN'">
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button class="handle"
                         size="mini" type="info" plain
                         @click="setCurrent(scope.row)">编辑
              </el-button>
              <el-button class="handle"
                         size="mini" type="primary" plain
                         @click="increaseQuota(scope.row)">增加额度
              </el-button>
              <el-button class="handle"
                         size="mini" type="danger" plain
                         @click="setCurrentStoreId(scope.row)">绑定通道
              </el-button>
            </template>
          </el-table-column>
        </template>
        <el-table-column label="商户池" align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.channels">
            </template>
            <template v-else>
              <el-tooltip :content="'Switch state: ' + stores[scope.$index].state" placement="top">
                <el-switch
                  v-model="stores[scope.$index].state"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  active-text="in"
                  inactive-text="out"
                  active-value="in"
                  inactive-value="out"
                  @change="switchState(scope.row)">
                </el-switch>
              </el-tooltip>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="创建商户" center v-model="dialogCreateStoreVisible" :visible.sync="dialogCreateStoreVisible" @close="resetCreateStore">
        <el-form id="#createStore" :model="createStore" :rules="createStoreRules" ref="createStore" label-width="120px">
          <el-form-item label="商户名" prop="name">
            <el-input v-model="createStore.name"></el-input>
          </el-form-item>
          <el-form-item label="费率" prop="bailPercentage">
            <el-input v-model="createStore.bailPercentage">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="通知地址" prop="notifyUrl">
            <el-input v-model="createStore.notifyUrl"></el-input>
          </el-form-item>
          <el-form-item label="回调地址" prop="returnUrl">
            <el-input v-model="createStore.returnUrl"></el-input>
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

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button plain @click="dialogCreateStoreVisible = false">取 消</el-button>
          <el-button type="primary" plain :loading="createLoading" @click="handleCreateStore">提交</el-button>
        </div>
      </el-dialog>

      <!-- 更新商户信息-->
      <el-dialog title="修改账户信息" center v-model="dialogUpdateVisible" :visible.sync="dialogUpdateVisible" @close="resetUpdate">
        <el-form id="#update" :model="update" :rules="updateRules" ref="update" label-width="120px">
          <el-form-item label="商户名" prop="name">
            <el-input v-model="update.name"></el-input>
          </el-form-item>
          <el-form-item label="费率" prop="bailPercentage">
            <el-input v-model="update.bailPercentage">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="通知地址" prop="notifyUrl">
            <el-input v-model="update.notifyUrl"></el-input>
          </el-form-item>
          <el-form-item label="回调地址" prop="returnUrl">
            <el-input v-model="update.returnUrl"></el-input>
          </el-form-item>
          <template v-if="update.paymentGateway === 'CHINAUMSH5'||update.paymentGateway === 'CHINAUMSAPP'">
            <el-form-item label="日限额" prop="dailyLimit">
              <el-input v-model="update.dailyLimit">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </template>
          <el-form-item label="客服联系方式" prop="csrTel">
            <el-input v-model="update.csrTel"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogUpdateVisible = false">取 消</el-button>
          <el-button type="primary" :loading="updateLoading" @click="updateStore">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 增加额度-->
      <el-dialog title="增加商户额度" center v-model="dialogIncreaseVisible" :visible.sync="dialogIncreaseVisible" width="30%">
        <el-form ref="formIncrease" :model="formIncrease" label-width="80px">
          <el-form-item label="增加额度">
            <el-input-number v-model="formIncrease.amount" :min="100" :step="100"></el-input-number>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogIncreaseVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleIncreaseQuota">增加额度</el-button>
        </div>
      </el-dialog>

      <!-- 添加通道-->
      <el-dialog title="添加通道" center v-model="dialogCreateChannelVisible" :visible.sync="dialogCreateChannelVisible" @close="resetCreateChannel">
        <el-form id="#createChannel" :model="createChannel" :rules="createChannelRules" ref="createChannel" label-width="120px">
          <el-form-item label="通道ID" prop="extStoreId">
            <el-input v-model="createChannel.extStoreId" placeholder="商户号,账户号,MD5证书"></el-input>
          </el-form-item>
          <el-form-item label="通道名称" prop="extStoreName">
            <el-input v-model="createChannel.extStoreName"></el-input>
          </el-form-item>
          <el-form-item label="支付网关类型" prop="paymentGateway">
            <el-select v-model="createChannel.paymentGateway" placeholder="请选择支付网关类型">
              <el-option label="环迅扫码" value="IPSSCAN"></el-option>
              <el-option label="环迅快捷" value="IPSQUICK"></el-option>
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
            <el-form-item label="机构号" prop="InstMid">
              <el-input v-model="createChannel.InstMid"></el-input>
            </el-form-item>
          </template>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogCreateChannelVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleCreateChannel">提交</el-button>
        </div>
      </el-dialog>

      <el-dialog title="绑定通道" center v-model="dialogBindChannelVisible" :visible.sync="dialogBindChannelVisible" @close="resetBindChannel" width="30%">
        <el-form id="#bindChannel" :model="bindChannel" ref="bindChannel" label-width="80px">
          <el-form-item label="选择通道">
            <el-select v-model="bindChannel.channels" multiple placeholder="请选择通道">
              <el-option
                v-for="item in channelList"
                :key="item.id"
                :label="item.extStoreName"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogBindChannelVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleBindChannel">提交</el-button>
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
    "name":"商户名",
    "bailPercentage":"请输入费率",
    "channelType":"通道类型",
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
        agentsInfo:{},
        storePool: [],
        stores: [],
        channelList:[],
        update:{
          name: '',
          bailPercentage: '',
          csrTel: '（投诉电话:,客服微信:）',
          notifyUrl: '',
          returnUrl: ''
        },
        createStore: {
          name: '',
          bailPercentage: '',
          appId: '',
          agentId: '',
          notifyUrl: '',
          returnUrl: '',
          channelType: ''
        },
        createChannel: {
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
        currentStoreId: '',
        bindChannel: {
          channels: []
        },
        formEdit: {
          account: '',
          password: '',
          name: '',
          role: ''
        },
        formIncrease: {
          amount: '',
          transaction_type: 'FREE'
        },
        storeId: '',
        createStoreRules: {
          name: [
            { required: true, message: '请输入商户名称', trigger: 'blur' },
          ],
          bailPercentage: [
            { required: true, message: '请输入费率', trigger: 'blur' },
          ],
          notifyUrl: [
            { required: true, message: '请输入通知地址', trigger: 'blur' },
          ],
          returnUrl: [
            { required: true, message: '请输入回调地址', trigger: 'blur' },
          ],
          channelType: [
            { required: true, message: '请输入通道类型', trigger: 'blur' },
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
          ]
        },
        updateRules: {
          name: [
            { required: true, message: '请输入商户名称', trigger: 'blur' },
          ],
          csrTel: [
            { required: true, message: '请输入客服联系方式', trigger: 'blur' },
          ],
          notifyUrl: [
            { required: true, message: '请输入通知地址', trigger: 'blur' },
          ],
          returnUrl: [
            { required: true, message: '请输入回调地址', trigger: 'blur' },
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
          notifyUrl: ''
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'name', //搜索框的搜索字段
        loading: true,
        dialogCreateStoreVisible: false,
        dialogCreateChannelVisible: false,
        dialogBindChannelVisible: false,
        dialogIncreaseVisible: false,
        dialogUpdateVisible: false,
        createLoading: false,
        updateLoading: false,
        placeholder:placeholders["name"],
        storeState: [],
      };
    },
    mounted: function() {
      this.adminId = sessionStorage.getItem('currentAdminId');
      this.createStore.appId = sessionStorage.getItem('currentAppId');
      this.createStore.agentId = sessionStorage.getItem('currentAgentId');
      this.createStore.adminId = sessionStorage.getItem('currentAdminId');
      let userInfo = JSON.parse(sessionStorage.getItem('access-user'));
      this.$http.get(`/xpay/admin/${userInfo.id}/channels`).then(res=> {
        this.channelList = res.data.data;
      });
      if (userInfo) {
        this.userInfo.id = userInfo.id;
        this.userInfo.account = userInfo.account;
        this.userInfo.name = userInfo.name;
        this.userInfo.role = userInfo.role;
      }
      this.getStores();
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
      resetUpdate() {
        this.$refs.update.resetFields();
      },
      resetCreateChannel() {
        this.$refs.createChannel.resetFields();
      },
      resetBindChannel(){
        this.bindChannel.channels = [];
      },
      //获取商户列表
      getStores() {
        this.loading = true;
        this.$http.get(`/xpay/admin/${this.adminId}/store_pool`).then(res=>{
          this.storePool = [];
          let storePool = res.data.data;
          if(storePool){
            storePool.forEach(store=> {
              this.storePool.push(store.extStoreName);
            });
          }

          this.$http.get(`/xpay/admin/${this.adminId}/stores`).then(res => {
            if(res.data.data.constructor !== Array){
              this.stores = [];
              this.stores.push(res.data.data);
            }
            else this.stores = res.data.data;
            this.stores.forEach(val =>{
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
              val.quota -= val.todayTradeAmount;
              val.quota += '元';
              val.todayTradeAmount += '元';
              val.dailyLimit += '元';
              if(val.channels){
                if(val.channels[0].paymentGateway === 'IPSQUICK'){
                  val.dailyLimit = '不限';
                  val.quota = '不限';
                }
                val.paymentGateway = val.channels[0].paymentGateway;
              }
              else {
                val.paymentGateway = 'No Channel'
              }
              if(this.storePool.includes(val.name)){
                val.state = 'in'
              }
              else {
                val.state = 'out'
              }
            });
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
        });
      },
      view(row){
        this.$refs.table.toggleRowExpansion(row);
      },
      handleCreateStore(){
        this.$refs.createStore.validate((valid) => {
          if (valid) {
            this.createLoading=true;
            this.createStore.appId = sessionStorage.getItem('currentAppId');
            this.createStore.agentId = sessionStorage.getItem('currentAgentId');
            this.createStore.adminId = sessionStorage.getItem('currentAdminId');
            this.$http.put(`http://www.zmpay.xyz/xpay/admin/${this.userInfo.id}/stores`,this.createStore).then(() => {
              this.$message.success('创建商户成功！');
              this.resetCreateStore();
              this.getStores();
              this.createLoading=false;
              this.dialogCreateStoreVisible = false;
            }).catch(() => {
              this.$message.error('创建商户失败！');
              this.resetCreateStore();
            })
          }
          else {
            return false;
          }
        })
      },
      setCurrent(row){
        this.update.id=row.id;
        this.update.name=row.name;
        if(row.csrTel){
          this.update.csrTel=row.csrTel;
        }
        this.update.notifyUrl= row.notifyUrl;
        this.update.returnUrl= row.returnUrl;
        this.update.bailPercentage = parseFloat(row.bailPercentage);
        if(row.channels){
          this.update.paymentGateway = row.paymentGateway;
        }
        this.dialogUpdateVisible=true;
      },
      //修改商户信息
      updateStore(){
        this.$refs.update.validate((valid) => {
          if (valid) {
            this.updateLoading=true;
            this.$http.patch(`/xpay/admin/${this.userInfo.id}/stores/${this.update.id}`,this.update).then(res => {
              this.$message.success('修改商户信息成功！');
              this.dialogUpdateVisible = false;
              this.updateLoading = false;
              this.resetUpdate();
              this.getStores();
            }).catch(() =>{
              this.$message.error('修改商户信息失败！');
              this.resetUpdate();
              this.dialogUpdateVisible = false;
              this.updateLoading = false;
            })
          }
          else {
            return false;
          }
        });
      },
      increaseQuota(row) {
        this.storeId = row.id;
        this.dialogIncreaseVisible = true;
      },
      handleIncreaseQuota(){
        let id = this.userInfo.id;
        let storeId = this.storeId;
        this.$http.post(`/xpay/admin/${id}/stores/${storeId}/quota`,this.formIncrease).then(() => {
          this.$message.success('增加额度成功！');
          this.dialogIncreaseVisible = false;
          this.getStores();
        }).catch(() => {
          this.$message.error('增加额度失败！');
        })
      },
      handleCreateChannel(){
        this.$refs.createChannel.validate((valid) => {
          if (valid) {
            this.createLoading = true;
            this.$http.put(`/xpay/admin/${this.userInfo.id}/channels`,this.create).then(res => {
              console.log(res);
              this.$message.success('新增通道成功！');
              this.dialogCreateVisible = false;
              this.createLoading = false;
              resetCreateChannel();
              this.getChannels();
            })
          }
          else {
            return false;
          }
        });
      },
      setCurrentStoreId(row) {
        this.dialogBindChannelVisible = true;
        this.currentStoreId = row.id;
      },
      handleBindChannel(){
        this.$http.patch(`/xpay/admin/${this.userInfo.id}/stores/${this.currentStoreId}/channels`,this.bindChannel).then(()=>{
          this.$message.success('绑定成功!');
          this.resetBindChannel();
        }).catch(()=>{
          this.$message.error('绑定失败!');
          this.resetBindChannel();
        })
      },
      switchState(row){
        this.$http.get(`/xpay/admin/${row.admin.id}/stores/${row.id}/goods`).then(res=>{
          let goodsList = res.data.data;
          let param = {
            extStoreId: res.data.data[0].extStoreId,
            extStoreName: row.name
          };

          if(row.state === 'in'){
            this.$http.put(`/xpay/admin/${row.admin.id}/store_pool/`,param).then(() => {
              goodsList.map(good=>{
                let storeParam = {
                  name: good.name,
                  amount: good.amount,
                  extGoodsList: good.extGoodsList
                };
                this.$http.post(`/xpay/admin/${row.admin.id}/store_pool/${param.extStoreId}/goods`,storeParam)
              });
            }).then(()=>{
              this.$message.success('添加成功！');
              this.getStores();
            }).catch(() => {
              this.$message.error('添加失败！');
              this.getStores();
            })
          }

          if(row.state === 'out'){
            this.$http.delete(`/xpay/admin/${row.admin.id}/store_pool/${param.extStoreId}`).then(()=>{
              this.$message.success('删除成功!');
              this.getStores();
            }).catch(()=>{
              this.$message.error('删除失败!');
              this.getStores();
            })
          }

        }).catch(()=>{
          this.$message.error('操作失败!');
          this.getStores();
        })
      },
      viewGood(row){
        if(row.channels){
          sessionStorage.setItem('currentStoreId', JSON.stringify(row.id));
          sessionStorage.setItem('channelData', JSON.stringify(row.channels));
          this.$router.push({ path: '/store/storeChannels' });
        }
        else {
          if(row.id){
            sessionStorage.setItem('currentAdminId',row.admin.id);
            sessionStorage.setItem('currentStoreId',row.id);
            this.$router.push({ path: '/store/Goods' });
          }
        }
      }
    }
  }
</script>

<style slot-scoped>
  .paging{
    text-align: center;
    margin:12px 0;
  }
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 110px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 100%!important;
  }
  .el-dialog__body{
    margin: 0 20%;
  }
  .handle{
    margin: 8px auto;
  }
</style>
