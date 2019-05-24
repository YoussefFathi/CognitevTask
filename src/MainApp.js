import React from "react";
import acl from "./services/acl";
import { an, check, a } from "./services/acl";
import {setPermissions,checkPermissions,createNeededRoles} from "./services/testing"
class MainApp extends React.Component {
  constructor() {
    super();
  }
  startTesting = () => {
    createNeededRoles();
    setPermissions();
    checkPermissions();
  };
  render() {
    return (
      <div>
        <h1> Welcome To Cognitev Task</h1>
        <button onClick={this.startTesting}>Start Now</button>
      </div>
    );
  }
}
export default MainApp;
