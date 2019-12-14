import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ExamplePage } from './ExamplePage';

const App = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={ExamplePage} />
      <Route path="/examples" component={ExamplePage} />
    </Switch>
  </Router>
);

export default App;
