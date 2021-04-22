import {applyMiddleware, createStore} from 'redux'
import thunkMiddleware from "../lib/redux-thunk";

const initState = {
  userInfo: {
    id: 0,
    name: '',
  },
  count: 0,
}

const reducer = (state = initState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {...state, userInfo: action.payload}
    case 'INCREMENT':
      return {...state, count: state.count + 1}
    case 'DECREMENT':
      return {...state, count: state.count - 1}
    default:
      return state
  }
}

const store = createStore(reducer, initState, applyMiddleware(thunkMiddleware))

export default store
