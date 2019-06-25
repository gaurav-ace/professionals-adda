import React, { Fragment, useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from './components/layouts/Navbar'
import Landing from './components/layouts/Landing'
import Routes from './components/routing/Routes'
import './App.css'

import { Provider } from 'react-redux'
import store from './store'
import { loadUser } from './actions/auth'
import setauthtoken from './utils/setauthtoken'

if (localStorage.token) {
  setauthtoken(localStorage.token)
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser())
  }, []) // to run this and finish for only once,we use empty brackets

  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Switch>
            <Route exact path='/' component={Landing} />
            <Route component={Routes} />
          </Switch>
        </Fragment>
      </Router>
    </Provider>
  )
}

export default App
