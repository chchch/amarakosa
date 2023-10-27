import Data from './data.json';
//import Texts from './texts.json';
//import Grams from './grams.json';
import Hypher from 'hypher';
import createSqlWorker from './sqlWorker.mjs';
import { hyphenation_sa } from './sa.mjs';
import Cytoscape from 'cytoscape';
//import cola from 'cytoscape-cola';
import Fcose from 'cytoscape-fcose';
//cytoscape.use(cola);
Cytoscape.use(Fcose);

const state = {
    //texts: new Map(Texts),
    dbdata: null,
    highlit: [],
    searchTimeout: null
};

const hyphenator = new Hypher(hyphenation_sa);
const CytoStyle =  [{
    selector: 'node',
    style: {
        'background-color': '#777',
        'label': 'data(id)',
        'width': el => el.data('centrality')*1.5 + 1,
        'height': el => el.data('centrality')*1.5 + 1,
        //'width': 15,
        //'height': 15,
        'font-family': 'Brill'
    }
},
{selector: 'edge',
style: {
    //width: 1,
    //width: el => { const scaled = el.data('similarity') - 0.4; return scaled > 0 ? scaled * 10 : 1;},
    //width: el => 1 + 1/el.data('similarity'),
    width: el => el.data('similarity') * 5,
    'line-color': '#ccc',
    //'line-opacity': el => { const scaled = (1-el.data('similarity'))*2; return scaled > 1 ? 1 : scaled; },
    //'line-opacity': el => { const scaled = (1 - Math.log(el.data('similarity'),Math.E)/Math.E); return scaled > 1 ? 1 : scaled;},
    'line-opacity': el => {const scaled = el.data('similarity') + 0.1; return scaled > 1 ? 1 : scaled;},
    'z-index': 1,
    'curve-style': 'straight',
    'events': 'no'
    }
},
{selector: 'edge.mst',
    style: {
        //'line-opacity': el => { const scaled = (1 - Math.log(el.data('similarity'),Math.E))/Math.E; return scaled > 1 ? 1 : scaled;},
        'line-opacity': el => {const scaled = el.data('similarity') + 0.2; return scaled > 1 ? 1 : scaled;},
        //'curve-style': 'taxi'
        'curve-style': 'straight'
    }
},
{selector: '.mst',
style: {
    'line-color': 'rgb(7,48,80)',
    'z-index': 10,
    }
},
{selector: '.lowlight',
style: {
    'underlay-color': 'rgb(240,231,112)',
    'underlay-padding': 2,
    'underlay-opacity': 0.3,
    }
},
{selector: '.highlight',
style: {
    'underlay-color': 'rgb(255,255,12)',
    'underlay-padding': 2,
    'underlay-opacity': 0.8,
    'line-color': 'rgb(255,255,12)',
    'z-index': 15
    }
},
{selector: '.found',
style: {
    'underlay-color': 'rgb(255,255,12)',
    'underlay-padding': 4,
    'underlay-opacity': 0.8,
    'line-color': 'rgb(255,255,12)',
    'z-index': 15
    }
}];
//const colours = ['#a6cee3','#1f78b4' ,'#b2df8a' ,'#33a02c' ,'#fb9a99' ,'#e31a1c', '#fdbf6f','#ff7f00' ,'#cab2d6','#6a3d9a','#fcfc12','#b15928'];
//const languages = [ 'bangla', 'burmese', 'hindi', 'kannada', 'nepali', 'newari', 'malayalam', 'marathi', 'sinhala', 'tamil', 'telugu','tibetan'];
const colours = [
    /*indo-european*/
    '#136d52','#1a9873','#21c494','#3bdead','#67e5bf','#92ecd2',
    /*dravidian*/
    '#7d2502','#e14204','#fc8050','#fec8b4',
    /*tibeto-burman*/
    '#045a8d','#2b8cbe','#74a9cf'
    ];
