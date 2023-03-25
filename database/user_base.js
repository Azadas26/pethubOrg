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
            if (count)
            {
                resolve(count.products.length)
            }
            else
            {
                resolve(0)
            }

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
                        from:consts.sell_base,
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
    },
    Add_pets_sell:(userId,data)=>
    {
        return new Promise(async(resolve,reject)=>
        {
             var state=
             {
                userid : objectId(userId),
                petinfo:data
             }
             await db.get().collection(consts.sell_base).insertOne(state).then((data)=>
             {
                //console.log(data)
                resolve(data.ops[0]._id)
             })
        })
    },
    get_pets_by_user:()=>
    {
        return new Promise(async(resolve,reject)=>
        {
            var pets=await db.get().collection(consts.sell_base).find().toArray()
           // console.log(pets)
            resolve(pets)
            
            
        })
    },
    Get_user_selldetails:(userId)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            var pets = await db.get().collection(consts.sell_base).find({userid:objectId(userId)}).toArray()
           // console.log(pets)
            resolve(pets)
           
        })
    },
    Delete_user_sell:(proId)=>
    {
        return new Promise(async(resolve,reject)=>
        {
             await db.get().collection(consts.sell_base).removeOne({_id:objectId(proId)}).then((data)=>
             {
                //console.log(data)
                resolve(data)
             })
        })
    },
    Get_choosed_product_info:(proId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(consts.sell_base).findOne({ _id: objectId(proId) }).then((product) => {
                //console.log(product)
                resolve(product)
            })
        })
    }
}