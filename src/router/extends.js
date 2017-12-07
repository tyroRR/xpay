let extendsRoutes;

if(role === 'ADMIN'){

  extendsRoutes = [
    {
      path: '/',
      name: 'home',
      component: resolve => require(['@/components/Home'], resolve),
      redirect: '/dashboard',
      leaf: true, // 只有一个节点
      menuShow: true,
      iconCls: 'iconfont icon-home', // 图标样式class
      children: [
        {path: '/dashboard', component: resolve => require(['@/components/Dashboard'], resolve), name: '首页', menuShow: true}
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),
      name: '系统管理',
      iconCls: 'iconfont icon-users',
      menuShow: true,
      children: [
        {path: '/system/createAdmin', component: resolve => require(['@/components/CreateAdmin'], resolve), name: '创建商户管理员', menuShow: true},
        {path: '/system/editAdmin', component: resolve => require(['@/components/EditAdmin'], resolve), name: '修改管理员密码', menuShow: true},
        {path: '/system/increaseQuota', component: resolve => require(['@/components/IncreaseQuota'], resolve), name: '增加商户额度', menuShow: true}
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      name: '商户管理',
      iconCls: 'iconfont icon-users1',
      menuShow: true,
      children: [
        {path: '/store/storeList', component: resolve => require(['@/components/Stores'], resolve), name: '商户列表', menuShow: true},
        {path: '/store/AppList', component: resolve => require(['@/components/AppList'], resolve), name: 'App列表', menuShow: true},
        {path: '/store/storeChannels', component: resolve => require(['@/components/StoreChannels'], resolve), name: '商户通道'},
        {path: '/store/domainName', component: resolve => require(['@/components/DomainName'], resolve), name: '域名报备', menuShow: true},
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      iconCls: 'iconfont icon-users',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/agent/agentList', component: resolve => require(['@/components/AgentList'], resolve), name: '代理商列表', menuShow: true}
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      name: '通道管理',
      iconCls: 'iconfont icon-users',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/channel/channelList', component: resolve => require(['@/components/Channels'], resolve), name: '通道列表', menuShow: true}
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      iconCls: 'iconfont icon-home1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/orders', component: resolve => require(['@/components/Orders'], resolve), name: '交易记录', menuShow: true},
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      iconCls: 'iconfont icon-leaf',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/complain', component: resolve => require(['@/components/Complain'], resolve), name: '投诉管理', menuShow: true},
      ]
    }
  ]
}

if(role === 'AGENT'){
  extendsRoutes = [
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),
      redirect: '/dashboard',
      leaf: true, // 只有一个节点
      menuShow: true,
      iconCls: 'iconfont icon-home', // 图标样式class
      children: [
        {path: '/dashboard', component: resolve => require(['@/components/Dashboard'], resolve), name: '首页', menuShow: true}
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      name: '商户管理',
      iconCls: 'iconfont icon-users1',
      menuShow: true,
      children: [
        {path: '/store/storeList', component: resolve => require(['@/components/Stores'], resolve), name: '商户列表', menuShow: true},
        {path: '/store/AppList', component: resolve => require(['@/components/AppList'], resolve), name: 'App列表', menuShow: true},
        {path: '/store/storeChannels', component: resolve => require(['@/components/StoreChannels'], resolve), name: '商户通道'},
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      iconCls: 'iconfont icon-home1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/orders', component: resolve => require(['@/components/Orders'], resolve), name: '交易记录', menuShow: true},
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      iconCls: 'iconfont icon-users',
      menuShow: true,
      children: [
        {path: '/recharge/rechargeList', component: resolve => require(['@/components/RechargeList'], resolve), name: '商户充值记录', menuShow: true}
      ]
    }
  ]
}

if(role === 'STORE'){
  extendsRoutes = [
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),
      redirect: '/dashboard',
      leaf: true, // 只有一个节点
      menuShow: true,
      iconCls: 'iconfont icon-home', // 图标样式class
      children: [
        {path: '/dashboard', component: resolve => require(['@/components/Dashboard'], resolve), name: '首页', menuShow: true}
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      name: '在线充值',
      iconCls: 'iconfont icon-users',
      menuShow: true,
      children: [
        {path: '/recharge/rechargeOrder', component: resolve => require(['@/components/Recharge'], resolve), name: '在线充值', menuShow: true},
        {path: '/recharge/rechargeList', component: resolve => require(['@/components/RechargeList'], resolve), name: '充值记录', menuShow: true}
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      iconCls: 'iconfont icon-home1',
      leaf: true,
      menuShow: true,
      children: [
        {path: '/orders', component: resolve => require(['@/components/Orders'], resolve), name: '交易记录', menuShow: true},
      ]
    },
    {
      path: '/',
      component: resolve => require(['@/components/Home'], resolve),      iconCls: 'iconfont icon-users1',
      menuShow: true,
      children: [
        {path: '/store/storeList', component: resolve => require(['@/components/Stores'], resolve), name: '商户列表', menuShow: true}
      ]
    },
  ]
}

export default extendsRoutes
