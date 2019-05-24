import React from "react";
import acl from "./services/acl";
import { an, check, a } from "./services/acl";
import {
  setPermissions,
  checkPermissions,
  createNeededRoles
} from "./services/testing";
import "./mainApp.css";
class MainApp extends React.Component {
  constructor() {
    super();
    this.state = {
      errors: []
    };
  }
  componentDidMount() {
    createNeededRoles();
    setPermissions();
  }
  startTesting = () => {
    let messages = checkPermissions();
    this.setState({ errors: messages });
  };
  render() {
    let { errors } = this.state;
    return (
      <div className="mainWindow">
        <h1> Welcome to IPublish</h1>
        <button onClick={this.startTesting}>Start Checking Now</button>
        <h3>Error Messages :</h3>
        {errors.length > 0 ? (
          <ul>
            {errors.map(error => {
              return <li>{error}</li>;
            })}
          </ul>
        ) : (
          <p>NO ERRORS</p>
        )}
      </div>
    );
  }
}
export default MainApp;
