import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserRouter, makeRouteConfig, Route } from 'found'

import Layout from './Layout'
import Login from './Login'

const mountNode = document.createElement('div')
document.body.appendChild(mountNode)

const BrowserRouter = createBrowserRouter({
  routeConfig: makeRouteConfig(
    <Route path='/' Component={Layout}>
      <Route Component={Login} />
    </Route>
  )
})

ReactDOM.render(<BrowserRouter />, mountNode)
