var userModel = require('../models/users');
var eventModel = require('../models/events');

var express = require('express');
var router = express.Router();

var cloudinary = require('cloudinary').v2;
cloudinary.config({
 cloud_name: 'dsnrvfoqx',
 api_key: '169999271669978',
 api_secret: 'd3R9CygGoYRnHQz2ViW7OFTc_jo' 
});



/* BUDDYSCREEN - AFFICHE LA LISTE DES BUDDIES ET LA RELATION*/
router.get('/list-related-users/:token',async function (req,res,next){
  
  let tokenHandlers = await userModel.find({buddies : { $all: [ { "$elemMatch" : {token: req.params.token}}]}})
  let currentUser = await userModel.findOne({token: req.params.token});

  res.json({listOfRelations: tokenHandlers, currentUser: currentUser})
})


/* BUDDYSCREEN - ACCEPTER UN BUDDY*/
router.post('/accept-buddy', async function(req,res, next){

  let currentUser = await userModel.findOne({token : req.body.userToken});
  let receiverUser = await userModel.findOne({token : req.body.token});
  let receiverIndex = currentUser.buddies.map((el) => el.token).indexOf(req.body.token)
  currentUser.buddies[receiverIndex].status = true;
  let currentUserSaved = await currentUser.save();

  res.json({ result: true, requester : currentUserSaved, receiver :receiverUser });
});



/* BUDDYSCREEN - REFUSER UN BUDDY*/
router.post('/decline-buddy', async function(req,res, next){
  
  // récupère le user demandé et le user demandeur
  let currentUser = await userModel.findOne({token : req.body.userToken});
  let receiverUser = await userModel.findOne({token : req.body.token});

  //vérification si le token est déjà présent dans la liste de buddies.
  if (currentUser.buddies.some((buddy) => buddy.token !== req.body.token ) && receiverUser.buddies.some((buddy) => buddy.token !== req.body.userToken)) {
    res.json({result: false})

  } else {
    currentUser.buddies = [...currentUser.buddies.filter((buddy) => buddy.token !== req.body.token)];
    receiverUser.buddies = [...receiverUser.buddies.filter((buddy) => buddy.token !== req.body.userToken)];

    let currentUserSaved = await currentUser.save();
    let receiverUserSaved = await receiverUser.save();

    res.json({ result: true, requester : currentUserSaved, receiver :receiverUserSaved });
  }

});








