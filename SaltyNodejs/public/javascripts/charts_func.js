var socket;
var normal_bet_data;
var tourney_bet_data;
var data_table;
var default_record_count = 100;
var saved_record_count = default_record_count;
var current_bettor = "EMPSiglemic";
google.load('visualization', '1.0', {'packages':['corechart']});
$(document).ready(function() {
    $('#last100bets').click(function() {
	saved_record_count = 100;
	showLoaderImages();
	populateBetData(); 
    });
    $('#maxbets').click(function() { 
	saved_record_count = -1; 
	showLoaderImages();
	populateBetData(); 
    });
    showLoaderImages();
    //data_table = $('#serverTable').DataTable({"searching":false,"order":[1,'desc'],serverSide: true, ajax: '/testme', columns:[{data:'bettor_name'},{data:'bet_date'},{data:'balance'},{data:'bet_amount'},{data:'is_tourney'}]});
    google.setOnLoadCallback(populateBetData());
    setInterval(function(){populateBetData()}, 20000);
    });

function showLoaderImages() {
    $('#bethistory table tbody').html('<img src="/images/ajax-loader.gif">');
    $('#bettorList').html('<img src="/images/ajax-loader.gif">');
    $('#chart_div').html('<img src="/images/ajax-loader.gif">');
    $('#tourney_chart_div').html('<img src="/images/ajax-loader.gif">');
}

function populateBetData() {
    var tableContent = '';
    var bettorList = '';
    var recordCount = 0;
    $('#bettorHeader').html(current_bettor); 
    //tableContent += '<tr><th>Name</th><th>Bet Datetime (UTC)</th><th>Balance</th><th>Bet Amount</th><th>Tourney</th></tr>'
    // jQuery AJAX call for JSON
    $.getJSON( '/getbethistory', {requested_bettor: current_bettor, record_number: saved_record_count}, function( data ) {
	    normal_bet_data = [];
        tourney_bet_data = [];
		if (data_table != null) { data_table.destroy(); }
		if(saved_record_count < 0) { // do server side processing when returning all records
			data_table = $('#serverTable').DataTable({"searching":false,"order":[1,'desc'],"processing": true, "serverSide": true, "ajax":{ "url": '/betprocessing',
					"data": function ( d ) { d.requested_bettor = current_bettor; d.record_number = saved_record_count; }}, 
					"columns":[{"data":"bettor_name"},{"data":"bet_date"},{"data":"balance"},{"data":"bet_amount"},{"data":"is_tourney"}]});
		}
		else { // client side processing of records into datatable
			data_table = $('#serverTable').DataTable({"searching":false,"order":[1,'desc'],columns:[{data:'bettor_name'},{data:'bet_date'},{data:'balance'},{data:'bet_amount'},{data:'is_tourney'}]});
			data_table.clear();
			data_table.rows.add(data);
        	data_table.draw();		
		}	
		// For each item in our JSON, add a table row and cells to the content string
	    var interval = Math.floor(data.length/100); // limit to 100 data points on visualization graph, but the latest bet is always shown since it is at index 0
	    for(var i=0; i<data.length;i=i+interval) {
		if (data[i].is_tourney) {
		    normal_bet_data.push([data[i].bet_date, 0]);
		    tourney_bet_data.push([data[i].bet_date, data[i].balance]);
		    // add in the oldest element if it will be skipped next iteration
		    if(i+interval > data.length-1) { 
			normal_bet_data.push([data[data.length-1].bet_date, 0]);
			tourney_bet_data.push([data[data.length-1].bet_date, data[data.length-1].balance]);
		    }
                }
                else {
		    normal_bet_data.push([data[i].bet_date, data[i].balance]);
		    tourney_bet_data.push([data[i].bet_date, 0]);
		    // add in the oldest element if it will be skipped next iteration
                    if(i+interval > data.length-1) {
			normal_bet_data.push([data[data.length-1].bet_date, data[data.length-1].balance]);
			tourney_bet_data.push([data[data.length-1].bet_date, 0]);
		    }
                }
	    }
	    /*
	    $.each(data, function(){
		
		if (this.is_tourney) {
                    normal_bet_data.push([this.bet_date, 0]);
                    tourney_bet_data.push([this.bet_date, this.balance]);
		} 
		else {
		    normal_bet_data.push([this.bet_date, this.balance]);
		    tourney_bet_data.push([this.bet_date, 0]);
		}
		tableContent += '<tr>';
		tableContent += '<td>' + this.bettor_name + '</td>';
		tableContent += '<td>' + this.bet_date + '</td>';
		tableContent += '<td>$' + this.balance + '</td>';
		tableContent += '<td>$' + this.bet_amount + '</td>';
		tableContent += '<td>' + this.is_tourney + '</td>';
		tableContent += '</tr>';
		recordCount += 1;
	    }); */
	    //$('#recordsHeading').html('Displaying: ' + recordCount + ' bets');
	    //$('#bethistory table tbody').html(tableContent);
            drawChart();
	});
    $.getJSON('/getbettors', function(data) {
	$.each(data, function(index, value){
	    bettorList += '<a href="#" class="bettorLink" onClick="loadDifferentBettor(\'' + value + '\')">' + value + '</a><br>';
	});
	$('#bettorList').html(bettorList);

    });
}

function loadDifferentBettor(bettor) {
    saved_record_count = default_record_count;
    current_bettor = bettor;
    showLoaderImages();
    populateBetData();
    
}

var isEmpty = function(obj) { for(var i in obj) { return false; } return true; }

function drawChart() {
    //var data = google.visualization.arrayToDataTable([
	//					      ['Year', 'Sales', 'Expenses'],
	//					      ['2004',  1000,      400],
	//					      ['2005',  1170,      460],
	//					      ['2006',  660,       1120],
	//					      ['2007',  1030,      540]
	//					      ]);
    normal_bet_data.push(['Datetime','Normal Balance']);
    tourney_bet_data.push(['Datetime','Tourney Balance']);
    var data = new google.visualization.arrayToDataTable(normal_bet_data.reverse());
    var tourney_data = new google.visualization.arrayToDataTable(tourney_bet_data.reverse());
    var options = {
    legend: { position: 'top'},
    hAxis: { textStyle: { fontSize: 10 }, title: 'Time (UTC)' },
    chartArea: { height: '60%' },
    height:400,
    };
    var tourney_options = {
    legend: { position: 'top'},
    hAxis: { textStyle: { fontSize: 10 }, title: 'Time (UTC)' },
    chartArea: { height: '60%' },
    colors: ['red'],
    height:400
    };
    var normal_chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    normal_chart.draw(data, options);
    var tourney_chart = new google.visualization.LineChart(document.getElementById('tourney_chart_div'));
    tourney_chart.draw(tourney_data, tourney_options);
}
