import acl from "./acl";
import { an, check, a } from "./acl";

 // create different roles
export const createNeededRoles = ()=>{
 acl.createRole("admin");
 acl.createRole("writer");
 acl.createRole("reader");
 }
export const setPermissions = ()=>{
try{
// a writer can view all books
a('writer').can('get').from('/books');

// a writer can post a book
a('writer').can('post').to('/books');

// a writer can write a review on book not written by him
a('writer').can('put').to('/books/:bookID/addReview').when((params,book,writer)=>
  ((params.bookID===book.id)&&!(book.writerID===writer.id))
);

// an admin can approve a book
an('admin').can('put').to('/books/approvebook')

// an admin can remove a book only if the book is not original
an('admin').can('delete').from('/books/:bookID').when((params,book)=>params.bookID===book.id&&book.isOriginal===true)

// a reader can view all books
a('reader').can('get').from('/books');

// a reader can add comment on a book
a('reader').can('put').to('/books/addComment')
}catch(err){
    console.log(err);
}
 }
export const checkPermissions = ()=>{
    try{
        let results = [];
        results.push(check.if('writer').can('get').from('/books')) //true
        results.push(check.if('writer').can('post').to('/reviews')); //false
        results.push(check.if('writer').can('put').to('/books/10/addReview').when({writerID:20,id:10},{id:20})); //false
        results.push(check.if('writer').can('put').to('/books/12/addReview').when({writerID:20,id:12},{id:560})); //true
        results.push(check.if('writer').can('put').to('/books/10/addReview').when({writerID:20,id:10},{id:10})); //true
        results.push(check.if('reader').can('put').to('/books/approvebook')); //false
        results.push(check.if('reader').can('get').from('/books')); //true
        results.push(check.if('admin').can('delete').from('/books/12').when({id:12,isOriginal:true})); //true
        results.push(check.if('admin').can('delete').from('/books/12').when({id:12,isOriginal:false})); //false
        results.push(check.if('admin').can('put').from('/books/approvebook')); //true
        results.forEach((result)=>{
            console.log(result);
        })
        console.log(acl.errorMessages);
        return {errors:acl.errorMessages,results:results};
    }catch(err){
        console.log(err)
    }
}
console.log(acl.getAllUsers())