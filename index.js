const client = require('./modules/discordClient');
const config = require('./config');

client.login(config.bot.token);
