<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>通道管理</el-breadcrumb-item>
        <el-breadcrumb-item>通道列表</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>

    <el-col :span="24" class="warp-main">
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" class="demo-form-inline">
          <el-form-item label="ID">
            <el-input v-model="filters.id" placeholder="请输入ID"></el-input>
          </el-form-item>
          <el-form-item label="通道名称">
            <el-input v-model="filters.name" placeholder="请输入通道名称"></el-input>
          </el-form-item>
          <el-form-item label="通道类型">
            <el-select v-model="filters.state" placeholder="请输入通道类型">
              <el-option label="type1" value="1"></el-option>
              <el-option label="type2" value="2"></el-option>
            </el-select>
          </el-form-item><el-form-item>
          <el-button type="primary" icon="search" @click="searchClick">查询</el-button>
          <el-button type="success" icon="plus" @click="addClick">新增</el-button>
        </el-form-item>
        </el-form>
      </el-col>

      <el-table
        :data="channelList"
        v-loading="listLoading"
        border
        @selection-change="selectionChange"
        style="width: 100%">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="id"
          label="ID">
        </el-table-column>
        <el-table-column
          prop="name"
          label="通道名称">
        </el-table-column>
        <el-table-column
          prop="type"
          label="通道类型">
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button :plain="true" type="success" size="small" icon="edit" @click="editClick(scope.row)">编辑</el-button>
            <el-button :plain="true" type="danger" size="small" icon="delete" @click="deleteClick(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row style="margin-top: 20px" type="flex" justify="end">
        <el-col :span="6" >
          <el-button :plain="true" type="danger" size="small" icon="delete" @click="removeSelection">删除所选</el-button>
        </el-col>
        <el-col :span="18" >
          <el-pagination
            style="float: right"
            @size-change="pageSizeChange"
            @current-change="currentPageChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-col>
      </el-row>

      <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
        <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
          <el-form-item label="ID" prop="id">
            <el-input-number v-model="editForm.id"></el-input-number>
          </el-form-item>
          <el-form-item label="通道名称" prop="name">
            <el-input v-model="editForm.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="通道类型" prop="type">
            <el-input-number v-model="editForm.id" auto-complete="off"></el-input-number>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click.native="editFormVisible = false">取消</el-button>
          <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
        </div>
      </el-dialog>

    </el-col>
  </el-row>
</template>

<script>

  export default {
    data (){
      return {
        //列表数据
        channelList: [{
          id: '1',
          name: '1',
          type: 1
        }, {
          id: '2',
          name: '2',
          type: '2'
        }],
        //显示加载中样式
        listLoading: false,
        //搜索表单
        filters: {
          id: '',
          name: '',
          state: ''
        },
        //多选值
        multipleSelection: [],
        //当前页
        currentPage: 3,
        //分页大小
        pageSize: 100,
        //总记录数
        total: 1000,
        //删除的弹出框
        deleteVisible: false,
        //编辑界面是否显示
        editFormVisible: false,
        editLoading: false,
        editFormRules: {
          name: [
            {required: true, message: '请输入姓名', trigger: 'blur'}
          ]
        },
        //编辑界面数据
        editForm: {
          id: 0,
          name: '',
          type: ''
        }
      }
    },
    methods:{
      /*表格重新加载数据
      loadingData:function() {
        var _self = this;
        _self.loading = true;
        setTimeout(function(){
          console.info("加载数据成功");
          _self.loading = false;
        },300);
      },*/
      //获取用户列表
      getData:function() {
        let para = {
          currentPage: this.currentPage,
          id: this.filters.id,
          name: this.filters.name,
          type: this.filters.type
        };
        this.listLoading = true;
        reqGetChannelListPage(para).then((res) => {
          this.channelList = res.data.channelList;
          this.total = res.data.total;
          this.listLoading = false;
        })
      },
      //表格编辑事件
      editClick:function(row) {
        console.log(row);
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
      },
      //表格删除事件
      deleteClick:function(row) {
        var _self = this;
        this.$confirm('确认删除' + row.name +'吗?', '提示', {
          type: 'warning'
        }).then(function(){
          _self.$message({
            message: row.name + '删除成功',
            type: 'success'
          });
          _self.getData();//重新加载数据
        }).catch(function(e){
          if(e != "cancel")
            console.log("出现错误：" + e);
        });
      },
      //新建事件
      addClick:function() {
        var _self = this;
        this.editFormVisible = true;
        //_self.getData();//重新加载数据
      },
      //表格查询事件
      searchClick:function() {
        alert("搜索");
        var _self = this;
        _self.getData();//重新加载数据
      },
      //表格勾选事件
      selectionChange:function(val) {
        for(var i=0;i<val.length;i++) {
          var row = val[i];
        }
        this.multipleSelection = val;
        console.info(val);
      },
      //删除所选，批量删除
      removeSelection:function() {
        var _self = this;
        var multipleSelection = this.multipleSelection;
        if(multipleSelection.length < 1) {
          _self.$message({
            message: '请至少选中一条记录',
            type: 'error'
          });
          return;
        }
        var ids = "";
        for(var i=0;i<multipleSelection.length;i++) {
          var row = multipleSelection[i];
          ids += row.name + ","
        }
        this.$confirm('确认删除' + ids +'吗?', '提示', {
          type: 'warning'
        }).then(function(){
          _self.$message({
            message: ids + '删除成功',
            type: 'success'
          });
          _self.getData();//重新加载数据
        }).catch(function(e){
          if(e != "cancel")
            console.log("出现错误：" + e);
        });
      },
      //分页大小修改事件
      pageSizeChange:function(val) {
        console.log('每页 ' + val +' 条');
        this.pageSize = val;
        var _self = this;
        _self.getData();//重新加载数据
      },
      //当前页修改事件
      currentPageChange:function(val) {
        this.currentPage = val;
        console.log('当前页: ' + val);
        var _self = this;
        _self.getData();//重新加载数据
      },
      //保存点击事件
      editSubmit:function(){
        console.info(this.editForm);
      },
      mounted() {
        this.getData();
      }
    }
  }

</script>

<style>

</style>
