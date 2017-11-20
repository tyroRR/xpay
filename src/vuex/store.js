import Vue from 'vue'
import Vuex from 'vuex'
import api from '../api/api'
import * as types from './mutation-types'

Vue.use(Vuex)

const state = {
  userInfo:{
    account: '',
    password: ''
  }
}

const getters = {
  userInfo: state => state.userInfo
}

const actions = {
  login({commit}){
    api.reqLogin().then(res => commit(types.REQ_LOGIN, res)).catch(function(err){
      console.log(err);
    });
  }
}

const mutations = {
  [types.REQ_LOGIN](state,res) {
    state.userInfo  = res
  }
}

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations
})

