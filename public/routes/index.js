var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Customer Support' });
});

router.get('/chat', function(req, res, next){
  var user_message = (req.query.user_message);
})

module.exports = router;
