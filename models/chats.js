var mongoose = require('mongoose')


//schema de la collection chat de groupe
var chatSchema = mongoose.Schema({
    date: Date,
    content: String,
    event_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
    from: String,
});


//méthode model avec en premier argument le nom de la collection et en deuxième le schéma 
module.exports = mongoose.model('chats', chatSchema);