import axios from 'axios'

// axios 配置
axios.defaults.timeout = 10000;
axios.defaults.baseURL = 'http://106.14.47.193';

//POST传参序列化(添加请求拦截器)
axios.interceptors.request.use(config => {
  // 在发送请求之前做某件事
  if(config.method  === 'post'){
    // JSON 转换为 FormData
    const formData = new FormData()
    Object.keys(config.data).forEach(key => formData.append(key, config.data[key]))
    config.data = formData
  }

// 存储 token
  if (localStorage.token) {
    config.headers.Authorization = 'JWT ' + localStorage.token
  }
  return config
},error =>{
  alert("错误的传参", 'fail')
  return Promise.reject(error)
})

//返回状态判断(添加响应拦截器)
axios.interceptors.response.use(res =>{
  //对响应数据做些事
  if(!res.data.success){
    alert(res.error_msg)
    return Promise.reject(res)
  }
  return res
}, error => {
  if(error.response.status === 401) {
    // 401 说明 token 验证失败
    // 可以直接跳转到登录页面，重新登录获取 token
    location.href = '/login'
  } else {
    // do something
  }
  // 返回 response 里的错误信息
  return Promise.reject(error.response.data)
})

export default {
  reqLogin: params => {
    return axios.get('/xpay/admin/',{ params: params })
  }
}

/*export const reqGetApps = params => {
  return axios.get(`http://106.14.47.193/xpay/${agentId}/apps`,
    { params: params }).then(res => res.data)
}

export const reqPutApps = params => {
  return axios.put(`http://106.14.47.193/xpay/${agentId}/apps`,
    { params: params }).then(res => res.data)
}

export const reqGetChannels = params => {
  return axios.get(`http://106.14.47.193/xpay/${id}/channels`,
    { params: params }).then(res => res.data)
}

export const reqPutChannels = params => {
  return axios.get(`http://106.14.47.193/xpay/${id}/channels`,
    { params:{extStoreId: "",paymentGateway: "",extStoreName: ""} }).then(res => res.data)//UPAY, CHINAUMSH5
}*/

/*
export const reqGetStores = params => {
  return axios.get(`http://106.14.47.193/xpay/admin/10/stores`,
    { params: params }).then(res => res.data)
}

export const reqPatchChannels = params => {
  return axios.patch(`http://106.14.47.193/xpay/agents/${id}store/{storeId}/channels`,
    { params:{channels: [1,2,3,4,5]}
    }).then(res => res.data)
}
*/


