var UserModel = require('../models/users');

var express = require('express');
const { Router } = require('express');
var router = express.Router();


/* PAGE DE CONNEXION */
router.post('/login', async function(req, res, next) {

  var email = req.body.email
  var password = req.body.password

  //variable de vérification de l'existence d'un user
  var result = false
  var error = "Pas d'erreurs!"

  //recherche du document correspondant à l'email reçu du frontend
  var user = await UserModel.findOne({email});
    if (!user) {
      error = "Utilisateur inexistant!"
        } else if (user) {
          //comparaison du mdp existant au mdp reçu du frontend
          if (user.password === password) {
          result = true
          }
        }

  //on renvoie la réponse au format json: le résultat, le message d'erreur et l'objet user
  res.json({result, error, user})
})


/* PAGE DE CREATION DE COMPTE */
router.post('/register', async function(req, res, next) {

  var error = "Nouvel utilisateur!"

  var user = await UserModel.findOne({email: req.body.email});
  if (user) {
    error = "Utilisateur existant!"
      } else if (!user) {

        //création d'un nouvel utilisateur
        var newUser = new UserModel ({
          lastname: req.body.lastname,
          firstname: req.body.firstname,
          email: req.body.email,
          password: req.body.password,
          userAddress: req.body.adresse,
          userPhoneNumber: req.body.phoneNumber,
          dateOfBirth: req.body.dateOfBirth,
          sexe: req.body.value
        });

        //enregistrement du nouvel utilisateur dans la bdd
        var userSaved = await newUser.save();
        console.log(userSaved)
      }

  res.json({error, userSaved, user})
});

module.exports = router;
