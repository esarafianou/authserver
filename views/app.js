import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserRouter, makeRouteConfig, Route } from 'found'

import Layout from './Layout'
import Login from './Login'
import Authorization from './Authorization'

const mountNode = document.createElement('div')
document.body.appendChild(mountNode)

const BrowserRouter = createBrowserRouter({
  routeConfig: makeRouteConfig(
    <Route path='/' Component={Layout}>
      <Route Component={Login} />
      <Route path='oauth' Component={Authorization} />
    </Route>
  )
})

ReactDOM.render(<BrowserRouter />, mountNode)
