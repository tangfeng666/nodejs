var mongoose = require('mongoose');

var acgSchema = new mongoose.Schema({
	author: String,
	cname: String
});

module.exports = mongoose.model('acg', acgSchema);