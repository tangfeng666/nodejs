var express = require('express');
var router = express.Router();
var characterModel = require('../models/CharacterModel');

/* GET home page. */
router.get('/', function(req, res, next) {
	characterModel.find((err, data) => {
		if (err) {
			return console.log(err);
		}
		res.render('index', { characters: data });
	});
});

module.exports = router;
