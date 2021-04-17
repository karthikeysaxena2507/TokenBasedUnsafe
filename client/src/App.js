import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import Home from "./Pages/Home";
import Xss from "./Pages/Xss";
import Login from "./Pages/Login";
import Change from "./Pages/Change";
import Register from "./Pages/Register";
import Error from "./Pages/Error";

// COMPONENT TO DEFINE ALL ROUTES AND GATHER ALL COMPONENTS
const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/xss" component={Xss} />
        <Route exact path="/change" component={Change} />
        <Route exact path="/home" component={Home} />
        <Route path="*" component={Error} />
      </Switch>
    </Router>
  );
}
export default App;
