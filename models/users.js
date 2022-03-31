var mongoose = require('mongoose');

//schema de la collection users
var userSchema = mongoose.Schema({
    lastname : String,
    firstname : String,
    email : String,
    password : String,
    userAddress : String,
    userPhoneNumber : Number,
    dateOfBirth : String,
    gender : String,
    avatar : String,
    token : String,
    messages: [messageSchema],
    event_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
    buddies: [buddiesSchema],
    favouriteBuddies : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    chat: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chats' }],
});


//schema de la collection messages privés
var messageSchema = mongoose.Schema({
  status : String,
  date : Date,
  sender : String,
  content: String,
  receiver: String,
});


// schéma de la collection mes buddies
var buddiesSchema = mongoose.Schema({
  token : String,
  status : Boolean,
});


//méthode model avec en premier argument le nom de la collection et en deuxième le schéma 
module.exports = mongoose.model('users', userSchema);