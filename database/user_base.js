var Promise = require('promise')
var bcrypt = require('bcrypt')
var db = require('../connection/connect')
var consts = require('../connection/consts')
const { reject, resolve } = require('promise')
var objectId = require('mongodb').ObjectId


module.exports =
{
    Do_sinup: (data) => {
        return new Promise(async (resolve, reject) => {
            data.Password = await bcrypt.hash(data.Password, 10);
            //console.log(data)
            db.get().collection(consts.user_base).insertOne(data).then((data) => {
                //console.log(data)
                resolve(data)
            })
        })
    },
    Do_login: (data) => {
        return new Promise(async (resolve, reject) => {
            var info = await db.get().collection(consts.user_base).findOne({ Email: data.Email })
            if (info) {
                var state =
                {
                    status: true,
                    users: info
                }
                bcrypt.compare(data.Password, info.Password).then((data) => {
                    // console.log(data)
                    if (data) {
                        //console.log("Login success fulll...")
                        resolve(state)
                    }
                    else {
                        //console.log("Login Faild.....")
                        resolve({ status: false })
                    }
                })
            }
            else {
                // console.log("Incorrect Email address...")
                resolve({ status: false })
            }
        })
    },
    Add_to_cart: (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            var cartpro = await db.get().collection(consts.cart_base).findOne({ users: objectId(userId) })
            if (cartpro) {
                db.get().collection(consts.cart_base).updateOne({ users: objectId(userId) },
                    {
                        $push:
                        {
                            products: objectId(proId)
                        }
                    }).then((data) => {
                        resolve(data)
                    })
            }
            else {
                var state =
                {
                    users: objectId(userId),
                    products: [objectId(proId)]
                }
                db.get().collection(consts.cart_base).insertOne(state).then((data) => {
                    //console.log(data)
                    resolve(data)
                })
            }
        })
    },
    cart_count :(userId)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            var count= await db.get().collection(consts.cart_base).findOne({users:objectId(userId)})
            resolve(count.products.length)

        })
    },
    Get_cart_products:(userId)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            var cartpro = await db.get().collection(consts.cart_base).aggregate([
                {
                    $match:
                    {
                        users:objectId(userId)
                    }
                    
                },
                {
                    $lookup:
                    {
                        from:consts.admin_base,
                        let:{cartList:"$products"},
                        pipeline:[
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $in:['$_id','$$cartList']
                                    }
                                }
                            }
                        ],
                        as:"cartcount"
                    }
                }
            ]).toArray()
            console.log(cartpro[0].cartcount)
            resolve(cartpro[0].cartcount)
        })
    }
}