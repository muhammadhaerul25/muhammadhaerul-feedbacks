const fs = require('fs');
const https = require('https');
const path = require('path');

const url = "https://media.licdn.com/dms/image/v2/D562DAQGA3M_BUeHAEA/profile-treasury-document-images_1280/B56Zw4J5A0GYAU-/1/1770468645222?e=1793232000&v=beta&t=b7QZVaYMPa_qUS7PW4HE32A263wYof62-RNd_ABNs9Q";
const dest = path.join(__dirname, '../public/assets/images/awards/award_img_5.jpg');

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, function(redirectRes) {
            redirectRes.pipe(file);
            file.on('finish', function() {
                file.close(() => {
                    console.log('Downloaded successfully via redirect to:', dest);
                    process.exit(0);
                });
            });
        });
    } else {
        response.pipe(file);
        file.on('finish', function() {
            file.close(() => {
                console.log('Downloaded successfully to:', dest);
                process.exit(0);
            });
        });
    }
}).on('error', function(err) {
    fs.unlink(dest, () => {});
    console.error('Download error:', err.message);
    process.exit(1);
});
