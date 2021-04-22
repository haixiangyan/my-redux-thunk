import React, {useState} from 'react'
import {bindActionCreators} from 'redux'
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
  const {userInfo, count} = useSelector(state => state)

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

      <div>
        <p>服务次数: {count}</p>
        <button onClick={() => props.increment(3)}>+1</button>
        <button onClick={props.decrement}>-1</button>
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => ({
  fetchUserById: fetchUserById(dispatch),
  ...bindActionCreators({
    increment: (diff) => ({type: 'INCREMENT', payload: diff}),
    decrement: () => ({type: 'DECREMENT'}),
  }, dispatch)
})

export default connect(null, mapDispatchToProps)(UserInfo)
