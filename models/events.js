var mongoose = require('mongoose');


// schéma de la collection chat de groupe
var chatRoomSchema = mongoose.Schema({
  date : Date,
  content: String,
  author : String,
  room: String
});


// schéma de la collection table
var eventSchema = mongoose.Schema({
  _id: Schema.Types.ObjectId,
  date: Date,
  title: String,
  planner: String,    
  presentation: String,
  restaurantName: String,
  restaurantAddress: String,
  foodType: String,
  budget: Number, 
  booking_status: String,
  capacity: Number,
  age : String,
  chat_messages: [chatRoomSchema],
  guests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]
})



//méthode model avec en premier argument le nom de la collection et en deuxième le schéma 
module.exports = mongoose.model('events', eventSchema);