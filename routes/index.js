const userModel = require("../models/users");
const eventModel = require("../models/events");

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* CREATESCREEN - CRÉATION DE TABLE*/
router.post("/add-table", async function (req, res, next) {
  const addTable = new eventModel({
    date: req.body.dateOfEvent,
    title: req.body.titleEvent,
    restaurantName: req.body.restaurantName,
    restaurantAddress: req.body.restaurantAddress,
    foodType: req.body.foodType,
    presentation: req.body.presentationEvent,
    age: req.body.ageRange,
    capacity: req.body.capacity,
    budget: req.body.budget,
    planner: req.body.planner,
  });

  const newTable = await addTable.save();

  res.json({ result: newTable ? true : false, newTable });
});

/* HOMESCREEN - AFFICHAGE DES TABLES DISPONIBLES*/
router.get("/search-table", async function (req, res, next) {
  // affichage uniquement des events futurs
  const result = await eventModel
    .find({
      date: { $gte: new Date(Date.now()).toISOString() },
    })
    .sort({ date: 1 })
    .populate("guests")
    .exec();

  res.json({ result: result });
});

/* HOMESCREEN - FILTRAGE DES TABLES DISPONIBLES*/
router.post("/filters", async function (req, res, next) {
  if (req.body.date != 0 && req.body.type != "") {
    let startDate = new Date(req.body.date); // ISODate("2014-10-03T04:00:00.188Z")
    startDate.setUTCSeconds(0);
    startDate.setUTCHours(0);
    startDate.setUTCMinutes(0);

    let endDate = new Date(req.body.date);
    endDate.setUTCHours(23);
    endDate.setUTCMinutes(59);
    endDate.setUTCSeconds(59);

    let filteredData = await eventModel.aggregate([
      {
        $match: {
          $and: [
            {
              date: { $gte: startDate, $lte: endDate },
              foodType: req.body.type,
            },
          ],
        },
      },
      { $sort: { date: 1 } },
    ]);

    const result = filteredData;
    console.log("Date+Type:", result, req.body.type);
  } else if (req.body.type != "") {
    const typeFromFront = req.body.type.split(","); // req.body.type = string => tableau

    let typeFilter = await eventModel.find({
      foodType: { $in: typeFromFront },
      date: { $gte: new Date(Date.now()).toISOString() },
    });

    const result = typeFilter;
    console.log("Type:", result);
  } else if (req.body.date != 0) {
    let startDate = new Date(req.body.date); // ISODate("2014-10-03T04:00:00.188Z")
    startDate.setUTCSeconds(0);
    startDate.setUTCHours(0);
    startDate.setUTCMinutes(0);

    let endDate = new Date(req.body.date);
    endDate.setUTCHours(23);
    endDate.setUTCMinutes(59);
    endDate.setUTCSeconds(59);

    let dateFilter = await eventModel.find({
      date: { $gte: startDate, $lte: endDate },
    });
    const result = dateFilter;
    console.log("Date:", result);
  }

  res.json({ result });
});

/* JOINSCREEN/TABLESCREEN - INFORMATIONS DE L'EVENT SÉLECTIONNÉ */
router.get("/join-table/:tableId", async function (req, res, next) {
  const result = await eventModel
    .findById(req.params.tableId)
    .populate("guests")
    .exec();
  const planner = await userModel.findOne({ token: result.planner });

  res.json({ result: result, planner: planner });
});

/* JOINSCREEN - INFORMATIONS L'EVENT REJOINT */
router.post("/enter-table", async function (req, res, next) {
  const table = await eventModel.findById(req.body.id);
  const user = await userModel.findOne({ token: req.body.token });

  if (table.guests.includes(user.id)) {
    res.json({ table, result: false });
  } else {
    table.guests.push(user.id);
    table = await table.save();
    res.json({ table, result: true, user });
  }
});

/* EVENTSCREEN - AFFICHAGES DES EVENTS DU USER */
router.get("/my-events/:token", async function (req, res, next) {
  const user = await userModel.findOne({ token: req.params.token });

  const result = await eventModel.aggregate([
    {
      $match: {
        $or: [{ planner: req.params.token }, { guests: user._id }],
      },
    },
    { $sort: { date: 1 } },
  ]);

  res.json({ result });
});

/* TABLESCREEN - QUITTER UNE TABLE */
router.delete("/delete-guest/:tableId/:token", async function (req, res, next) {
  const table = await eventModel.findById(req.params.tableId);
  console.log("table.guests:", table.guests);
  const user = await userModel.findOne({ token: req.params.token });
  console.log("user.id:", user.id);
  console.log("table.planner:", table.planner);

  //si le user id fait parti de la liste des id des guests
  //alors libérer une place de participants sur la table
  if (table.guests.includes(user.id)) {
    table.guests = table.guests.filter((e) => e != user.id);
    table = await table.save();

    //si le token planner est strictement égal au token user et que la table à au moins deux guests
    //alors trouver le premier participant et le passer en planner
  } else if (table.planner === req.params.token && table.guests.length > 0) {
    const guestData = await userModel.findOne({ _id: table.guests[0] });
    table.planner = guestData.token;
    table.guests = table.guests.filter((e) => e._id == guestData._id);
    table = await table.save();

    //si le token planner est strictement égal au token user et que la table à un seul guest
    //alors suppression de la table
  } else if (table.planner === req.params.token && table.guests.length == 0) {
    await table.delete();
  }

  res.json({ table });
});

module.exports = router;