const languages = [
    /*indo-european*/
    'hindi','nepali','gujarati','sinhala','bangla','marathi', 
    /*dravidian*/
    'tamil','kannada','telugu','malayalam', 
    /*tibeto-burman*/
    'newar','tibetan','burmese'
    ];
for(let n=0;n<colours.length;n++) {
    CytoStyle.push({
        selector: `node.${languages[n]}`,
        style: {
            'background-color': colours[n]
        }
    });
}

const main = async function() {
    //const res = await fetch('./data.json');
    //const Data = await res.json();
    const cy = Cytoscape( {
        container: document.getElementById('graph'),
        elements: Data,
        wheelSensitivity: 0.2,
        layout: {
            name: 'null',
        },
        style: CytoStyle
    });
    const tree = cy.elements().kruskal(edge => 1 - edge.data('similarity'));
    tree.addClass('mst');
    const others = cy.$('edge').difference(tree);
    others.remove();
    const layout1 = cy.layout({
        name: 'fcose',
        nodeDimensionsIncludeLabels: true,
        randomize: true,
        //numIter: 4000,
        //idealEdgeLength: edge => 50 / edge.data('similarity'),
        //edgeElasticity: edge => edge.data('similarity') * 80
        });
    const layout2 = cy.layout({
        name: 'fcose',
        nodeDimensionsIncludeLabels: true,
        randomize: false,
        numIter: 4000,
        quality: 'proof',
        //idealEdgeLength: edge => 50 / edge.data('similarity'),
        idealEdgeLength: edge => (1-edge.data('similarity')) * 30,
        //edgeElasticity: edge => 200 / edge.data('similarity'),
        //edgeElasticity: edge => edge.data('similarity') * 50
        edgeElasticity: edge => edge.data('similarity')
        });
    layout1.run();
    cy.once('layoutstop',() => {
        /*cy.layout({
        name: 'cose',
        nodeDimensionsIncludeLabels: true,
        numIter: 4000,
        idealEdgeLength: edge => 50 / edge.data('similarity'),
        //edgeElasticity: edge => edge.data('similarity') * 80
        }).run();*/
        layout2.run();
        cy.once('layoutstop',() => others.restore());
        //others.restore();
    });
    cy.on('tap',mouseUp.bind(null,cy));
    cy.on('mouseover',mouseOver.bind(null,cy));
    
    blackout.addEventListener('click',unBlackout);
    document.getElementById('gramselector').addEventListener('click',switchGrams);
    document.getElementById('searchbox').addEventListener('change',searchSigla.bind(null,cy));
    document.getElementById('searchbox').addEventListener('keyup',searchSigla.bind(null,cy));
};

const mouseUp = async (cy,e) => {
    clearFound(cy);
    if(e.target.isNode && e.target.isNode()) {
        if(state.highlit.length === 1) {
            if(state.highlit[0] === e.target) {
                cy.$('.highlight, .lowlight').removeClass(['highlight','lowlight']);
                e.target.removeClass('highlight');
                state.highlit = [];
                return;
            }
            const highlitnode = state.highlit[0];
            e.target.addClass('highlight');
            cy.$('edge.lowlight').removeClass(['highlight','lowlight']);
            e.target.edgesWith(highlitnode).addClass('highlight');
            await textPopup(state.highlit[0].id(),e.target.id());
            state.highlit.push(e.target);
        }
        else if(state.highlit.length === 2 || state.highlit.length === 0) {
            const targindex = state.highlit.indexOf(e.target);
            if(state.highlit.length === 2 && targindex !== -1) {
               if(targindex === 1) state.highlit.pop();
               else state.highlit.shift();
               e.target.removeClass('highlight');
               cy.$('edge.highlight').removeClass('highlight');
               difflight(state.highlit[0].connectedEdges());
            }
            else {
                cy.$('.highlight').removeClass('highlight');
                state.highlit = [];
                const edges = e.target.connectedEdges();
                difflight(edges);
                e.target.addClass('highlight');
                state.highlit.push(e.target);
            }
        }
    }/*
    else if(e.target.isEdge && e.target.isEdge()) {
        cy.$('.highlight, .lowlight').removeClass(['highlight','lowlight']);
        e.target.addClass('highlight');
        const nodes = e.target.connectedNodes();
        nodes.addClass('highlight');
        textPopup(nodes[0].id(),nodes[1].id());
        state.highlit = [nodes[0],nodes[1]];
    }*/
    else {
        cy.$('.highlight, .lowlight').removeClass(['highlight','lowlight']);
        state.highlit = [];
    }
};
const difflight = (edges) => {
    /*
    const sorted = edges.sort((a, b) => a.data('similarity') - b.data('similarity'));
    sorted.forEach((edge, i) => {
        if(i < 6) edge.addClass('highlight');
        else edge.addClass('lowlight');
    });
    */
    const numsort = (a,b) => a - b;
    const sorted = edges.map(e => e.data('similarity')).sort(numsort);
    const first = quantileSorted(sorted,0.25);
    const third = quantileSorted(sorted,0.75);
    const iqr = third - first;
    edges.forEach((edge) => {
        // 1.5 * iqr = "outlier", 3 * iqr = "far out"
        if(edge.data('similarity') > third + (3 * iqr)) edge.addClass('highlight');
        else edge.addClass('lowlight');
    });
};

