'use strict';

function undefCheck(text, defValue) {
	if(text) {return defValue}
	return text;
}

function hexToColor(hex) {
	if(hex === '#724a7f') {return 'purple';}
	if(hex === '#eb584a') {return 'red';}
	if(hex === '#dcc75b') {return 'yellow';}
	if(hex === '#4f819a') {return 'blue';}
	return "";
}

function generatePlainText(board, tickets) {
	return 'Board information\n' +
	'=============================\n' +
	'Board name: ' + undefCheck(board.name, '') + '\n' +
	'Board description: ' + undefCheck(board.description, '') + '\n' +
	'Board created by: ' + undefCheck(board.createdBy.email, '') + '\n' +
	'Board width: ' + undefCheck(board.size.width, '0') + '\n' +
	'Board height: ' + undefCheck(board.size.height, '0') + '\n' +
	'=============================\n' +
	'\n' + 
	'Tickets information\n' +
	'=============================\n' +
	ticket.map(function(t) {
		return 'Ticket heading: ' + undefCheck(t.heading, '') + '\n' +
				'Ticket content: ' + undefCheck(t.content, '') + '\n' +
				'Ticket color: ' + hexToColor(t.color) + '\n' + 
				'Ticket position x: ' + undefCheck(t.position.x, '0') + '\n' +
				'Ticket position y: ' + undefCheck(t.position.y, '0') + '\n' +
				'---------------\n';
	}).join('') + '\n' +
	'=============================';
}

function generateCSV(board, tickets) {
	var json2csv = require('nice-json2csv');

	var boardCSVData = {
		'NAME':        board.name,
		'DESCRIPTION': board.description,
		'CREATED_BY':  board.createdBy.email,
		'SIZE_WIDTH':  '' + board.size.width  + '',
		'SIZE_HEIGHT': '' + board.size.height + '',
	}

	var ticketCSVData = tickets.map(function(t) {
		return {
			'HEADING':    t.heading,
			'CONTENT':    t.content,
			'COLOR':      t.color,
			'POSITION_X': '' + t.position.x + '',
			'POSITION_Y': '' + t.position.y + '',
			'POSITION_Z': '' + t.position.z + '',
		}
	});

	var csvBoard    = json2csv.convert(boardCSVData);
	var csvTickets  = json2csv.convert(ticketCSVData);
	return csvBoard + '\n\n' + csvTickets;
}

module.exports = {
	generatePlainText: generatePlainText,
	generateCSV: generateCSV
}
