<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <template v-if="this.path === '/store/Goods'">
          <el-breadcrumb-item>商户管理</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/store/storeAdmins' }">商户管理员列表</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/store/storeDetails'}">商户详情</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/store/Goods'}">商品列表</el-breadcrumb-item>
        </template>
        <template v-if="this.path === '/storePool/poolList/poolGoods'">
          <el-breadcrumb-item>商户池商户管理</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/storePool/poolList' }">商户池列表</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: 'storePool/poolList/poolGoods'}">商户池商品</el-breadcrumb-item>
        </template>
        <el-breadcrumb-item>商品详情</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="24" class="warp-main">
      <el-table :data="GoodsList"
                style="width: 100%"
                height="830"
                border>
        <el-table-column prop="name" label="商品名" align="center"></el-table-column>
        <el-table-column prop="extQrCode" label="小微商品二维码" align="center"></el-table-column>
        <el-table-column prop="note" label="备注" align="center"></el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script>

  export default {
    data: function() {
      return {
        userInfo:{
          id:'',
          account:'',
          name:'',
          role:''
        },
        GoodsList:[],
        path: '',
        storeId: ''
      };
    },
    mounted: function() {
      this.path = sessionStorage.getItem('path');
      //console.log(this.path);
      let userInfo = sessionStorage.getItem('access-user');
      if (userInfo) {
        userInfo = JSON.parse(userInfo);
        this.userInfo.id = userInfo.id;
        this.userInfo.account = userInfo.account;
        this.userInfo.name = userInfo.name;
        this.userInfo.role = userInfo.role;
      }
        this.GoodsList = JSON.parse(sessionStorage.getItem('extGoodsList'));
    },
    destroyed: function () {
      //sessionStorage.removeItem('extGoodsList')
    },
    methods: {

    }
  }
</script>

<style>
</style>
