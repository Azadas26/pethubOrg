var express = require('express');
var router = express.Router();
var adminbase = require('../database/admin_base')
var userbase = require('../database/user_base')

var verfyadminLogin = (req,res,next)=>
{
  if(req.session.admin)
  {
    next()
  }
  else
  {
    res.redirect('/admin')
  }
}
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
  adminbase. Admin_Login(req.body).then((info)=>
  {
      if(info)
      {
        req.session.admin = {admin:"admin"}
        req.session.admin.adstatus = true
        res.redirect('/admin/showpro')
      }
      else
      {
        req.session.adfalse = true
        res.redirect('/admin')
      }
  })
})
router.get('/showpro', verfyadminLogin,function (req, res, next) {

  adminbase.Output_admin_products_for_admin().then((products) => {
    res.render('./admin/list-products', { admin: true, products })
  })


});

router.get('/add', verfyadminLogin,(req, res) => {
  res.render('./admin/add-products', { admin: true })
})

router.post('/add',verfyadminLogin,(req, res) => {
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

router.get('/delete',verfyadminLogin,(req, res) => {
  adminbase.Delete_product(req.query.id).then((data) => {
    res.redirect('/admin')
  })
})

router.get('/edit',verfyadminLogin,(req, res) => {
  adminbase.Get_datafor_edit(req.query.id).then((data) => {
    res.render('./admin/edit-products', { admin: false, data })
  })
})
router.post('/edit',verfyadminLogin,(req, res) => {
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

router.get('/useradd',verfyadminLogin,(req, res) => {
  adminbase.get_user_selled_products().then((products) => {
    res.render('./admin/user-products', { admin: true, products })
  })
})

router.get('/selldelete',verfyadminLogin,(req, res) => {
  userbase.Delete_user_sell(req.query.id).then((data) => {
    res.redirect('/admin/useradd')
  })
})
router.get('/userorders',verfyadminLogin,(req, res) => {
  adminbase.Get_all_product_orders_By_whisc_User().then((details) => {
    res.render('./admin/user-orders', { admin: true, pro: details })
  })
})
router.get('/userpetorders',verfyadminLogin,(req, res) => {
  adminbase.Get_Pet_orders_Details().then((info) => {
    res.render('./admin/user-petorders', { admin: true, pro: info })
  })
})
router.get('/logout',(req,res)=>
{
   req.session.admin= null
   res.redirect('/admin')
})

module.exports = router;
