var userModel = require('../models/users');
var eventModel = require('../models/events');
var conversationModel = require('../models/conversations');

var express = require('express');
var router = express.Router();

var cloudinary = require('cloudinary').v2;
cloudinary.config({
 cloud_name: 'dsnrvfoqx',
 api_key: '169999271669978',
 api_secret: 'd3R9CygGoYRnHQz2ViW7OFTc_jo' 
});



/* TABLESCREEN - SAUVEGARDE DES MESSAGES DU CHAT */
router.post('/update-table-messages', async function(req,res, next){

  let userTable = await eventModel.findById(req.body.eventId)
  userTable.chat_messages.push({content: req.body.content, date: req.body.date, author: req.body.author, room: req.body.eventId})
  let savedTable = await userTable.save()

res.json({ result: true, conversation: savedTable });
});



/* TABLESCREEN - ENVOI DES MESSAGES DU CHAT */
router.get('/list-table-messages/:tableId/:token', async function(req, res, next){

  console.log('req.params:', req.params)
  let userTable = await eventModel.findById( req.params.tableId).populate("guests").exec();
  console.log('userTable:', userTable)
  let userIndex = userTable.guests.map((el) => el.token).indexOf(req.params.token)
  console.log('userIndex:', userIndex)
  let author = userTable.guests[userIndex].firstname
  console.log('author:', author)

res.json({chatMessages: userTable.chat_messages, author: author})
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








module.exports = router;