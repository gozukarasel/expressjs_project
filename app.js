/* ----------------------------------------------*/
/*
 * Libraries
 */
/* ----------------------------------------------*/

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

// Database URI
const MongoDB_URI =
  "mongodb+srv://e-ticaret:Anacondas123@cluster0.3uezxnc.mongodb.net/?retryWrites=true&w=majority";

// Error Controller
const errorController = require("./controllers/error");

// User Model
const User = require("./models/user");

// express app
const app = express();


/* ----------------------------------------------*/
/*
 * File storage configs for adding single image.
 */
/* ----------------------------------------------*/

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dosyaların kaydedileceği dizin
    cb(null, "images"); 
  },
  filename: (req, file, cb) => {
    // __dirname'e sadece string veri atabilirsin!
    // Dosya adını düzenleme Ayrıca file objesinde gelen verimin dataları var console.log(imageUrl yani req.file)
    cb(null, "-" + file.originalname); 
  },
});

// gönderilen dosyanın uzantısını filtreleme! kind of validation!
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


/* ----------------------------------------------*/
/*
 * Sesssion data storage for mongoDB.
 */
/* ----------------------------------------------*/

const store = new MongoDBStore({
  uri: MongoDB_URI,
  collection: "sessions",
});

// csrf token generator
const csrfProtection = csrf(); 


/* ----------------------------------------------*/
/*
 * View engine configs.
 */
/* ----------------------------------------------*/

app.set("view engine", "ejs");
app.set("views", "views");

/* ----------------------------------------------*/
/*
 * Routes
 */
/* ----------------------------------------------*/

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

/* ----------------------------------------------*/
/*
 * Required middlewares.
 */
/* ----------------------------------------------*/

app.use(bodyParser.urlencoded({ extended: false }));

// Yalnızca tek bir dosya yükleneceğini belirtiyoruz. İstekten gelen dosyanın "image" adında bir alanı (name) olmalı.
// Birden fazla dosya yüklemek isterseniz, farklı bir fonksiyon kullanmalısınız.
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

//middlewares for serving static files.
app.use(express.static(path.join(__dirname, "public")));

app.use('/images', express.static(path.join(__dirname, "images"))); // 'eğer root bilgisayarın /images path'ına istek atılırsa bu dosyadan statik veri gönder!

app.use(
  session({
    secret: "My Secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection); //csrf işlemi için middleware
app.use(flash()); // flash error message'ları için middleware

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

//Bu middleware, response nesnesine tüm render dosyalarına veri gönderiyor!
app.use((req, res, next) => {
  
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken(); // CSRF token değerini burada ayarlamanız gerekiyor;

  next();
});

/* ----------------------------------------------*/
/*
 *  All routes
 */
/* ----------------------------------------------*/

app.use(authRoutes);

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error,req,res,next) => { 
  // speacial error middleware
    
  // normalde tüm urlsiz atılan istekler 404'e gidicekken next objesinin içinde Error objesi tanımlarsam bu middleware e gelecekler!
  res.redirect('/500');
})

/* ----------------------------------------------*/
/*
 * port and database connection
 */
/* ----------------------------------------------*/

mongoose
  .connect(MongoDB_URI)
  .then(() => {
    console.log("Connection to database is successful!");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
