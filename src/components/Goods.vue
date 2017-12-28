<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>域名报备</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>

    <el-col :span="24" class="warp-main">
      <!-- 查询 -->
      <el-col :span="24" class="toolbar">
        <el-form :inline="true" class="demo-form-inline" >
          <el-input :placeholder="placeholder" v-model="keywords" style="width: 400px; margin-right: 15px" @keyup.enter.native="getDomainNames">
            <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:110px">
              <el-option label="商户ID" value="id"></el-option>
              <el-option label="商户名" value="name"></el-option>
              <el-option label="域名" value="domainName"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getDomainNames">查询</el-button>
          </el-input>
          <el-button type="info" plain icon="el-icon-plus" @click="DialogVisible = true">添加</el-button>
          <upload-excel @on-selected-file='selectedExcel'></upload-excel>
          <el-button @click="exampleVisible = true" type="text" size="small">批量导入示例</el-button>
        </el-form>
      </el-col>

      <el-table :data="domainNames"
                style="width: 100%"
                height="680"
                ref="table">
        <el-table-column prop="id" label="商户ID"></el-table-column>
        <el-table-column prop="name" label="商户名"></el-table-column>
        <el-table-column prop="name" label="域名">
          <template slot-scope="scope">
            <el-button @click="audit(scope.row)" type="text" size="small">{{scope.row.domainName}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>
        <template v-if="userInfo.role === 'ADMIN'">
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini" type="primary" plain
                @click="edit(scope.row)">修改
              </el-button>
              <el-button
                size="mini" type="danger" plain
                @click="reject(scope.row)">驳回
              </el-button>
              <el-button
                size="mini" type="success" plain
                @click="agree(scope.row)">提交
              </el-button>
            </template>
          </el-table-column>
        </template>
        <template v-if="userInfo.role !== 'ADMIN'">
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini" type="primary" plain
                @click="edit(scope.row)">修改
              </el-button>
              <el-button
                size="mini" type="danger" plain
                @click="reject(scope.row)">删除
              </el-button>
              <el-button
                size="mini" type="success" plain
                @click="agree(scope.row)">提交
              </el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>
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

    <el-dialog title="批量导入示例" center v-model="exampleVisible" :visible.sync="exampleVisible">
      <p>1.选择excel文件</p>
      <p>2.excel文档表头依次设置为id name domainName</p>
      <p>3.id=>商户id  name=>商户名  domainName=>域名 一一对应</p>
      <h4>excel文档模板</h4>
      <img src="./../../assets/images/example.png" width="80%" alt="example">
      <h4>excel文档导入后</h4>
      <img src="./../../assets/images/example2.png" width="100%" alt="example2">
      <div slot="footer" class="dialog-footer">
        <el-button plain @click="exampleVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增域名" center v-model="DialogVisible" :visible.sync="DialogVisible" @close="reset">
      <el-form id="#createStore" :model="addDomainName" :rules="addDomainNameRules" ref="addDomainName" label-width="80px">
        <el-form-item label="商户名" prop="name">
          <el-input v-model="addDomainName.name"></el-input>
        </el-form-item>
        <el-form-item label="域名" prop="domainName">
          <el-input v-model="addDomainName.domainName">
            <template slot="prepend">http://</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button plain @click="DialogVisible = false">取 消</el-button>
        <el-button type="primary" plain :loading="createLoading" @click="onSubmit">提交</el-button>
      </div>
    </el-dialog>

  </el-row>
</template>

<script>
  import uploadExcel from './../UploadExcel.vue'

  let placeholders = {
    "id":"商户ID",
    "name":"商户名",
    "bailPercentage":"域名"
  };

  export default {
    components: { uploadExcel },
    data() {
      return {
        userInfo:{
          id:'',
          account:'',
          name:'',
          role:''
        },
        addDomainName: {
          id: '',
          name: '',
          domainName: '',
          status: ''
        },
        addDomainNameRules: {
          id: [
            { required: true, message: '请输入商户ID', trigger: 'blur' },
          ],
          name: [
            { required: true, message: '请输入商户名', trigger: 'blur' },
          ],
          domainName: [
            { required: true, message: '请输入域名', trigger: 'blur' },
          ]
        },
        domainNames: [{
          id: 1,
          name: '王小虎',
          domainName: 'http://www.baidu.com',
          status: '已报备'
        }, {
          id: 2,
          name: '王小虎',
          domainName: 'http://www.baidu.com',
          status: '未报备'
        }, {
          id: 3,
          name: '王小虎',
          domainName: 'http://www.baidu.com',
          status: '报备失败'
        }],
        filter: {
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
          name: '',
          bailPercentage: '',
        },
        keywords: '', //搜索框的关键字内容
        select: 'name', //搜索框的搜索字段
        loading: true,
        selected: [], //已选择项
        totalRows: 0,
        DialogVisible: false,
        exampleVisible: false,
        createLoading: false,
        placeholder:placeholders["name"]
      }
    },
    created: function () {
      let userInfo = sessionStorage.getItem('access-user');
      if (userInfo) {
        userInfo = JSON.parse(userInfo);
        this.userInfo.id = userInfo.id;
        this.userInfo.account = userInfo.account;
        this.userInfo.name = userInfo.name;
        this.userInfo.role = userInfo.role;
      }
    },
    mounted: function () {
    },
    methods: {
      //批量导入
      selectedExcel(data) {
        console.log(data);
        //提交data
        this.domainNames = data
      },
      searchFieldChange(val) {
        this.select = val;
        this.placeholder=placeholders[val];
        console.log(`搜索字段： ${val} `);
      },
      pageSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.filter.pageSize = val;
        this.getDomainNames();
      },
      pageCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.filter.currentPage = val;
        this.getDomainNames();
      },
      reset(){
        this.$refs.addDomainName.resetFields();
      },
      onSubmit(){
        this.addDomainName.domainName = 'http://' + this.addDomainName.domainName;
      },
      audit(row){
        let url = row.domainName;
        window.open(url);
      },
      edit(){

      },
      reject(){

      },
      agree(){

      },
      getDomainNames(){

      }
    }
  }
</script>

<style>
  .paging{
    text-align: center;
    margin:12px 0;
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
</style>

