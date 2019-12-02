import React from 'react'
import ReactDOM from 'react-dom'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import RichTextExample from './examples/rich-text'
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
