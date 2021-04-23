# 造一个 redux-thunk 轮子

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c5a3654be7434c87b2d3b4909a30c52e~tplv-k3u1fbpfcp-zoom-1.image)

哈？redux-thunk 不就是那个只有 14 行代码的轮子嘛？我一行就能写出来还要你来教我做事？

不错，redux-thunk 是一个非常小的库，不到 5 分钟就能理解并造出来。但是今天我并不想从 “怎么造” 这个角度来讲这个轮子，而是想从 “为什么” 这个角度来聊一聊这个轮子的是怎么出现的。

很多分析 redux-thunk 源码的文章一般会说：如果 action 是函数的话就传入 dispatch，在 action 函数里面使用 `dispatch`，如果action 不是函数的话就正常 `dispatch(action)`。不过，我觉得这是从结果出发找造这个轮子的原因，并不能从需求层面解释这个中间件到底解决了什么问题。

本文希望从解决问题的角度来推导 redux-thunk 诞生的原因。

## 一个需求

首先，我们先把 redux-thunk 忘了，来看一下这个需求：

1. 输入框搜索用户 Id，调用 getUserInfoById 来获取用户信息
2. 展示对应用户 id 和 name

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/144d7e18b6bb45ddaf8f0da8c92415c8~tplv-k3u1fbpfcp-zoom-1.image)

首先，我们弄一个 store 存放 `userInfo`。

```jsx
// store.js
const initState = {
  userInfo: {
    id: 0,
    name: '0号技师',
  }
}

const reducer = (state = initState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {...state, userInfo: action.payload} // 直接更新 userInfo
    default:
      return state
  }
}

const store = createStore(reducer, initState)
```

然后使用 **react-redux** 提供的 `Provider` 向整个 App 注入数据：

```jsx
// App.jsx
function App() {
  return (
    <Provider store={store}>
      <UserInfo/>
    </Provider>
  )
}
```

最后一步，在 `UserInfo` 组件里获取并展示用户信息。

```js
// UserInfo.jsx
const UserInfo = () => {
  const dispatch = useDispatch()

  const userInfo = useSelector(state => state.userInfo)

  // 业务组件状态
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
          name: id + '号技师'
        }

        dispatch({type: 'SET_USER', payload: newUserInfo})

        setLoading(false)

        resolve(newUserInfo)
      }, 1000)
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
```

上面代码很简单：在 `input` 输入 id 号，点击“getUserInfo”按钮后触发 `fetchUserById`，1 秒后拿到最新的 `userInfo` 来更新 store 值，最后展示技师信息。

## 解耦

上面的代码在很多业务里非常常见，常见到我们根本不需要什么 redux-thunk，redux-saga 来处理。不就是 fetch 数据，把数据放到 `action.payload`，再 dispatch 这个 action 更新值嘛。所以很多人看到这些“框架”的时候都会觉得很奇怪：这些库好像解决了一些问题，但好像又感觉没做什么大事情。

这么写有什么问题呢？**假如我想把 `fetchUserById` 抽到组件外面就很痛苦了，因为整个 `fetchUserById` 完全依赖了 `dispatch` 函数。** 有人可能会说了，我直接外层 import  `store.dispatch` 来使用不就解除依赖了么：

```js
// store 一定为单例
import store from './store'

const fetchUserById = (id) => {
  if (loading) return

  return new Promise(resolve => {
    setTimeout(() => {
      const newUserInfo = {
        id: id,
        name: id + '号技师'
      }

      store.dispatch({type: 'SET_USER', payload: newUserInfo})

      resolve(newUserInfo)
    }, 1000)
  })
}
```

**但是这样会导致你的 store 必须是一个单例！单例就不好了么？某些情况下如 SSR，mock store，测试 store 就需要同时存在多个 store 的情况。所以，单例 store 是不太推荐的。**

**另一个解耦方法：我们可以把 `dispatch` 作为参数传入，而不是直接使用，这样就可以完成函数的解耦了：**

```js
// 根据 Id 获取 userInfo
const fetchUserById = (dispatch, id) => {
  if (loading) return

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

// UserInfo.jsx
const UserInfo = (props) => {
  const dispatch = useDispatch()

  const {userInfo, count} = useSelector(state => state)

  const [loading, setLoading] = useState(false)
  const [id, setId] = useState('')

  const onClick = async () => {
    setLoading(true)
    await fetchUserById(id, dispatch)
    setLoading(false)
  }

  return (
    ...
  )
}
```

