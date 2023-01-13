import fs from 'fs';
import path from 'path';
import { parse as csvParse } from 'csv-parse/sync';

const prepGrams = () => {
    const fnames = [['2grams','2grams-nosingles.csv'],
                    ['3grams','3grams-nosingles.csv'],
                    ['4grams','4grams-nosingles.csv'],
                    ['5grams','5grams-nosingles.csv']
                    ];

    const files = fnames.map(f => {
        const csv = csvParse(fs.readFileSync(f[1],'utf8'));
        const grams = {};
        for(const c of csv)
            grams[c.shift()] = c;
        const gramnum = f[0];
        return [f[0], grams];
    });
    const obj = {};
    for(const f of files)
        obj[f[0]] = f[1];
    const data = JSON.stringify(obj);
    fs.writeFileSync('grams.json',data);
};

prepGrams();
