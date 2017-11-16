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
            <el-input :placeholder="placeholder" v-model="keywords" style="width: 300px;">
              <el-select v-model="select" placeholder="请选择" @change="searchFieldChange" slot="prepend">
                <el-option label="ID" value="id"></el-option>
                <el-option label="通道名称" value="name"></el-option>
                <el-option label="通道类型" value="type"></el-option>
              </el-select>
              <el-button type="danger" class="danger" slot="append" icon="el-icon-search" @click="query"></el-button>
            </el-input>
          <el-form-item>
            <div class="btn-edit">
              <el-button type="primary" @click="dialogCreateVisible = true">添加</el-button>
              <el-button type="primary" icon="delete" :disabled="selected.length==0" @click="removeStores()"  >删除</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-col>

      <!-- 商户列表-->
      <el-table :data="stores"
                style="width: 100%"
                height="443"
                @sort-change="tableSortChange"
                @selection-change="tableSelectionChange">
        <el-table-column type="selection" width="60"></el-table-column>
        <el-table-column sortable="custom" prop="id" label="ID"></el-table-column>
        <el-table-column prop="name" label="通道名称"></el-table-column>
        <el-table-column prop="type" label="通道类型"></el-table-column>
        <el-table-column inline-template label="操作" width="250">
                            <span>
                                <el-button type="primary" size="mini" @click="removeStore(row)">删除</el-button>
                                <el-button type="primary" size="mini" @click="setCurrent(row)">编辑</el-button>
                            </span>
        </el-table-column>
      </el-table>

      <!--分页begin-->
      <el-pagination class="paging"
                     :current-page="filter.page"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="filter.per_page"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total_rows"
                     @size-change="pageSizeChange"
                     @current-change="pageCurrentChange">
      </el-pagination>
      <!--分页end-->

    </el-col>



  </el-row>
</template>

<script>
  import {reqGetStores} from '../../api/api';

  var placeholders={"id":"请输入查找ID","name":"请输入查找通道名称","type":"请输入查找通道类型"};

  export default {
    name: 'app',
    data: function() {

      return {
        stores: [
        ],
        create: {
          id: '',
          name: '',
          type: '',
          is_active: true
        },
        currentId:'',
        update:{
          id: '',
          name: '',
          type: '',
          is_active: true
        },
        rules: {
          id: [
            { required: true, message: '请输入ID', trigger: 'blur' },
            { pattern:/^[0-9]*/, message: 'ID为数字'}
          ],
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          type: [
            { required: true, message: '请输入通道类型', trigger: 'blur' },
          ]
        },
        filter: {
          per_page: 10, // 页大小
          page: 1, // 当前页
          id:'',
          name:'',
          type:'',
          sorts:''
        },
        total_rows: 0,
        keywords: '', //搜索框的关键字内容
        select: '', //搜索框的搜索字段
        loading: true,
        selected: [], //已选择项
        dialogCreateVisible: false, //创建对话框的显示状态
        dialogUpdateVisible: false, //编辑对话框的显示状态
        createLoading: false,
        updateLoading: false,
        placeholder:placeholders["id"]
      };
    },
    mounted: function() {
      this.getStores();
    },
    methods: {
      tableSelectionChange(val) {
        this.selected = val;
      },
      tableSortChange(val) {
        console.log(`排序属性: ${val.prop}`);
        console.log(`排序: ${val.order}`);
        if(val.prop!=null){
          if(val.order=='descending'){
            this.filter.sorts = '-'+val.prop;
          }
          else{
            this.filter.sorts = ''+val.prop;
          }
        }
        else{
          this.filter.sorts = '';
        }
        this.getStores();
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
      setCurrent(store){
        this.currentId=store.id;
        this.update.name=store.name;
        this.update.is_active=store.is_active;
        this.dialogUpdateVisible=true;
      },
      // 重置表单
      reset() {
        this.$refs.create.resetFields();
      },
      query(){
        this.filter.id='';
        this.filter.name='';
        this.filter.type='';
        this.filter[this.select]=this.keywords;
        this.getStores();
      },

      //获取用户列表
      getStores() {
        this.loading = true;

        reqGetStores().then((res) => {
          console.log(res);
          this.stores = res.data.stores;
          this.total_rows = res.data.total_rows;
          this.loading = false;
          this.selected.splice(0,this.selected.length);
        })

      },

      /* 获取用户列表
      getStores() {
        this.loading = true;

        var resource = this.$resource(this.url);
        resource.query(this.filter)
          .then((response) => {
            this.stores = response.data.datas;
            this.total_rows = response.data.total_rows;
            this.loading = false;
            this.selected.splice(0,this.selected.length);
          })
          .catch((response)=> {
            this.$message.error('错了哦，这是一条错误消息');
            this.loading = false;
          });

      },*/

      // 创建用户
      createStore(){
        // 主动校验
        this.$refs.create.validate((valid) => {
          if (valid) {
            this.createLoading=true;
            var resource = this.$resource(this.url);
            resource.save(this.create)
              .then((response) => {
                this.$message.success('创建用户成功！');
                this.dialogCreateVisible=false;
                this.createLoading=false;
                this.reset();
                this.getStores();
              })
              .catch((response) => {
                var data=response.data;
                if(data instanceof Array){
                  this.$message.error(data[0]["message"]);
                }
                else if(data instanceof Object){
                  this.$message.error(data["message"]);
                }
                this.createLoading=false;
              });
          }
          else {
            return false;
          }
        });
      },

      // 删除单个用户
      removeStore(store) {
        this.$confirm('此操作将永久删除用户 ' + store.username + ', 是否继续?', '提示', { type: 'warning' })
          .then(() => {
            // 向请求服务端删除
            var resource = this.$resource(this.url + "{/id}");
            resource.delete({ id: store.id })
              .then((response) => {
                this.$message.success('成功删除了用户' + store.username + '!');
                this.getStores();
              })
              .catch((response) => {
                this.$message.error('删除失败!');
              });
          })
          .catch(() => {
            this.$message.info('已取消操作!');
          });
      },
      //删除多个用户
      removeStores() {
        this.$confirm('此操作将永久删除 ' + this.selected.length + ' 个用户, 是否继续?', '提示', { type: 'warning' })
          .then(() => {
            console.log(this.selected);
            var ids = [];
            //提取选中项的id
            $.each(this.selected,(i, user)=> {
              ids.push(user.id);
            });
            // 向请求服务端删除
            var resource = this.$resource(this.url);
            resource.remove({ids: ids.join(",") })
              .then((response) => {
                this.$message.success('删除了' + this.selected.length + '个用户!');
                this.getStores();
              })
              .catch((response) => {
                this.$message.error('删除失败!');
              });
          })
          .catch(() => {
            this.$Message('已取消操作!');
          });
      },

      // 更新用户资料
      updateStore() {
        this.$refs.update.validate((valid) => {
          if (valid) {
            this.updateLoading=true;
            var actions = {
              update: {method: 'patch'}
            }
            var resource = this.$resource(this.url,{},actions);
            resource.update({"ids":this.currentId},this.update)
              .then((response) => {
                this.$message.success('修改用户资料成功！');
                this.dialogUpdateVisible=false;
                this.updateLoading=false;
                this.getStores();
              })
              .catch((response) => {
                var data=response.data;
                console.log(data);
                if(data instanceof Array){
                  this.$message.error(data[0]["message"]);
                }
                else if(data instanceof Object){
                  this.$message.error(data["message"]);
                }
                this.updateLoading=false;
              });
          }
          else {
            return false;
          }
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
