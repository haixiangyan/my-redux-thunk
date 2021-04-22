import React, {useState} from 'react'
import {connect, useSelector} from 'react-redux'

// 根据 Id 获取 userInfo
const fetchUserById = (dispatch) => (id) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newUserInfo = {
        id: id,
        name: id + '号技师'
      }

      dispatch({type: 'SET_USER', payload: newUserInfo})

      resolve(newUserInfo)
    }, 1000)
  })
}

const UserInfo = (props) => {
  const userInfo = useSelector(state => state.userInfo)

  const [loading, setLoading] = useState(false)
  const [id, setId] = useState('')

  const onClick = async () => {
    setLoading(true)
    await props.fetchUserById(id)
    setLoading(false)
  }

  return (
    <div>
      <div>
        <input value={id} onChange={e => setId(e.target.value)}/>
        <button onClick={onClick}>getUserInfo</button>
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

const mapDispatchToProps = (dispatch) => ({
  fetchUserById: fetchUserById(dispatch)
})

export default connect(null, mapDispatchToProps)(UserInfo)
