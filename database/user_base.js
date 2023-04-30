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
            var proObj =
            {
                item: objectId(proId),
                qut: 1
            }
            var cartpro = await db.get().collection(consts.cart_base).findOne({ userid: objectId(userId) })

            if (cartpro) {
                var proindex = cartpro.products.findIndex(pro => pro.item == proId)
                console.log(proindex);

                if (proindex != -1) {
                    await db.get().collection(consts.cart_base).updateOne({ 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.qut': 1 }
                        }).then((data) => {
                            resolve(data)
                        })
                }
                else {

                    db.get().collection(consts.cart_base).updateOne({ userid: objectId(userId) },
                        {
                            $push:
                            {
                                products: proObj
                            }
                        }).then((data) => {
                            //console.log("addeddd........")
                            resolve(data)
                        })

                }


            }
            else {
                var state =
                {
                    userid: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(consts.cart_base).insertOne(state).then((data) => {
                    console.log(data)
                    resolve(data)
                })
            }
        })
    },
    cart_count: (userId) => {
        return new Promise(async (resolve, reject) => {
            var count = await db.get().collection(consts.cart_base).findOne({ userid: objectId(userId) })
            console.log(count);
            if (count) {
                console.log(count)
                resolve(count.products.length)
            }
            else {
                resolve(0)
            }

        })
    },
    Get_cart_products: (userId) => {
        return new Promise(async (resolve, reject) => {
            var cartpro = await db.get().collection(consts.cart_base).aggregate([
                {
                    $match:
                    {
                        userid: objectId(userId)
                    }

                },
                {
                    $unwind: "$products"
                },
                {
                    $project:
                    {
                        userId: "$userid",
                        item: "$products.item",
                        qut: "$products.qut"
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.sell_base,
                        localField: "item",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $project:
                    {
                        userId: 1, item: 1, qut: 1,
                        pro: {
                            $arrayElemAt: ["$product", 0]
                        }
                    }
                }
            ]).toArray()
           // console.log(cartpro[0])
            resolve(cartpro)
        })
    },
    Add_pets_sell: (userId, data) => {
        return new Promise(async (resolve, reject) => {
            var state =
            {
                userid: objectId(userId),
                petinfo: data
            }
            await db.get().collection(consts.sell_base).insertOne(state).then((data) => {
                //console.log(data)
                resolve(data.ops[0]._id)
            })
        })
    },
    get_pets_by_user: () => {
        return new Promise(async (resolve, reject) => {
            var pets = await db.get().collection(consts.sell_base).find().toArray()
            // console.log(pets)
            resolve(pets)


        })
    },
    Get_user_selldetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            var pets = await db.get().collection(consts.sell_base).find({ userid: objectId(userId) }).toArray()
            // console.log(pets)
            resolve(pets)

        })
    },
    Delete_user_sell: (proId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.sell_base).removeOne({ _id: objectId(proId) }).then((data) => {
                //console.log(data)
                resolve(data)
            })
        })
    },
    Get_choosed_product_info: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.sell_base).findOne({ _id: objectId(proId) }).then((product) => {
                //console.log(product)
                resolve(product)
            })
        })
    },
    Get_cart_products2: (userId) => {
        return new Promise(async (resolve, reject) => {
            var carts = await db.get().collection(consts.cart_base).aggregate([
                {
                    $match:
                    {
                        users: objectId(userId)
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.admin_base,
                        let: { proList: '$products' },
                        pipeline:
                            [
                                {
                                    $match:
                                    {
                                        $expr:
                                        {
                                            $in: ['$_id', '$$proList']
                                        }
                                    }
                                }
                            ],
                        as: 'allproducts'
                    }
                }
            ]).toArray()
            //console.log(carts[0].allproducts)
            resolve(carts[0].allproducts)
        })
    },
    Cart_remove_products: (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.cart_base).updateOne({ users: objectId(userId) }, { "$pull": { "products": objectId(proId) } }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    Get_Details_of_admin_products: (proId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.admin_base).findOne({ _id: objectId(proId) }).then((data) => {
                // console.log(data)
                resolve(data)
            })
        })
    },
    Change_product_Quantity: (data) => {
        console.log(data)
        return new Promise(async (resolve, reject) => {
            console.log(data.quantity, data.cut);
            if (data.quantity == 1 && data.cut == -1) {
                await db.get().collection(consts.cart_base).updateOne({ _id: objectId(data.cartid) }, {
                    $pull: { products: { item: objectId(data.proid) } }
                }).then((data) => {
                    resolve({ data: true })
                })
            }
            else {
                await db.get().collection(consts.cart_base).updateOne({ _id: objectId(data.cartid), "products.item": objectId(data.proid) },
                    {
                        $inc:
                        {
                            "products.$.qut": parseInt(data.cut)
                        }
                    }).then((data) => {
                        resolve({ data: false });
                    })
            }
        })
    },
    Total_amount_from_carted_products: (userId) => {
       
            return new Promise(async (resolve, reject) => {
                var total = await db.get().collection(consts.cart_base).aggregate([
                    {
                        $match:
                        {
                            userid: objectId(userId)
                        }

                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $project:
                        {
                            userId: "$userid",
                            item: "$products.item",
                            qut: "$products.qut"
                        }
                    },
                    {
                        $lookup:
                        {
                            from: consts.sell_base,
                            localField: "item",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    {
                        $project:
                        {
                            userId: 1, item: 1, qut: 1,
                            first: {
                                $arrayElemAt: ["$product", 0]
                            }
                        }
                    },
                    {
                        $group:
                        {
                            _id: null,
                            totalAmount: { $sum: { $multiply: [{ $toInt: "$first.petinfo.price" }, "$qut"] } }
                        }
                    }
                ]).toArray()
                if (total[0]) {
                    resolve(total[0].totalAmount)
                }
                else {
                    resolve(0)
                }
                //resolve(total)
            })
        },
        User_Placed_Orderd:()=>
        {
            return new Promise(async(resolve,reject)=>
            {
                var state=
                {
                    spuser:s_user,
                    proId:objectId(proid),
                    quantity:Quantity
                }
                var ss=await db.get().collection(consts.Order_base).findOnd({spuser:objectId(suser)})
                if(ss)
                {
                    
                }
                else
                {
                   await db.get().collection(consts.Order_base).insertOns(state).then((data)=>
                   {
                    console.log(data)
                   })
                }
            })
        }
    

}
       

