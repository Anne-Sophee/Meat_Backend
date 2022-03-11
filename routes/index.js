var UserModel = require('../models/users');

var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
var uid2 = require('uid2');

var fs = require('fs');
var uniqid = require('uniqid');
var cloudinary = require('cloudinary').v2;
cloudinary.config({
 cloud_name: 'dsnrvfoqx',
 api_key: '169999271669978',
 api_secret: 'd3R9CygGoYRnHQz2ViW7OFTc_jo' 
});



/* PAGE DE CONNEXION */
router.post('/login', async function(req, res, next) {

  var email = req.body.email
  var password = req.body.password
  console.log('email:', email, 'mdp:', password)

  //variable de vérification de l'existence d'un user
  var error = "Utilisateur inexistant!"
  var errorPassword = "Mot de passe erroné!"
  console.log('erreur user:', error, 'erreur mdp:', errorPassword)

  //recherche du document correspondant à l'email reçu du frontend
  var user = await UserModel.findOne({email});

  if (user) {
  //comparaison des mdp crytés pour permettre le login
    if (bcrypt.compareSync(password, user.password)) {
      res.json({ login: true, user });
      console.log('user trouvé:', user)
    } else {
      res.json({ signin: false, errorPassword });
      console.log('mdp error:', errorPassword)
    }

  } else {
    res.json({ error, user })
    console.log('user error:', error)
  }
})


/* PAGE DE CREATION DE COMPTE */
router.post('/register', async function(req, res, next) {

  var error = "Nouvel utilisateur!"
  const cost = 10; //nombre de tours de hashage à effectuer
  const hash = bcrypt.hashSync(req.body.password, cost); //génère le hash du mdp

  var user = await UserModel.findOne({email: req.body.email});
  if (user) {
    error = "Utilisateur existant!"
      } else if (!user) {

        //création d'un nouvel utilisateur
        var newUser = new UserModel ({
          avatar: req.body.avatar,
          lastname: req.body.lastname,
          firstname: req.body.firstname,
          email: req.body.email,
          password: hash,
          userAddress: req.body.address,
          userPhoneNumber: req.body.phoneNumber,
          dateOfBirth: req.body.dateOfBirth,
          gender: req.body.gender,
          token: uid2(32)
          
        });

        //enregistrement du nouvel utilisateur dans la bdd
        var userSaved = await newUser.save();
        console.log(userSaved)
      }

  res.json({result: userSaved ? true : false, error})
});


/* SAUVEGARDE DE FICHIER SUR CLOUDINARY */
router.post('/uploadAvatar', async function(req, res, next) {

  // dossier dans lequel on veut placer notre fichier
  var picturePath = './tmp/'+uniqid()+'.jpg';

  // enregistrement/déplacement du fichier 'avatar' dans notre dossier temporaire 
  var resultCopy = await req.files.avatar.mv(picturePath);

    if (!resultCopy) {
      var resultCloudinary = await cloudinary.uploader.upload(picturePath);
      console.log(resultCloudinary)
      res.json({cloud: resultCloudinary, message: 'Fichier téléchargé!'});
    } else {
      res.json({error: resultCopy, message: 'Erreur de téléchargement!'})
    }
  
});









module.exports = router;
