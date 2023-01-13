import fs from 'fs';
import path from 'path';
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
            const item = ret.get(cur);
            if(item)
                ret.set(cur,{ desc: item.desc, text: item.text.concat([trimmed]) });
            else
                ret.set(cur,{ desc: descs.get(cur), text: [trimmed] });
        }
    }
    console.log(`${ret.size} texts.`);
    const data = JSON.stringify([...ret]);
    fs.writeFileSync('texts.json',data);
};

prepTexts();
