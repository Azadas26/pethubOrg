const { resolve } = require('promise')
var Promise = require('promise')
var db = require('../connection/connect')
var consts = require('../connection/consts')
var objectId = require('mongodb').ObjectId

module.exports =
{
     Input_admin_products:(data)=>
     {
       return new Promise((resolve,reject)=>
       {
           db.get().collection(consts.admin_base).insertOne(data).then((data)=>
           {
            // console.log(data)
            resolve(data.ops[0]._id)
           })
       })
     },
     Output_admin_products:()=>
     {
         return new Promise(async(resolve,reject)=>
         {
            await db.get().collection(consts.admin_base).find().toArray().then((data)=>
             {
                 //console.log(data)
                 resolve(data)
             })
         })
     },
     Delete_product:(id)=>
     {
         return new Promise(async(resolve,reject)=>
         {
             await db.get().collection(consts.admin_base).removeOne({_id:objectId(id)}).then((data)=>
             {
                //console.log(data)
                resolve(data)
             })
         })
     },
     Get_datafor_edit : (id)=>
     {
         return new Promise(async(resolve,reject)=>
         {
             await db.get().collection(consts.admin_base).findOne({_id:objectId(id)}).then((data)=>
             {
                 //console.log(data)
                 resolve(data)
             })
         })
     },
     Do_edit:(id,data)=>
     {
         return new Promise(async(resolve,reject)=>
         {
             await db.get().collection(consts.admin_base).updateOne({_id:objectId(id)},
             {
                 $set:
                 {
                     name:data.name,
                     discription:data.discription,
                     price:data.price
                 }
             }).then((data)=>
             {
                //console.log(data)
                resolve(data)
             })
         })
     }
}