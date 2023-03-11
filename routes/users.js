var express = require('express');
var router = express.Router();
var adminbase = require('../database/admin_base')
var userbase = require('../database/user_base')

/* GET users listing. */

module.exports.common=(req,res,next)=>
{
    if(req.session.user)
    {
      next()
    }
    else
    {
      res.redirect('/login')
    }
}

router.get('/', function (req, res, next) {

  adminbase.Output_admin_products().then((products) => {
    if (req.session.status) {
      var user = req.session.user
      res.render('./user/first-page', { products, admin: false, user })
    }
    else {
      res.render('./user/first-page', { products, admin: false })
    }



  })
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
   if(req.session.false)
   {
     var err = "Invali Username or Password..."
     res.render('./user/login-page',{err})
     req.session.false=false
   }
   else
   {
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
      req.session.false=true
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>
{
   req.session.destroy()
   res.redirect('/login')
})

router.get('/cart',this.common,(req,res)=>
{
   userbase.Add_to_cart(req.session.user._id,req.query.id).then((data)=>
   {
     res.redirect('/')
   })
})

module.exports = router;
