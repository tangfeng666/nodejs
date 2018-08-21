//爬虫
var http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    eventproxy = require('eventproxy'),
    characterModel = require('./models/characterModel');

//连接数据库
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/AcgDB', { useNewUrlParser: true });
mongoose.connection.on('error', function() {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

/*
let Ut = require("./tools/common");
(async () => {
  try {
    let url = "http://avatar.csdn.net/1/A/1/3_zzwwjjdj1.jpg";
    let opts = {
      url: url,
    };
    let path = "./1.jpg";
    let r1 = await Ut.downImg(opts, path);
    console.log(r1);
  }
  catch (e) {
    console.log(e);
  }
})()
*/


var ep = new eventproxy();
var pageUrls = [];      //页面地址
var hrefUrls = [];      //下一级页面地址
var characters = [];    //角色资料
for(var i=1 ; i<= 2 ; i++){
    pageUrls.push('http://www.acgrenwu.com/dm/naruto/list_'+i+'.html');
}

pageUrls.forEach((pageUrl) => {
    superagent.get(pageUrl).end((err, pres) => {
        var $ = cheerio.load(pres.text);
        $('.c_row').each((index, element) => {
            var href = $(element).find('.c_row_right2').find('.c_subject').find('a').attr('href');
            var tags = [];
            $(element).find('.c_row_right2').find('.c_tag').find('.mt10').eq(1).find('.color444').find('a').each((i, e) => {
                tags.push($(e).text());
            });
            var dic = {
                tags: tags,
                href: href
            }
            hrefUrls.push(dic);
            ep.emit('AcgUrl', dic);
        });
    });
});

ep.after('AcgUrl', 35, (acgUrls) => {
    var reptileMove = (dic, callback) => {
        var url = dic.href;
        superagent.get(url).end((err,sres) => {
            var $ = cheerio.load(sres.text);
            var view = $('.anime-right-info');
            var name = view.find('.ts18').find('h1').text();     //角色名字
            var contentArr = [];
            view.find('.mt10').each((index, element) => {
                var content = $(element).find('.color444').text();
                contentArr.push(content);   //插入其他信息
            });

            //热度为一段js代码
            var hotHtml = view.find('.mt10').eq(3).find('.color444').html();
            var hotUrl = (hotHtml.split('src="'))[1].split('"')[0];
            hotUrl = hotUrl.replace(/\&amp;/g,'&');
            superagent.get(hotUrl).end((hErr, hRes) => {
                var hot = hRes.text.split('\'')[1];
                contentArr.splice(3, 1, hot);   //插入热度
                contentArr.splice(0, 0, name);  //插入名字
                contentArr.push(dic.tags);
                characters.push(contentArr);

                callback();
            });
        });
    }

    async.mapLimit(hrefUrls, 5 , (dic, callback) => {
        reptileMove(dic, callback);
    },  (err,result) => {
        characters.map((item, index) => {
            var newCharacter = new characterModel({
                name: item[0],
                acg: item[1],
                author: item[2],                   
                gender: item[3],                                   
                tags: item[7],                       
                recordDate: new Date(Date.parse(item[5])),            
                introduce: item[6],             
                hot: parseInt(item[4]),                     
            });
            newCharacter.save((error, d) => {
                if (err){
                    return console.log(err);
                }
            });

            console.log('完成数：'+index);
        });
    });
});