var mongoose = require('mongoose');

var characterSchema = new mongoose.Schema({
	name: String,							//名字
	author: String,							//作者
	acg: String,							//作品
	gender: String,							//性别
	tags: [String],							//标签
	recordDate: Date,						//收录日期
	introduce: String,						//简介
	hot: Number,							//热度
});

module.exports = mongoose.model('character', characterSchema);