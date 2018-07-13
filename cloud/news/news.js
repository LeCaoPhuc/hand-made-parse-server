
Parse.Cloud.define('getNewsList', function (req, res) {
    var newsQuery = new Parse.Query("genkData");
    console.log("getNewsList");
    var limit = req.params.limit;
    var page = req.params.page;
    if(!limit || !page) {
        res.error(-1, "page and limit is require")
        return;
    }
    else {
        limit = parseInt(limit);
        page = parseInt(page);
        if (page < 1) {
            res.error(-1, "page must be larger than 0")
            return;
        }
    }
    var query = new  Parse.Query("genkData");
    query.limit(limit);
    query.skip((page - 1) * limit);
    query.find()
    .then(function (results) {
        res.success({
            code: 200,
            data: results
        });
    })
    .catch(function (err) {
        res.error(400, err)
    })
    
})

Parse.Cloud.define("saveNewsItem", function(req, res){
    console.log("saveNewsItem")
    var listDataNews = req.params.data;
    if(!listDataNews) {
        res.error(-1, "data undefined");
        return;
    }
    else{
        if(typeof listDataNews === 'string') {
            try {
                listDataNews = JSON.parse("[" + req.params.data + "]")[0];
            }
            catch(ex) {
                console.log(ex);
                res.error(-1, "data undefined");
                return;
            }
        }
    }
    var genkDataList = [];
  
    for(var i = 0 ; i < listDataNews.length; i++) {
        var GenkData = new Parse.Object.extend('genkData');
        var genkData = new GenkData();
        genkData.set("title", listDataNews[i].title)
        genkData.set("image", listDataNews[i].image)
        genkData.set("sourceUrl", listDataNews[i].sourceUrl)
        genkData.set("subContent", listDataNews[i].subContent)
        genkData.set("sourcePage", listDataNews[i].sourcePage)
        genkData.set("typeOrHumanSource", listDataNews[i].typeOrHumanSource)
        genkDataList.push(genkData);
    }
    Parse.Object.saveAll(genkDataList)
    .then(function (genkDataList) {
        console.log("saveNewsItem success")
        res.success({
            data: genkDataList,
            code: 200
        })
    })
    .catch(function (error) {
        console.log("saveNewsItem error")
        res.error(-1,"fail to save genkData")
    });
})