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
      errors: [],
      results: []
    };
  }
  componentDidMount() {
    createNeededRoles();
    setPermissions();
  }
  startTesting = () => {
    let returnObject = checkPermissions();
    let results = returnObject.results;
    let errors = returnObject.errors;
    this.setState({ errors: errors, results: results });
  };
  render() {
    let { errors,results } = this.state;
    return (
      <div className="mainWindow">
        <h1> Welcome to IPublish</h1>
        <button onClick={this.startTesting}>Start Checking Now</button>
        <div className="messages">
        <div className="results">
        <h3>Results of Checks:</h3>
            <ol>
                {results.map((result)=>{
                    return <li>{result+""}</li>
                })}
                </ol>
        </div>
          <div className="errors">
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
        </div>
      </div>
    );
  }
}
export default MainApp;
