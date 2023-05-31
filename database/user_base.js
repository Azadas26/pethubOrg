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
             await db.get().collection(consts.cart_base).findOne({userid:objectId(userId)}).then((pro)=>
            {
                resolve(pro)
            })
            // console.log(cartpro[0])
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
            console.log(userId,proId);
            await db.get().collection(consts.cart_base).updateOne({ userid: objectId(userId) },{ $pull: { products: { item: objectId(proId) }}}).then((data) => {
                // console.log(data)
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
                        from: consts.admin_base,
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
                        totalAmount: { $sum: { $multiply: [{ $toInt: "$first.price" }, "$qut"] } }
                    }
                }
            ]).toArray()
           // console.log(total);
             if (total[0]) {
                 resolve(total[0].totalAmount)
             }
             else {
                resolve(0)
             }
            //resolve(total)
        })
    },
    User_Placed_Orderd: () => {
        return new Promise(async (resolve, reject) => {
            var state =
            {
                spuser: s_user,
                proId: objectId(proid),
                quantity: Quantity
            }
            var ss = await db.get().collection(consts.Order_base).findOnd({ spuser: objectId(suser) })
            if (ss) {

            }
            else {
                await db.get().collection(consts.Order_base).insertOns(state).then((data) => {
                    console.log(data)
                })
            }
        })
    },
    Total_price_of_Each_product_by_Userproducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            var each = await db.get().collection(consts.cart_base).aggregate([
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
                        from: consts.admin_base,
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
                    $project:
                    {
                        userid: 1,
                        first: 1,
                        item: 1,
                        qut: 1,
                        totalAmount: { $sum: { $multiply: [{ $toInt: "$first.price" }, "$qut"] } }
                    }
                }

            ]).toArray()
            console.log(each);
            resolve(each)
        })
    },
    Place_single_Order_product__BY_User: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.single_Orders_base).insertOne(data).then((data) => {
                resolve(data)
            })
        })
    },
    view_user_celled_orders: (userId) => {
        return new Promise(async (resolve, reject) => {
            var details = await db.get().collection(consts.single_Orders_base).aggregate([
                {
                    $match: { me: objectId(userId) }
                },
                {
                    $lookup:
                    {
                        from: consts.sell_base,
                        localField: "product",
                        foreignField: "_id",
                        as: "products"
                    }
                },
                {
                    $project:
                    {
                        totalamount: 1, selluser: 1, quantity: 1, product: 1, me:1,
                        pro: {
                            $arrayElemAt: ["$products", 0]
                        }
                    }
                }
            ]).toArray()

            console.log(details);
            resolve(details)
        })
    },
    Place_order_Products_which_are_FROMAdminSide:(info)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(consts.adminOrder_base).insertOne(info).then((data)=>
            {
                resolve(data)
            })
        })
    },
    remove_Automatically_AllProductfrom_card_BsedOwn_orderPlace:(userId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(consts.cart_base).removeOne({ userid :objectId(userId)}).then(()=>
            {
                resolve();
            })
        })
    },
    Get_Product_Details_After_place_order:(userId)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            var products = await db.get().collection(consts.adminOrder_base).aggregate([
                {
                    $match:
                    {
                        user:objectId(userId)
                    }
                },
                {
                    $unwind:"$products"
                },
                {
                    $project:
                    {
                        _id:1,
                        adsress:1,
                        pin:1,
                        ph:1,
                        pay:1,
                        total:1,
                        status:1,
                        item:'$products.item',
                        quantity:'$products.qut',
                        user:1,
                        date:1
                    }
                },
                {
                    $lookup:
                    {
                        from:consts.admin_base,
                        localField: 'item',
                         foreignField:'_id',
                         as:"proinfo"
                    }
                },
                {
                    $project:
                    {
                        _id: 1,
                        adsress: 1,
                        pin: 1,
                        ph: 1,
                        pay: 1,
                        total: 1,
                        status: 1,
                        item: 1,
                        quantity: 1,
                        user: 1,
                        date: 1,
                        proinfo:
                        {
                            $arrayElemAt: ['$proinfo', 0 ]
                        }
                    }
                }
            ]).toArray()
            console.log(products);
            resolve(products)
        })
    },
    Place_Pets_orders:(info)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(consts.user_Orders_base).insertOne(info).then((data)=>
            {
                resolve(data)
            })
        })
    },
    Get_ordered_pet_Details:(userId)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            var pets = await db.get().collection(consts.user_Orders_base).find({byuser:objectId(userId)}).toArray()
            resolve(pets)
        })
    },
    Remove_pet_Product_When_Complete_PlaceOrder:(proId)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            await db.get().collection(consts.sell_base).removeOne({_id:objectId(proId)}).then(()=>
            {
                resolve()
            })
        })
    }
}


