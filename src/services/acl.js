class acl {
  constructor() {
    this.users = [];
    this.roles = [];
    this.checking = false;
    this.errorMessages = []; //Logging all error messages generated while checking the permissions
  }
  createRole = role => {
    this.roles.push(role);
  };
  getAllRoles = () => {
    return this.roles;
  };
  getAllUsers = () => {
    return this.users;
  };
  createUser = () => {
    let newUser = {
      role: "", // i.e admin
      permissions: [],
      hasWhen: false, //To indicate whether the permission needed has a when function associated with it
      permissionFound: false, //If the permission needed was found successfully
      isFalse: false, // If a  method call returned false, bubble it to the end of sequence of invoking
      requiredPermissions: [], //Store the permissions that map to the httpVerb indicated in the can(httpVerb) function for use in to()
      finalPermission: "", //Store the final corresponding permission to be used in when() function
      currentStage: 0, // Stages enforce the sequence of invoking of functions to be an/a().can().to/from().when(), other than that an Exception is thrown
      to: target => {
        if (newUser.currentStage === 1) {
          newUser.currentStage = 2; //to() ----> stage=2
          if (newUser.isFalse) return false;
          //End of bubbling of false result
          else return to(target, newUser);
        } else {
          throw "Must Invoke to() or from() after can()";
        }
      },
      from: target => {
        return newUser.to(target);
      },
      when: (functObj, ...restArgs) => {
        //If we are creating the permission, the when function takes another function
        //If we are the checking the permission, the when function takes an object to be checked i.e {id:20}
        if (newUser.currentStage === 2) {
          newUser.currentStage = 3; // when() -----> stage=3
          if (!aclInstance.checking) {
            let end = newUser.permissions.length - 1;
            newUser.permissions[end].whenFunction = functObj;
          } else {
            if (newUser.isFalse) return false;
            let returnOfWhen = newUser.finalPermission.whenFunction(
              newUser.finalPermission.params,
              functObj,
              ...restArgs
            );
            if (!returnOfWhen) {
              //When function returned false
              aclInstance.errorMessages.push(
                "Parameter values in when function are not matching"
              );
            }
            return returnOfWhen;
          }
        } else {
          throw "Must invoke when() after to() or from()";
        }
      },
      can: httpVerb => {
        if (newUser.currentStage === 0) {
          newUser.currentStage = 1; //can() ----> stage=1
          if (newUser.isFalse) return newUser; //Bubbling the false upwards;
          return can(httpVerb, newUser);
        } else {
          throw "Must invoke can() after an() or a()";
        }
      }
    };
    return newUser;
  };
}

const aclInstance = new acl();

export const an = role => {
  const { roles, users } = aclInstance;
  checkRoleExists(role); //throws an error if role doesn't exist
  let userFound = checkUserExists(role);
  if (userFound) {
    userFound.currentStage = 0;
    return userFound;
  } else {
    // No permission was done before for that user role, so create a new User entry for permissions
    let userInstance = aclInstance.createUser();
    userInstance.role = role;
    aclInstance.users.push(userInstance);
    return userInstance;
  }
};
export const a = role => {
  //Alias for an(role)
  return an(role);
};

export const check = {
  if: role => {
    setChecking(); //Started checking for permission
    let { users } = aclInstance;
    let falseUser = aclInstance.createUser();
    falseUser.isFalse = true; // Dummy user role having value false to be bubbled till to() function
    if (!checkRoleExists(role)) {
      aclInstance.errorMessages.push("Role (" + role + ") doesn't exist");
      return falseUser;
    }
    let userFound = checkUserExists(role);
    if (userFound) {
      initializeAttrs(userFound);
      return userFound;
    } else {
      aclInstance.errorMessages.push(
        "NO permissions for role: ( " + role + " ) yet"
      );
      return falseUser;
    }
  }
};
const initializeAttrs = userFound => {
    //Initialize the variables used in checking the permissions
    userFound.currentStage = 0;
    userFound.isFalse = false;
    userFound.hasWhen = false;
    userFound.requiredPermissions = [];
    userFound.finalPermission = "";
    userFound.permissionFound = false;
  };

