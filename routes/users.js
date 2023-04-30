var express = require('express');
var router = express.Router();
var adminbase = require('../database/admin_base')
var userbase = require('../database/user_base')

/* GET users listing. */

module.exports.common = (req, res, next) => {
  if (req.session.user) {
    next()
  }
  else {
    res.redirect('/login')
  }
}

router.get('/', async function (req, res, next) {


  if (req.session.user) {
    await userbase.cart_count(req.session.user._id).then((count) => {
      req.session.count = count
      userbase.get_pets_by_user().then((products) => {



        res.render('./user/first-page', { products, admin: false, user: req.session.user, count })

      })
    })
  }
  else {
    await userbase.get_pets_by_user().then((products) => {
      res.render('./user/first-page', { products, admin: false, count: 0 })
    })
  }


});

router.get('/sinup', (req, res) => {
  res.render('./user/sinup-page', { admin: false })
})

router.post('/sinup', (req, res) => {
  // console.log(req.body)
  userbase.Do_sinup(req.body).then((data) => {
    res.redirect('/sinup')
  })
})

router.get('/login', (req, res) => {
  if (req.session.false) {
    var err = "Invali Username or Password..."
    res.render('./user/login-page', { err })
    req.session.false = false
  }
  else {
    res.render('./user/login-page')
  }
})

router.post('/login', (req, res) => {
  userbase.Do_login(req.body).then((state) => {
    if (state.status) {
      req.session.status = true
      req.session.user = state.users
      res.redirect('/')
    }
    else {
      req.session.false = true
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

router.get('/cart', this.common, (req, res) => {
  //console.log(req.query.id)
  userbase.Add_to_cart(req.session.user._id, req.query.id).then((data) => {
    //res.redirect('/')
    res.json({ status: true })
  })
})

router.get('/intocart', this.common, (req, res) => {
  userbase.Get_cart_products(req.session.user._id).then((products) => {
    if (products) {
      userbase.Total_amount_from_carted_products(req.session.user._id).then((total)=>
      {
        res.render('./user/cart-page', { admin: false, products, user: req.session.user,total})
      })
      

    }
  }).catch((data) => {
    res.render('./user/cart-page', { admin: false, user: req.session.user })
  })
})

router.get('/buynow', this.common, (req, res) => {
  res.render('./user/buy-page', { admin: false, user: req.session.user })
})

router.get('/sell', this.common, (req, res) => {
  res.render('./user/sell-page', { admin: false, user: req.session.user })
})

router.post('/sell', this.common, (req, res) => {
  //onsole.log(req.body)
  userbase.Add_pets_sell(req.session.user._id, req.body).then((id) => {
    res.redirect('/sell')
    if (req.files.image1) {
      var img1 = req.files.image1
      img1.mv("public/user-image/" + id + "1.jpg")
      var img2 = req.files.image2
      img2.mv("public/user-image/" + id + "2.jpg")
      var img3 = req.files.image3
      img3.mv("public/user-image/" + id + "3.jpg")

    }


  })
})

router.get('/usersell', this.common, (req, res) => {
  userbase.Get_user_selldetails(req.session.user._id).then((pets) => {
    res.render('./user/sell-view', { admin: false, user: req.session.user, pets })
  })

})

router.get('/selldelete', this.common, (req, res) => {
  userbase.Delete_user_sell(req.query.id).then((data) => {
    res.redirect('/usersell')
  })
})
router.get('/proinfo', this.common, (req, res) => {
  userbase.Get_choosed_product_info(req.query.id).then((product) => {
    console.log(product)
    res.render('./user/product-page', { product, admin: false, user: req.session.user })
  })
})

router.get('/accessories', (req, res) => {
  if (req.session.user) {

    userbase.cart_count(req.session.user._id).then((count) => {

      adminbase.Output_admin_products_acc().then((products) => {

        if (req.session.user) {

          res.render('./user/accessories-page', { admin: false, user: req.session.user, products, count })
        }
        else {
          res.render('./user/accessories-page', { admin: false, products, count })
        }
      })
    })
  }
  else {
    adminbase.Output_admin_products_acc().then((products) => {
      res.render('./user/accessories-page', { admin: false, user: req.session.user, products, count: 0 })
    })
  }
})

router.get('/food', (req, res) => {
  if (req.session.user) {

    userbase.cart_count(req.session.user._id).then((count) => {

      adminbase.Output_admin_products_food().then((products) => {
        //console.log(products)

        if (req.session.user) {

          res.render('./user/food-page', { admin: false, user: req.session.user, products, count })
        }
        else {
          res.render('./user/food-page', { admin: false, products, count })
        }
      })
    })
  }
  else {
    adminbase.Output_admin_products_food().then((products) => {
      res.render('./user/food-page', { admin: false, user: req.session.user, products, count: 0 })
    })
  }
})

router.get('/intocart2', this.common, (req, res) => {
  userbase.Get_cart_products2(req.session.user._id).then((products) => {
    res.render('./user/acc_food-cart', { products, user: req.session.user, admin: false })
  })
})

router.get('/cartremove', (req, res) => {
  userbase.Cart_remove_products(req.session.user._id, req.query.id).then((data) => {
    res.redirect('/intocart2')
  })
})

router.get('/instruction', this.common, (req, res) => {
  res.render('./user/instruction', { admin: false, user: req.session.user })
})

router.get('/acc&food', this.common, (req, res) => {
  userbase.Get_Details_of_admin_products(req.query.id).then((product) => {
    res.render('./user/admin-product', { admin: false, user: req.session.user, count: req.session.count, product })
  })
})

router.get('/orders', this.common, (req, res) => {
  res.render('./admin/order-page', { admin: false, user: req.session.user, count: req.session.count })
})
router.post('/cartqut',async(req,res)=>
{
  console.log("Hi...")
  console.log(req.session.user._id);
  await userbase.Change_product_Quantity(req.body).then(async(data) => {
     if (data.data) {
       res.json({ remove: true })
     }
     else {
      await userbase.Total_amount_from_carted_products(req.session.user._id).then((Total) => {
         res.json({ get: true, total: Total })
       })

     }
  })
})

router.get('/placeorder',this.common,(req,res)=>
{
  userbase.Total_amount_from_carted_products(req.session.user._id).then((total) => {

    res.render('./user/order-form', { userhd: true, user: req.session.user, total })

  })
})


module.exports = router;
