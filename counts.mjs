import ForceGraph from 'force-graph';
import { forceCollide, forceX, forceY, forceLink} from 'd3-force';
import Database from './texts.db';
import Counts from './counts.json';
import createSqlWorker from './sqlWorker.mjs';
import Hypher from 'hypher';
import { hyphenation_sa } from './sa.mjs';

const hyphenator = new Hypher(hyphenation_sa);
const hyphenate = el => {
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
const Graph = new ForceGraph(document.getElementById('graph'));

let yForce = forceY(n => n.type === 'scale' ? 50 : 0).strength(0.2);
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
    'tamil','telugu','kannada','malayalam', 
    /*tibeto-burman*/
    'newar','tibetan','burmese'
    ];

const colourmap = new Map(languages.map((e, i) => [e,colours[i]]));

const nodes = Counts;

nodes.push({id: 'scale-0',pos: -0.0008963251, type: 'scale', name: '0'});
nodes.push({id: 'scale-500',pos: 500/3347, type: 'scale', name: '500'});
nodes.push({id: 'scale-1000',pos: 1000/3347, type: 'scale', name: '1000'});
nodes.push({id: 'scale-1500',pos: 1500/3347, type: 'scale', name: '1500'});
nodes.push({id: 'scale-2000',pos: 2000/3347, type: 'scale', name: '2000'});
nodes.push({id: 'scale-2500',pos: 2500/3347, type: 'scale', name: '2500'});
nodes.push({id: 'scale-3000',pos: 3000/3347, type: 'scale', name: '3000'});
nodes.push({id: 'scale-3500',pos: 1.045713, type: 'scale', name: '3500 syllables'});

const getNodeVal = node => node.pos * 10 || 0.001;
const nodeRelSize = 4;

Graph
  // Deactivate existing forces
  .d3Force('center', null)
  .d3Force('charge', null)
    
  // Add collision and x/y forces
  .d3Force('collide', forceCollide(n => Math.sqrt(n.pos*10 || 0.001)*Graph.nodeRelSize()))
  //.d3Force('collide',forceCollide(Graph.nodeRelSize())
  .d3Force('x', forceX(d => (d.pos-0.5) * (window.innerWidth - 100)))
  .d3Force('y', yForce)
  .d3Force('link', forceLink().strength(0))

  // Add nodes
  .graphData({ nodes, links: [{source: 'scale-0', target: 'scale-3500'}] })
  .nodeLabel(node => node.size ? `${node.name} (${node.size} syllables)` : null)
  .nodeVal(getNodeVal)
  .nodeRelSize(nodeRelSize)
  .onNodeClick(n => textPopup(n.name))
  .nodeColor(node => colourmap.get(node.language) || 'grey')
  .nodeCanvasObjectMode(node => node.type === 'scale' ? 'replace' : 'after')
  .nodeCanvasObject((node, ctx, globalScale) => {
          if(node.type !== 'scale') {/*
            const color = colourmap.get(node.language) || 'grey';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x,node.y,Math.sqrt(node.pos * 10 || 0.001) * 4,0,2 * Math.PI, false);
            ctx.fill();*/
            return;
          }
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

          ctx.fillStyle = 'rgba(255,255,255, 0.8)';
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'grey';
          ctx.fillText(label, node.x, node.y);

          node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
        })
        .nodePointerAreaPaint((node, color, ctx) => {
          if(node.type !== 'scale') {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x,node.y,Math.sqrt(getNodeVal(node)) * nodeRelSize,0,2 * Math.PI, false);
            ctx.fill();
          }
          /* make scale unclickable
          else {
              ctx.fillStyle = color;
              const bckgDimensions = node.__bckgDimensions;
              bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
          }
          */
    });
setTimeout(() => Graph.centerAt(50,0).zoom(0.96), 1);

const separate = e => {
  if(e.target.innerHTML === 'separate') {
      yForce.y(d => d.type === 'scale' ? 50 : getSeparateY(d.language)).strength(0.1);
      Graph.d3ReheatSimulation();
      e.target.innerHTML = 'collapse';
  }
  else {
      yForce.y(n => n.type === 'scale' ? 50 : 0).strength(0.2);
      Graph.d3ReheatSimulation();
      e.target.innerHTML = 'separate';
  }

};

const getSeparateY = lang => {
    if(lang === 'sanskrit')
        return 0;
    else if(lang === 'hindi' ||
            lang === 'nepali' ||
            lang === 'gujarati' ||
            lang === 'sinhala' ||
            lang === 'bangla' ||
            lang === 'marathi')
        return -150;
    else if(lang === 'tamil' ||
            lang === 'telugu' ||
            lang === 'kannada' ||
            lang === 'malayalam')
        return 150;
    else return 300;
};

const getData = async id => {
    //const worker = await createSqlWorker('/texts.db');
    const worker = await createSqlWorker(Database);
    return (await worker.db.query(`SELECT id, text, description FROM texts WHERE texts.id = "${id}"`))[0];
};

const state = {};

const textPopup = async id => {
    const blackout = document.getElementById('blackout');
    blackout.style.display = 'flex';
    const popup = document.getElementById('textPopup');
    popup.style.display = 'none'; 
    const data = await getData(id);

    const container = document.getElementById('textbox');
    container.querySelector('.title').textContent = id;
    container.querySelector('.desc').textContent = data.description;
    const textbox = container.querySelector('.text');
    //textbox.textContent = data.text.join('\n\n');
    textbox.innerHTML = data.text/*.join('\n\n')*/;
    textbox.myText = textbox.innerHTML;

    hyphenate(textbox);

    document.getElementById('spinner').style.display = 'none';
    popup.style.display = 'flex';
    popup.scroll(0,0);
};

const unBlackout = e => {
    if(e.target.closest('#textPopup')) return;
    else {
        const blackout = document.getElementById('blackout');
        blackout.style.display = 'none';
        document.getElementById('textPopup').style.display = 'none';
        document.getElementById('spinner').style.display = 'flex';
    }
};

window.addEventListener('load', () => {
document.getElementById('blackout').addEventListener('click',unBlackout);
document.getElementById('separate').addEventListener('click',separate);
});
