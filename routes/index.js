var userModel = require('../models/users');
var eventModel = require('../models/events');

var express = require('express');
var router = express.Router();

var cloudinary = require('cloudinary').v2;
cloudinary.config({
 cloud_name: 'dsnrvfoqx',
 api_key: '169999271669978',
 api_secret: 'd3R9CygGoYRnHQz2ViW7OFTc_jo' 
});



/* CREATESCREEN - CRÉATION DE TABLE*/
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



/* HOMESCREEN - AFFICHAGE DES TABLES DISPONIBLES*/
router.get('/search-table', async function (req, res, next) {

  // affichage uniquement des events futurs
  var result = await eventModel.find({
    date:
      { $gte: new Date(Date.now()).toISOString() }
  })
    .sort({ date: 1 }).populate("guests").exec();

  res.json({ result: result });
});



/* HOMESCREEN - FILTRAGE DES TABLES DISPONIBLES*/
router.post('/filters', async function (req, res, next) {

  if (req.body.date != 0 && req.body.type != "") {

    let startDate = new Date(req.body.date); // ISODate("2014-10-03T04:00:00.188Z")
    startDate.setUTCSeconds(0);
    startDate.setUTCHours(0);
    startDate.setUTCMinutes(0);

    let endDate = new Date(req.body.date);
    endDate.setUTCHours(23);
    endDate.setUTCMinutes(59);
    endDate.setUTCSeconds(59);

    let filteredData = await eventModel.aggregate([{
      $match: {
        $and: [{
          date: { $gte: startDate, $lte: endDate },
          foodType: req.body.type
        }]
      }
    },
    { $sort: { date: 1 } }
    ])

    var result = filteredData
    console.log("Date+Type:", result, req.body.type)

  } else if (req.body.type != "") {

    const typeFromFront = req.body.type.split(","); // req.body.type = string => tableau

    let typeFilter = await eventModel.find({
      foodType: { $in: typeFromFront },
      date: { $gte: new Date(Date.now()).toISOString() }
    })

    var result = typeFilter
    console.log("Type:", result)

  } else if (req.body.date != 0) {

    let startDate = new Date(req.body.date); // ISODate("2014-10-03T04:00:00.188Z")
    startDate.setUTCSeconds(0);
    startDate.setUTCHours(0);
    startDate.setUTCMinutes(0);

    let endDate = new Date(req.body.date);
    endDate.setUTCHours(23);
    endDate.setUTCMinutes(59);
    endDate.setUTCSeconds(59);

    let dateFilter = await eventModel.find({ date: { $gte: startDate, $lte: endDate } })
    var result = dateFilter
    console.log("Date:", result)
  }
  

res.json({ result })
})



/* JOINSCREEN/TABLESCREEN - INFORMATIONS DE L'EVENT SÉLECTIONNÉ */
router.get('/join-table/:_tableId', async function (req, res, next) {

  var result = await eventModel.findOne({ _id: req.params._tableId }).populate("guests").exec();
  var planner = await userModel.findOne({token: result.planner});

  res.json({ result: result, planner : planner});

});



/* JOINSCREEN - INFORMATIONS L'EVENT REJOINT */
router.post('/enter-table', async function (req, res, next) {

  var table = await eventModel.findById(req.body.id);
  var user = await userModel.findOne({ token: req.body.token });

  if (table.guests.includes(user.id)) {
    res.json({table, result: false})

  } else {
    table.guests.push(user.id)
    table = await table.save();
    res.json({ table ,result : true, user});
  }
});









/* REDIRECTION VERS LA PAGE D'EVENT SÉLECTIONNÉE */
router.get('/my-events/:token', async function (req, res, next) {

  const user = await userModel.findOne({ token: req.params.token })

  var result = await eventModel.aggregate([{
    $match: {
        $or: [{ planner: req.params.token },
        { guests: user._id }],
    }
  },  
  { $sort: { date: 1 } }
  ])

  res.json({ result })
  })













module.exports = router;