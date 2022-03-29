var userModel = require('../models/users');
var eventModel = require('../models/events');

var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
var uid2 = require('uid2');

var fs = require('fs');
var uniqid = require('uniqid');
const { Hash } = require('crypto');
var cloudinary = require('cloudinary').v2;
cloudinary.config({
 cloud_name: 'dsnrvfoqx',
 api_key: '169999271669978',
 api_secret: 'd3R9CygGoYRnHQz2ViW7OFTc_jo' 
});



/* PAGE DE CRÉATION DE TABLE */
router.post('/add-table', async function (req, res, next) {

  var addTable = new eventModel({
    date: req.body.dateOfEvent,
    title: req.body.titleEvent,
    restaurantName: req.body.restaurantName,
    restaurantAddress: req.body.restaurantAddress,
    foodType: req.body.foodType,
    presentation: req.body.presentationEvent,
    age: req.body.ageRange,
    capacity: req.body.capacity,
    budget: req.body.budget,
    planner: req.body.planner
  });

  var newTable = await addTable.save();
  
  res.json({ result: newTable ? true : false, newTable });
});


/* PAGE D'AFFICHAGE DES TABLES DISPONIBLES */
router.get('/search-table', async function (req, res, next) {

  // affichage uniquement des events futurs
  var result = await eventModel.find({
    date:
      { $gte: new Date(Date.now()).toISOString() }
  })
    .sort({ date: 1 }).populate("guests").exec();

  res.json({ result: result });
  });






module.exports = router;