var ep = new eventproxy(),
    urlsArray = [], //存放爬取网址
    pageUrls = [],  //存放收集文章页面网站
    pageNum = 200;  //要爬取文章的页数

for(var i=1 ; i<= 2 ; i++){
	// pageUrls.push('http://www.cnblogs.com/#p'+i);
	pageUrls.push('http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex='+ i +'&ParentCategoryId=0');
}

function start(){
    let onRequest = (req, res) => {
        // 轮询 所有文章列表页
        pageUrls.forEach((pageUrl) => {
            superagent.get(pageUrl)
                .end((err,pres) => {
              // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
              // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
              // 剩下就都是利用$ 使用 jquery 的语法了
              var $ = cheerio.load(pres.text);
              var curPageUrls = $('.titlelnk');
 
              for(var i = 0 ; i < curPageUrls.length ; i++){
                var articleUrl = curPageUrls.eq(i).attr('href');
                urlsArray.push(articleUrl);
                // 相当于一个计数器
                ep.emit('BlogArticleHtml', articleUrl);
              }
            });
        });
 		
        ep.after('BlogArticleHtml', pageUrls.length*20 ,(articleUrls) => {
        	// 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
		    // 控制并发数
		    var reptileMove = (url,callback) => {		     
		    	superagent.get(url)
		        .end((err,sres) => {
		            // sres.text 里面存储着请求返回的 html 内容
		            var $ = cheerio.load(sres.text);
		            // 收集数据
		            // 拼接URL
		            var currentBlogApp = url.split('/p/')[0].split('/')[3],
		                appUrl = "http://www.cnblogs.com/mvc/blog/news.aspx?blogApp="+ currentBlogApp;
		            // 具体收集函数
		            personInfo(appUrl);
		            callback();
		        });
			};    

			// 使用async控制异步抓取   
			// mapLimit(arr, limit, iterator, [callback])
			// 异步回调
			async.mapLimit(articleUrls, 5 , (url, callback) => {
		      	reptileMove(url, callback);
		    },  (err,result) => {
		        // 4000 个 URL 访问完成的回调函数
		        // ...
		    });
        });
    }
    http.createServer(onRequest).listen(3000);
}

function personInfo(url) {
	superagent.get(url)
    .end((err,sres) => {
        // sres.text 里面存储着请求返回的 html 内容
        var $ = cheerio.load(sres.text);
        
        console.log("/n");
        console.log("url:" + url);
        console.log("昵称：" + $('#profile_block a').eq(0).html());
        console.log("园龄：" + $('#profile_block a').eq(1).html());
        console.log("粉丝：" + $('#profile_block a').eq(2).html());
        console.log("关注：" + $('#profile_block a').eq(3).html());
    });
}

exports.start= start;