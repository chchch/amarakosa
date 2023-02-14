import fs from 'fs';
import path from 'path';
import { parse as csvParse } from 'csv-parse/sync';

const main = () => {
    const fnames = ['2grams.csv','3grams.csv','4grams.csv','5grams.csv'];

    const files = fnames.map(f => csvParse(fs.readFileSync(f,'utf8')));
    
    const allgrams = new Map();
    for(const file of files) {
        for(const row of file) {
            const name = row.shift();
            if(allgrams.has(name))
                allgrams.set(name,allgrams.get(name).concat(row));
            else
                allgrams.set(name,row);
        }
    }
    
    const gramsets = [];
    for(const [key, val] of allgrams) {
    
        const present = new Set();
        for(let n=0;n<val.length;n++) {
            if(val[n] !== '')
                present.add(n);
        }
        gramsets.push([key, present]);
    }

    const weights = [];
    for(let n=0;n<gramsets.length;n++) {
        for(let m=n+1;m<gramsets.length;m++) {

            const union = new Set(gramsets[n][1]);
            const intersection = new Set();
            for(const el of gramsets[m][1]) {
                union.add(el);
                if(gramsets[n][1].has(el)) intersection.add(el);
            }
            
            const jaccard = (union.size - intersection.size) / union.size;
            if(jaccard !== 1) {
                const dice = 1 - 2*intersection.size/(gramsets[n][1].size + gramsets[m][1].size);
                weights.push({
                    group: 'edges',
                    data: {
                        id: `${gramsets[n][0]}-${gramsets[m][0]}`,
                        source: gramsets[n][0],
                        target: gramsets[m][0],
                        //jaccard: jaccard,
                        dice: dice
                    }
                });
            }
        }
    }
    
    const langs = new Map([
        ['hindi', ['MPEd','RBEd','RPEd','RDEd','DhaEd','BhoEd','DEd','SSEd']],
        ['kannada',['RSEd','JM278','LREd']],
        ['nepali', ['BKEd']],
        ['newari',['KA2a','KA2b','KA5','KA6','KA7','CAdd1698']],
        ['malayalam', ['BPEd']],
        ['marathi', ['EAP248-1-81']],
        ['tamil', ['KPEd','ORI3317','RE22704','Ad69312','Ad70820','Ad71010','Ad72614','EO1272','RE45807','RE37121']],
        ['telugu', ['GBPEd']]
    ]);

    const keys = [...allgrams.keys()].map(k => {
        const ret = {
            group: 'nodes',
            data: {
                id: k
            }
        };
        const classes = [];
        
        for(const [lang, nodes] of langs)
            if(nodes.includes(k)) classes.push(lang);
        ret.classes = classes;
        return ret;
    });
    const data = JSON.stringify(keys.concat(weights));
    fs.writeFileSync('data.json',data);
};

main();

