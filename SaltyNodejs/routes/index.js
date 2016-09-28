var toolname = "cupW";
var express = require('express');
var router = express();
var db;

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { header: toolname, title: toolname+' - Home' });
});

router.get('/bethistory', function(req,res) {
	db = req.db;
	res.render('bethistory', { header: toolname, title: toolname+" - Bet History" });
    });

router.get('/getbethistory', function(req,res) {
    var record_number = req.query["record_number"];
    var bettor = req.query["requested_bettor"];
    var collection = db.get('bets');
    if(record_number < 0) {
	collection.find({bettor_name:bettor},{sort : { bet_date: -1 } },function(e,docs) {
                res.json(docs);
        });
    }
    else {
	collection.find({bettor_name:bettor},{limit:record_number, sort : { bet_date: -1 } },function(e,docs) {
		res.json(docs);
	});
    }
});

router.get('/getbettors', function(req,res) {
    var collection = db.get('bets');
    collection.distinct('bettor_name',function(e,docs) {
                res.send(docs);
        });
});

module.exports = router;
