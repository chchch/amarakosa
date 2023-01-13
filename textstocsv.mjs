import fs from 'fs';
import path from 'path';

const textsToCsv = () => {
    const file = fs.readFileSync('./texts.json','utf8');
    const Texts = JSON.parse(file);     
    const data = Texts.map(t => {
       const id = t[0];
       const text = t[1].map(tt => `"${tt}"`).join(',');
       return `${id},,${text}`;
    }).join('\n');
    fs.writeFileSync('texts.csv',data);
};

textsToCsv();