const quantileSorted = (values, p, fn) => {
    const n = values.length;
    if (!n) {
      return;
    }

    const fnValueFrom =
      Object.prototype.toString.call(fn) == "[object Function]" ? 
          fn : function (x) {
            return x;
          };

    p = +p;

    if (p <= 0 || n < 2) {
      return +fnValueFrom(values[0], 0, values);
    }

    if (p >= 1) {
      return +fnValueFrom(values[n - 1], n - 1, values);
    }

    const i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = +fnValueFrom(values[i0], i0, values),
      value1 = +fnValueFrom(values[i0 + 1], i0 + 1, values);

    return value0 + (value1 - value0) * (i - i0);
};

const mouseOver = (cy,e) => {
    if(e.target.isNode && e.target.isNode()) {
        clearFound(cy);
        if(state.highlit.length < 2) {
            let prevhighlit = null;
            let prevlowlit = null;
            if(state.highlit.length === 1) {
                const highlitnode = cy.$('node.highlight');
                const curedge = e.target.edgesWith(highlitnode);
                const curclasses = curedge ? curedge.classes() : null;
                prevhighlit = cy.$('edge.highlight');
                prevlowlit = cy.$('edge.lowlight');
                prevhighlit.removeClass('highlight');
                prevlowlit.removeClass('lowlight');
                if(curedge && curclasses) curedge.addClass(curclasses);
            }

            e.target.addClass('highlight');
            e.target.once('mouseout',mouseOut.bind(null,[prevhighlit,prevlowlit]));
        }
        else {
            e.target.addClass('highlight');
            e.target.once('mouseout',mouseOut.bind(null,[]));
        }
    }
};

const mouseOut = (prevlit,e) => {
    if(state.highlit.indexOf(e.target) === -1) {
        e.target.removeClass('highlight');
        if(prevlit[0]) prevlit[0].addClass('highlight');
        if(prevlit[1]) prevlit[1].addClass('lowlight');
    }
};

const getData = async (id1, id2) => {
    //const worker = await createSqlWorker('/texts.db');
    const worker = await createSqlWorker('texts.db');
    return await worker.db.query(`SELECT id, text, description, grams2, grams3, grams4, grams5 FROM texts WHERE texts.id IN ("${id1}","${id2}")`);
};

