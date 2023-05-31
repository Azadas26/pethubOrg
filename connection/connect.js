var mongoClient = require('mongodb').MongoClient
var Promise = require('promise')

var state=
{
    dn:null,
}

module.exports=
{
     connect : ()=>
     {
          return new Promise((resolve,reject)=>
          {
             var dbname = "PetHub"
              
              mongoClient.connect("mongodb://127.0.0.1", { useNewUrlParser: true, useUnifiedTopology: true },(err,data)=>
              {
                 if(err)
                 {
                   // console.log("Database connection error....")
                     reject("Database connection error....")
                 }
                 else
                 {
                    state.db = data.db(dbname);
                    //console.log("data base connection successfull...")
                     resolve("Database connection successfull...")
                 }
              })   

          })
     },
     get:()=>
     {
        return state.db;
     }
}

