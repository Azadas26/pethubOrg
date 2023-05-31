var express = require('express');
var router = express.Router();
var adminbase = require('../database/admin_base')
var userbase = require('../database/user_base')

/* GET home page. */
router.get('/', (req, res) => {
  if (req.session.adfalse) {
    res.render('./admin/login-page', { admin: true, errr: "Incorrect Usename or Password" })
    req.session.adfalse = false
  }
  else {
    res.render('./admin/login-page', { admin: true })
  }
})

router.post('/', (req, res) => {
  console.log(req.body);
  if (req.body.name == "admin") {

    if (req.body.password == "pethub") {
      req.session.admin = "Admin"
      req.session.adstatus = true
      res.redirect('/admin/showpro')
    }
    else {
      req.session.adfalse = true
      res.redirect('/admin')
    }
  }
  else {
    req.session.adfalse = true;
    res.redirect('/admin')
  }
})
router.get('/showpro', function (req, res, next) {

  adminbase.Output_admin_products_for_admin().then((products) => {
    res.render('./admin/list-products', { admin: true, products })
  })


});

router.get('/add', (req, res) => {
  res.render('./admin/add-products', { admin: true })
})

router.post('/add', (req, res) => {
  //console.log(req.body)
  adminbase.Input_admin_products(req.body).then((id) => {


    if (req.files.image) {
      var image = req.files.image
      image.mv("public/admin_image/" + id + ".jpg", (err, done) => {
        if (err) {
          console.log(err)
        }
        else {
          res.redirect('/admin/add')
        }
      })


    }
  })
})

router.get('/delete', (req, res) => {
  adminbase.Delete_product(req.query.id).then((data) => {
    res.redirect('/admin')
  })
})

router.get('/edit', (req, res) => {
  adminbase.Get_datafor_edit(req.query.id).then((data) => {
    res.render('./admin/edit-products', { admin: false, data })
  })
})
router.post('/edit', (req, res) => {
  //console.log(req.query.id)
  // console.log(req.body)
  adminbase.Do_edit(req.query.id, req.body).then((data) => {
    res.redirect('/admin')
    if (req.files.image) {
      var image = req.files.image
      image.mv("public/admin_image/" + req.query.id + ".jpg", (err, data) => {
        if (err) {
          console.log(err)
        }
      })
    }
  })
})

router.get('/useradd', (req, res) => {
  adminbase.get_user_selled_products().then((products) => {
    res.render('./admin/user-products', { admin: true, products })
  })
})

router.get('/selldelete', (req, res) => {
  userbase.Delete_user_sell(req.query.id).then((data) => {
    res.redirect('/admin/useradd')
  })
})
router.get('/userorders', (req, res) => {
  adminbase.Get_all_product_orders_By_whisc_User().then((details) => {
    res.render('./admin/user-orders', { admin: true, pro: details })
  })
})
router.get('/userpetorders', (req, res) => {
  adminbase.Get_Pet_orders_Details().then((info) => {
    res.render('./admin/user-petorders', { admin: true, pro: info })
  })
})

module.exports = router;
