import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

const UserInfo = () => {
  const dispatch = useDispatch()

  const userInfo = useSelector(state => state.userInfo)

  const [loading, setLoading] = useState(false)
  const [id, setId] = useState('')

  // 根据 Id 获取 userInfo
  const fetchUserById = (id) => {
    if (loading) return

    return new Promise(resolve => {
      setLoading(true)

      setTimeout(() => {
        const newUserInfo = {
          id: id,
          name: '新名字 ' + id
        }

        dispatch({type: 'SET_USER', payload: newUserInfo})

        setLoading(false)

        resolve(newUserInfo)
      }, 2000)
    })
  }

  return (
    <div>
      <div>
        <input value={id} onChange={e => setId(e.target.value)}/>
        <button onClick={() => fetchUserById(id)}>getUserInfo</button>
      </div>

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
