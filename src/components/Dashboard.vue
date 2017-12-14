<template>
  <el-row class="warp">
    <el-col :span="24" class="warp-breadcrum">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }"><b>首页</b></el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <template v-if="role === 'STORE'">
      <el-col :span="24" class="warp-main">
        <el-table :data="rechargeInfo"
                  style="width: 100%"
                  height="680"
                  ref="table">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item label="code">
                  <span>{{ props.row.code }}</span>
                </el-form-item>
                <el-form-item label="key">
                  <span>{{ props.row.key }}</span>
                </el-form-item>
                <el-form-item label="secret">
                  <span>{{ props.row.secret }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="方式"></el-table-column>
          <el-table-column prop="quota" label="剩余额度"></el-table-column>
          <el-table-column prop="bailPercentage" sortable  label="费率"></el-table-column>
          <el-table-column label="对接参数">
            <template slot-scope="scope">
              <el-button
                size="mini" type="primary"
                @click="view(scope.row)">查看
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="充值">
            <template slot-scope="scope">
              <el-button
                size="mini" type="primary"
                @click="recharge(scope.row)">充值
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-dialog
        title="充值"
        :visible.sync="DialogVisible"
        width="35%"
        center>
          <el-form ref="formRecharge" :model="formRecharge" label-width="100px">
            <el-form-item label="充值金额">
              <el-input-number v-model="formRecharge.amount" :min="100" :step="100"></el-input-number>
            </el-form-item>
            <el-form-item label="支付方式">
              <el-select v-model="formRecharge.channel" placeholder="请选择支付方式">
                <el-option label="支付宝" value="ALIPAY"></el-option>
                <el-option label="微信" value="WECHAT"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">立即充值</el-button>
            </el-form-item>
          </el-form>
      </el-dialog>
    </template>
  </el-row>
</template>

<script>
  export default {
    data() {
      return {
        formRecharge: {
          amount: '',
          channel: '',
          quota: 0
        },
        rechargeInfo: [{
          type: '支付宝',
          quota: '10000',
          bailPercentage: '2',
          code: 'code',
          key: 'key',
          secret: 'secret'
        }, {
          type: '微信',
          quota: '10000',
          bailPercentage: '2',
          code: 'code',
          key: 'key',
          secret: 'secret'
        }],
        role:'',
        DialogVisible: false
      }
    },
    created: function () {
      this.role = sessionStorage.getItem('role');
    },
    methods: {
      view(row){
        this.$refs.table.toggleRowExpansion(row);
      },
      recharge(row){
        this.DialogVisible = true
      },
      getInfo() {
        this.form.storeId = sessionStorage.getItem('code');
        this.form.appId = sessionStorage.getItem('key');
        this.form.secret = sessionStorage.getItem('secret');
      }
    }
  }
</script>

<style>
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

