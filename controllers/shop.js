/* ----------------------------------------------*/
/*
 * Libraries
 */
/* ----------------------------------------------*/

const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

/* ----------------------------------------------*/
/*
 * Models
 */
/* ----------------------------------------------*/

const Product = require("../models/product");
const Order = require("../models/order");
const user = require("../models/user");

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
      console.log(orders);
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

/* ----------------------------------------------*/
/*
 * downloading invoice for user order.
 */
/* ----------------------------------------------*/

exports.getInvoice = (req, res, next) => {
  // atadığımız url'den gelecek!
  const orderId = req.params.orderId;

  const invoiceFileName = "invoice-" + req.user._id + "-" + orderId + ".pdf"; // bu her fatura için otomatik generate edilecek çünkü bunu biz böyle belirledik!
  const invoicePath = path.join("data", "invoices", invoiceFileName);

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found!"));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      const file = fs.createReadStream(invoicePath);
      
      // gönderilen verinin headerını belirleme
      res.setHeader("Content-Type", "application/pdf");

      // gönderilen veri client browser'da açılsın mı indirilsin mi?
      //res.setHeader('Content-Disposition','attachment; filename=example.pdf'); // bu isimle indirilsin.
      res.setHeader("Content-Disposition", "inline"); // sadece açılsın.

      // file.pipe(res); //readable stream to writable stream for large chunk of data 

      // fs.readFile(invoicePath, (err, data) => {
      // Authorized'sa veriyi yollayabilirsin
      //   if (err) {
      //     console.error("Error reading file:", err);
      //     return next(err);
      //   }

      //   // gönderilen verinin headerını belirleme
      //   res.setHeader("Content-Type", "application/pdf");

      //   // gönderilen veri client browser'da açılsın mı indirilsin mi?
      //   //res.setHeader('Content-Disposition','attachment; filename=example.pdf'); // bu isimle indirilsin.
      //   res.setHeader("Content-Disposition", "inline"); // sadece açılsın.

      //   res.send(data);
      // });
    })
    .catch((err) => {
      next(err);
    });
};
