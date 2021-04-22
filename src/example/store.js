import {createStore} from 'redux'

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
      console.log(action)
      return {...state, count: state.count + 1}
    case 'DECREMENT':
      return {...state, count: state.count - 1}
    default:
      return state
  }
}

const store = createStore(reducer, initState)

export default store
