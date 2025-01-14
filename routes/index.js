var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.sendFile(path.join(__dirname, '..', 'public', 'test.html'));
});

router.get('/getQuestion/:questionId', (req, res, next) => {
  let questionId = req.params.questionId
  let fullPath = path.join(__dirname, '..', 'questionJson', `question${questionId}.json`);


  try {
    const data = fs.readFileSync(fullPath, 'utf8');
    // console.log(data);
    res.json(JSON.parse(data))
  } catch (err) {
    console.error(err);
    res.status(500).send(err)
  }

})

module.exports = router;
