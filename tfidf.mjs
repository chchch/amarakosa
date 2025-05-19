import fs from 'fs';
import langs from './languages.mjs';
import { parse as csvParse } from 'csv-parse/sync';

const cosineSimilarity = (arr) => {
    const ret = [];
    for(let n=0;n<arr.length-1;n++) {
        for(let m=n+1;m<arr.length;m++) {
            const similarity = cosinesim(arr[n][1],arr[m][1]);
            //const similarity = 1 - (Math.acos(csim)/Math.PI);
            if(similarity === 0) continue;
            ret.push({
                group: 'edges',
                data: {
                    id: arr[n][0] + '-' + arr[m][0],
                    source: arr[n][0], 
                    target: arr[m][0], 
                    similarity: similarity
                }
            });
        }
    }
    return ret;
};

const weightedCentrality = (grammap, edges) => {
    const alpha = 0.5;
    const ret = new Map([...grammap.keys()].map(k => [k,{strength: 0, degree: 0}]));
    for(const edge of edges) {
        const similarity = edge.data.similarity;
        if(similarity > 0.75) continue; // skip multiple witnesses of the same text

        const source = ret.get(edge.data.source);
        const target = ret.get(edge.data.target);
        source.strength = source.strength + similarity;
        target.strength = target.strength + similarity;
        source.degree = source.degree + 1;
        target.degree = target.degree + 1;
    
    }
    for(const [key,val] of ret) {
        const weighted = val.degree ** (1-alpha) * val.strength ** alpha;
        ret.set(key, weighted);
    }
    return ret;
};

const cosinesim = (arr1, arr2) => {
    let dotprod = 0;
    let m1 = 0;
    let m2 = 0;
    for(let i=0; i < arr1.length; i++) {
        dotprod = dotprod + (arr1[i] * arr2[i]);
        m1 = m1 + (arr1[i] * arr1[i]);
        m2 = m2 + (arr2[i] * arr2[i]);
    }
    return dotprod / (Math.sqrt(m1) * Math.sqrt(m2));
};

const main = () => {
    const fnames = ['2grams-nosingles.csv','3grams-nosingles.csv','4grams-nosingles.csv','5grams-nosingles.csv',/*'6grams-nosingles.csv'*/];

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
    const totals = new Map();

    for(const [key, val] of allgrams) {
        for(let n=0;n<val.length;n++) {
            if(!totals.has(n)) totals.set(n,0);
            if(val[n] !== '')
                totals.set(n, totals.get(n) + 1);
        }
    }
    
    const idf = new Map();
    for(const [key, val] of totals)
        idf.set(key, Math.log(allgrams.size/val));

    const tfidf = new Map();
    for(const [key, val] of allgrams) {
        const newval = [];
        for(let n=0;n<val.length;n++) {
            if(val[n] !== '')
                newval.push(idf.get(n));
            else
                newval.push(0);
        }
        tfidf.set(key,newval);
    }
    const edges = cosineSimilarity([...tfidf]);
    /*
    const angularedges = edges.map(e => {
        return {
            group: 'edges',
            data: {
                id: e.data.id,
                source: e.data.source, 
                target: e.data.target,
                similarity: 1 - (2 * Math.cos(e.data.similarity)/Math.PI)
            }
        };
    });
    */
    const centrality = weightedCentrality(tfidf,edges);

    const keys = [...allgrams.keys()].map(k => {
        const ret = {
            group: 'nodes',
            data: {
                id: k,
                centrality: centrality.get(k)
            }
        };
        const classes = [];
        
        for(const [lang, nodes] of langs)
            if(nodes.includes(k)) classes.push(lang);
        ret.classes = classes;
        return ret;
    });
    const data = JSON.stringify(keys.concat(edges));
    fs.writeFileSync('public/data.json',data);
};

main();

