const express = require("express");
const { check, body } = require("express-validator/check");

const loginController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", loginController.getLogin);

router.post(
  "/login",
  [
    body("email", "Please enter a valid email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 5 })
      .withMessage(
        "Please enter a password with at least 5 characters and alphanumeric."
      )
      .isAlphanumeric()
      .trim(),
  ],
  loginController.postLogin
);

router.post("/logout", loginController.postLogout);

router.get("/signup", loginController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          // Promise reject döndürdüğü için custom fonksiyonu bunu otomatik oalrak error olarak algılıyor
          if (user) {
            return Promise.reject(
              "Email exists already, please choose a different one or login"
            );
          }
          return true;
        })
      }),
    body("password")
      .isLength({ min: 5 })
      .withMessage(
        "Please enter a password with at least 5 characters and alphanumeric."
      )
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").trim().custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password does not match!");
      }
      return true;
    })
    ,
  ],
  loginController.postSignup
);

router.get("/reset", loginController.getResetPassword);

router.post("/reset", loginController.postResetPassword);

router.get("/reset/:token", loginController.getNewPassword); // Token'la birlikte gelen şifre değiştirme sayfası!

router.post("/reset/new-password", loginController.postNewPassword);

module.exports = router;
