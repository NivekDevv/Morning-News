var express = require("express");
var router = express.Router();

var uid2 = require("uid2");
var bcrypt = require("bcrypt");

var userModel = require("../models/users");
var articleModel = require("../models/article");

router.post("/wishlist-article", async function (req, res, next) {
  console.log(req.body);
  var result = false;
  var user = await userModel.findOne({
    token: req.body.token,
  });
  if (user != null) {
    var newArticle = new articleModel({
      title: req.body.name,
      description: req.body.desc,
      content: req.body.content,
      urlToImage: req.body.img,
      userId: user._id,
    });

    var saveArticle = await newArticle.save();
    if (saveArticle.name) {
      result = true;
    }
  }

  res.json({ result });
});

router.delete("/wishlist-article", async function (req, res, next) {
  var result = false;
  const user = await userModel.findOne({
    token: req.body.token,
  });
  if (user != null) {
    var returnDb = await articleModel.deleteOne({
      title: req.body.title,
      userId: user._id,
    });

    if (returnDb.deleteCount == 1) {
      result = true;
    }
  }

  res.json({ result });
});

router.get("/wishlist-article", async function (req, res, next) {
  var articles = [];
  var user = await userModel.findOne({ token: req.query.token });

  if (user != null) {
    articles = await articleModel.find({ userId: user._id });
  }

  res.json({ articles });
});

router.post("/sign-up", async function (req, res, next) {
  var error = [];
  var result = false;
  var saveUser = null;
  var token = null;

  const data = await userModel.findOne({
    email: req.body.emailFromFront,
  });

  if (data != null) {
    error.push("utilisateur déjà présent");
  }

  if (
    req.body.usernameFromFront == "" ||
    req.body.emailFromFront == "" ||
    req.body.passwordFromFront == ""
  ) {
    error.push("champs vides");
  }

  if (error.length == 0) {
    var hash = bcrypt.hashSync(req.body.passwordFromFront, 10);
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      email: req.body.emailFromFront,
      password: hash,
      token: uid2(32),
    });

    saveUser = await newUser.save();

    if (saveUser) {
      result = true;
      token = saveUser.token;
    }
  }

  res.json({ result, saveUser, error, token });
});

router.post("/sign-in", async function (req, res, next) {
  var result = false;
  var user = null;
  var error = [];
  var token = null;

  if (req.body.emailFromFront == "" || req.body.passwordFromFront == "") {
    error.push("champs vides");
  }

  if (error.length == 0) {
    user = await userModel.findOne({
      email: req.body.emailFromFront,
    });

    if (user) {
      if (bcrypt.compareSync(req.body.passwordFromFront, user.password)) {
        result = true;
        token = user.token;
      } else {
        result = false;
        error.push("mot de passe incorrect");
      }
    } else {
      error.push("email incorrect");
    }
  }

  res.json({ result, user, error, token });
});

router.post("/user-lang", async function (req, res, next) {
  var result = false;
  var user = await userModel.updateOne(
    { token: req.body.token },
    { lang: req.body.lang }
  );

  if (user != null) {
    result = true;
  }

  res.json({ result });
});

module.exports = router;
