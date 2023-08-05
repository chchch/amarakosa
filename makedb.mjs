import fs from 'fs';
import path from 'path';
import sqlite3 from 'better-sqlite3';
import { parse as csvParse } from 'csv-parse/sync';

const prepTexts = () => {
    const txt = fs.readFileSync('./texts.fas','utf8');
    const descs = new Map(
        csvParse(fs.readFileSync('./texts-descriptions.csv','utf8'))
            .map(el => [el[0],el[1]])
    );

    const ret = new Map();
    let cur = '';
    for(const line of txt.split(/\r?\n/)) {
        const trimmed = line.trim();
        if(trimmed === '') continue;
        if(trimmed.startsWith('>'))
            cur = trimmed.slice(1).trim();
        else {
            if(fs.existsSync(`${cur}.xml`)) {
                const item = ret.get(cur);
                if(item) continue;
                const newtext = fs.readFileSync(`${cur}.xml`,'utf8');
                ret.set(cur,{desc: descs.get(cur), text: [newtext]});
            }
            else {
                const item = ret.get(cur);
                if(item)
                    ret.set(cur,{ desc: item.desc, text: item.text.concat([trimmed]) });
                else
                    ret.set(cur,{ desc: descs.get(cur), text: [trimmed] });
            }
        }
    }
    console.log(`${ret.size} texts.`);
    return ret;
};

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
            grams[c.shift()] = JSON.stringify(c);
        const gramnum = f[0];
        return [f[0], grams];
    });

    const obj = {};
    for(const f of files)
        obj[f[0]] = f[1];

    return obj;
};

const db = new sqlite3('./texts.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.prepare('DROP TABLE IF EXISTS texts').run();
db.prepare('CREATE TABLE ' +
    'texts (' +
    'id TEXT NOT NULL PRIMARY KEY, ' +
    'description TEXT NOT NULL, ' +
    'text TEXT NOT NULL, ' +
    'grams2 TEXT NOT NULL, ' +
    'grams3 TEXT NOT NULL, ' +
    'grams4 TEXT NOT NULL, ' +
    'grams5 TEXT NOT NULL' +
')').run();

const texts = prepTexts();
const grams = prepGrams();

for(const id of texts.keys()) {
    const text = texts.get(id);
    const values = [
        id, 
        text.desc,
        text.text.join('\n\n'),
        grams['2grams'][id],
        grams['3grams'][id],
        grams['4grams'][id],
        grams['5grams'][id]
    ];
    db.prepare('INSERT INTO texts VALUES (?,?,?,?,?,?,?)')
      .run(values);
}

db.prepare('CREATE UNIQUE INDEX idx_texts_id ON texts (id)').run();

db.prepare('VACUUM').run();
db.close();
