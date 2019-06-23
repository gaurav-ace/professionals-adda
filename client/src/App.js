import React, { Fragment, useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from './components/layouts/Navbar'
import Landing from './components/layouts/Landing'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Alert from './components/layouts/Alert'
import Dashboard from './components/dashboard/Dashboard'
import PrivateRoute from './components/routing/PrivateRoute'
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
          <Route exact path='/' component={Landing} />
          <section className='container'>
            <Alert />
            <Switch>
              <Route exact path='/register' component={Register} />
              <Route exact path='/login' component={Login} />
              <PrivateRoute exact path='/dashboard' component={Dashboard} />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  )
}

export default App
