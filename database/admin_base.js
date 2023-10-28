const { resolve } = require('promise')
var Promise = require('promise')
var db = require('../connection/connect')
var consts = require('../connection/consts')
var objectId = require('mongodb').ObjectId

module.exports =
{
    Input_admin_products: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(consts.admin_base).insertOne(data).then((data) => {
                // console.log(data)
                resolve(data.ops[0]._id)
            })
        })
    },
    Output_admin_products_for_admin: () => {
        return new Promise(async (resolve, reject) => {
            console.log("hello world")
            await db.get().collection(consts.admin_base).find().toArray().then((data) => {
                //console.log(data)
                resolve(data)
            })
        })
    },
    Output_admin_products_acc: () => {
        return new Promise(async (resolve, reject) => {
            console.log("hello world")
            await db.get().collection(consts.admin_base).find({ type: 'acc' }).toArray().then((data) => {
                //console.log(data)
                resolve(data)
            })
        })
    },
    Output_admin_products_food: () => {
        return new Promise(async (resolve, reject) => {
            console.log("hello world")
            await db.get().collection(consts.admin_base).find({ type: 'food' }).toArray().then((data) => {
                //console.log(data)
                resolve(data)
            })
        })
    },
    Delete_product: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.admin_base).removeOne({ _id: objectId(id) }).then((data) => {
                //console.log(data)
                resolve(data)
            })
        })
    },
    Get_datafor_edit: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.admin_base).findOne({ _id: objectId(id) }).then((data) => {
                //console.log(data)
                resolve(data)
            })
        })
    },
    Do_edit: (id, data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.admin_base).updateOne({ _id: objectId(id) },
                {
                    $set:
                    {
                        name: data.name,
                        discription: data.discription,
                        price: data.price
                    }
                }).then((data) => {
                    //console.log(data)
                    resolve(data)
                })
        })
    },
    get_user_selled_products: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(consts.sell_base).find().toArray().then((data) => {
                //console.log(data)
                resolve(data)
            })
        })
    },
    Get_all_product_orders_By_whisc_User: () => {
        return new Promise(async (resolve, reject) => {
            var details = await db.get().collection(consts.adminOrder_base).aggregate([
                {
                    $unwind: '$products'
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
                        user: 1,
                        date: 1,
                        item: '$products.item',
                        quantity: '$products.qut'
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.admin_base,
                        localField: 'item',
                        foreignField: '_id',
                        as:'pro'
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
                        user: 1,
                        date: 1,
                        item: 1,
                        quantity: 1,
                        pro:
                        {
                            $arrayElemAt: ['$pro', 0 ]
                        }
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.user_base,
                        localField: 'user',
                        foreignField: '_id',
                        as: 'users'
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
                        user: 1,
                        date: 1,
                        item: 1,
                        quantity: 1,
                        pro:1,
                        users:
                        {
                            $arrayElemAt: ['$users', 0]
                        }
                    }
                }
            ]).toArray()
            console.log(details);
            resolve(details)
        })
    },
    Get_Pet_orders_Details:()=>
    {
        return new Promise(async(resolve,reject)=>
        {
            var info = await db.get().collection(consts.user_Orders_base).aggregate([
                {
                    $lookup:
                    {
                        from:consts.user_base,
                        localField:'byuser',
                        foreignField:'_id',
                        as:'byuserss'
                    }
                },
                {
                    $project:
                    {
                        adsress: 1,
                        pin: 1,
                        ph: 1,
                        pay: 1,
                        date: 1,
                        status:1,
                        pro:1,
                        petinfo:'$pro.petinfo',
                        selluse:'$pro.userid',
                        byuserss:
                        {
                            $arrayElemAt: ['$byuserss', 0] 
                        }
                    }
                },
                {
                    $lookup:
                    {
                        from:consts.user_base,
                        localField: 'selluse',
                        foreignField: '_id',
                        as: 'selluserss'
                    }
                },
                {
                    $project:
                    {
                        adsress: 1,
                        pin: 1,
                        ph: 1,
                        pay: 1,
                        date: 1,
                        status: 1,
                        pro: 1,
                        petinfo: '$pro.petinfo',
                        byuserss:1,
                        selluserss:
                        {
                            $arrayElemAt: ['$selluserss', 0] 
                        }
                    }
                }
            ]).toArray()
            console.log(info);
            resolve(info)
        })
    },
    Admin_Login : (info)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            await db.get().collection(consts.admin_Login).findOne({name:info.name},{password:info.password}).then((info)=>
            {
               if(info)
               {
                        resolve({...info})
                        console.log("successs");
               }
               else
               {
                        resolve(false)
                        console.log("faild");
               }
            })
        })
    }
}