const textPopup = async (id1, id2) => {
    const blackout = document.getElementById('blackout');
    blackout.style.display = 'flex';
    const popup = document.getElementById('textPopup');
    popup.style.display = 'none'; 
    const data = await getData(id1,id2);

    state.dbdata = new Map(
        data.map(el => [el.id, {
            text: el.text,
            desc: el.description,
            '2grams': JSON.parse(el.grams2),
            '3grams': JSON.parse(el.grams3),
            '4grams': JSON.parse(el.grams4),
            '5grams': JSON.parse(el.grams5)
        }])
    );
    const boxen = [...state.dbdata].map(([id,el],n) => {
        const container = document.getElementById(`textbox${n}`);
        container.querySelector('.title').textContent = id;
        container.querySelector('.desc').textContent = el.desc;
        const textbox = container.querySelector('.text');
        //textbox.textContent = el.text.join('\n\n');
        textbox.innerHTML = el.text/*.join('\n\n')*/;
        textbox.myText = textbox.innerHTML;
        return {id: id, textbox: textbox};
    });
    document.querySelector('.selected')?.classList.remove('selected');
    document.querySelector('#gramselector span').classList.add('selected');

    document.getElementById('spinner').style.display = 'none';
    popup.style.display = 'flex';
    highlightTexts(boxen,'2grams');
};

const unBlackout = (e) => {
    if(e.target.closest('#textPopup')) return;
    else {
        const blackout = document.getElementById('blackout');
        blackout.style.display = 'none';
        document.getElementById('textPopup').style.display = 'none';
        document.getElementById('spinner').style.display = 'flex';
    }
};

const highlightTexts = (boxen, grams) => {
    const gramdata = boxen.map(el => state.dbdata.get(el.id)[grams]);
    const found = {
        text1: [],
        text2: []
    };
    for(let n=0;n<gramdata[0].length;n++) {
        if(gramdata[0][n] !== '' && gramdata[1][n] !== '') {
            found.text1 = found.text1.concat(cleanString(gramdata[0][n]));
            found.text2 = found.text2.concat(cleanString(gramdata[1][n]));
        }
    }
    highlightText(found.text1,boxen[0].textbox);
    highlightText(found.text2,boxen[1].textbox);
};

const cleanString = (str) => {
    return str.replace(/&#(\d+);/g, (match,p1) => {
        if(p1 !== '59') return String.fromCodePoint(p1);
        else return '&#59';
    })
              .split(';').map(s => s.replace(/&#59/g,';')
                                    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                                    .trim());
};

const highlightText = (tokens, el) => {
    const intervals = [];
    for(const token of tokens) {
        const regex = new RegExp(token,'g');
        const matches = el.textContent.matchAll(regex);
        for(const m of matches)
            intervals.push([m.index, m.index + m[0].length]);
    }
    const startsort = (a,b) => a[0] - b[0];
    intervals.sort(startsort);

    const spans = [];
    for(let n=0;n<intervals.length;n++) {
        if( (n === intervals.length - 1) ||
            (intervals[n][1] <= intervals[n+1][0]) )
            spans.push(intervals[n]);
        else
            intervals[n+1] = [intervals[n][0],intervals[n+1][1]];
    }
    for(const span of spans.reverse()) {
        /*
        const range = document.createRange();
        range.setStart(el.childNodes[0],span[0]);
        const end = el.childNodes[0].length > span[1] ? span[1] : el.childNodes[0].length;
        range.setEnd(el.childNodes[0],end);
        */
        const range = getRange(el,span[0],span[1]); 
        highlightRange(range);
        /*
        const highlightNode = document.createElement('span');
        highlightNode.className = 'highlit';
        highlightNode.appendChild(range.extractContents());
        range.insertNode(highlightNode);
        */
    }
    el.normalize();
    hyphenate(el);
};

