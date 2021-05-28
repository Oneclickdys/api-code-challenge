'use strict';

const CONFIG = require('./config/config');
const readline = require('readline');
const fs = require('fs');
const SWAGGER_FILE = "./api/swagger/swagger.yaml";

if (CONFIG.SWAGGER_BASE_PATH && CONFIG.SWAGGER_BASE_PATH !== "") {

    var newSwaggerFile = "";

    let rl = readline.createInterface({
        input: fs.createReadStream(SWAGGER_FILE)
    });

    rl.on('line', function (line) {

        if (line.indexOf("basePath:") >= 0) {
            line = `basePath: ${CONFIG.SWAGGER_BASE_PATH}`;
        }
        newSwaggerFile += line + "\n";
    });

    rl.on('close', function () {
        // write file
        fs.writeFileSync(SWAGGER_FILE, newSwaggerFile);
    });
}

return "exit 0";
