const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },  
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // hangi modele ref etmek istiyorsan ismi onunla uyumlu olmaslı
    required: true
  },
});

module.exports = mongoose.model("Product", ProductSchema);

// const mongoDb = require("mongodb");
// const getDb = require("../util/database").getDb;

// /*
//  $SET:THİS OLAYI ÖNEMLİ ÇÜNKÜ BURDA
//   BİZ TÜM OBJEYİ DEĞİŞTİRİYORUZ AMA MESELA BELKİ DE SADECE
//   TEK BİR ENTİTY DEĞİŞTİRMEK İSTEYEBİLİRDİK MESELA
//   THİS.TİTLE=TUPDATEDTİTLE GİBİ.
// */

// const ObjectId = mongoDb.ObjectId;

// class Product {
//   constructor(title, price, description, imageUrl, _id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id =_id ? new mongoDb.ObjectId(_id): null // Burada artık gelen Product'ın id'sini direkt mongoDb objesine dönüştürererek bu işlemi genel bir hale getirdik ve save() deki if bloğunu checklemek için bu bool u oluşturduk
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db
//         .collection("products").insertOne(this);
//     }
//     return dbOp;
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         //console.log(products);
//         return products;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new ObjectId(prodId) })
//       .next()
//       .then((product) => {
//         //console.log(product);
//         return product;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongoDb.ObjectId(prodId) });
//   }
// }

// module.exports = Product;
