#!/usr/bin/env node

var fs = require('fs');

var iterateOnFile = function iterateOnFile (onIteration, onEnd) {
    // Read file
    var dbFile = fs.createReadStream(process.argv[2], { bufferSize: 64 * 1024 });
    var recordBuffer = "";

    // Iterate on file and execute functions
    dbFile.on('data', function(data, algo) {
        var records, record;
        var i, j;
        var stringData = data.toString();
        var limit;

        records = stringData.split('\n');

        if (records.length === 1) {
            recordBuffer += stringData;
            return;
        } else if (recordBuffer.length > 0) {
            records[0] = recordBuffer + records[0];
            recordBuffer = "";
        }

        limit = records.length - 1;

        for( i=0; i < limit; i+=1 ){
            if (records[i].match(/[^\s]/)) {
                record = JSON.parse(records[i]);
                onIteration.call(this, record);
            }
        }

        recordBuffer += records[limit];
    });

    dbFile.on('end', onEnd || function () {} );
}

var recordMatched = function recordMatched (record, query) {
    var j;
    var queryKeys = Object.keys(query);
    var matched = true;

    for( j=0; j < queryKeys.length; j++ ){
        if (query[queryKeys[j]] === null || typeof(query[queryKeys[j]]) !== 'object') {
            matched &= (query[queryKeys[j]] === record[queryKeys[j]])
        } else if (query[queryKeys[j]]['$ne']) {
            matched &= (query[queryKeys[j]]['$ne'] !== record[queryKeys[j]])
        }
    }

    return matched;
}

exports.iterateOnFile = iterateOnFile;
exports.recordMatched = recordMatched;
