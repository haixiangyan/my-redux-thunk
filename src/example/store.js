import {createStore} from 'redux'

const initState = {
  userInfo: {
    id: 11,
    name: 'Jack',
  }
}

const reducer = (state = initState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {...state, userInfo: action.payload}
    default:
      return state
  }
}

const store = createStore(reducer, initState)

export default store
