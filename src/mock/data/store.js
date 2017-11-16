import Mock from 'mockjs'

const Stores = []
for (let i = 0; i < 100; i++) {
  Stores.push(Mock.mock({
    id: Mock.Random.guid(),
    name: Mock.Random.ctitle(2, 12),
  }))
}

export {Stores}
