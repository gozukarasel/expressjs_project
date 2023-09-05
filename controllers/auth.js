const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator/check");

const User = require("../models/user");

// libraries and api key for the email service
/* 
const nodemailer = require("nodemailer"); //packages for sending mails
const nodemailMailgun = require('nodemailer-mailgun-transport');


const auth = {
  auth: {
    api_key:"5146f47f64d632e85678e51c1e33eb85" ,
    domain: "sandboxad347b0b3eb347098f5f0b216dc7320b.mailgun.org",
    // domain: "https://app.mailgun.com/app/sending/domains/sandboxad347b0b3eb347098f5f0b216dc7320b.mailgun.org",
    host:"api.eu.mailgun.net"
  }
}

const transporter = nodemailer.createTransport(nodemailMailgun(auth));
*/

/* ----------------------------------------------*/
/*
 *  GET and POST requests for signup event.
 */
/* ----------------------------------------------*/

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      // error varsa 422 validation errorcode!
      pageTitle: "signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        oldEmail: email,
        oldPassword: password,
        oldConfirmedPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  return bcrypt.hash(password, 12).then((hashedPassword) => {
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items: [] },
    });

    return user
      .save()
      .then((result) => {
        //  this is a function that sends e-mail for auothorization!
        // transporter.sendMail({
        //   from: "shop@node-complete",
        //   to: email,
        //   subject: "Test E-posta",
        //   text: "Bu bir test e-postadır.",
        //   html: "<h1>Bu bir test e-postadır.</h1>",
        // })
        console.log("User saved to the database! with", result.email);
        res.redirect("/login");
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error); // error middleware'ine gitmesini sağladık
      });
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message;
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "signup",
    path: "/signup",
    errorMessage: message,
    oldInput: {
      oldEmail: "",
      oldPassword: "",
      oldConfirmedPassword: "",
    },
    validationErrors: [],
  });
};

/* ----------------------------------------------*/
/*
 *  GET AND POST REQUESTS FOR LOGIN EVENT
 */
/* ----------------------------------------------*/

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      // error varsa 422 validation errorcode!
      pageTitle: "login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        oldEmail: email,
        oldPassword: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email }) // bunu validation olarak algılayıp oraya koyabilirdim ama sanırım session değişkeni için koymadık.
    .then((user) => {
      if (!user) {
        req.flash(
          "error",
          "Invalid email or password but i dont know which one is incorrect"
        );
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password) // bu bir bool döndürdüğü için doMatch de bool dönüyor(.then() parametresi)!!
        .then((doMatch) => {
          if (doMatch) {
            // password matched
            req.session.user = user;
            req.session.isLoggedIn = true;

            return req.session.save((err) => {
              //console.log(err);
              res.redirect("/");
            });
          }
          req.flash("error", "Password not matched");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık
    });
};

exports.getLogin = (req, res, next) => {
  const errors = validationResult(req);

  let flashMessage = req.flash("error");

  if (flashMessage.length > 0) {
    flashMessage;
  } else {
    flashMessage = null;
  }
  //console.log(flashMessage);
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/404",
    errorMessage: flashMessage,
    oldInput: {
      oldEmail: "",
      oldPassword: "",
    },
    validationErrors: errors.array(),
  });
};

/* ----------------------------------------------*/
/*
 * GET AND POST REQUESTS FOR PASSWORD RESET
 */
/* ----------------------------------------------*/

exports.postResetPassword = (req, res, next) => {
  const resetEmail = req.body.email;
  console.log(resetEmail);

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    console.log("buraya gelebiliyorum!");
    const token = buffer.toString("hex");
    User.findOne({ email: resetEmail })
      .then((user) => {
        if (!user) {
          req.flash("error", "This email does not exist!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;

        return user.save();
      })
      .then((result) => {
        console.log(token);
        res.redirect("/"); // normalde burda bi texthtml gibi bir şey olacak bunun yerine
        /*
         * this is a function to send e-mail for auothorization!
         */

        // transporter.sendMail({
        //   from: "shop@node-complete",
        //   to: resetEmail,
        //   subject: "Password reset",
        //   html: `<p> Click this <a href = "http://localhost:3000/reset/${token}> link </a> to set a new password  </p>"`, // token yollama şekline dikkat et! linkin uzantısının içinde eğer başka bir isim girersen url'i de değiştirmek zorundasın
        // })
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error); // error middleware'ine gitmesini sağladık
      });
  });
};

exports.getResetPassword = (req, res, next) => {
  let flashMessage = req.flash("error");

  if (flashMessage.length > 0) {
    flashMessage;
  } else {
    flashMessage = null;
  }
  //console.log("burada okeyiz");
  // console.log(flashMessage);
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: flashMessage,
  });
};

/* ----------------------------------------------*/
/*
 *  GET AND POST REQUESTS FOR NEW PASSWORD EVENT
 */
/* ----------------------------------------------*/

exports.postNewPassword = (req, res, next) => {
  const confirmedNewPassword = req.body.confirmedNewPassword;
  const passwordToken = req.body.token;

  const userId = req.body.userId; //user'ın kim olduğunu bir şekilde bulmak zorundasın o yüzden post request'in bodysine hidden bir şekilde atmıştık!

  let resetUser;

  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user; // diğer than blokta kullanmak zorunda kaldığımız için user'ı let resetUser'a atadık;
      return bcrypt.hash(confirmedNewPassword, 12);
    })
    .then((hashedNewPassword) => {
      resetUser.password = hashedNewPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;

      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); // error middleware'ine gitmesini sağladık
    });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token; // Maille girilen url'den gelen token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }) // User dondurecek only if greater than now.
    .then((user) => {
      let flashMessage = req.flash("error");

      if (flashMessage.length > 0) {
        flashMessage;
      } else {
        flashMessage = null;
      }
      //console.log(flashMessage);
      res.render("auth/new-password", {
        pageTitle: "Reset Password",
        path: "/new-password",
        errorMessage: flashMessage,
        userId: user._id.toString(),
        token: token,
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
 *  POST REQUEST FOR LOGOUT EVENT
 */
/* ----------------------------------------------*/

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    console.log("Logout event done with:", req.user.email);
    res.redirect("/");
  });
};
