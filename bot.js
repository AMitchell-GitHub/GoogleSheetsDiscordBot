/***


	AP Computer Science Discord Bot


***/
const si = require('systeminformation');
const Discord = require('discord.js');
const bot = new Discord.Client();
const axios = require('axios')

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

var colors = [225, 43, 164];

// Bot Commands
bot.on('message', (message) =>
{
	var mess = message.content;
  if (mess.startsWith("!"))
  {
	  var command = mess.substr(1,mess.length)

		if (command.startsWith("help"))
    {
			const embed = new Discord.RichEmbed()
				.setColor(colors)
				.setTitle("Help")
				.setFooter("Triggered by: "+message.author.username, message.author.avatarURL);
			embed.addField('!tomorrow', "Shows information about tomorrow", true);
			embed.addField('!date <month/date>', "Shows information about that date", true);
			embed.addField('!next <*>', "Searches for next date that includes *", true);
			message.channel.send({embed});
    }
    if (command.startsWith("tomorrow"))
    {
			// Load client secrets from a local file.
			fs.readFile('credentials.json', (err, content) => {
			  if (err) return console.log('Error loading client secret file:', err);
			  // Authorize a client with credentials, then call the Google Sheets API.
			  //authorize(JSON.parse(content), authorizationCallback);
				authorize(JSON.parse(content), listNextDay, message);
			});
    }
		if (command.startsWith("date"))
    {
			// Load client secrets from a local file.
			fs.readFile('credentials.json', (err, content) => {
			  if (err) return console.log('Error loading client secret file:', err);
			  // Authorize a client with credentials, then call the Google Sheets API.
			  //authorize(JSON.parse(content), authorizationCallback);
				authorize(JSON.parse(content), listDay, message);
			});
    }
		if (command.startsWith("next"))
    {
			// Load client secrets from a local file.
			fs.readFile('credentials.json', (err, content) => {
			  if (err) return console.log('Error loading client secret file:', err);
			  // Authorize a client with credentials, then call the Google Sheets API.
			  //authorize(JSON.parse(content), authorizationCallback);
				authorize(JSON.parse(content), next, message);
			});
    }
  }
});

// Runs when client connects to Discord.
bot.on('ready', () => {
	console.log('Logged in as', bot.user.tag)
	bot.user.setPresence(
	{
		game:
		{
			// Example: "Watching 5 players on server.com"
			name: `for \"!help\"`,
			type: 3 // Use activity type 3 which is "Watching"
		}
	})
})

function bulkDelete(amount, channel)
{
	channel.fetchMessages
	({
		limit: amount,
	}).then((messages) => {
		 channel.bulkDelete(messages).catch(error => console.log(error.stack));
	});
}

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, message) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, message);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listNextDay(auth, message) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: 'XXXX',
    range: 'XXXX!B4:F',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      //console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        //console.log(`${row[1]}, ${row[2]}, ${row[3]}`);
				var date = row[0];
				if (date  != null && date != "")
				{
					var month = date.substr(0, date.indexOf("/"));
					var sday = date.substr(date.indexOf("/")+1, date.length);

					var day = new Date();
					var nextDay = new Date(day);
					nextDay.setDate(day.getDate()+1);
					//console.log(nextDay); // Apr 30 2000
					/*console.log(month);
					console.log(sday);
					console.log(nextDay.getMonth());
					console.log(nextDay.getDate());
					console.log(); //*/

					if (month == nextDay.getMonth()+1 && sday == nextDay.getDate())
					{
						const embed = new Discord.RichEmbed()
							.setColor(colors)
							.setTitle("Next Day Assignment")
							//.setDescription("Returning stats for team "+teamNumber+" in the "+season+" Season")
							.setURL("XXXX")
							.setFooter("Triggered by: "+message.author.username, message.author.avatarURL);
							if (row[0] == null || row[0] == "") { row[0] = "None"; }
						embed.addField('Date', `${row[0]}/${nextDay.getFullYear()}`, true);
						if (row[1] == null || row[1] == "") { row[1] = "None"; }
						embed.addField('Lesson', `${row[1]}`, true);
						if (row[2] == null || row[2] == "") { row[2] = "None"; }
						embed.addField('Dropbox', `${row[2]}`, true);
						if (row[3] == null || row[3] == "") { row[3] = "None"; }
						embed.addField('Assessments', `${row[3]}`, true);
						message.channel.send({embed})
					}
				}
      });
    } else {
      //console.log('No data found.');
    }
  });
}

