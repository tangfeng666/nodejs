var express = require('express');
var router = express.Router();
var acgModel = require('../models/AcgModel');

/* GET users listing. */
router.get('/', function(req, res, next) {
	acgModel.find((err, data) => {
		if (err) {
			return console.log(err);
		}
		res.render('acg/AcgList',{
			acg: data
		});
	});
});

router.get('/add', function(req, res, next) {
  	res.render('acg/AcgAdd');
});

router.post('/add', (req, res, next) => {
	var newAcg = new acgModel({
		author: req.body.author,
		cname: req.body.cname
	});
	newAcg.save((err, data) => {
		if (err){
			return console.log(err);
		}
		res.redirect('/acg');
	});
});

module.exports = router;
