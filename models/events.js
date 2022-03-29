var mongoose = require('mongoose');


var chatRoomSchema = mongoose.Schema({
  date : Date,
  content: String,
  author : String,
  room: String
});


var eventSchema = mongoose.Schema({
  chat_messages: [chatRoomSchema],
  token : String,
  dateInsert: Date,
  date: String,
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


module.exports = mongoose.model('events', eventSchema);