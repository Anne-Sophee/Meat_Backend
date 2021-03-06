const userModel = require("../models/users");
const eventModel = require("../models/events");
const conversationModel = require("../models/conversations");

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* TABLESCREEN - ENVOI DES MESSAGES/AUTEUR DU CHAT */
router.get(
  "/list-table-messages/:tableId/:token",
  async function (req, res, next) {
    let selectTable = await eventModel
      .findById(req.params.tableId)
      .populate("guests")
      .exec();
    let userData = await userModel.findOne({ token: req.params.token });
    let author = userData.firstname;

    res.json({ chatMessages: selectTable.chat_messages, author: author });
  }
);

/* TABLESCREEN - SAUVEGARDE DES MESSAGES DU CHAT */
router.post("/update-table-messages", async function (req, res, next) {
  let userTable = await eventModel.findById(req.body.eventId);
  userTable.chat_messages.push({
    content: req.body.content,
    date: req.body.date,
    author: req.body.author,
    room: req.body.eventId,
  });
  let savedTable = await userTable.save();

  res.json({ result: true, conversation: savedTable });
});

/* BUDDYSCREEN - AFFICHE LA LISTE DES BUDDIES ET LA RELATION*/
router.get("/list-related-users/:token", async function (req, res, next) {
  let tokenHandlers = await userModel.find({
    buddies: { $all: [{ $elemMatch: { token: req.params.token } }] },
  });
  let currentUser = await userModel.findOne({ token: req.params.token });

  res.json({ listOfRelations: tokenHandlers, currentUser: currentUser });
});

/* BUDDYSCREEN - AJOUTER UN BUDDY*/
router.post("/add-buddy", async function (req, res, next) {
  let currentUser = await userModel.findOne({ token: req.body.userToken });
  let receiverUser = await userModel.findOne({ token: req.body.token });

  //vérification si le token est déjà présent dans la liste de buddies.
  if (
    currentUser.buddies.some((buddy) => buddy.token === req.body.token) &&
    receiverUser.buddies.some((buddy) => buddy.token === req.body.userToken)
  ) {
    res.json({ result: false });
  } else if (currentUser.token === receiverUser.token) {
    res.json({ result: false });
  } else {
    currentUser.buddies = [
      ...currentUser.buddies,
      { token: req.body.token, status: true },
    ];
    receiverUser.buddies = [
      ...receiverUser.buddies,
      { token: req.body.userToken, status: false },
    ];
    let currentUserSaved = await currentUser.save();
    let receiverUserSaved = await receiverUser.save();

    res.json({
      result: true,
      requester: currentUserSaved,
      receiver: receiverUserSaved,
    });
  }
});

/* BUDDYSCREEN - ACCEPTER UN BUDDY*/
router.post("/accept-buddy", async function (req, res, next) {
  let currentUser = await userModel.findOne({ token: req.body.userToken });
  let receiverUser = await userModel.findOne({ token: req.body.token });
  let receiverIndex = currentUser.buddies
    .map((el) => el.token)
    .indexOf(req.body.token);

  currentUser.buddies[receiverIndex].status = true;
  let currentUserSaved = await currentUser.save();

  res.json({
    result: true,
    requester: currentUserSaved,
    receiver: receiverUser,
  });
});

/* BUDDYSCREEN - REFUSER UN BUDDY*/
router.post("/decline-buddy", async function (req, res, next) {
  // récupère le user demandé et le user demandeur
  let currentUser = await userModel.findOne({ token: req.body.userToken });
  let receiverUser = await userModel.findOne({ token: req.body.token });

  //vérification si le token est déjà présent dans la liste de buddies.
  if (
    currentUser.buddies.some((buddy) => buddy.token !== req.body.token) &&
    receiverUser.buddies.some((buddy) => buddy.token !== req.body.userToken)
  ) {
    res.json({ result: false });
  } else {
    currentUser.buddies = [
      ...currentUser.buddies.filter((buddy) => buddy.token !== req.body.token),
    ];
    receiverUser.buddies = [
      ...receiverUser.buddies.filter(
        (buddy) => buddy.token !== req.body.userToken
      ),
    ];

    let currentUserSaved = await currentUser.save();
    let receiverUserSaved = await receiverUser.save();

    res.json({
      result: true,
      requester: currentUserSaved,
      receiver: receiverUserSaved,
    });
  }
});

/* MESSAGESCREEN - ENVOYER LES MESSAGES SAUVEGARDÉS*/
router.get(
  "/list-chat-messages/:conversation/:token",
  async function (req, res, next) {
    let userConversation = await conversationModel
      .findById(req.params.conversation)
      .populate("talkers")
      .exec();
    let userIndex = userConversation.talkers
      .map((el) => el.token)
      .indexOf(req.params.token);
    let author = userConversation.talkers[userIndex].firstname;

    res.json({ chatMessages: userConversation.chat, author: author });
  }
);

/* MESSAGESCREEN - ENREGISTRER LA CONVERSATION*/
router.post("/update-messages", async function (req, res, next) {
  let userConversation = await conversationModel.findById(
    req.body.conversation
  );
  userConversation.chat.push({
    content: req.body.content,
    date: req.body.date,
    author: req.body.author,
    conversation: req.body.conversation,
  });
  let savedConversation = await userConversation.save();

  res.json({ result: true, conversation: savedConversation });
});

module.exports = router;
