import acl from "./acl";
import { an, check, a } from "./acl";

 // create different roles
export const createNeededRoles = ()=>{
 acl.createRole("admin");
 acl.createRole("user");
 acl.createRole("guest");
 acl.createRole("amir");
 }
export const setPermissions = ()=>{
// admin can list all users
an('admin').can('get').from('/users');
// admin can create users
an('admin').can('post').to('/users');
// user can post an article only when it's his data
a('user').can('post').to('/users/:userId/articles').when((params, user) =>
user.id === params.userId);
a('user').can('get').from('/users/:userId/books/:bookId/:stateID').when((params,user,book,state) =>
user.id === params.userId&& book.bookId===params.bookId && params.stateID === state.stateID);
// guest can get data from articles
a('guest').can('get').from('/articles');
 }
export const checkPermissions = ()=>{
    try{
        console.log(check.if('guest').can('get').from('/articles'));
        console.log(check.if('admin').can('post').to('/users'));
        console.log(check.if('user').can('post').to('/users/10/articles').when({id:10}));
        console.log(check.if('user').can('get').from('/users/10/books/12/12').when({id:10},{bookId:12},{stateID:12}));
        console.log(acl.errorMessages);
    }catch(err){
        console.log(err)
    }
}
console.log(acl.getAllUsers())