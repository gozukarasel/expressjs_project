const Product = require("../models/product");
const Order = require("../models/order");

/* ----------------------------------------------*/
/*
 *  GET request FOR getting all the products for the /.
 */
/* ----------------------------------------------*/

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      //console.log(req.session.isLoggedIn);
      //console.log("burada mıyım")
      //  console.log(products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık
    });
};

/* ----------------------------------------------*/
/*
 *  GET request for single product.
 */
/* ----------------------------------------------*/

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      //console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  console.log(req.user);
  req.user
    //.populate("cart.items.productId")
    .getCart()
    .then((cartProducts) => {
      //console.log(cartProducts);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cartProducts,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      //console.log(product);
      console.log(req.session.user);
      return req.user.addToCart(product);
    })
    .then((result) => {
      //console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      return req.session.user.deleteFromCart(product);
    })
    .then((result) => {
      console.log(prodId);
      console.log("Delete event done");
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık
    });
};

exports.getOrders = (req, res, next) => {
  //console.log("buraya geldim mi");
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) => {
      //console.log(orders);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .getCart()
    .then((cartProducts) => {
      updatedOrderData = cartProducts.map((p) => {
        return { quantity: p.quantity, productData: p.singleProduct };
      });
      console.log(cartProducts);
      console.log("------------");
      console.log(updatedOrderData);
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.session.user,
        },
        orderProducts: updatedOrderData,
      });
      return order.save();
    })
    .then(() => {
      req.user.clearCart();
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık);
    });
};
