//import qs from 'qs'
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)
/*//test api
let base = ''

export const reqLogin = params => {
  return axios.post(`${base}/login`,params ).then(res => res.data)
}

export const reqAddStores = params => {
  return axios.get(`${base}/stores/add`,
    { params: params }).then(res => res.data)
}

export const reqDeleteStores = params => {
  return axios.get(`${base}/stores/delete`,
    { params: params }).then(res => res.data)
}

export const reqBatchdeleteStores = params => {
  return axios.get(`${base}/stores/batchdelete`,
    { params: params }).then(res => res.data)
}

export const reqEditStores = params => {
  return axios.get(`${base}/stores/edit`,
    { params: params }).then(res => res.data)
}

export const reqGetStores = params => {
  return axios.get(`${base}/stores/list`,
    { params: params })
}*/




export const reqLogin = params => {
  return axios.get('http://106.14.47.193/xpay/admin/',{ params: params }).then(res => res).catch(error => console.log(error));
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

export const reqGetStores = params => {
  return axios.get(`http://106.14.47.193/xpay/admin/10/stores`,
    { params: params }).then(res => res.data)
}

export const reqPatchChannels = params => {
  return axios.patch(`http://106.14.47.193/xpay/agents/${id}store/{storeId}/channels`,
    { params:{channels: [1,2,3,4,5]}
    }).then(res => res.data)
}


