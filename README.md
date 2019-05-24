## Cognitev Task
An access control list module to be used in restricting access to certain end-points in your application.

This module has been wrapped inside a react app that simulates an example of an application which will make use of the ACL.js module to restrict access to certain users with certain roles.

The main functionalities and testing are included in `services` folder inside `acl.js` and `testing.js`.

Error messages clarifying the reasons behind failure of permissions after checking them is logged in an array of messages and printed at the end of checking.

For testing purposes, we simulated having an online books publishing application.   
-- Writers post their books on the application and write reviews on other books not written by them.   
-- Admin can remove/approve a certain book by a certain writer, or remove any comment/review made on an book.  
-- Reader can read any book or search for a specific book, and also can add comments on any book.  


