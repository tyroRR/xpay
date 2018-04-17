<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>商户管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/store/storeAdmins' }">商户列表</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/store/storeDetails' }">商户详情</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/store/storeChannels' }">商户通道</el-breadcrumb-item>
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
          <el-input :placeholder="placeholder" v-model="keywords" style="width: 35%">
            <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:130px">
              <el-option label="通道ID" value="extStoreId"></el-option>
              <el-option label="通道名称" value="extStoreName"></el-option>
              <el-option label="通道类型" value="paymentGateway"></el-option>
              <el-option label="末次使用时间" value="updateDate"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getChannels">查询</el-button>
          </el-input>
          <template v-if="userInfo.role === 'ADMIN'">
            <el-button type="info" plain icon="el-icon-plus" @click="dialogBindChannelVisible = true">绑定</el-button>
          </template>
        </el-form>
      </el-col>

      <!-- 通道列表-->
      <el-table :data="channels"
                style="width: 100%"
                height="680"
                :default-sort = "{prop: 'updateDate', order: 'descending'}"
                @selection-change="tableSelectionChange">
        <el-table-column prop="extStoreId" label="通道ID" align="center"></el-table-column>
        <el-table-column prop="extStoreName" label="通道名称" align="center"></el-table-column>
        <el-table-column prop="paymentGateway" label="通道类型" align="center"></el-table-column>
        <el-table-column sortable prop="updateDate" label="末次使用时间" align="center"></el-table-column>
        <template v-if="userInfo.role === 'ADMIN'">
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="danger"
                @click="removeChannel(scope.$index, scope.row)">解绑</el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <!-- 绑定通道-->
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
    "extStoreId": "请输入通道ID",
    "extStoreName": "请输入通道名称",
    "paymentGateway": "请输入通道类型",
    "updateDate": "请输入末次使用时间"
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
        channels: [],
        channelList: "",
        currentStoreId: "",
        bindChannel: {
          channels: []
        },
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          extStoreId: "",
          extStoreName: "",
          paymentGateway: "",
          updateDate: "",
        },
        totalRows: 0,
        keywords: '', //搜索框的关键字内容
        select: 'extStoreId', //搜索框的搜索字段
        loading: false,
        selected: [], //已选择项
        dialogBindChannelVisible: false,
        createLoading: false,
        placeholder:placeholders["extStoreId"]
      };
    },
    mounted: function() {
      let userInfo = JSON.parse(sessionStorage.getItem('access-user'));
      let currentStoreId = JSON.parse(sessionStorage.getItem('currentStoreId'));
      this.$http.get(`/xpay/admin/${userInfo.id}/channels`).then(res=> {
        this.channelList = res.data.data;
      });
      if(currentStoreId){
        this.currentStoreId = currentStoreId;
      }
      if (userInfo) {
        this.userInfo.id = userInfo.id;
        this.userInfo.account = userInfo.account;
        this.userInfo.name = userInfo.name;
        this.userInfo.role = userInfo.role;
      }
      this.getChannels()
    },
    destroyed: function () {
      sessionStorage.removeItem('channelData');
    },
    methods: {
      tableSelectionChange(val) {
        this.selected = val;
      },
      searchFieldChange(val) {
        this.select = val;
        console.log(this.select);
        this.placeholder = placeholders[val];
        console.log(`搜索字段： ${val} `);
      },
      pageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.filter.pageSize = val;
        this.getChannels();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        this.getChannels();
      },
      // 重置表单
      reset() {
        this.$refs.create.resetFields();
      },
      //获取通道列表
      getChannels() {
        this.loading = true;
        this.channels = JSON.parse(sessionStorage.getItem('channelData'));
        //查询
        let queryData = [];
        if(this.keywords !==""){
          for (var i=0,len=this.channels.length;i<len;i++) {
            let reg = new RegExp(this.keywords);
            if(this.channels[i][this.select].toString().match(reg)!==null){
              queryData.push(this.channels[i]);
              //console.log(queryData);
            }
          }
        }
        else queryData = this.channels;
        this.totalRows = queryData.length;
        //分页
        this.filter.beginIndex = (this.filter.currentPage-1)*10;
        this.channels = queryData.splice(this.filter.beginIndex,this.filter.pageSize);
        this.loading = false;
        this.selected.splice(0,this.selected.length);
      },
      handleBindChannel(){
        this.$http.patch(`/xpay/admin/${this.userInfo.id}/stores/${this.currentStoreId}/channels`,this.bindChannel).then(res =>{
          this.$message.success('绑定成功!');
          this.resetBindChannel();
        }).catch(()=>{
          this.$message.error('绑定失败!');
          this.resetBindChannel();
        })
      },
      resetBindChannel(){
        this.bindChannel.channels = [];
      },
      removeChannel(index,row) {
        this.$confirm('此操作将解绑通道 ' + row.extStoreName + ', 是否继续?', '提示', { type: 'warning' })
          .then(() => {
            let channelId = row.id  ;
            let channelList = JSON.parse(JSON.stringify(this.channelList));
            channelList.splice(channelList.findIndex(id => id === channelId), 1);
            this.$http.patch(`/xpay/admin/${this.userInfo.id}/stores/${this.currentStoreId}/channels`,this.bindChannel).then(() => {
              this.$message.success('成功解绑了通道' + row.extStoreName + '!');
              this.channels.splice(this.channels.findIndex(id => id === channelId), 1);
              sessionStorage.setItem('channelData', JSON.stringify(row.channels));
            })
              .catch(() => {
                this.$message.error('解绑失败!');
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
