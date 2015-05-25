'use strict';

var json2csv = require('nice-json2csv');
var fs       = require('fs');
var utils    = require('../utils');

/**
 * Checks if value is undefined and returns defValue. Othervise value is returned 
 * @param {*} value - Value to check.
 * @param {*} defValue - Default value to be returned in value is undefined.
 * @returns {*} defValue if value it undefined, otherwise return value
 */
function undefCheck(value, defValue) {
	if(typeof value === 'undefined') {return defValue}
	return value;
}
/**
 * Return hex color to readable format
 * @param {string} hex - Hex value to be turned.
 * @returns {string} color hex converted
 */
function hexToColor(hex) {
	if(hex === '#724a7f') {return 'purple';}
	if(hex === '#eb584a') {return 'red';}
	if(hex === '#dcc75b') {return 'yellow';}
	if(hex === '#4f819a') {return 'blue';}
	return "";
}

/**
 * Edits content text to be on same line
 * @param {string} content - content to be edited.
 * @returns {string} content edited
 */
function contentEdit(content) {
	content = content.replace(/\n/g, '\n 			');
	return content;
}

/**
 * Generates plain text from board and tickets
 * @param {object} board - Board object to be generated.
 * @param {object} tickets - Tickets to be generated.
 * @returns {string} plain text
 */
function generatePlainText(board, tickets) {
	return 'Board information\n' +
	'=========================================\n\n' +
	'Board name: 		' + undefCheck(board.name, '') + '\n' +
	'Board created by: 	' + undefCheck(board.createdBy.email, '') + '\n\n' +
	'=========================================\n\n\n\n' +
	'Tickets information\n' +
	'=========================================\n' +
	tickets.map(function(t) {
		return '\n' +
				'------------------------------------------\n' +
				'Ticket content:    	' + contentEdit(undefCheck(t.content, '')) + '\n' +
				'Ticket color: 	    	' + hexToColor(t.color) + '\n' + 
				'------------------------------------------\n';
	}).join('') + '\n' +
	'=========================================';
}

/**
 * Generates CSV from board and tickets
 * @param {object} board - Board object to be generated.
 * @param {object} tickets - Tickets to be generated.
 * @returns {string} csv text
 */
function generateCSV(board, tickets) {
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
