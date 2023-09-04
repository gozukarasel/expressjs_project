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

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();


/* ----------------------------------------------*/
/*
 * Sesssion data storage.
*/
/* ----------------------------------------------*/

const store = new MongoDBStore({
  uri: MongoDB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");


/* ----------------------------------------------*/
/*
 * Required middlewares.
*/
/* ----------------------------------------------*/


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest:'/images'}).single('image')); // form'da yolladığımız verinin name'inin image olması gerekiyor aksi takdirde çalışmayacak
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "My Secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection); //csrf işlemi için middleware
app.use(flash());

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

app.use((req, res, next) => {
  //Bu middleware, response nesnesine tüm render dosyalarına veri gönderiyor!

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

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error,req,res,next) => { // speacial error middleware normalde tüm urlsiz atılan istekler 404'e gidicekken catch ile atılane errorler bu middleware'den geçer!
  res.redirect('/500');
})

mongoose
  .connect(MongoDB_URI)
  .then(() => {
    console.log("Connection to database is successful!");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
