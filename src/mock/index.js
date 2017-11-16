import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {LoginUsers} from './data/user'
import {Stores} from './data/store'
let _Stores = Stores

export default {

  init () {
    let mock = new MockAdapter(axios)

    // mock success request
    mock.onGet('/success').reply(200, {
      msg: 'success'
    })

    // mock error request
    mock.onGet('/error').reply(500, {
      msg: 'failure'
    })

    // 登录
    mock.onPost('/login').reply(arg => {
      let {account, password} = JSON.parse(arg.data)
      return new Promise((resolve, reject) => {
        let user = null
        setTimeout(() => {
          let hasUser = LoginUsers.some(u => {
            if (u.account === account && u.password === password) {
              user = JSON.parse(JSON.stringify(u))
              delete user.password
              return true
            }
          })

          if (hasUser) {
            resolve([200, {code: 200, msg: '请求成功', user}])
          } else {
            resolve([200, {code: 500, msg: '账号或密码错误'}])
          }
        }, 1000)
      })
    })

 /*   mock.onPost('/user/profile').reply(function (arg) {
      let {name, email} = JSON.parse(arg.data)
      return new Promise((resolve, reject) => {
        let user = LoginUsers[0]
        user.name = name
        user.email = email
        resolve([200, {code: 200, msg: '请求成功', user}])
      })
    })
*/
    // 获取列表
    mock.onGet('/store/list').reply(config => {
      let {name} = config.params
      let mockStores = _Stores.filter(store => {
        if (name && store.name.indexOf(name) === -1) return false
        return true
      })
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            stores: mockStores
          }])
        }, 500)
      })
    })

    /* 获取列表（分页）
    mock.onGet('/store/list').reply(config => {
      let {page, name} = config.params
      let mockBooks = _Books.filter(book => {
        if (name && book.name.indexOf(name) === -1) return false
        return true
      })
      let total = mockBooks.length
      mockBooks = mockBooks.filter((u, index) => index < 10 * page && index >= 10 * (page - 1))
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            total: total,
            books: mockBooks
          }])
        }, 500)
      })
    })*/

    // 删除
    mock.onGet('/store/delete').reply(config => {
      let {id} = config.params
      _Stores = _Stores.filter(b => b.id !== id)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: '删除成功'
          }])
        }, 500)
      })
    })

    // 编辑
    mock.onGet('/store/edit').reply(config => {
      let {id, name} = config.params
      _Books.some(u => {
        if (u.id === id) {
          u.name = name
          return true
        }
      })

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: '编辑成功'
          }])
        }, 500)
      })
    })

    // 批量删除
    mock.onGet('/store/batchdelete').reply(config => {
      let {ids} = config.params
      ids = ids.split(',')
      _Stores = _Stores.filter(u => !ids.includes(u.id))
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: '删除成功'
          }])
        }, 500)
      })
    })

    // 新增
    mock.onGet('/store/add').reply(config => {
      let {name} = config.params
      _Stores.push({
        name: name,
      })
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: '新增成功'
          }])
        }, 500)
      })
    })
  }

}
