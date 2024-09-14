const { Client } = require('discord.js-selfbot-v13');

const { downloadImage, sleep } = require('./utils');
const { info, bad, success } = require('./logs');

const fs = require('fs');
const path = require('path');
const config = require('./config');
const savePath = './data/';

const createDirIfNotExists = (dir) => !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });

['avatars', 'banners'].forEach(dir => createDirIfNotExists(path.join(savePath, dir)));
createDirIfNotExists(savePath);

const client = new Client();

client.on('ready', async () => {
    try {
        console.clear();

        const guild = client.guilds.cache.get(config.bot.guild);
        const members = await guild.members.fetch();
        info(`UNDESYNC PROFILE SCRAPER | Scraping: ${guild.name}`);
        info(`Total members: ${members.size}`);
        info(`${client.user.username} is ready!`);
        await sleep(3000);

        let count = 0, errorCount = 0;

        for (const member of members.values()) {
            if (config.save.maxScrapes > 0 && count === config.save.maxScrapes) break;

            const fetchedUser = await client.users.fetch(member.user.id, { force: true });
            
            if (config.save.id) {
                fs.appendFileSync(path.join(savePath, 'IDs.txt'), `${member.user.id}\n`);
            }
            if (config.save.username) {
                fs.appendFileSync(path.join(savePath, 'Usernames.txt'), `${member.user.username}\n`);
            }

            const downloadAndSave = async (url, dir, id) => {
                try {
                    await downloadImage(url, path.join(dir, `${id}.png`));
                } catch (error) {
                    bad(`Error downloading for ${member.user.username}: ${error.message}`);
                    errorCount++;
                }
            };

            if (config.save.avatar && member.user.displayAvatarURL()) {
                await downloadAndSave(member.user.displayAvatarURL(), path.join(savePath, 'avatars'), member.user.id);
            }

            if (config.save.banner && fetchedUser.bannerURL({ dynamic: true, size: 4096 })) {
                await downloadAndSave(fetchedUser.bannerURL({ dynamic: true, size: 4096 }), path.join(savePath, 'banners'), member.user.id);
            }

            count++;
            console.clear();
            info(`${Math.floor((count / members.size) * 100)}% done`);
        }

        console.clear();
        success('Process finished!');
        success(`Total users scraped: ${count - errorCount}`);
        info(`Total errors encountered: ${errorCount}`);

    } catch (error) {
        bad(error.message);
    }
});

module.exports = client;