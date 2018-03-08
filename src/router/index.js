import Vue from 'vue'
import Router from 'vue-router'
import { getToken, setToken, removeToken } from '@/utils/auth'
import Home from '@/components/Home'
import Dashboard from '@/components/Dashboard'

import Channels from '@/components/Channels'
import AgentList from '@/components/AgentList'
import Replenishment from '@/components/Replenishment'
import RechargeList from '@/components/Recharge/RechargeList'
import StoreAdmins from '@/components/stores/StoreAdmins'
import StoreDetails from '@/components/stores/StoreDetails'
import StoreChannels from '@/components/stores/StoreChannels'
import Goods from '@/components/stores/Goods'
import GoodDetails from '@/components/stores/GoodDetails'
import AttachGoods from '@/components/stores/AttachGoods'
import StorePool from '@/components/store-pool/StorePool'
import PoolList from '@/components/store-pool/PoolList'
import PoolGoods from '@/components/store-pool/PoolGoods'
import DomainName from '@/components/stores/DomainName'
import Orders from '@/components/Orders'
import Complain from '@/components/Complain'

// 懒加载方式，当路由被访问的时候才加载对应组件
const Login = resolve => require(['@/components/Login'], resolve);

Vue.use(Router);

let router = new Router({
  routes: [
    {
      path: '/login',
      name: '登录',
      component: Login,
    },
    {
      path: '/',
      name: 'home',
      meta: { role:['ADMIN','AGENT','STORE'] },
      component: Home,
      redirect: '/dashboard',
      leaf: true, // 只有一个节点
      menuShow: true,
      iconCls: 'iconfont icon-home', // 图标样式class
      children: [
        {path: '/dashboard', component: Dashboard, name: '首页', menuShow: true}
      ]
    },
    /*{
      path: '/',
      component: Home,
      name: '系统管理',
      meta: { role: 'ADMIN'},
      iconCls: 'iconfont icon-users',
      menuShow: true,
      children: [
        {path: '/system/createAdmin', component: CreateAdmin, name: '创建商户管理员', menuShow: true},
        {path: '/system/editAdmin', component: EditAdmin, name: '修改管理员密码', menuShow: true},
        {path: '/system/increaseQuota', component: IncreaseQuota, name: '增加商户额度', menuShow: true}
      ]
    },*/
    {
      path: '/',
      component: Home,
     // name: '商户管理',
      meta: { role:['ADMIN','AGENT'] },
      iconCls: 'iconfont icon-users1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/store/storeAdmins', component: StoreAdmins, name: '商户管理', menuShow: true},
        {path: '/store/storeDetails', component: StoreDetails, name: '商户详情'},
        {path: '/store/storeChannels', component: StoreChannels, name: '商户通道'},
        {path: '/store/Goods', component: Goods, name: '商品列表'},
      ]
    },
    {
      path: '/',
      component: Home,
      meta: { role: 'ADMIN'},
      iconCls: 'iconfont icon-users1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/storePool', component: StorePool, name: '商户池管理', menuShow: true},
        {path: '/storePool/poolList', component: PoolList, name: '商户池列表', menuShow: true},
        {path: '/storePool/poolList/poolGoods', component: PoolGoods, name: '商户池内商品', menuShow: true},
      ]
    },
    {
      path: '/',
      component: Home,
      meta: { role: 'ADMIN'},
      children: [
        {path: '/GoodDetails', component: GoodDetails, name: '商品详情'}
      ]
    },
    {
      path: '/',
      component: Home,
      meta: { role: 'ADMIN'},
      children: [
        {path: '/AttachGoods', component: AttachGoods, name: '关联商品列表'}
      ]
    },
    {
      path: '/',
      component: Home,
      meta: { role: 'ADMIN'},
      iconCls: 'iconfont icon-users1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/agent', component: AgentList, name: '代理商管理', menuShow: true}
      ]
    },
/*{
  path: '/',
  component: Home,
  meta: { role:['ADMIN','AGENT']},
  iconCls: 'iconfont icon-users',
  leaf: true,
  menuShow: true,
  children: [
    {path: '/agent/AppList', component: AppList, name: 'App列表', menuShow: true}
  ]
},
{
  path: '/',
  component: Home,
  name: '通道管理',
  iconCls: 'iconfont icon-users',
  leaf: true,
  menuShow: true,
  children: [
    {path: '/channel/channelList', component: Channels, name: '通道列表', menuShow: true}
  ]
},
{
 path: '/',
 component: Home,
 meta: { role: 'STORE'},
 iconCls: 'iconfont icon-users',
 leaf: true,
 menuShow: true,
 children: [
   {path: '/recharge/rechargeOrder', component: Recharge, name: '交易额度管理', menuShow: true}
 ]
},*/
/*    {
      path: '/',
      component: Home,
      meta: { role: 'ADMIN'},
      iconCls: 'iconfont icon-home1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/store/domainName', component: DomainName, name: '域名报备', menuShow: true},
      ]
    },*/
    {
      path: '/',
      component: Home,
      meta: { role:['ADMIN','AGENT','STORE','H5PROVIDER'] },
      iconCls: 'iconfont icon-home1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/orders', component: Orders, name: '交易查询', menuShow: true},
      ]
    },
    {
      path: '/',
      component: Home,
      meta: { role:['ADMIN','AGENT','STORE'] },
      iconCls: 'iconfont icon-home1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/replenishment', component: Replenishment, name: '丢单查询', menuShow: true}
      ]
    },
    {
      path: '/',
      component: Home,
      meta: { role:['ADMIN','AGENT','STORE'] },
      iconCls: 'iconfont icon-home1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/recharge', component: RechargeList, name: '充值查询', menuShow: true}
      ]
    },
    {
      path: '/',
      component: Home,
      meta: { role: 'ADMIN'},
      iconCls: 'iconfont icon-leaf',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/complain', component: Complain, name: '投诉查询', menuShow: true},
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  // console.log('to:' + to.path)
  if (to.path.startsWith('/login')) {
    //window.sessionStorage.removeItem('access-user')
    next()
  } else {
    let token = getToken();
    let accessUser = sessionStorage.getItem('access-user');
    if (!token||!accessUser) {
      next({path: '/login'})
    } else {
      next()
    }
  }

});

export default router
