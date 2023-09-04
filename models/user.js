const mongoose = require("mongoose");
const product = require("./product");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  let newQuantity = 1;

  const cartProductIndex = this.cart.items.findIndex((p) => {
    return p.productId.toString() === product._id.toString(); // toString olayı kafanı karıştırabilir burayı hatırlamak için bakmak isteyebilirsin.
  });

  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.getCart = function () {
  const productIds = this.cart.items.map((i) => i.productId);
  
  //console.log(productIds);

  return this.model("Product")
    .find({ _id: { $in: productIds } })
    .then((products) => {
      return products.map((singleProduct) => ({
        singleProduct,
        quantity: this.cart.items.find(
          (i) => i.productId.toString() === singleProduct._id.toString()
        ).quantity,
      }));
    });
};

userSchema.methods.deleteFromCart = function (product) {

  const updatedCartItems = this.cart.items.filter((p) => {
    return p.productId.toString() !== product._id.toString();
  });

  this.cart.items = updatedCartItems;

  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = {items: []};

  return this.save();
}


module.exports = mongoose.model("User", userSchema);

// const { get } = require("../routes/admin");
// const { mongoConnect } = require("../util/database");

// const getDb = require("../util/database").getDb;
// const mongoDb = require("mongodb");

// const ObjectId = mongoDb.ObjectId;

// class User {
//   constructor(username, email, cart, _id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart || { items: [] }; //{items:[{product,quantity}]};
//     this._id = _id;
//   }

//   save() {
//     db = getDb();

//     return db.collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     let newQuantity = 1;

//     const cartProductIndex = this.cart.items.findIndex((p) => {
//       return p.productId.toString() === product._id.toString(); // toString olayı kafanı karıştırabilir burayı hatırlamak için bakmak isteyebilirsin.
//     });

//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }

//     const updatedCart = {
//       items: updatedCartItems,
//     };

//     const db = getDb();
//     db.collection("users").updateOne(
//       { _id: new ObjectId(this._id) }, // user id
//       { $set: { cart: updatedCart } }
//     );
//   }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map((i) => i.productId);

//     return db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((p) => ({
//           ...p,
//           quantity: this.cart.items.find(
//             (i) => i.productId.toString() === p._id.toString()
//           ).quantity,
//         }));
//       })
//       .catch((error) => {
//         throw error; // Hataları yakalamayı unutmayın
//       });
//   }

//   deleteFromCart(product) {
//     const cartProductIndex = this.cart.items.findIndex((p) => {
//       return p.productId.toString() === product._id.toString(); // toString olayı kafanı karıştırabilir burayı hatırlamak için bakmak isteyebilirsin.
//     });

//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex > -1) {
//       updatedCartItems.splice(cartProductIndex, 1);
//     }

//     const updatedCart = {
//       items: updatedCartItems,
//     };

//     const db = getDb();

//     return db.collection("users").updateOne(
//       { _id: new ObjectId(this._id) }, // user id
//       { $set: { cart: updatedCart } }
//     );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart().then((products) => {
//       const order = {
//         items: products,
//         user: {
//           _id: new ObjectId(this._id),
//           name: this.name,
//           email: this.email,
//         },
//       };

//       return db
//         .collection("orders")
//         .insertOne(order)
//         .then((result) => {
//           this.cart = { items: [] };
//           return db
//             .collection("users")
//             .updateOne(
//               { _id: new ObjectId(this._id) },
//               { $set: { cart: { items: [] } } }
//             );
//         });
//     });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user._id": new ObjectId(this._id) })
//       .toArray()
//       .then((result) => {
//         console.log("eeeeehehe")
//         console.log(result);
//         return result;
//       })
//       .catch((err) => console.log(err));
//   }

//   static findById(userId) {
//     const db = getDb();

//     return db
//       .collection("users")
//       .find({ _id: new ObjectId(userId) })
//       .next()
//       .then((user) => {
//         //console.log(user);
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

// module.exports = User;
