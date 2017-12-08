<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>通道管理</el-breadcrumb-item>
        <el-breadcrumb-item>通道列表</el-breadcrumb-item>
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
            <el-button type="primary" icon="el-icon-plus" @click="dialogCreateVisible = true">添加</el-button>
        </el-form>
      </el-col>

      <!-- 通道列表-->
      <el-table :data="channels"
                style="width: 100%"
                height="680"
                :default-sort = "{prop: 'updateDate', order: 'descending'}"
                @selection-change="tableSelectionChange">
        <el-table-column prop="extStoreId" label="通道ID"></el-table-column>
        <el-table-column prop="extStoreName" label="通道名称"></el-table-column>
        <el-table-column prop="paymentGateway" label="通道类型"></el-table-column>
        <el-table-column sortable prop="updateDate" label="末次使用时间"></el-table-column>
        <el-table-column label="操作">
             <template slot-scope="scope">
               <el-button
                 size="mini"
                 type="danger"
                 @click="removeChannel(scope.$index, scope.row)">删除</el-button>
             </template>
         </el-table-column>
      </el-table>

      <!-- 新增通道-->
      <el-dialog title="新增通道" center v-model="dialogCreateVisible" :visible.sync="dialogCreateVisible" :close-on-click-modal="false" @close="reset" >
        <el-form id="#create" :model="create" :rules="rules" ref="create" label-width="100px">
          <el-form-item label="通道ID" prop="extStoreId">
            <el-input v-model="create.extStoreId"></el-input>
          </el-form-item>
          <el-form-item label="通道名称" prop="extStoreName">
            <el-input v-model="create.extStoreName"></el-input>
          </el-form-item>
          <el-form-item label="通道类型" prop="paymentGateway">
            <el-select v-model="create.paymentGateway" placeholder="请选择通道类型">
              <el-option label="银商H5" value="CHINAUMSH5"></el-option>
              <el-option label="银商APP" value="CHINAUMSAPP"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="create.paymentGateway === 'CHINAUMSH5'||create.paymentGateway === 'CHINAUMSAPP'">
            <el-form-item label="终端号" prop="tid">
              <el-input v-model="create.chinaUmsProps.tid"></el-input>
            </el-form-item>
            <el-form-item label="消息源ID" prop="msgSrcId">
              <el-input v-model="create.chinaUmsProps.msgSrcId"></el-input>
            </el-form-item>
            <el-form-item label="消息源" prop="msgSrc">
              <el-input v-model="create.chinaUmsProps.msgSrc"></el-input>
            </el-form-item>
          </template>
          <el-form-item label="代理商" prop="agent">
            <el-select v-model="create.agent" placeholder="请选择代理商">
              <el-option
                v-for="item in agentsInfo"
                :key="item[0]"
                :label="item[3]"
                :value="item[0]">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogCreateVisible = false">取 消</el-button>
          <el-button type="primary" :loading="createLoading" @click="createChannel">确 定</el-button>
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
          name:''
        },
        agentsInfo:{},
        channels: [],
        create: {
          extStoreId: "",
          extStoreName: "",
          paymentGateway: "",
          chinaUmsProps:{
            tid: "",
            msgSrcId: "",
            msgSrc: ""
          },
          agent: ""
        },
        currentId:'',
        update:{
          extStoreId: "",
          extStoreName: "",
          paymentGateway: "",
          updateDate: ""
        },
        rules: {
          extStoreId: [
            { required: true, message: '请输入通道ID', trigger: 'blur' },
            { pattern:/^[0-9]*$/, message: 'ID为数字'}
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
          agent: [
            { required: true, message: '请输入代理商', trigger: 'blur' },
          ]
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
        loading: true,
        selected: [], //已选择项
        dialogCreateVisible: false, //创建对话框的显示状态
        dialogUpdateVisible: false, //编辑对话框的显示状态
        createLoading: false,
        updateLoading: false,
        placeholder:placeholders["extStoreId"]
      };
    },
    mounted: function() {
      this.agentsInfo = JSON.parse(sessionStorage.getItem('agentsInfo'));
      let userInfo = sessionStorage.getItem('access-user');
      if (userInfo) {
        userInfo = JSON.parse(userInfo);
        this.userInfo.id = userInfo.id;
        this.userInfo.account = userInfo.account;
        this.userInfo.name = userInfo.name;
      }
      this.getChannels()
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
        this.$http.get(`http://106.14.47.193/xpay/admin/${this.userInfo.id}/channels`).then(res => {
          if(res.data.data){
            this.channels = res.data.data;
          }
          //查询
          //console.log(this.select);
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
        }).catch(e => {
          console.log(e)
        })
      },

      // 新增通道
      createChannel(){
        this.$refs.create.validate((valid) => {
          if (valid) {
            this.createLoading = true;
            this.$http.put(`http://106.14.47.193/xpay/admin/${this.userInfo.id}/channels`).then(res => {
              console.log(res);
              this.$message.success('创建通道成功！');
              this.dialogCreateVisible = false;
              this.createLoading = false;
              this.reset();
              this.getChannels();
            }).catch(() =>{
              this.$message.error('创建通道失败！');
              this.reset();
              this.createLoading = false;
            })
          }
          else {
            return false;
          }
        });
      },

      // 删除单个通道
      removeChannel(index,row) {
              console.log(index, row);
              this.$confirm('此操作将删除通道 ' + row.extStoreName + ', 是否继续?', '提示', { type: 'warning' })
                .then(() => {
                  // 向请求服务端删除
                  let channelId = row.id  ;
                  this.$http.delete(`http://106.14.47.193/xpay/admin/10/${this.userInfo.id}/${channelId}`).then(() => {
                      this.$message.success('成功删除了通道' + row.extStoreName + '!');
                      this.getChannels();
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
  .btn-edit{
    float: right;
  }

</style>
