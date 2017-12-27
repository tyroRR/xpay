<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
        <el-breadcrumb-item>投诉查询</el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-tabs class="el-col el-col-24" v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="待处理订单" name="first">
        <el-col :span="24" class="toolbar">
          <el-form :inline="true" class="demo-form-inline" >
            <el-input :placeholder="placeholder" v-model="keywords" style="width: 450px;">
              <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:130px">
                <el-option label="姓名" value="name"></el-option>
                <el-option label="银行订单号" value="extOrderNo"></el-option>
                <el-option label="投诉时间" value="createDate"></el-option>
              </el-select>
              <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
            </el-input>
          </el-form>
        </el-col>
        <el-table :data="pendingOrders"
                  style="width: 100%"
                  height="640"
                  ref="table">
          <el-table-column prop="code" label="编号" align="center"></el-table-column>
          <el-table-column prop="name" label="姓名" align="center"></el-table-column>
          <el-table-column prop="phone" label="电话" align="center"></el-table-column>
          <el-table-column prop="status" sortable label="工单状态" align="center"></el-table-column>
          <el-table-column prop="createDate" sortable label="投诉时间" align="center"></el-table-column>
          <el-table-column prop="extOrderNo" sortable label="银行订单号" align="center"></el-table-column>
          <el-table-column prop="orderImage" sortable label="订单图片" align="center"></el-table-column>
          <el-table-column label="审核处理" align="center">
            <template slot-scope="scope">
              <el-button class="handle"
                         size="mini" type="primary" plain>审核
              </el-button>
            </template>
          </el-table-column>
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
      </el-tab-pane>

      <el-tab-pane label="已处理订单" name="second">
        <el-col :span="24" class="toolbar">
          <el-form :inline="true" class="demo-form-inline" >
            <el-input :placeholder="placeholder" v-model="keywords" style="width: 450px;">
              <el-select class="sel-placeholder" v-model="select" @change="searchFieldChange" slot="prepend" style="width:130px">
                <el-option label="姓名" value="name"></el-option>
                <el-option label="银行订单号" value="extOrderNo"></el-option>
                <el-option label="投诉时间" value="createDate"></el-option>
              </el-select>
              <el-button slot="append" icon="el-icon-search" @click="getStores">查询</el-button>
            </el-input>
          </el-form>
        </el-col>
        <el-table :data="processedOrders"
                  style="width: 100%"
                  height="640"
                  ref="table">
          <el-table-column prop="code" label="编号" align="center"></el-table-column>
          <el-table-column prop="name" label="姓名" align="center"></el-table-column>
          <el-table-column prop="phone" label="电话" align="center"></el-table-column>
          <el-table-column prop="status" sortable label="工单状态" align="center"></el-table-column>
          <el-table-column prop="createDate" sortable label="投诉时间" align="center"></el-table-column>
          <el-table-column prop="extOrderNo" sortable label="银行订单号" align="center"></el-table-column>
          <el-table-column prop="orderImage" sortable label="订单图片" align="center"></el-table-column>
          <el-table-column label="审核处理" align="center">
            <template slot-scope="scope">
              <el-button class="handle"
                         size="mini" type="primary" plain>审核
              </el-button>
            </template>
          </el-table-column>
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
      </el-tab-pane>

    </el-tabs>
  </el-row>

</template>
<script>
  export default {
    data() {
      return {
        activeName: 'first',
        pendingOrders: [],
        processedOrders: [],
        filter: {
          name: '',
          channelType: '',
          bailPercentage: '',
          pageSize: 10,
          currentPage: 1,
          beginIndex: 0,
        },
        totalRows: ''
      };
    },
    methods: {
      handleClick(tab, event) {
        console.log(tab, event);
      }
    }
  };
</script>

<style>
  .paging{
    text-align: center;
    margin:12px 0;
  }
</style>
