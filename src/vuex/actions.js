import * as types from './mutation-types'

export const reqLogin = ({ commit }, res) => {
    commit(types.REQ_LOGIN, {
      res: res
    })
}
