const fs = require('fs');
const path = require('path');
const https = require('https');

const urls = [
  'https://media.licdn.com/dms/image/v2/D562DAQE0sZvavdRPAQ/profile-treasury-document-cover-images_1280/profile-treasury-document-cover-images_1280/0/1715421143275?e=1792728000&v=beta&t=jQd_Pyb8dvlEr_KY14Aobt3cUB6G_eWSD1j9Mt4NyYQ',
  'https://media.licdn.com/dms/image/v2/D562DAQGeP_UiwDoUGQ/profile-treasury-document-cover-images_1280/profile-treasury-document-cover-images_1280/0/1720350907371?e=1792728000&v=beta&t=B-Y5CBCkorNe1xdAikV3Cid--6zEPCFUkgoG5J4ZUdY',
  'https://media.licdn.com/dms/image/v2/D562DAQENdXBT40B1uA/profile-treasury-document-images_1920/B56Zfiji7iHoAo-/1/1751852667868?e=1793232000&v=beta&t=dUCSyTp0Cpykp5hfdVmQy5S3JoQdlhKe9x7SwhF9iew',
  'https://media.licdn.com/dms/image/v2/D4D2DAQG33Q7XxrpGWA/profile-treasury-image-shrink_1280_1280/B4DZpXH524JEAY-/0/1762398284065?e=1792728000&v=beta&t=YAhY1pC0lNqzpsZ6xnyAXfV51Ai_ANjIfGRmk4ItEno'
];

const destDir = path.join(__dirname, '../public/assets/images/awards');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (let i = 0; i < urls.length; i++) {
    const filename = `award_img_${i + 1}.jpg`;
    const target = path.join(destDir, filename);
    console.log(`Downloading ${i + 1} to ${target}...`);
    try {
      await download(urls[i], target);
      const stat = fs.statSync(target);
      console.log(`Downloaded ${filename}: ${stat.size} bytes`);
    } catch (e) {
      console.error(`Error downloading ${i + 1}:`, e.message);
    }
  }
}

main();
