import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import req from './modules/req'
import others from './modules/others'

Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    req,
    others
  }
})