const to = (target, newUser) => {
  if (!aclInstance.checking) {
    let end = newUser.permissions.length - 1;
    setParamsKeys(target, newUser); //Setting keys of the equivalent permission
    newUser.permissions[end].target = target;
  } else {
    //If there was no when() function added while setting, to() returns true in case of mathing target and false otherwise.
    // Else it returns User Object after setting correct parameter values

    let found = false;
    newUser.requiredPermissions.map(permission => {
      if (permission.target === target) {
        found = true;
      }
    });
    if (found) {
      return found;
    } //If target endpoint wasn't found directly, we try to map it with endpoints that have parameter values
    if (setParamsValues(newUser, target)) {
      if (newUser.hasWhen) return newUser;
      //Parameter values in the endpoint added successfully
      else return true;
    } else {
      return false; //No corresponding endpoint was found
    }
  }

  return newUser;
};
const setParamsKeys = (target, newUser) => {
  let end = newUser.permissions.length - 1;
  let targetString = target + "";
  if (targetString.includes(":")) {
    let divisions = targetString.split("/");
    for (let i = 0; i < divisions.length; i++) {
      //Get all parameter names
      let division = divisions[i];
      if (division.includes(":")) {
        //Adds all url parameters to params object for this permission
        let currentPermission = newUser.permissions[end];
        let parameterName = division.slice(1);
        currentPermission.params[parameterName] = i; //Value for the parameters will be set while checking
      }
    }
  }
};
const can = (httpVerb, newUser) => {
  if (!aclInstance.checking) {
    //Create a new Permission if we're not checking on a permission
    let newPermission = {
      httpVerb: httpVerb,
      target: "",
      params: [],
      whenFunction: ""
    };
    newUser.permissions.push(newPermission);
  } else {
    if (!addRequiredPermissionsIfExists(newUser, httpVerb)) {
      aclInstance.errorMessages.push(
        "The Http verb: ( " +
          httpVerb +
          " ) didn't match any corresponding permission for (" +
          newUser.role +
          ")"
      );
      newUser.isFalse = true; //Bubble the false upwards to be printed by the to()
    }
  }
  return newUser;
};
function isPositiveInteger(s) {
  //checks if string is a positive integer
  return /^\+?[1-9][\d]*$/.test(s);
}
const setParamsValues = (user, target) => {
  let targetString = target + "";
  let targetDivisions = targetString.split("/");
  user.requiredPermissions.map(permission => {
    //Map params values to correct permission in required permission
    let currentDivisons = (permission.target + "").split("/");
    let matching = true;
    if (currentDivisons.length === targetDivisions.length) {
      for (let i = 0; i < currentDivisons.length; i++) {
        if (!currentDivisons[i].includes(":")) {
          if (!(currentDivisons[i] === targetDivisions[i])) {
            matching = false;
            break;
          }
        }
      }
      if (matching) { //Found an equivalent permission taking into consideration the parameter values specified
        user.permissionFound = true;
        if (permission.whenFunction === "") {
          user.hasWhen = false;
          return true;
        } else {
          user.hasWhen = true;
          user.finalPermission = permission;
        }
      }
    }
  });
  if (!user.permissionFound) {
    //No Corresponding Permission was found for target specified
    aclInstance.errorMessages.push(
      "NO Corresponding endpoint was found for ( " +
        target +
        " ), httpVerb: " +
        user.requiredPermissions[0].httpVerb +
        " role: " +
        user.role
    );
    return false;
  } else if (user.finalPermission !== "") {
    let params = user.finalPermission.params;
    Object.keys(params).map(key => {
      //Traversing the params to set their values based on matching target
      if (isPositiveInteger(targetDivisions[params[key]]))
        //checking if value is an integer for correct comparison
        params[key] = parseInt(targetDivisions[params[key]] + "");
      else {
        params[key] = targetDivisions[params[key]] + "";
      }
    });
    return true;
  }
};
const addRequiredPermissionsIfExists = (user, httpVerb) => {
  //Filters all the permissions according to the required httpVerb
  user.permissions.map(permission => {
    if (permission.httpVerb === httpVerb) {
      user.requiredPermissions.push(permission);
    }
  });
  if (user.requiredPermissions.length === 0) {
    return false;
  }
  return true;
};

const setChecking = () => {
  //Started Checking
  aclInstance.checking = true;
};
const checkRoleExists = role => {
  //Checking if role was created
  let { roles } = aclInstance;
  if (!roles.includes(role)) {
    if (!aclInstance.checking) {
      throw "ROLE NOT FOUND";
    } else {
      return false;
    }
  }
  return true;
};
const checkUserExists = role => {
  let { users } = aclInstance;
  let userFound = users.find(user => {
    //Check if any permission was created for that role before
    return user.role === role;
  });
  return userFound;
};

export default aclInstance;