function listDay(auth, message) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: 'XXXX',
    range: 'XXXX!B4:F',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      //console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
			var mess = message.content;
			const args = mess.slice(1).trim().split(/ +/g);
      rows.map((row) => {
        //console.log(`${row[1]}, ${row[2]}, ${row[3]}`);
				if (row[0] == args[1])
				{
					const embed = new Discord.RichEmbed()
						.setColor(colors)
						.setTitle("Assignment for: "+args[1])
						//.setDescription("Returning stats for team "+teamNumber+" in the "+season+" Season")
						.setURL("XXXX")
						.setFooter("Triggered by: "+message.author.username, message.author.avatarURL);
						if (row[0] == null || row[0] == "") { row[0] = "None"; }
					embed.addField('Date', `${row[0]}`, true);
					if (row[1] == null || row[1] == "") { row[1] = "None"; }
					embed.addField('Lesson', `${row[1]}`, true);
					if (row[2] == null || row[2] == "") { row[2] = "None"; }
					embed.addField('Dropbox', `${row[2]}`, true);
					if (row[3] == null || row[3] == "") { row[3] = "None"; }
					embed.addField('Assessments', `${row[3]}`, true);
					message.channel.send({embed})
				}
      });
    } else {
      //console.log('No data found.');
    }
  });
}

function next(auth, message) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: 'XXXX',
    range: 'XXXX!B4:F',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      //console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
			var mess = message.content;
			const args = mess.slice(1).trim().split(/ +/g);
			var dates = [];
			var specificRow = 0;
      rows.map((row) => {
				if (row[0] != null && row[0] != "")
				{
					if (row[1] == null || row[1] == "") { row[1] = "None"; }
					if (row[2] == null || row[2] == "") { row[2] = "None"; }
					if (row[3] == null || row[3] == "") { row[3] = "None"; }
					var searchTerm = args[1].toLowerCase();
					if (searchTerm == "test" || searchTerm == "quiz") { specificRow = 3; }
					if (specificRow != 0)
					{
						if ( row[specificRow].toLowerCase().includes(searchTerm) )
						{
							dates.push(row[0]);
						}
					}
					else
					{
						if ( row[1].toLowerCase().includes(searchTerm)
						||   row[2].toLowerCase().includes(searchTerm)
						||   row[3].toLowerCase().includes(searchTerm) )
						{
							dates.push(row[0]);
						}
					}
				}
      });
			var earliestDate = findEarliestDate(dates);
			rows.map((row) => {
				if (row[0]==earliestDate)
				{
					const embed = new Discord.RichEmbed()
						.setColor(colors)
						.setTitle("Next: "+args[1])
						//.setDescription("Returning stats for team "+teamNumber+" in the "+season+" Season")
						.setURL("XXXX")
						.setFooter("Triggered by: "+message.author.username, message.author.avatarURL);
						if (row[0] == null || row[0] == "") { row[0] = "None"; }
					embed.addField('Date', `${row[0]}`, true);
					if (row[1] == null || row[1] == "") { row[1] = "None"; }
					embed.addField('Lesson', `${row[1]}`, true);
					if (row[2] == null || row[2] == "") { row[2] = "None"; }
					embed.addField('Dropbox', `${row[2]}`, true);
					if (row[3] == null || row[3] == "") { row[3] = "None"; }
					embed.addField('Assessments', `${row[3]}`, true);
					message.channel.send({embed})
				}
      });
    } else {
      //console.log('No data found.');
    }
  });
}

function findEarliestDate(dates){
    if(dates.length == 0) return null;
    var earliestDate = dates[0];
    for(var i = 1; i < dates.length ; i++){
        var currentDate = dates[i];
        if(currentDate < earliestDate){
            earliestDate = currentDate;
        }
    }
    return earliestDate;
}

function authorizationCallback(auth)
{
	console.log(auth);
}

bot.login('XXXX');
