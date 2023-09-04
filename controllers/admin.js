const mongoDb = require("mongodb");
const Product = require("../models/product");

const { validationResult } = require("express-validator/check");

/* ----------------------------------------------*/
/*
 *  GET annd POST requests for add product event.
 */
/* ----------------------------------------------*/

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);

  const title = req.body.title;
  const imageUrl = req.file;
  const price = req.body.price;
  const description = req.body.description;
  console.log("deneme")
  console.log(imageUrl);
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user._id,
  });
  // console.log(errors.array()[0]);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      // error varsa 422 validation errorcode!
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
    });
  }

  product
    .save()
    .then((result) => {
      console.log("Book data created");
      //console.log(result);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık

      // res.redirect('/500');
      // return res.status(500).render("admin/edit-product", {
      //   // error varsa 422 validation errorcode!
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description,
      //   },
      //   errorMessage: "Database operation failed.",
      // });
    });
};

/* ----------------------------------------------*/
/*
 *  GET annd POST requests for edit product event.
 */
/* ----------------------------------------------*/

exports.postEditProduct = (req, res, next) => {
  
  const errors = validationResult(req);

  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      // error varsa 422 validation errorcode!
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDescription,
        _id: productId,
      },
      errorMessage: errors.array()[0].msg,
    });
  }

  Product.findById(productId).then((product) => {
    console.log(product.userId.toString());
    console.log(req.user._id.toString());

    if (product.userId.toString() !== req.user._id.toString()) {
      //authorizaton! sadece req.user'ın olduğu kişi editleyebilsin diye!
      return res.redirect("/");
    }

    product.title = updatedTitle;
    product.imageUrl = updatedImageUrl;
    product.price = updatedPrice;
    product.description = updatedDescription;

    return product
      .save()
      .then(() => {
        // bu then blogu .save() içinde olmalı çünkü burada olmazsa yukarıdakini returnlediğinde de de then bloğu çalışacak ve yanlış yere redirect atacak
        console.log("Product Updated!");
        res.redirect("/admin/products");
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error); // error middleware'ine gitmesini sağladık
      });
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;

  Product.findById(prodId).then((product) => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product", // Başlık düzeltilmiş olarak ayarlandı
      path: "/admin/edit-product", // Yol düzeltilmiş olarak ayarlandı
      product: product,
      editing: editMode,
      errorMessage: null,
      hasError: false,
    });
  });
};

/* ----------------------------------------------*/
/*
 *  GET request for display the admin items.
 */
/* ----------------------------------------------*/

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id }) //Authorization için filter ekledik. sadece o kişinin eklediği productlar gözükebilsin diye.
    // .select('title _id ') // burayı bi bakarsın tekrar
    // .populate('userId')
    .then((products) => {
      // console.log("anlamadın mı")
      // console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/edit-product",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

/* ----------------------------------------------*/
/*
 *  POST request for delete the product.
 */
/* ----------------------------------------------*/

exports.postDeleteProduct = (req, res, next) => {
  const deletedId = req.body.deletedId;

  Product.deleteOne({ _id: deletedId, userId: req.user._id }) // userId: req.user._id
    .then((result) => {
      console.log("Product deleted with id: ", deletedId);
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