虽然上面的 `fetchUserById` 看起来还是有点智障，但是只在使用的时候才传入 dispatch，完全脱离了 dispatch 的依赖。

## 柯里化

每次执行 `fetchUserById` 都要传一个 `dispatch` 进去，这不禁让我们想到：能不能先在一个地方把 `fetchUserById` 初始化好，比如初始化成 `fetchUserByIdWithDispatch`，让它拥有了 `dispatch` 的能力，然后执行的时候直接使用 `fetchUserByIdWithDispatch` 函数呢？

**使用闭包就解决了（也可以说将函数柯里化），所谓的柯里化也仅是多返回一个函数：**

```js
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
```

使用的时候把 `dispatch` 传入生成新函数，相当于给 `fetchUserById` **“赋能”**：

```jsx
// UserInfo.jsx
const UserInfo = () => {
  const dispatch = useDispatch()
  
  const {userInfo, count} = useSelector(state => state)

  const [loading, setLoading] = useState(false)
  const [id, setId] = useState('')
  
  const fetchUserByIdWithDispatch = fetchUserById(dispatch)

  const onClick = async () => {
    setLoading(true)
    await fetchUserByIdWithDispatch(id)
    setLoading(false)
  }

  return (
    ...
  )
}
```

定义的 `fetchUserById` 有点类似工厂模式里的工厂函数，由其生成的 `fetchUserByIdWithDispatch` 才是我们真实想要的 “fetchUserById”。

这样的 **“函数式套娃”** 在 redux 的很多轮子中都出现过，对造轮子有很大作用，希望大家可以对此有个印象。我自己对这样处理一个形象的理解是：好比一个正在准备发射的火箭，每执行一次外层的函数时就像给这个火箭加一点能量，等执行到最后一个函数的时候整个火箭就以最快的速度喷射出去。

回到例子，这样的函数声明方式也不好，每次使用的时候都要用 dispatch 初始化一下，还是很麻烦。而且容易给人造成误解：好好的 `fetchUserById` 不传 id 而是传一个 `dispatch` 函数来初始化。怕是会顺着网线过来锤你。

## 把参数互换位置

我们理想中的 `fetchUserById` 应该是像这样使用的：

```
fetchUserById(id)
```

**把 dispatch 和 id 尝试换一下看看效果如何：**

```js
// 根据 Id 获取 userInfo
const fetchUserById = (id) => (dispatch) => {
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
```

组件里的 onClick 就要这样使用了：

```js
const onClick = async () => {
  setLoading(true)
  const fetchDispatch = fetchUserById(id)
  await fetchDispatch(dispatch)
  setLoading(false)
}
```

虽然表面上可以 `fetchUserById(id)` 了，但是 `fetchDispatch(dispatch)` 也太丑了了。**能不能把 “fetchUserById” 和 “dispatch” 反过来写呢**，变成这样：

```js
dispatch(fetchUserById(id))
```

这样一来，所以用到 `dispatch` 的代码都可以用下面这样的函数来封装了：

```js
const fn = (...我的参数) => (dispatch) => {
  // 用“我的参数”做一些事...
  doSomthing(我的参数)
  // dispatch 修改值
  dispatch(...)
}
```

**为了下次懒得再一次解释这样的函数结构，干脆用一个词这概括它，就叫它 "thunk" 吧。**

要实现上面的效果，我们需要更改 `dispatch` 函数内容，使其变成增强版的 `dispatch`：入参为函数时执行该函数的返回函数，同时传入 `dispatch`，如果为普通 action 时直接 `dispatch(action)`。

```js
const originalDispatch = store.dispatch
const getState = store.getState

store.dispatch = (action) => {
  if (typeof action === 'function') {
    action(originalDispatch, getState)
  } else {
    originalDispatch(action)
  }
}
```

直接赋值来增强 `dispatch` 是不太雅观的，更优雅的方式是用 redux 提供了中间件的功能来增强 `dispatch` 函数。

## 中间件

可能很多人还不会写 redux 的中间件。其实非常简单，都是有套路的。首先，弄一个模板出来：

