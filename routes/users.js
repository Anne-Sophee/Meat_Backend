const userModel = require("../models/users");

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const uid2 = require("uid2");

const fs = require("fs");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* LOGINSCREEN - PAGE DE CONNEXION */
router.post("/login", async function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  console.log("email:", email, "mdp:", password);

  //constiable de vérification de l'existence d'un user
  const error = "Utilisateur inexistant!";
  const errorPassword = "Mot de passe erroné!";
  console.log("erreur user:", error, "erreur mdp:", errorPassword);

  //recherche du document correspondant à l'email reçu du frontend
  const user = await userModel.findOne({ email });

  if (user) {
    //comparaison des mdp crytés pour permettre le login
    if (bcrypt.compareSync(password, user.password)) {
      res.json({ login: true, user });
      console.log("user trouvé:", user);
    } else {
      res.json({ signin: false, errorPassword });
      console.log("mdp error:", errorPassword);
    }
  } else {
    res.json({ error, user });
    console.log("user error:", error);
  }
});

/* REGISTERSCREEN - PAGE DE CREATION DE COMPTE */
router.post("/register", async function (req, res, next) {
  const error = "Nouvel utilisateur!";
  const cost = 10; //nombre de tours de hashage à effectuer
  const hash = bcrypt.hashSync(req.body.password, cost); //génère le hash du mdp

  const user = await userModel.findOne({ email: req.body.email });
  if (user) {
    error = "Utilisateur existant!";
  } else if (!user) {
    //création d'un nouvel utilisateur
    const newUser = new userModel({
      avatar: req.body.avatar,
      lastname: req.body.lastname,
      firstname: req.body.firstname,
      email: req.body.email,
      password: hash,
      userAddress: req.body.address,
      userPhoneNumber: req.body.phoneNumber,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      token: uid2(32),
    });

    //enregistrement du nouvel utilisateur dans la bdd
    const userSaved = await newUser.save();
    console.log(userSaved);
  }

  res.json({ result: userSaved ? true : false, error });
});

/* REGISTERSCREEN - SAUVEGARDE DE FICHIER SUR CLOUDINARY */
router.post("/upload-avatar", async function (req, res, next) {
  // dossier dans lequel on veut placer notre fichier avec un nom unique
  const picturePath = `./tmp/${uniqid()}.jpg`;

  // enregistrement/déplacement du fichier 'avatar' dans notre dossier temporaire (mv=déplacer)
  const resultCopy = await req.files.avatar.mv(picturePath);

  if (!resultCopy) {
    const resultCloudinary = await cloudinary.uploader
      .upload(picturePath)
      .catch((e) => {
        console.error(e.message);
      });
    res.json({ cloud: resultCloudinary });
  } else {
    res.json({ error: resultCopy });
  }

  fs.unlinkSync(picturePath);
});

/* ACCOUNTSCREEN - SAUVEGARDE DE FICHIER SUR CLOUDINARY */
router.get("/search-user/:userToken", async function (req, res, next) {
  const result = await userModel.findOne({ token: req.params.userToken });

  res.json({ result: result });
});

/* ACCOUNTSCREEN - MISE A JOUR DES DONNÉES UTILISATEUR */
router.put("/update-account", async function (req, res, next) {
  const cost = 10;
  const hash = bcrypt.hashSync(req.body.password, cost);
  const updatedUser = await userModel.findOne({ token: token });

  if (existingUser) {
    (updatedUser.email = req.body.email),
      (updatedUser.password = hash),
      (updatedUser.firstname = req.body.firstname),
      (updatedUser.lastname = req.body.lastname),
      (updatedUser.userAddress = req.body.userAddress),
      (updatedUser.userPhoneNumber = req.body.userPhoneNumber);
  }

  const newUserData = await existingUser.save();

  res.json({ newUserData });
});

module.exports = router;
