var mongoose = require('mongoose');

//schema de la collection users
var UserSchema = mongoose.Schema({
    lastname : String,
    firstname : String,
    email : String,
    password : String,
    userAddress : String,
    userPhoneNumber : Number,
    dateOfBirth : Date,
    gender : String,
    avatar : String
});

//méthode model avec en premier argument le nom de la collection et en deuxième le schéma 
module.exports = mongoose.model('users', UserSchema);