```js
const thunkMiddleware = ({dispatch, getState}) => (next) => (action) => {
  next(action) // 交给下一个中间件处理
}
```

上面相当于一个啥也不做的 "Hello World" 版中间件，然后根据我们刚刚的思路做出基础版 redux-thunk 中间件：

```js
const thunkMiddleware = ({dispatch, getState}) => (next) => (action) => {
  if (typeof action === 'function') {
    action(dispatch, getState) // 如果是函数，执行该函数
  } else {
    next(action) // 交给下一个中间件处理
  }
}
```

然后在 store.js 里用 `applyMiddleware` 加入中间件：

```js
// store.js
const store = createStore(reducer, initState, applyMiddleware(thunkMiddleware))
```

刷新页面会发现在执行 `onClick` 的时候，会发现根本没有 loading！

```js
const onClick = async () => {
  setLoading(true)
  await dispatch(fetchUserById(id))
  setLoading(false)
}
```

这是因为 `fetchUserById` 返回是个 Promise，而中间件里没有把它 return 出去，所以 `setLoading(false)` 并没有等 `await dispatch(fetchUserById(id))` 的 Promise 回来就执行了。

为了解决这个问题，只需在中间件里加一句 `return` 就好，并简化一下代码：

```js
const thunkMiddleware = ({dispatch, getState}) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(dispatch, getState)
  }

  return next(action)
}
```

可能有人会觉得 `action(dispatch, getState)` 里为什么不传 `next` 函数，而是传入 `dispatch` 函数呢？毕竟 next 到最后就是 `dispatch` 了呀，这里就不得不做 `next` 和 `dispatch` 这两个函数的执行意义了：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7684c43a3f304fef9fdd47d04642d3af~tplv-k3u1fbpfcp-zoom-1.image)

* store.dispatch，也就是我们经常用到的 dispatch 函数，其实是通过所有中间件增强后的 dispatch，可以理解为 `completelyEnhancedDispatch`
* next，函数签名也是 `(action) => action`，但是这是在走中间件时的函数，有点像增强到一半的 dispatch，可以理解为 `partiallyEnhancedDispatch`

对比如下：

| 函数 | 类型 | 增强程度 | 执行流程 | 意义 |
|---|---|---|---|---|
| dispatch | `(action) => action` | 完全增强 | 走完整个中间件流程，在最后调用原始的  `dispatch(action)` | 开始整个分发的流程 |
| next | `(action) => action` | 半增强 | next 前为进入中间件部分，next 后为返回中间件部分 | 交给下一个中间件处理 |

**在 `fetchUserById` 函数里的 `dispatch` 的工作是要分发 action，要这个 action 是要走完所有中间件流程的，而不是传给下一个中间件处理，所以中间件里传入的参数为 `dispatch` 函数而不是 `next` 函数。**

## withExtraArgs

上面看到我们“顺手”把 `getState` 也作为参数传入 action 函数里了，除了 dispatch 和 getState，开发者可能也可能想传一些额外的参数进去，比如开发环境 env 啥的。

我们创建一个工厂函数 `createThunkMiddleware`，然后把 `extraArgs` 传入 action 第三个参数里就可以了：

```js
function createThunkMiddleware(extraArgs) {
  return ({dispatch, getState}) => (next) => (action) => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgs)
    }

    return next(action)
  }
}

const thunkMiddleware = createThunkMiddleware()

thunkMiddleware.withExtraArgs = createThunkMiddleware

export default thunkMiddleware
```

使用的时候完成参数传递：

```js
// store.js
const store = createStore(
  reducer,
  initState,
  applyMiddleware(thunkMiddleware.withExtraArgs('development'))
)
```

最后在 `fetchUserById` 里获取 `"development"` 的值：

```js
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
```

## 复盘

到此我们终于实现了 redux-thunk 这个库的功能了。再来复盘一下整个过程是怎样的：

