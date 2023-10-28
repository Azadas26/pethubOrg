var express = require("express");
var router = express.Router();
var adminbase = require("../database/admin_base");
var userbase = require("../database/user_base");
var ObjectId = require("mongodb").ObjectId;

/* GET users listing. */

module.exports.common = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", async function (req, res, next) {
  if (req.session.user) {
    await userbase.cart_count(req.session.user._id).then((count) => {
      req.session.count = count;
      userbase.get_pets_by_user().then((products) => {
        res.render("./user/first-page", {
          products,
          admin: false,
          user: req.session.user,
          count,
        });
      });
    });
  } else {
    await userbase.get_pets_by_user().then((products) => {
      res.render("./user/first-page", { products, admin: false, count: 0 });
    });
  }
});

router.get("/sinup", (req, res) => {
  if(req.session.emailfals)
  {
    res.render("./user/sinup-page", { admin: false ,err:"This Email Address Is already Exist"});
    req.session.emailfals= false
  }
  else
  {
    res.render("./user/sinup-page", { admin: false });
  }
});

router.post("/sinup", (req, res) => {
  // console.log(req.body)
  userbase
    .Check_wether_the_email_is_Already_Exist_or_nOt(req.body)
    .then((ress) => {
      if (ress) {
        console.log("Hello");
        req.session.emailfals = true
        res.redirect("/sinup")
      } else {
        console.log("Nottt");
        userbase.Do_sinup(req.body).then((data) => {
          res.redirect("/login");
        });
      }
    });
});

router.get("/login", (req, res) => {
  if (req.session.false) {
    var err = "Invali Username or Password...";
    res.render("./user/login-page", { err });
    req.session.false = false;
  } else {
    res.render("./user/login-page");
  }
});

