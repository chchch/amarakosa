import cytoscape from 'cytoscape';
//import cola from 'cytoscape-cola';
import Data from './data.json';
import Texts from './texts.json';
import Grams from './grams.json';
import Hypher from 'hypher';
import { hyphenation_sa } from './sa.mjs';
//cytoscape.use(cola);

const state = {
    texts: new Map(Texts),
    highlit: [],
    searchTimeout: null
};

const hyphenator = new Hypher(hyphenation_sa);

const main = async function() {
    //const res = await fetch('./data.json');
    //const Data = await res.json();
    const cy = cytoscape( {
        container: document.getElementById('cytoscape'),
        elements: Data,
        wheelSensitivity: 0.2,
        layout: {
            name: 'null',
        },
        style: [{
            selector: 'node',
            style: {
                'background-color': '#666',
                'label': 'data(id)',
                'width': 10,
                'height': 10,
                'font-family': 'Brill'
            }
        },
        {
            selector: 'node.hindi',
            style: { 'background-color': '#a6cee3' }
        },
        {
            selector: 'node.kannada',
            style: { 'background-color': '#1f78b4' }
        },
        {
            selector: 'node.nepali',
            style: { 'background-color': '#b2df8a' }
        },
        {
            selector: 'node.newari',
            style: { 'background-color': '#33a02c' }
        },
        {
            selector: 'node.malayalam',
            style: { 'background-color': '#fb9a99' }
        },
        {
            selector: 'node.marathi',
            style: { 'background-color': '#e31a1c' }
        },
        {
            selector: 'node.tamil',
            style: { 'background-color': '#ff7f00' }
        },
        {
            selector: 'node.telugu',
            style: { 'background-color': '#cab2d6' }
        },
        {selector: 'edge',
        style: {
            //width: 1,
            width: el => el.data('dice') < 0.2 ? 2 : 1,
            //width: el => 1 + 1/el.data('dice'),
            'line-color': '#ccc',
            //'line-opacity': el => { const scaled = (1-el.data('dice'))*2; return scaled > 1 ? 1 : scaled; },
            'line-opacity': el => 1-el.data('dice'),
            'z-index': 1
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
        }]
    });
    const tree = cy.elements().kruskal(edge => edge.data('dice'));
    tree.addClass('mst');
    const others = cy.$('edge').difference(tree);
    others.remove();
    const layout = cy.layout({
        name: 'cose',
        nodeDimensionsIncludeLabels: true,
        numIter: 4000,
        idealEdgeLength: edge => 50 / edge.data('dice'),
        //edgeElasticity: edge => edge.data('dice') * 80
        });
    layout.run();
    cy.once('layoutstop',() => {
        /*cy.layout({
        name: 'cose',
        nodeDimensionsIncludeLabels: true,
        numIter: 4000,
        idealEdgeLength: edge => 50 / edge.data('dice'),
        //edgeElasticity: edge => edge.data('dice') * 80
        }).run();*/
        others.restore();
    });
    cy.on('tap',mouseUp.bind(null,cy));
    cy.on('mouseover',mouseOver.bind(null,cy));
    
    blackout.addEventListener('click',unBlackout);
    document.getElementById('gramselector').addEventListener('click',switchGrams);
    document.getElementById('searchbox').addEventListener('change',searchSigla.bind(null,cy));
    document.getElementById('searchbox').addEventListener('keyup',searchSigla.bind(null,cy));
};

const mouseUp = (cy,e) => {
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
            textPopup(state.highlit[0].id(),e.target.id());
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
    }
    else if(e.target.isEdge && e.target.isEdge()) {
        cy.$('.highlight, .lowlight').removeClass(['highlight','lowlight']);
        e.target.addClass('highlight');
        const nodes = e.target.connectedNodes();
        nodes.addClass('highlight');
        textPopup(nodes[0].id(),nodes[1].id());
        state.highlit = [nodes[0],nodes[1]];
    }
    else {
        cy.$('.highlight, .lowlight').removeClass(['highlight','lowlight']);
        state.highlit = [];
    }
};
const difflight = (edges) => {
    /*
    const sorted = edges.sort((a, b) => a.data('dice') - b.data('dice'));
    sorted.forEach((edge, i) => {
        if(i < 6) edge.addClass('highlight');
        else edge.addClass('lowlight');
    });
    */
    const numsort = (a,b) => a - b;
    const sorted = edges.map(e => e.data('dice')).sort(numsort);
    const first = quantileSorted(sorted,0.25);
    const third = quantileSorted(sorted,0.75);
    const iqr = third - first;
    edges.forEach((edge) => {
        if(edge.data('dice') <= first - (1.5 * iqr)) edge.addClass('highlight');
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

const textPopup = (id1, id2) => {
    const obj1 = state.texts.get(id1);
    const obj2 = state.texts.get(id2);
    const texts = [
    {n: 1, id: id1, desc: obj1.desc, text: obj1.text},
    {n: 2, id: id2, desc: obj2.desc, text: obj2.text},
    ];
    const blackout = document.getElementById('blackout');
    const popup = document.getElementById('textPopup');
    
    const ret = texts.map(el => {
        const container = document.getElementById(`textbox${el.n}`);
        container.querySelector('.title').textContent = el.id;
        container.querySelector('.desc').textContent = el.desc;
        const textbox = container.querySelector('.text');
        textbox.textContent = el.text.join('\n\n');
        textbox.myText = textbox.textContent;
        return {id: el.id, textbox: textbox};
    });
    
    document.querySelector('.selected')?.classList.remove('selected');
    document.querySelector('#gramselector span').classList.add('selected');
    highlightTexts(ret[0].id, ret[0].textbox, ret[1].id, ret[1].textbox,'2grams');
    blackout.style.display = 'flex';
};

const unBlackout = (e) => {
    if(e.target.closest('#textPopup')) return;
    else document.getElementById('blackout').style.display = 'none';
};

const highlightTexts = (id1, el1, id2, el2, grams) => {
    const grams1 = Grams[grams][id1];
    const grams2 = Grams[grams][id2];
    const found = {
        text1: [],
        text2: []
    };
    for(let n=0;n<grams1.length;n++) {
        if(grams1[n] !== '' && grams2[n] !== '') {
            found.text1 = found.text1.concat(cleanString(grams1[n]));
            found.text2 = found.text2.concat(cleanString(grams2[n]));
        }
    }
    highlightText(found.text1,el1);
    highlightText(found.text2,el2);
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
        const range = document.createRange();
        range.setStart(el.childNodes[0],span[0]);
        const end = el.childNodes[0].length > span[1] ? span[1] : el.childNodes[0].length;
        range.setEnd(el.childNodes[0],end);
        const highlightNode = document.createElement('span');
        highlightNode.className = 'highlit';
        highlightNode.appendChild(range.extractContents());
        range.insertNode(highlightNode);
    }

    hyphenate(el);
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
    
    const ret = [1,2].map(n => {
        const textbox = document.getElementById(`textbox${n}`);
        const id = textbox.querySelector('.title').textContent; 
        const text = textbox.querySelector('.text');
        text.innerHTML = text.myText;
        return {id: id, text: text};
    });
    
    highlightTexts(ret[0].id, ret[0].text, ret[1].id, ret[1].text,n);
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
