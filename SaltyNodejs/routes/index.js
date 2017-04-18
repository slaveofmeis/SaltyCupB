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

router.get('/betprocessing', function(req,res) {
	console.log(req.query);
	var record_number = req.query["record_number"];
    var bettor = req.query["requested_bettor"];
    var collection = db.get('bets');
	var start = req.query["start"];
    var length = req.query["length"];
    var draw = req.query["draw"];
	var asc = 1;
	var column_index = parseInt(req.query["order"][0]["column"],10);
	var column_sort = req.query["columns"][column_index]["data"];

	if(req.query["order"][0]["dir"] === "desc") { asc = -1; }
	else { asc = 1; } 
	if(record_number < 0) { collection.count({bettor_name:bettor}, function(e, count) { record_number = count; }); }
    // cannot find a way to replace the sort column with a variable, so doing multiple if elif blocks
	if(column_sort === "bettor_name") {
		collection.find({bettor_name:bettor},{limit:length, fields: {_id: 0}, skip:start, sort : {bettor_name: asc} },function(e,docs) {
			var myJSON = '{"draw": ' + draw + ', "recordsTotal":' + record_number + ', "recordsFiltered": ' + record_number + ', "data": ' + JSON.stringify(docs) + '}';
			res.send(myJSON);	
		});
	}
	else if(column_sort === "bet_date") {
		collection.find({bettor_name:bettor},{limit:length, fields: {_id: 0}, skip:start, sort : {bet_date: asc} },function(e,docs) {
            var myJSON = '{"draw": ' + draw + ', "recordsTotal":' + record_number + ', "recordsFiltered": ' + record_number + ', "data": ' + JSON.stringify(docs) + '}';
            res.send(myJSON);
        });
	}
	else if(column_sort === "balance") {
		collection.find({bettor_name:bettor},{limit:length, fields: {_id: 0}, skip:start, sort : {balance: asc} },function(e,docs) {
            var myJSON = '{"draw": ' + draw + ', "recordsTotal":' + record_number + ', "recordsFiltered": ' + record_number + ', "data": ' + JSON.stringify(docs) + '}';
            res.send(myJSON);
        });
	}
	else if(column_sort === "bet_amount") {
		collection.find({bettor_name:bettor},{limit:length, fields: {_id: 0}, skip:start, sort : {bet_amount: asc} },function(e,docs) {
            var myJSON = '{"draw": ' + draw + ', "recordsTotal":' + record_number + ', "recordsFiltered": ' + record_number + ', "data": ' + JSON.stringify(docs) + '}';
            res.send(myJSON);
        });
	}
	else {
		collection.find({bettor_name:bettor},{limit:length, fields: {_id: 0}, skip:start, sort : {is_tourney: asc} },function(e,docs) {
            var myJSON = '{"draw": ' + draw + ', "recordsTotal":' + record_number + ', "recordsFiltered": ' + record_number + ', "data": ' + JSON.stringify(docs) + '}';
            res.send(myJSON);
        });
	}
});

module.exports = router;
