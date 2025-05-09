import ForceGraph from 'force-graph';
import { forceCollide, forceX, forceY, forceLink} from 'd3-force';
import Database from './texts.db';
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

const nodes = [{"id":1,"name":"AEd","size":382,"language":"sanskrit","pos":0.11323573349268001},{"id":2,"name":"JEd","size":421,"language":"sanskrit","pos":0.12488795936659695},{"id":3,"name":"KkEd","size":300,"language":"sanskrit","pos":0.08873618165521363},{"id":4,"name":"KEd","size":197,"language":"sanskrit","pos":0.05796235434717657},{"id":5,"name":"MsEd","size":72,"language":"sanskrit","pos":0.020615476546160742},{"id":6,"name":"MEd","size":120,"language":"sanskrit","pos":0.03495667762175082},{"id":7,"name":"P1481","size":195,"language":"sanskrit","pos":0.05736480430236032},{"id":8,"name":"NcEd","size":156,"language":"sanskrit","pos":0.04571257842844338},{"id":9,"name":"PcEd","size":1095,"language":"sanskrit","pos":0.32626232446967435},{"id":10,"name":"KA324-10","size":1032,"language":"sanskrit","pos":0.30743949805796233},{"id":11,"name":"KA322-4b","size":1019,"language":"sanskrit","pos":0.3035554227666567},{"id":12,"name":"KA323-19","size":1019,"language":"sanskrit","pos":0.3035554227666567},{"id":13,"name":"PpEd","size":641,"language":"sanskrit","pos":0.19061846429638482},{"id":14,"name":"PvG","size":127,"language":"sanskrit","pos":0.037048102778607706},{"id":15,"name":"PvI","size":115,"language":"sanskrit","pos":0.03346280250971019},{"id":16,"name":"PvEd","size":128,"language":"sanskrit","pos":0.03734687780101584},{"id":17,"name":"PvEdC","size":138,"language":"sanskrit","pos":0.0403346280250971},{"id":18,"name":"P2824","size":117,"language":"sanskrit","pos":0.03406035255452644},{"id":19,"name":"RLEd","size":122,"language":"sanskrit","pos":0.03555422766656707},{"id":20,"name":"RPEd","size":676,"language":"hindi","pos":0.20107559008066925},{"id":21,"name":"ṬEd","size":636,"language":"sanskrit","pos":0.1891245891843442},{"id":22,"name":"TEd(1892)","size":1967,"language":"sanskrit","pos":0.5867941440095608},{"id":23,"name":"TEd(1892)-note","size":55,"language":"bangla","pos":0.015536301165222588},{"id":24,"name":"UEd","size":208,"language":"sanskrit","pos":0.06124887959366597},{"id":25,"name":"TEd(1886)","size":1991,"language":"sanskrit","pos":0.5939647445473558},{"id":26,"name":"VSEd","size":1707,"language":"sanskrit","pos":0.5091126381834479},{"id":27,"name":"BnF-549","size":165,"language":"sanskrit","pos":0.04840155363011652},{"id":28,"name":"BnF-612m","size":354,"language":"sanskrit","pos":0.10487003286525247},{"id":29,"name":"BnF-612r","size":300,"language":"sanskrit","pos":0.08873618165521363},{"id":30,"name":"BnF-612","size":179,"language":"sanskrit","pos":0.052584403943830293},{"id":31,"name":"BnF-614","size":125,"language":"sanskrit","pos":0.036450552733791455},{"id":32,"name":"BnF-619","size":848,"language":"sanskrit","pos":0.25246489393486704},{"id":33,"name":"BnF-620","size":396,"language":"sanskrit","pos":0.11741858380639379},{"id":34,"name":"BnF-623","size":1551,"language":"sanskrit","pos":0.4625037346877801},{"id":35,"name":"BnF-626","size":1547,"language":"sanskrit","pos":0.4613086345981476},{"id":36,"name":"BnF-1379","size":988,"language":"sanskrit","pos":0.2942933970720048},{"id":37,"name":"BnF-1379m","size":35,"language":"sanskrit","pos":0.009560800717060053},{"id":38,"name":"BnF-622","size":579,"language":"tamil","pos":0.17209441290708097},{"id":39,"name":"D1183","size":62,"language":"sanskrit","pos":0.017627726322079474},{"id":40,"name":"D1205","size":242,"language":"sanskrit","pos":0.07140723035554228},{"id":41,"name":"D3347","size":1247,"language":"sanskrit","pos":0.3716761278757096},{"id":42,"name":"D3351","size":1118,"language":"sanskrit","pos":0.33313414998506125},{"id":43,"name":"D3377","size":145,"language":"sanskrit","pos":0.04242605318195399},{"id":44,"name":"EAP729-1-1-43","size":434,"language":"sanskrit","pos":0.1287720346579026},{"id":45,"name":"Ś242","size":1445,"language":"sanskrit","pos":0.43083358231251867},{"id":46,"name":"Ś427","size":109,"language":"sanskrit","pos":0.031670152375261426},{"id":47,"name":"Ś344","size":104,"language":"sanskrit","pos":0.030176277263220794},{"id":48,"name":"Ś591","size":87,"language":"sanskrit","pos":0.02509710188228264},{"id":49,"name":"ŚA145","size":34,"language":"sanskrit","pos":0.009262025694651926},{"id":50,"name":"Ś161","size":547,"language":"sanskrit","pos":0.1625336121900209},{"id":51,"name":"ŚA381","size":100,"language":"sanskrit","pos":0.028981177173588286},{"id":52,"name":"ŚA482","size":408,"language":"sanskrit","pos":0.12100388407529131},{"id":53,"name":"R483","size":79,"language":"sanskrit","pos":0.02270690170301763},{"id":54,"name":"R824","size":136,"language":"sanskrit","pos":0.039737077980280845},{"id":55,"name":"RE22704","size":2454,"language":"tamil","pos":0.7322975799223185},{"id":56,"name":"P743","size":1099,"language":"sanskrit","pos":0.3274574245593068},{"id":57,"name":"ABEdPc","size":1032,"language":"sanskrit","pos":0.30743949805796233},{"id":58,"name":"ABEdM","size":842,"language":"sanskrit","pos":0.2506722438004183},{"id":59,"name":"ABEdR","size":351,"language":"sanskrit","pos":0.10397370779802809},{"id":60,"name":"ABEdT","size":113,"language":"sanskrit","pos":0.03286525246489393},{"id":61,"name":"ORI3317","size":641,"language":"tamil","pos":0.19061846429638482},{"id":62,"name":"VEd","size":327,"language":"sanskrit","pos":0.09680310726023304},{"id":63,"name":"PEd","size":104,"language":"sanskrit","pos":0.030176277263220794},{"id":64,"name":"LBS322","size":70,"language":"sanskrit","pos":0.02001792650134449},{"id":65,"name":"BhoEd","size":166,"language":"hindi","pos":0.048700328652524646},{"id":66,"name":"DhaEd","size":188,"language":"hindi","pos":0.05527337914550343},{"id":67,"name":"A122-218","size":47,"language":"sanskrit","pos":0.013146100985957573},{"id":68,"name":"A122-223","size":36,"language":"sanskrit","pos":0.00985957573946818},{"id":69,"name":"A125-266","size":178,"language":"sanskrit","pos":0.05228562892142217},{"id":70,"name":"A126-307","size":381,"language":"sanskrit","pos":0.11293695847027188},{"id":71,"name":"A131-466","size":403,"language":"sanskrit","pos":0.11951000896325067},{"id":72,"name":"KA324-1","size":455,"language":"sanskrit","pos":0.13504631012847326},{"id":73,"name":"KA320-13","size":458,"language":"sanskrit","pos":0.13594263519569763},{"id":74,"name":"KA324-9","size":459,"language":"sanskrit","pos":0.13624141021810576},{"id":75,"name":"KA322-5","size":447,"language":"sanskrit","pos":0.13265610994920823},{"id":76,"name":"KB266-6","size":525,"language":"sanskrit","pos":0.15596056169704212},{"id":77,"name":"KB267-2","size":458,"language":"sanskrit","pos":0.13594263519569763},{"id":78,"name":"KA322-4a","size":679,"language":"sanskrit","pos":0.20197191514789364},{"id":79,"name":"RE33660","size":439,"language":"sanskrit","pos":0.13026590976994323},{"id":80,"name":"RE32661","size":105,"language":"sanskrit","pos":0.030475052285628922},{"id":81,"name":"CAdd1698","size":22,"language":"newar","pos":0.005676725425754407},{"id":82,"name":"CAdd1650","size":15,"language":"sanskrit","pos":0.00358530026889752},{"id":83,"name":"KE6-7","size":77,"language":"newar","pos":0.022109351658201375},{"id":84,"name":"KNNA2b","size":95,"language":"newar","pos":0.027487302061547654},{"id":85,"name":"KB267-9","size":95,"language":"newar","pos":0.027487302061547654},{"id":86,"name":"KA17-12(1)","size":96,"language":"newar","pos":0.027786077083955783},{"id":87,"name":"KA17-12(2)","size":97,"language":"newar","pos":0.028084852106363908},{"id":88,"name":"KA321-15","size":95,"language":"newar","pos":0.027487302061547654},{"id":89,"name":"KNNA6","size":49,"language":"newar","pos":0.013743651030773827},{"id":90,"name":"KNNA7","size":107,"language":"newar","pos":0.031072602330445176},{"id":91,"name":"GBP(Te)Ed","size":530,"language":"telugu","pos":0.15745443680908275},{"id":92,"name":"GBP(Ta)Ed","size":531,"language":"tamil","pos":0.15775321183149088},{"id":93,"name":"Ṭ-GBP(Ta)Ed","size":639,"language":"sanskrit","pos":0.19002091425156856},{"id":94,"name":"GKH1","size":31,"language":"sanskrit","pos":0.008365700627427548},{"id":95,"name":"GKH2","size":1268,"language":"sanskrit","pos":0.3779504033462803},{"id":96,"name":"RDEd","size":147,"language":"hindi","pos":0.04302360322677024},{"id":97,"name":"MPEd","size":214,"language":"hindi","pos":0.06304152972811473},{"id":98,"name":"BKEd","size":164,"language":"nepali","pos":0.048102778607708396},{"id":99,"name":"KK933","size":1611,"language":"sanskrit","pos":0.4804302360322677},{"id":100,"name":"BPEd","size":229,"language":"malayalam","pos":0.06752315506423663},{"id":101,"name":"PKEd1849","size":1218,"language":"tamil","pos":0.3630116522258739},{"id":102,"name":"PKEd1924","size":1203,"language":"tamil","pos":0.358530026889752},{"id":103,"name":"Ad69312","size":123,"language":"tamil","pos":0.0358530026889752},{"id":104,"name":"Ad70820","size":115,"language":"tamil","pos":0.03346280250971019},{"id":105,"name":"Ad71010","size":123,"language":"tamil","pos":0.0358530026889752},{"id":106,"name":"Ad72614","size":102,"language":"tamil","pos":0.02957872721840454},{"id":107,"name":"RE37121","size":106,"language":"tamil","pos":0.030773827308037047},{"id":108,"name":"EO1272","size":119,"language":"tamil","pos":0.0346579025993427},{"id":109,"name":"RE45807","size":165,"language":"tamil","pos":0.04840155363011652},{"id":110,"name":"EAP248-1-81","size":282,"language":"marathi","pos":0.08335823125186734},{"id":111,"name":"EAP584-5-300","size":119,"language":"sanskrit","pos":0.0346579025993427},{"id":112,"name":"EAP584-1-88","size":140,"language":"sanskrit","pos":0.04093217806991335},{"id":113,"name":"RAS-W155","size":203,"language":"sanskrit","pos":0.05975500448162534},{"id":114,"name":"EAP584-2-29","size":425,"language":"sanskrit","pos":0.12608305945622947},{"id":115,"name":"EAP886-1-21","size":1064,"language":"sanskrit","pos":0.3170002987750224},{"id":116,"name":"RSEd","size":89,"language":"kannada","pos":0.025694651927098893},{"id":117,"name":"JM278","size":129,"language":"kannada","pos":0.03764565282342396},{"id":118,"name":"LREd","size":230,"language":"kannada","pos":0.06782193008664476},{"id":119,"name":"IO-1758","size":145,"language":"kannada","pos":0.04242605318195399},{"id":120,"name":"RE33635","size":144,"language":"kannada","pos":0.04212727815954586},{"id":121,"name":"DEd","size":131,"language":"hindi","pos":0.03824320286824021},{"id":122,"name":"SSEd","size":293,"language":"hindi","pos":0.08664475649835673},{"id":123,"name":"WL-a1240","size":117,"language":"sanskrit","pos":0.03406035255452644},{"id":124,"name":"WL-a1293","size":125,"language":"sanskrit","pos":0.036450552733791455},{"id":125,"name":"WL-b1440","size":159,"language":"sanskrit","pos":0.046608903495667764},{"id":126,"name":"WL-b1442","size":160,"language":"sanskrit","pos":0.04690767851807589},{"id":127,"name":"IO-958","size":832,"language":"sanskrit","pos":0.247684493576337},{"id":128,"name":"Ox-d.192(1)","size":32,"language":"sanskrit","pos":0.008664475649835674},{"id":129,"name":"Ox-d.192(2)","size":309,"language":"sanskrit","pos":0.09142515685688676},{"id":130,"name":"Ox-d.197(2)","size":193,"language":"sanskrit","pos":0.05676725425754407},{"id":131,"name":"Ox-d.196(1)","size":197,"language":"sanskrit","pos":0.05796235434717657},{"id":132,"name":"Ox-d.196(2)","size":524,"language":"sanskrit","pos":0.155661786674634},{"id":133,"name":"Ox-c.31","size":201,"language":"sanskrit","pos":0.05915745443680908},{"id":134,"name":"Ox-c.32","size":189,"language":"sanskrit","pos":0.055572154167911565},{"id":135,"name":"Ox-c.161","size":190,"language":"sanskrit","pos":0.05587092919031969},{"id":136,"name":"Ox-d.119","size":214,"language":"sanskrit","pos":0.06304152972811473},{"id":137,"name":"Ox-d.200","size":5,"language":"sanskrit","pos":0.0005975500448162533},{"id":138,"name":"Ox-d.1122","size":89,"language":"sanskrit","pos":0.025694651927098893},{"id":139,"name":"RAS-T144","size":1876,"language":"sanskrit","pos":0.5596056169704213},{"id":140,"name":"RAS-T92","size":1509,"language":"sanskrit","pos":0.4499551837466388},{"id":141,"name":"RBEd","size":51,"language":"hindi","pos":0.01434120107559008},{"id":142,"name":"CSSEd","size":15,"language":"sanskrit","pos":0.00358530026889752},{"id":143,"name":"KGEd","size":137,"language":"nepali","pos":0.04003585300268898},{"id":144,"name":"KGEd1969","size":141,"language":"nepali","pos":0.041230953092321485},{"id":145,"name":"AVEd","size":186,"language":"sanskrit","pos":0.05467582910068718},{"id":146,"name":"RWTEd","size":307,"language":"telugu","pos":0.09082760681207051},{"id":147,"name":"ĀṬEd","size":189,"language":"telugu","pos":0.055572154167911565},{"id":148,"name":"BJVEd","size":61,"language":"telugu","pos":0.01732895129967135},{"id":149,"name":"VBEd","size":291,"language":"telugu","pos":0.08604720645354048},{"id":150,"name":"ŚNEd","size":274,"language":"tamil","pos":0.08096803107260234},{"id":151,"name":"PMEd","size":1785,"language":"malayalam","pos":0.5324170899312818},{"id":152,"name":"AAEd","size":197,"language":"burmese","pos":0.05796235434717657},{"id":153,"name":"WEd","size":1325,"language":"sinhala","pos":0.3949805796235435},{"id":154,"name":"GEd","size":945,"language":"sinhala","pos":0.2814460711084553},{"id":155,"name":"Tü-3085","size":394,"language":"sinhala","pos":0.11682103376157753},{"id":156,"name":"IO-458","size":3350,"language":"sanskrit","pos":1},{"id":157,"name":"Kk-ST","size":1179,"language":"tibetan","pos":0.351359426351957},{"id":158,"name":"Kk-D","size":1096,"language":"tibetan","pos":0.32656109949208245},{"id":159,"name":"Kk-N","size":572,"language":"tibetan","pos":0.17000298775022407},{"id":160,"name":"SBB-13208","size":494,"language":"tamil","pos":0.1466985360023902},{"id":161,"name":"SBB-3421","size":286,"language":"kannada","pos":0.08455333134149985},{"id":162,"name":"SBB-11412","size":196,"language":"sanskrit","pos":0.05766357932476845},{"id":163,"name":"SBB-11178","size":3,"language":"sanskrit","pos":0},{"id":164,"name":"SBB-11130","size":6,"language":"sanskrit","pos":0.00089632506722438},{"id":165,"name":"SBB-12032","size":13,"language":"sanskrit","pos":0.002987750224081267},{"id":166,"name":"SBB-Chambers804","size":15,"language":"sanskrit","pos":0.00358530026889752},{"id":167,"name":"SBB-11554","size":1314,"language":"sanskrit","pos":0.39169405437705407},{"id":168,"name":"SBB-12192","size":265,"language":"sanskrit","pos":0.07827905587092919},{"id":169,"name":"SBB-12578","size":308,"language":"sanskrit","pos":0.09112638183447863},{"id":170,"name":"KA1031-12","size":5,"language":"sanskrit","pos":0.0005975500448162533},{"id":171,"name":"KB1-2","size":22,"language":"sanskrit","pos":0.005676725425754407},{"id":172,"name":"KA324-2","size":14,"language":"sanskrit","pos":0.0032865252464893933},{"id":173,"name":"KB268-5","size":68,"language":"sanskrit","pos":0.019420376456528235},{"id":174,"name":"McG-6","size":15,"language":"sanskrit","pos":0.00358530026889752},{"id":175,"name":"NKP1878","size":15,"language":"sanskrit","pos":0.00358530026889752},{"id":176,"name":"ACEd","size":82,"language":"bangla","pos":0.023603226770242007},{"id":177,"name":"SEd","size":525,"language":"hindi","pos":0.15596056169704212},{"id":178,"name":"VaiEd","size":70,"language":"hindi","pos":0.02001792650134449},{"id":179,"name":"STVEd","size":482,"language":"telugu","pos":0.1431132357334927},{"id":180,"name":"KKŚEd","size":97,"language":"gujarati","pos":0.028084852106363908},{"id":181,"name":"DhKKhEd","size":59,"language":"gujarati","pos":0.016731401254855095},{"id":182,"name":"VREd","size":105,"language":"hindi","pos":0.030475052285628922},{"id":183,"name":"Z-V45A","size":85,"language":"sanskrit","pos":0.02449955183746639},{"id":184,"name":"KA321-14","size":247,"language":"sanskrit","pos":0.07290110546758291},{"id":185,"name":"KA321-14b","size":82,"language":"sanskrit","pos":0.023603226770242007},{"id":186,"name":"KC121-1","size":420,"language":"sanskrit","pos":0.12458918434418882},{"id":187,"name":"RUEd","size":97,"language":"nepali","pos":0.028084852106363908},{"id":188,"name":"JVBEd","size":349,"language":"kannada","pos":0.10337615775321184},{"id":189,"name":"Kgl-Paṇḍit555","size":203,"language":"sanskrit","pos":0.05975500448162534},{"id":190,"name":"Kgl-Paṇḍit37","size":204,"language":"sanskrit","pos":0.06005377950403346},{"id":191,"name":"Kgl-Paṇḍit38","size":1082,"language":"sanskrit","pos":0.3223782491783687},{"id":192,"name":"Kgl-Nepal124","size":96,"language":"newar","pos":0.027786077083955783},{"id":193,"name":"GOML-R4390","size":138,"language":"sanskrit","pos":0.0403346280250971},{"id":194,"name":"GOML-R3645","size":1001,"language":"sanskrit","pos":0.29817747236331044},{"id":195,"name":"IO-713","size":874,"language":"sanskrit","pos":0.26023304451747836},{"id":196,"name":"GOML-D1649","size":120,"language":"telugu","pos":0.03495667762175082},{"id":197,"name":"IO-377","size":441,"language":"sanskrit","pos":0.1308634598147595},{"id":198,"name":"IO-9","size":3344,"language":"sanskrit","pos":0.9982073498655513},{"id":199,"name":"IO-489","size":496,"language":"sanskrit","pos":0.14729608604720645},{"id":200,"name":"IO-569","size":518,"language":"sanskrit","pos":0.15386913654018525},{"id":201,"name":"IO-1115","size":367,"language":"sanskrit","pos":0.10875410815655812},{"id":202,"name":"IO-1161","size":932,"language":"sanskrit","pos":0.2775619958171497},{"id":203,"name":"IO-1589","size":2428,"language":"sanskrit","pos":0.7245294293397072},{"id":204,"name":"IO-1324","size":3218,"language":"sanskrit","pos":0.9605616970421272},{"id":205,"name":"IO-832","size":998,"language":"sanskrit","pos":0.29728114729608607},{"id":206,"name":"KB266-15","size":417,"language":"sanskrit","pos":0.12369285927696444},{"id":207,"name":"KB267-3","size":168,"language":"sanskrit","pos":0.049297878697340904},{"id":208,"name":"KU-MN3305","size":124,"language":"sanskrit","pos":0.03615177771138333},{"id":209,"name":"ChPŚEd","size":72,"language":"sanskrit","pos":0.020615476546160742},{"id":210,"name":"BRNRI-B18","size":100,"language":"sanskrit","pos":0.028981177173588286},{"id":211,"name":"RE339933","size":128,"language":"tamil","pos":0.03734687780101584},{"id":212,"name":"LD85857","size":192,"language":"sanskrit","pos":0.05646847923513594},{"id":213,"name":"LD82952","size":59,"language":"sanskrit","pos":0.016731401254855095},{"id":214,"name":"LD81415","size":22,"language":"sanskrit","pos":0.005676725425754407},{"id":215,"name":"LD80856","size":214,"language":"sanskrit","pos":0.06304152972811473},{"id":216,"name":"LD80856m","size":164,"language":"sanskrit","pos":0.048102778607708396},{"id":217,"name":"LD61513","size":16,"language":"gujarati","pos":0.003884075291305647},{"id":218,"name":"LD45475","size":3,"language":"sanskrit","pos":0},{"id":219,"name":"LD26243","size":150,"language":"sanskrit","pos":0.043919928293994624},{"id":220,"name":"LD19271","size":130,"language":"sanskrit","pos":0.03794442784583209},{"id":221,"name":"LD18362","size":592,"language":"sanskrit","pos":0.1759784881983866},{"id":222,"name":"LD17952","size":222,"language":"sanskrit","pos":0.06543172990737975},{"id":223,"name":"LD17953","size":74,"language":"sanskrit","pos":0.021213026590976996},{"id":224,"name":"LD12235","size":115,"language":"sanskrit","pos":0.03346280250971019},{"id":225,"name":"LD6277","size":10,"language":"sanskrit","pos":0.002091425156856887},{"id":226,"name":"LD841","size":209,"language":"sanskrit","pos":0.061547654616074095},{"id":227,"name":"LD18333","size":41,"language":"sanskrit","pos":0.011353450851508814},{"id":228,"name":"LD26824","size":1837,"language":"sanskrit","pos":0.5479533910965043},{"id":229,"name":"LD82088","size":1787,"language":"sanskrit","pos":0.533014639976098},{"id":230,"name":"UT-MF13-3-2","size":23,"language":"sanskrit","pos":0.005975500448162534},{"id":231,"name":"NM-57.106/699","size":304,"language":"sanskrit","pos":0.08993128174484613},{"id":232,"name":"EAP921/6/3/189","size":390,"language":"sanskrit","pos":0.11562593367194503},{"id":233,"name":"EAP1031/1/52","size":3320,"language":"sanskrit","pos":0.9910367493277562},{"id":234,"name":"RamEd","size":265,"language":"hindi","pos":0.07827905587092919},{"id":235,"name":"EAP921/6/3/24","size":77,"language":"sanskrit","pos":0.022109351658201375},{"id":236,"name":"EAP921/6/3/10","size":493,"language":"sanskrit","pos":0.14639976097998209},{"id":237,"name":"EAP921/6/3/140","size":904,"language":"sanskrit","pos":0.26919629518972216},{"id":238,"name":"EAP1031/1/228","size":332,"language":"sanskrit","pos":0.09829698237227368},{"id":239,"name":"EAP1031/1/211","size":94,"language":"sanskrit","pos":0.02718852703913953},{"id":240,"name":"EAP1031/1/166","size":1732,"language":"sanskrit","pos":0.516582013743651},{"id":241,"name":"EAP1304/1/260","size":456,"language":"sanskrit","pos":0.1353450851508814},{"id":242,"name":"GOML-D3097","size":219,"language":"telugu","pos":0.06453540484015537}];
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
