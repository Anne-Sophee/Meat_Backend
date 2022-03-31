var mongoose = require('mongoose');


// schéma de la collection table
var eventSchema = mongoose.Schema({
  chat_messages: [chatRoomSchema],
  token : String,
  dateInsert: Date,
  date: Date,
  title: String,
  planner: String,    
  guests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  presentation: String,
  restaurantName: String,
  restaurantAddress: String,
  foodType: String,
  budget: Number, 
  booking_status: String,
  capacity: Number,
  age : String,
})

// schéma de la collection chat de groupe
var chatRoomSchema = mongoose.Schema({
  date : Date,
  content: String,
  author : String,
  room: String
});


//méthode model avec en premier argument le nom de la collection et en deuxième le schéma 
module.exports = mongoose.model('events', eventSchema);