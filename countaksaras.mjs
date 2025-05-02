import fs from 'node:fs';
import { aksaraSplit } from './split.mjs';
import { filters, filterAll } from './normalize.mjs';
import langs from './languages.mjs';

const reverselangs = new Map();
for(const [lang,arr] of langs) {
       for(const el of arr) reverselangs.set(el,lang);
}

const go = () => {
    const lines = fs.readFileSync('texts.fas','utf8').split(/[\r\n]+/);
    const cur = {name: null, data: null};
    const all = new Map();
    for(const line of lines) {
        const trimmed = line.trim();
        if(trimmed.startsWith('>')) {
            const newname = trimmed.slice(1);
            if(cur.name === newname)
                continue;
            else {
                if(cur.name !== null)
                    all.set(cur.name, cur.data);
                cur.name = newname;
                cur.data = null;
            }
        }
        else {
            const lang = reverselangs.get(cur.name) || 'sanskrit';
            const filterindices = [];
            for(let n=0; n < filters.length;n++) {
                const el = filters[n];
                /*
                if(lang === 'tamil')
                    if(el.group === 'general' || el.group === 'tamil')
                        filterindices.push(n);
                */
                if(lang === 'tibetan')
                    if(el.group === 'general') filterindices.push(n);
                if(el.group === 'general' || el.group === 'sanskrit')
                    filterindices.push(n);
            }
            const split = aksaraSplit(filterAll(trimmed,filterindices)[0]);
            if(cur.data)
                cur.data = [...cur.data, ...split];
            else
                cur.data = split;
        }
    }
    const out = [];
    let max = 0;
    let min = Infinity;
    let id = 1;
    for(const el of [...all]) {
        const length = el[1].length;
        if(length > max) max = length;
        if(length < min) min = length;
        out.push({
            id: id,
            name: el[0],
            size: el[1].length,
            language: reverselangs.get(el[0]) || 'sanskrit'
        });
        id = id + 1;
    }
    const den = max - min;
    for(const el of out) {
        el.pos = (el.size - min) / den;
    }
    fs.writeFileSync('counts.json',JSON.stringify(out),{encoding: 'utf-8'});
};

go();