router.post("/login", (req, res) => {
  userbase.Do_login(req.body).then((state) => {
    if (state.status) {
      req.session.user = state.users;
      req.session.user.status = true;
      res.redirect("/");
    } else {
      req.session.false = true;
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/login");
});

router.get("/cart", this.common, (req, res) => {
  //console.log(req.query.id)
  userbase.Add_to_cart(req.session.user._id, req.query.id).then((data) => {
    //res.redirect('/')
    res.json({ status: true });
  });
});

router.get("/intocart", this.common, (req, res) => {
  userbase
    .Total_amount_from_carted_products(req.session.user._id)
    .then((total) => {
      userbase
        .Total_price_of_Each_product_by_Userproducts(req.session.user._id)
        .then((each) => {
          if (total == 0) {
            res.render("./user/cart-page", {
              admin: false,
              user: req.session.user,
              products: each,
            });
          } else {
            res.render("./user/cart-page", {
              admin: false,
              user: req.session.user,
              total,
              products: each,
            });
          }
        });
    })
    .catch((data) => {
      res.render("./user/cart-page", { admin: false, user: req.session.user });
    });
});

router.get("/buynow", this.common, (req, res) => {
  res.render("./user/buy-page", { admin: false, user: req.session.user });
});

router.get("/sell", this.common, (req, res) => {
  res.render("./user/sell-page", { admin: false, user: req.session.user });
});

router.post("/sell", this.common, (req, res) => {
  //onsole.log(req.body)
  userbase.Add_pets_sell(req.session.user._id, req.body).then((id) => {
    res.redirect("/sell");
    if (req.files.image1) {
      var img1 = req.files.image1;
      img1.mv("public/user-image/" + id + "1.jpg");
      var img2 = req.files.image2;
      img2.mv("public/user-image/" + id + "2.jpg");
      var img3 = req.files.image3;
      img3.mv("public/user-image/" + id + "3.jpg");
    }
  });
});

router.get("/usersell", this.common, (req, res) => {
  userbase.Get_user_selldetails(req.session.user._id).then((pets) => {
    res.render("./user/sell-view", {
      admin: false,
      user: req.session.user,
      pets,
    });
  });
});

router.get("/selldelete", this.common, (req, res) => {
  userbase.Delete_user_sell(req.query.id).then((data) => {
    res.redirect("/usersell");
  });
});
router.get("/proinfo", this.common, (req, res) => {
  userbase.Get_choosed_product_info(req.query.id).then((product) => {
    console.log(product);
    res.render("./user/product-page", {
      product,
      admin: false,
      user: req.session.user,
    });
  });
});

router.get("/accessories", (req, res) => {
  if (req.session.user) {
    userbase.cart_count(req.session.user._id).then((count) => {
      adminbase.Output_admin_products_acc().then((products) => {
        if (req.session.user) {
          res.render("./user/accessories-page", {
            admin: false,
            user: req.session.user,
            products,
            count,
            cart: true,
          });
        } else {
          res.render("./user/accessories-page", {
            admin: false,
            products,
            count,
            cart: true,
          });
        }
      });
    });
  } else {
    adminbase.Output_admin_products_acc().then((products) => {
      res.render("./user/accessories-page", {
        admin: false,
        user: req.session.user,
        products,
        count: 0,
        cart: true,
      });
    });
  }
});

router.get("/food", (req, res) => {
  if (req.session.user) {
    userbase.cart_count(req.session.user._id).then((count) => {
      adminbase.Output_admin_products_food().then((products) => {
        //console.log(products)

        if (req.session.user) {
          res.render("./user/food-page", {
            admin: false,
            user: req.session.user,
            products,
            count,
            cart: true,
          });
        } else {
          res.render("./user/food-page", {
            admin: false,
            products,
            count,
            cart: true,
          });
        }
      });
    });
  } else {
    adminbase.Output_admin_products_food().then((products) => {
      res.render("./user/food-page", {
        admin: false,
        user: req.session.user,
        products,
        count: 0,
        cart: true,
      });
    });
  }
});

router.get("/intocart2", this.common, (req, res) => {
  userbase.Get_cart_products2(req.session.user._id).then((products) => {
    res.render("./user/acc_food-cart", {
      products,
      user: req.session.user,
      admin: false,
    });
  });
});

router.get("/cartremove", (req, res) => {
  userbase
    .Cart_remove_products(req.session.user._id, req.query.id)
    .then((data) => {
      res.redirect("/intocart");
    });
});

router.get("/instruction", this.common, (req, res) => {
  res.render("./user/instruction", { admin: false, user: req.session.user });
});

router.get("/acc&food", this.common, (req, res) => {
  userbase.Get_Details_of_admin_products(req.query.id).then((product) => {
    res.render("./user/admin-product", {
      admin: false,
      user: req.session.user,
      count: req.session.count,
      product,
    });
  });
});

router.get("/orders", this.common, (req, res) => {
  userbase.view_user_celled_orders(req.session.user._id).then((info) => {
    res.render("./user/order-page", {
      admin: false,
      user: req.session.user,
      info,
    });
  });
});
router.post("/cartqut", async (req, res) => {
  console.log("Hi...");
  console.log(req.session.user._id);
  await userbase.Change_product_Quantity(req.body).then(async (data) => {
    if (data.data) {
      res.json({ remove: true });
    } else {
      await userbase
        .Total_amount_from_carted_products(req.session.user._id)
        .then((Total) => {
          res.json({ get: true, total: Total });
        });
    }
  });
});

router.get("/placeorder", this.common, (req, res) => {
  userbase
    .Total_amount_from_carted_products(req.session.user._id)
    .then((total) => {
      res.render("./user/order-form", {
        userhd: true,
        user: req.session.user,
        total,
      });
    });
});

router.post("/addorders", (req, res) => {
  req.body.me = req.session.user._id;

  req.body.selluser = ObjectId(req.body.selluser);
  req.body.product = ObjectId(req.body.product);
  req.body.me = ObjectId(req.body.me);

  userbase.Place_single_Order_product__BY_User(req.body).then((data) => {
    res.redirect("/intocart");
  });
});

router.post("/placeorder", (req, res) => {
  userbase
    .Total_amount_from_carted_products(req.session.user._id)
    .then(async (total) => {
      await userbase.Get_cart_products(req.session.user._id).then((product) => {
        console.log(product);
        req.body.total = total;
        req.body.status = req.body.pay === "cod" ? "placed" : "pending";
        req.body.products = product.products;
        req.body.user = ObjectId(req.session.user._id);
        req.body.date = new Date();
        //console.log(req.body);
        userbase
          .Place_order_Products_which_are_FROMAdminSide(req.body)
          .then((data) => {
            if (req.body.pay == "cod") {
              userbase
                .remove_Automatically_AllProductfrom_card_BsedOwn_orderPlace(
                  req.session.user._id
                )
                .then(() => {
                  res.render("./user/orderjust-paje", {
                    userhd: true,
                    user: req.session.user,
                  });
                });
            } else {
              res.redirect("/buynow");
            }
          });
      });
    });
});
router.get("/vieworder", this.common, (req, res) => {
  userbase
    .Get_Product_Details_After_place_order(req.session.user._id)
    .then((products) => {
      res.render("./user/view-orders", {
        userhd: true,
        user: req.session.user,
        info: products,
      });
    });
});
router.get("/buypet", this.common, (req, res) => {
  console.log(req.query.id, req.query.price);

  res.render("./user/petorder-form", {
    userhd: true,
    user: req.session.user,
    total: req.query.price,
    proid: req.query.id,
  });
});
router.post("/buypet", (req, res) => {
  console.log(req.query.id);
  userbase.Get_choosed_product_info(req.query.id).then((pro) => {
    req.body.byuser = ObjectId(req.session.user._id);
    req.body.date = new Date();
    req.body.pro = pro;
    req.body.status = req.body.pay == "cod" ? "placed" : "panding";
    console.log(req.body);
    userbase.Place_Pets_orders(req.body).then((data) => {
      userbase
        .Remove_pet_Product_When_Complete_PlaceOrder(req.body.pro._id)
        .then(() => {
          if (req.body.pay == "cod") {
            res.render("./user/after-petorder", {
              userhd: true,
              user: req.session.user,
            });
          } else {
            res.redirect("/buynow");
          }
        });
      //console.log(data);
    });
  });
});
router.get("/vieworder2", this.common, (req, res) => {
  userbase.Get_ordered_pet_Details(req.session.user._id).then((petpros) => {
    console.log(petpros);
    res.render("./user/view-petorders", {
      userhd: true,
      user: req.session.user,
      petpros,
    });
  });
});

module.exports = router;
