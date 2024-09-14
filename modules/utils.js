const axios = require('axios');
const fs = require('fs');

async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
    downloadImage,
    sleep
};
