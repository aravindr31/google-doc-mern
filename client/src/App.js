import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";
import Editor from "./Editor";
import { v4 } from "uuid";
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Redirect to={`/document/${v4()}`} />
        </Route>
        <Route path="/document/:id">
          <Editor />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
