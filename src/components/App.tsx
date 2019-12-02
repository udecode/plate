import React from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { ExamplePage } from './ExamplePage'

const App = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={ExamplePage} />
      <Route path="/examples" component={ExamplePage} />
    </Switch>
  </Router>
)

export default App
