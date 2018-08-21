var express = require('express');
var router = express.Router();
var userModel = require('../models/userModel.js');

router.get('/', function(req, res, next) {
  res.redirect('/users/list');
});

router.get('/list', function(req, res, next) {
	userModel.find((err, data) => {
		if (err){
			return console.log(err);
		}
		res.render('UserList', {
			user: data
		});
	});
});

// 用户详情
router.get('/detail/:id', function (req, res) {
  var id = req.params.id;
  userModel.findOne({_id: id}, function (err, data) {
    if(err){ return console.log(err) }
    res.render('UserDetail', {
      user: data
    })
  })
})

//ADD
router.get('/add', (req, res, next) => {
	res.render('UserAdd');
});
router.post('/add',(req, res, next) => {
	var newUser = new userModel({
		username: req.body.username,
		email: req.body.email
	});
	newUser.save((err, data) => {
		if (err){
			return console.log(err);
		}
		res.redirect('/users/list');
	});
});

//EDIT
router.get('/edit/:id', (req, res, next) => {
	var id = req.params.id;
	userModel.findOne({_id:id}, (err, data) => {
		res.render('UserEdit', {
			user: data
		});
	});
});
router.post('/update', (req, res, next) => {
	var id = req.body.id;
	userModel.findById(id, (err, data) => {
		if(err){
			return console.log(err);
		}
		data.username = req.body.username;
		data.email = req.body.email;
		data.save((err) => {
			res.redirect('/users/list');
		});
	});
});

// 删除用户
router.delete('/del', function (req, res) {
  var id = req.query.id;
  userModel.remove({_id: id}, function (err, data) {
    if(err){ return console.log(err); }
    res.json({code: 200, msg: '删除成功'});
  })
})

module.exports = router;