1. 我们需要完成获取信息，并用 `dispatch` 修改 store 数据的需求，按理说啥事没有
2. 但是发现在组件里这么写会依赖 `dispatch` 函数，所以把 `dispatch` 放到参数上
3. 又发现每次执行的时候都要传入 `dispatch` 函数，很麻烦，所以把 `dispatch` 作为第一个参数，并写出 `(dispatch) => (id) => {...}` 这样的函数结构，用 `dispatch` 初始化后可以到处使用了
4. 发现每次都要初始化还是很麻烦，而且容易被误导，所以我们考虑使用 `(id) => (dispatch) => {...}` 的函数结构，但是会出现 `fetchUserById(id)(dispatch)` 这样的结构
5. 我们希望将整个结构反过来变成这样：`dispatch(fetchUserById(id))`，所以想到了要改写 `dispatch` 函数
6. 发现直接赋值是个很笨的行为，比较高级的是使用中间件来改写 `dispatch` 函数
7. 最后，我们做了一个中间件出来，就叫做 redux-thunk

## 总结

最后来回答一些我在 redux 社区里看到的一些问题。

### redux-thunk 到底解决了什么问题？

**会发现 redux-thunk 并没有解决什么实际问题，只是提供了一种写代码的 “thunk 套路”，然后在 dispatch 的时候自动 “解析” 了这样的套路。**

那有没有别的 pattern 呢？有的，再比如你写成 Promise 的形式，然后 `dispach(acitonPromise)` ，然后自己在中间件里解析这个 Promise：

```js
export default function promiseMiddleware({ dispatch }) {
  return next => action => {
    if (!isFSA(action)) {
      return isPromise(action) ? action.then(dispatch) : next(action);
    }

    return isPromise(action.payload)
      ? action.payload
          .then(result => dispatch({ ...action, payload: result }))
          .catch(error => {
            dispatch({ ...action, payload: error, error: true });
            return Promise.reject(error);
          })
      : next(action);
  };
}
```

写好了吧？再发个 npm 包吧？OK，一个月下载量 7 万的 redux-promise 中间件就实现了。啊？这么简单的代码都值 7 万？不行，我也要自己编 pattern，把 Promise 改成 generator：`dispatch(actionGenerator)` 不就又一个 pattern 了，但是这个已经被 redux-saga 注册专利了。呃，那用 RxJs？但是被 redux-observable 实现了。

令人遗憾的是，基本上你能想到的 pattern 都被开发得差不多了。目前来说，redux-thunk, redux-saga 以及 redux-loop 是比较常用的 “pattern 解析器”，他们自己都提供了一套属于自己的 pattern，让开发者在自己的框架里随意 dispatch。

需要注意的是，redux-thunk 和后面两者其实并不是一个等级的库，后面两都除了提供 pattern 的 “翻译” 功能之外还有很多如 error handling 这样的特性，这里不展开说了。

### dispatch 到底是异步的还是同步的

刚开始学习的人看到 `await dispatch(getUserById(id))` 就会觉得加了中间件后 `dispatch` 是个异步函数，但是 redux 文档说了 `dispatch` 是同步的，感觉很蒙逼。

解析一下无论加了多少个中间件，最原始的 `dispatch` 函数一定是个同步函数。之所以可以 `await` 是因为 `getUserById` 返回的函数是异步的，当 `dispatch(getUserById(id))` 时其实是执行了 `getUserById` 的返回函数，此时 `dispatch` 确实是异步的。但是，对于普通的 `dispatch({type: 'SET_USER', payload: ...})` 是同步的。

### 要不要使用 redux-thunk

如果你在第 1 步的时候就觉得依不依赖 `dispatch` 对我都没什么影响，在组件里直接用 `dispatch` 也很方便呀。那完全不用管理什么 thunk，saga 的，安心撸页面就可以了。

redux-thunk 说白了也只是提供一种代码书写的 pattern，对提取公共代码是有帮助的。但是也不要滥用，过度使用 thunk，很容易导致过度设计。

比如，就刚刚这个需求，只是拿个用户信息设置一下，这么点代码放在组件里一点问都没有，还谈不上优化。就算这个代码被用了 2 ~ 3 次了，我觉得还是可以不用这么快来优化。除非出现 5 ~ 7 次的重复了并且代码量很大了，那么可以考虑提取为公共函数。

有时过度设计会造成严重的反噬，出现一改就崩的局面。而重复冗余的代码却可以在需求变化多端的项目中实现增量优化。优化与重复总是在天平的左右，做项目时应该保持一种天然平衡，而不是走向极端。

