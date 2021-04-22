import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// 根据 Id 获取 userInfo
const fetchUserById = (id) => (dispatch, getState, env) => {
  console.log('当前环境', env)

  return new Promise(resolve => {
    setTimeout(() => {
      const newUserInfo = {
        id: id,
        name: id + '号技师'
      }

      const state = getState()

      dispatch({type: 'SET_USER', payload: newUserInfo})
      dispatch({type: 'SET_COUNT', payload: state.count + 1})

      resolve(newUserInfo)
    }, 1000)
  })
}

const UserInfo = () => {
  const dispatch = useDispatch()

  const {userInfo, count} = useSelector(state => state)

  const [loading, setLoading] = useState(false)
  const [id, setId] = useState('')

  const onClick = async () => {
    setLoading(true)
    await dispatch(fetchUserById(id))
    setLoading(false)
  }

  return (
    <div>
      <div>
        <input value={id} onChange={e => setId(e.target.value)}/>
        <button onClick={onClick}>getUserInfo</button>
      </div>

      <p>已搜索: {count} 次</p>

      {
        loading ? <div>加载中...</div> : (
          <div>
            <p>Id: {userInfo.id}</p>
            <p>Name: {userInfo.name}</p>
          </div>
        )
      }
    </div>
  )
}

export default UserInfo
