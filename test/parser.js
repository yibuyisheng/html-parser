import fs from 'fs';
import parser from '../src/parser';

fs.readFile('./test/test1.html', function (err, content) {
    let emitter = parser(content);
    emitter.on('tag', function (obj) {
        console.log(obj.tag);
    });
});