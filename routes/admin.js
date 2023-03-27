var express = require('express');
var router = express.Router();
var adminbase = require('../database/admin_base')

/* GET home page. */
router.get('/', function (req, res, next) {

  adminbase.Output_admin_products_for_admin().then((products)=>
  {
    res.render('./admin/list-products', { admin: true, products })
  })

  
});

router.get('/add', (req, res) => {
  res.render('./admin/add-products', { admin: true })
})

router.post('/add', (req, res) => {
  //console.log(req.body)
  adminbase.Input_admin_products(req.body).then((id) => {


    if(req.files.image)
    {
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

router.get('/delete',(req,res)=>
{
    adminbase.Delete_product(req.query.id).then((data)=>
    {
       res.redirect('/admin')
    })
})

router.get('/edit',(req,res)=>
{
    adminbase.Get_datafor_edit(req.query.id).then((data)=>
    {
        res.render('./admin/edit-products',{admin:false,data})
    })
})
router.post('/edit',(req,res)=>
{
   //console.log(req.query.id)
  // console.log(req.body)
   adminbase.Do_edit(req.query.id,req.body).then((data)=>
   {
     res.redirect('/admin')
     if(req.files.image)
     {
       var image = req.files.image
       image.mv("public/admin_image/"+req.query.id +".jpg",(err,data)=>
       {
         if(err)
         {
           console.log(err)
         }
       })
      }
   })
})

module.exports = router;