const highlightRange = (range) => {
    const highlight1 = (range) => {
        const highlightNode = document.createElement('span');
        highlightNode.className = 'highlit';
        highlightNode.appendChild(range.extractContents());
        range.insertNode(highlightNode);
    };
    const findEls = (range) => {
        const container = range.cloneContents();
        if(container.firstElementChild) return true;
        return false;
    };
    const nextSibling = (node) => {
        let start = node;
        while(start) {
            const sib = start.nextSibling;
            if(sib) return sib;
            else start = start.parentElement; 
        }
        return null;
    };

    if(!findEls(range))
        return highlight1(range);

    const toHighlight = [];
    const start = (range.startContainer.nodeType === 3) ?
        range.startContainer :
        range.startContainer.childNodes[range.startOffset];

    const end = (range.endContainer.nodeType === 3) ?
        range.endContainer :
        range.endContainer.childNodes[range.endOffset-1];

    if(start.nodeType === 3 && range.startOffset !== start.length) {
        const textRange = document.createRange();
        textRange.setStart(start,range.startOffset);
        textRange.setEnd(start,start.length);
        toHighlight.push(textRange);
    }
    
    const getNextNode = (n) => n.firstChild || nextSibling(n);

    for(let node = getNextNode(start); node !== end; node = getNextNode(node)) {
        if(node.nodeType === 3) {
            const textRange = document.createRange();
            textRange.selectNode(node);
            toHighlight.push(textRange);
        }
    }

    if(end.nodeType === 3 && range.endOffset > 0) {
        const textRange = document.createRange();
        textRange.setStart(end,0);
        textRange.setEnd(end,range.endOffset);
        toHighlight.push(textRange);
    }
    
    const firsthighlit = highlight1(toHighlight.shift());

    for(const hiNode of toHighlight)
        highlight1(hiNode);
};

const getRange = (par, start, end) => {
    const range = document.createRange();
    const walker = document.createTreeWalker(par,NodeFilter.SHOW_TEXT, { acceptNode() {return NodeFilter.FILTER_ACCEPT;}});
    let count = 0;
    let started = false;
    let cur = walker.nextNode();
    while(cur) {
        const curend = count + cur.length;
        if(!started && start <= curend) {
            range.setStart(cur, start - count);
            started = true;
        }
        if(end <= curend) {
            range.setEnd(cur,end - count);
            return range;
        }
        count = curend;
        cur = walker.nextNode();
    }
};

const hyphenate = (el) => {
    const nbsp = String.fromCodePoint('0x0A0');
    const walker = document.createTreeWalker(el,NodeFilter.SHOW_TEXT,
        {acceptNode() {return NodeFilter.FILTER_ACCEPT;} });
    var curnode = walker.nextNode();
    while(curnode) {
        curnode.data = hyphenator.hyphenateText(curnode.data
                            .replace(/\s+([\|।॥])/g,`${nbsp}$1`)
                            .replace(/([\|।॥])[ \t\r\f]+(?=[\d०१२३४५६७८९❈꣸৽৽])/g,`$1${nbsp}`)
                            // don't use \s+ or else it matches \n\n (see DhaEd)
        );
        curnode = walker.nextNode();
    }
};

const switchGrams = (e) => {
    const el = e.target.closest('span');
    if(!el) return;
    if(el.classList.contains('selected')) return;
    const n = el.dataset.n;
    if(!n) return;

    document.querySelector('.selected')?.classList.remove('selected');
    el.classList.add('selected');
    
    const ret = [0,1].map(n => {
        const container = document.getElementById(`textbox${n}`);
        const id = container.querySelector('.title').textContent; 
        const textbox = container.querySelector('.text');
        textbox.innerHTML = textbox.myText;
        return {id: id, textbox: textbox};
    });
    
    highlightTexts(ret,n);
};

const clearFound = (cy) => {
    const oldfound = cy.nodes('.found');
    if(oldfound) oldfound.removeClass('found');
    if(state.searchTimeout) state.searchTimeout = null;
};

const searchSigla = (cy,e) => {
    const go = (cy, targ) => {
        clearFound(cy);
        const val = targ.value;
        if(val) {
            const oldfound = cy.nodes('.found');
            if(oldfound) oldfound.removeClass('found');
            const found = cy.nodes(`[id *= '${val}']`);
            found.addClass('found');
            return found ? found[0] : null;
        }
        else return false;
    };
    
    if(e.key === 'Enter') {
        const found = go(cy,e.target);
        if(found) cy.animate({fit: {eles: found, padding: 400}, duration: 1000});
    }
    else
        if(!state.searchTimeout)
            state.searchTimeout = setTimeout(go,300,cy,e.target);
};

const Jaccard = {
    init: main
};

export default Jaccard;
