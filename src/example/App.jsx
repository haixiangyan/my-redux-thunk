import {Provider} from 'react-redux'
import React from 'react'
import store from './store'
import UserInfo from './UserInfo'

function App() {
  return (
    <Provider store={store}>
      <UserInfo/>
    </Provider>
  )
}

export default App;
