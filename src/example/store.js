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
    case 'SET_COUNT':
      return {...state, count: action.payload}
    default:
      return state
  }
}

const store = createStore(
  reducer,
  initState,
  applyMiddleware(thunkMiddleware.withExtraArgument('development'))
)

export default store
