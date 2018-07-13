
require('./news/news');
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});
