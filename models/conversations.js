var mongoose = require('mongoose');


//schema de la collection chat de groupe
var chatSchema = mongoose.Schema({
  date : Date,
  content: String,
  author : String,
  conversation: String
});


//schema de la collection conversation
var conversationSchema = mongoose.Schema({
  chat: [chatSchema],
  talkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
});


//méthode model avec en premier argument le nom de la collection et en deuxième le schéma 
module.exports = mongoose.model('conversations', conversationSchema);