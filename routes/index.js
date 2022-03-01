var UserModel = require('../models/users');

var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
var uid2 = require('uid2');



/* PAGE DE CONNEXION */
router.post('/login', async function(req, res, next) {

  var email = req.body.email
  var password = req.body.password
  console.log("req.body", req.body)

  //variable de vérification de l'existence d'un user
  var error = "Utilisateur inexistant!"
  var errorPassword = "Mot de passe erroné!"

  //recherche du document correspondant à l'email reçu du frontend
  var user = await UserModel.findOne({email});

  if (user) {
  //comparaison des mdp crytés pour permettre le login
    if (bcrypt.compareSync(password, user.password)) {
      console.log("password ok")
      res.json({ login: true, user });
    } else {
      res.json({ login: false, errorPassword });
    }

  } else {
    res.json({ error, user })
  }
})


/* PAGE DE CREATION DE COMPTE */
router.post('/register', async function(req, res, next) {

  var error = "Nouvel utilisateur!"
  const cost = 10; //nombre de tours de hashage à effectuer
  const hash = bcrypt.hashSync(myPlaintextPassword, cost); //génère le hash du mdp

  var user = await UserModel.findOne({email: req.body.email});
  if (user) {
    error = "Utilisateur existant!"
      } else if (!user) {

        //création d'un nouvel utilisateur
        var newUser = new UserModel ({
          lastname: req.body.lastname,
          firstname: req.body.firstname,
          email: req.body.email,
          password: hash,
          userAddress: req.body.adresse,
          userPhoneNumber: req.body.phoneNumber,
          dateOfBirth: req.body.dateOfBirth,
          gender: req.body.value,
          token: uid2(32)
        });

        //enregistrement du nouvel utilisateur dans la bdd
        var userSaved = await newUser.save();
        console.log(userSaved)
      }

  res.json({error, userSaved, user})
});

module.exports = router;
