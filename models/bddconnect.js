const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

//options de connexion Mongoose avec limite de temps de tentative de connexion
const options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//module de connexion incluant une fonction de callback en cas d'erreurs
mongoose.connect(
  `mongodb+srv://Anesofie:${process.env.MONGODB_KEY}@cluster0.ur7oi.mongodb.net/NewmeatApp?retryWrites=true&w=majority`,
  options,
  function (err) {
    if (err) {
      console.log(err);
    } else {
      //renvoi une information différente de "null"
      console.log("Bdd connectée");
    }
  }
);

//alternative avec ternaire = question ?(alors) condition1(true) :(sinon) condition2(false)
//function(err) {err ? console.log(err) : console.log('Bdd connectée')}
