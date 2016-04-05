var options = require('minimist')(process.argv.slice(2));
var request = require('request');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://noreply%40brandingbrand.com@smtp.gmail.com');

var selector = options.s || '.headerjk';
var uri = options.u || 'http://www.google.com';

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"page pinger" <noreply@brandingbrand.com>', // sender address
    to: 'jon.koynok@brandingbrand.com', // list of receivers
    subject: 'pinger results', // Subject line
    text: 'Hello world', // plaintext body
    html: '<b>Hello world </b>' // html body
};

var regexCallback = function(err, response, body) {
	if (new RegExp(selector).test(body)) {
		var msg = selector +' found on '  + uri;
		send(msg, body);
	} else {
		var msg = 'no instance of ' + selector + ' found on ' + uri;
		send(msg, body);
	}	
}

var selectorCallback = function(err, response, body) {
	var $ = cheerio.load(body);
	if ($(selector).length) {
		var msg = selector +' found on '  + uri;
		send(msg, body);
	} else {
		var msg = 'no instance of ' + selector + ' found on ' + uri;
		send(msg, body);
	}	
}

var send = function(msg, body) {
		mailOptions.text = msg;
		mailOptions.html = msg;
		mailOptions.attachments = [{ filename: 'response.txt', content: body}];
		transporter.sendMail(mailOptions, cb);
}

if (selector.indexOf('/') == 0) {
 request(uri, regexCallback);
} else {
 request(uri, selectorCallback);
}

// send mail with defined transport object
cb = function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
};