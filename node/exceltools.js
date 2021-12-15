const xlsx = require('xlsx');
const fs = require ('fs');
const path = require ('path');
const masterdatattools = require('./masterdatatools');

//скорочені назви функцій
const logmsg = masterdatattools.logmsg;
const writetolog = masterdatattools.writetolog;
const syncobs = masterdatattools.syncobs;

//тільки для тестування, закоментувати при використанні 
test();

function test () {
  test_getmasterdata_fromxls();

} 

function test_getmasterdata_fromxls () {
  let pathfiles = './exampledata/';
  let filexls = pathfiles + 'masterdata.xlsx';
  let masterdata = {};
  getmasterdata_fromxls (masterdata, filexls)
}

//отримання даних та первинна обробка з Masterdata
function getmasterdata_fromxls (masterdata, filexls) {
  const wb = xlsx.readFile(filexls);
  const wss = wb.Sheets;
  const wstags = wss['tags'];
  const wsacttps = wss ['acttps'];
  const wsCLSID = wss ['CLSID'];

  const acttrtypes = masterdata.acttrtypes = {};
  const CLSIDs = xlsx.utils.sheet_to_json(wsCLSID);
  
  //отримання властивостей acttrs
  for (row of xlsx.utils.sheet_to_json(wsacttps)) {
    let acttrtype = acttrtypes[row.ACTTYPE] = {CLSID:`16#${row.CLSID}`, fnname:row.FN,  typename: row.ACTTYPE, altertypename: row.ALTERNAME, typedescr: row.ACTTYPEDESCR, io:{}};
    for (colname in row) {
      let str = colname.substr(0,2);
      if (str ==='IN') {
        if (colname[colname.length-1] === 'A') {
          acttrtype.io[row[colname]]={type: 'AIVAR_CFG'}
        } else {
          acttrtype.io[row[colname]]={type: 'DIVAR_CFG'}          
        }
      }  
      if (str ==='OU') {
        if (colname[colname.length-1] === 'A') {
          acttrtype.io[row[colname]]={type: 'AOVAR_CFG'}
        } else {
          acttrtype.io[row[colname]]={type: 'DOVAR_CFG'}          
        }
      }      
    }  
  }

  const tags = masterdata.tags = xlsx.utils.sheet_to_json(wstags);
  if (!masterdata.tagstwin) masterdata.tagstwin = {};
  const tagstwin = masterdata.tagstwin; //зберігає усю інформацію про теги які були
  const moduls = masterdata.moduls = {}; //карта модулів,
  
  if (!masterdata.idinfo) masterdata.idinfo = {vars:[null], acttrs:[null]};
  
  let dicnt = 0, docnt=0, aicnt=0, aocnt=0, modulscnt=0;  
  
  //вичистка неіснуючих tagtwin
  for (let tagname in  tagstwin) {
    if (!tags[tagname]) delete tagstwin[tagname]
  }
  
  //формування списку CLSID для каналів
  masterdata.class = {};
  for (let row of  CLSIDs) {
    if (!masterdata.class [row.TYPE]) masterdata.class [row.TYPE] = {};
    masterdata.class [row.TYPE][row.SUBTYPE] = {CLSID : row.CLSID, DESCR: row.DESCR};
  }
  //console.log (masterdata.class);

  //формування загальної бази каналів
  masterdata.chs = {DI:[], DO:[], AI:[], AO:[], NDI:[], NDO:[], NAI:[], NAO:[]};

  //формування карти модулів moduls [MODID - ідентифікатор модуля]
  //розподіл тегів по каналам модулів
  for (tag of tags) {
    if (!checktagname (tag.TAGNAME)) {
      console.error ('Перевірка тегів не пройдена');
      process.exit(1);
    }
    if (!checktagname (tag.ACTTR)) {
      console.error ('Перевірка ВМ не пройдена');
      process.exit(1);
    }
    masterdata.idinfo.vars[tag.ID] = tag.TAGNAME; 
    if (!tagstwin [tag.TAGNAME]) {
      tagstwin [tag.TAGNAME] =  {taginfo: tag}; 
    } else {
      tagstwin[tag.TAGNAME].taginfo = tag;
    }
    tagstwin[tag.TAGNAME].lastupdateinfo = Date();  
    if (!moduls[tag.MODID]) {
      moduls[tag.MODID] = {chai : [], chdi: [], chdo : [], chao:[]};
    };
    let module = moduls[tag.MODID];
    
    if (!tag.SUBTYPE || tag.SUBTYPE.length < 2) {
     tag.SUBTYPE = 'deflt';
    }
    let chclass =  masterdata.class[tag.TYPE][tag.SUBTYPE];   
    masterdata.chs[tag.TYPE][tag.CHID] = {
      CLSID: chclass.CLSID, 
      DESCR: chclass.DESCR,
      VARNAME: tag.TAGNAME};
    
    let clsidfromtype = {DI:0x1010, AI:0x1030, DO:0x1020,AO:0x1040, } 
    if (!tag.CLSID || tag.CLSID == 0) {
      tag.CLSID = clsidfromtype[tag.TYPE];  
    }  
    switch (tag.TYPE) {
      case 'DI': 
        module.chdi.push(tag);
        dicnt++;
        break;
      case 'AI':
        module.chai.push(tag);
        aicnt++;       
        break;
      case 'DO':
        module.chdo.push(tag);
        docnt++;       
        break;
      case 'AO': 
        module.chao.push(tag);
        aocnt++;    
        break;
      default:
        break;
    }

  }
  //упорядкування елементів по зростанню CHID в кожному типі
  for (modulename in moduls){
    modulscnt++;
    let module = moduls[modulename];
    module.chdi.sort (function(a, b) {
      return a.CHID - b.CHID;
    })
    module.chai.sort (function(a, b) {
      return a.CHID - b.CHID;
    })
    module.chdo.sort (function(a, b) {
      return a.CHID - b.CHID;
    })
    module.chao.sort (function(a, b) {
      return a.CHID - b.CHID;
    })
    //console.log (modulscnt + ' ' + modulename);
  }
  masterdata.iostatistic = {dicnt, aicnt, docnt, aocnt, modulscnt};
  //getactrtinfo (masterdata);
}

//запис в файл
function savemasterdatatofile (masterdata) {
  const filename = masterdata.pathes.masterpath + path.basename (masterdata.pathes.filexls,'.xlsx') + '.json'; 
  //console.log ( filename);
  if (!fs.existsSync(path.dirname(filename))) {
    fs.mkdirSync(path.dirname(filename))
  }
  fs.writeFileSync(filename, JSON.stringify (masterdata) , 'utf8');
}

//читання з файлу 
function readmasterfromjson (masterpath) {
  const filename = masterpath + 'masterdata.json'; 
  let content = fs.readFileSync (filename, 'utf8');
  return (JSON.parse (content));
}

//перетворення даних IOMAP в форму PACFramework
function iomaptoplcform (masterdata) {
  const submodtypes = {'0':'-','1':'DI','2':'DO','3':'AI','4':'AO' };//1- DICH, 2- DOCH, 3- AICH, 4 – AOCH
  const moduls = masterdata.moduls;
  const iomap = masterdata.iomapplc = {genform:{}, plcform : []};
  for (modulename in moduls){
    let module = moduls[modulename];
    let modulegenform = iomap.genform [modulename] = {};
    modulegenform.submdicnt = Math.ceil(module.chdi.length/16);
    modulegenform.submdocnt = Math.ceil(module.chdo.length/16);
    modulegenform.submaicnt = Math.ceil(module.chai.length/16);
    modulegenform.submaocnt = Math.ceil(module.chao.length/16);
    modulegenform.submodules = [
      {type:'0', chidstart:0, adrstart:0,chcnt:0},
      {type:'0', chidstart:0, adrstart:0,chcnt:0},
      {type:'0', chidstart:0, adrstart:0,chcnt:0},
      {type:'0', chidstart:0, adrstart:0,chcnt:0}
    ];
    let nmbsubmodule = 0;
    for (let i=0; i<modulegenform.submdicnt; i++) {
      modulegenform.submodules [nmbsubmodule] = {type:'1', chidstart :  module.chdi[i*16].CHID, adrstart: module.chdi[i*16].SRCADR, chcnt: i+1<module.submdicnt ? 16 : (module.chdi.length === 16) ? 16: (module.chdi.length % 16)};
      nmbsubmodule ++; 
    } 
    for (let i=0; i<modulegenform.submdocnt; i++) {
      modulegenform.submodules [nmbsubmodule] = {type:'2', chidstart :  module.chdo[i*16].CHID, adrstart: module.chdo[i*16].SRCADR, chcnt: i+1<module.submdocnt ? 16 : (module.chdo.length === 16) ? 16: (module.chdo.length % 16)};
      nmbsubmodule ++; 
    } 
    for (let i=0; i<modulegenform.submaicnt; i++) {
      modulegenform.submodules [nmbsubmodule] = {type:'3', chidstart :  module.chai[i*16].CHID, adrstart: module.chai[i*16].SRCADR, chcnt: i+1<module.submaicnt ? 16 : (module.chai.length === 16) ? 16: (module.chai.length % 16)};
      nmbsubmodule ++; 
    } 
    for (let i=0; i<modulegenform.submaocnt; i++) {
      modulegenform.submodules [nmbsubmodule] = {type:'4', chidstart :  module.chao[i*16].CHID, adrstart: module.chao[i*16].SRCADR, chcnt: i+1<module.submaocnt ? 16 : (module.chao.length === 16) ? 16: (module.chao.length % 16)};
      nmbsubmodule ++; 
    }
    //MODTYPE вказує в DB тип підмодулів в одному модулі, наприклад 1324; //1- DICH, 2- DOCH, 3- AICH, 4 – AOCH, 5 - COM
    //MODTYPE 1000 - це один підмодуль до 16 каналів 1- DICH
    //CHCNTS - d191 вказує на кількість каналів на кожен Submodule, комбінація в 16-ковому форматі - 1 (16#XYZQ) X - для першого субмодуля 
    //CHCNTS - F000 вказує на 16 каналів у першому підмодулі
    let modulemap = {
      MODID : modulename,
      MODTYPE:  modulegenform.submodules[0].type + modulegenform.submodules[1].type + modulegenform.submodules[2].type + modulegenform.submodules[3].type,
      MODTYPESTR: '',
      CHCNTS:`${(modulegenform.submodules[0].chcnt-1).toString(16)}${(modulegenform.submodules[1].chcnt-1).toString(16)}${(modulegenform.submodules[2].chcnt-1).toString(16)}${(modulegenform.submodules[3].chcnt-1).toString(16)}`,
      CHCNTSD: `${modulegenform.submodules[0].chcnt}-${modulegenform.submodules[1].chcnt}-${modulegenform.submodules[2].chcnt}-${modulegenform.submodules[3].chcnt}`,
      STRTNMB0: `${modulegenform.submodules[0].chidstart}`,
      STRTNMB1: `${modulegenform.submodules[1].chidstart}`,
      STRTNMB2: `${modulegenform.submodules[2].chidstart}`,
      STRTNMB3: `${modulegenform.submodules[3].chidstart}`,
      STATISTIC: ''  
    };
    for (let i=0; i<4; i++) {
      if (modulegenform.submodules[i].type>0) { 
      modulemap.MODTYPESTR += `${submodtypes[modulegenform.submodules[i].type]}(${modulegenform.submodules[i].chidstart}..${modulegenform.submodules[i].chidstart+modulegenform.submodules[i].chcnt-1}) `
      }
    }  
    modulemap.CHCNTS = modulemap.CHCNTS.replace(/-1/g,'0');  
    modulemap.MODTYPESTR = modulemap.MODTYPESTR.replace(/-1/g,'0');
    iomap.plcform.push (modulemap);   
  }
} 

function iomaptoexcel (masterdata) {
  const masterpath = masterdata.pathes.masterpath;
  const iomap = masterdata.iomapplc;
  iomap.plcform[0].STATISTIC = `Modules Count = ${masterdata.iostatistic.modulscnt}`;
  iomap.plcform[1].STATISTIC = `DICNT=${masterdata.iostatistic.dicnt}; DOCNT=${masterdata.iostatistic.docnt};AICNT=${masterdata.iostatistic.aicnt};AOCNT=${masterdata.iostatistic.aocnt}`;
  let newwb = xlsx.utils.book_new();
  let wsiomap = xlsx.utils.json_to_sheet (iomap.plcform);
  xlsx.utils.book_append_sheet(newwb, wsiomap, 'IOmap');
  xlsx.writeFile(newwb, masterpath + 'io.xlsx');
}


//отримує обєкт-список виконавчих механізмів 
function getactrtinfo (masterdata) {
  tags = masterdata.tags;
  const acttrs = masterdata.acttrs =  {};
  if (!masterdata.acttrprops) masterdata.acttrprops = {}; 
  const acttrprops = masterdata.acttrprops;
  const actIDs = masterdata.idinfo.acttrs; 
  
  //masterdata.acttrprops = {};//очистка всієї інформації про ВМ розкоментувати при необхідності
  //очистка існуючих тегів
  for (actrname in acttrprops) {
    acttrprops [actrname].tags = [];
  }
  //заповнення інформації з БД тегів
  for (tag of tags) {
    if (tag.ACTTR) {
      if (!acttrs[tag.ACTTR]) {
        acttrs[tag.ACTTR] = [];
      } 
      acttrs[tag.ACTTR].push (tag);
      //якщо актуатор тільки зявився в БД тегів
      if (!acttrprops [tag.ACTTR]) {
        acttrprops [tag.ACTTR] = {name : tag.ACTTR};
        acttrprops [tag.ACTTR].tags = [];
      }
      let tagnamear = tag.TAGNAME.split ('_'); 
      //встановлення назви актуаторів
      if (tagnamear[1][0]==='A') { //!acttrprops[tag.ACTTR].description &&
        let descr = tag.DESCRIPTION;
        let start = descr.search (/\(/);
        descr = (start > 0)? descr.substring (0, start): descr ; 
        acttrprops [tag.ACTTR].description = descr;
      } 
      acttrprops [tag.ACTTR].position = tag.SUBS + tag.ACTTR.replace (/_/g, '');
      if (tag.ACTTYPE) {
        acttrprops [tag.ACTTR].type = tag.ACTTYPE;
      }
      let descr = tag.DESCRIPTION;
      let start = descr.search (/\(/);
      descr = (start > 0)? descr.substring (start): descr ;
      acttrprops [tag.ACTTR].tags.push ({name: tag.TAGNAME, description: descr});
      
      //встановлення часу відкриття актуатора
      if (tag.TOPN) {
        acttrprops[tag.ACTTR].topn = tag.TOPN;
        //console.log (acttrprops[tag.ACTTR]);
      }
    }
  }

  //очитска неіснуючих вже актуаторів
  for (actrname in acttrprops) {
    if (!acttrs[actrname]) {
      let acttrprop = acttrprops[actrname];
      //очистка actIDs від вже не існуючого актуатора 
      if (acttrprop.ID && (actrname === actIDs[acttrprop.ID])) {
        actIDs[acttrprop.ID] = null;
      }
      delete acttrprops[actrname]}
  }
  
  //очистка невірних індентифікаторів
  actIDs[0]=null;
  for (let i=1; i<actIDs.length; i++) {
    let actrname = actIDs[i];
    if (!acttrprops[actrname] || !acttrprops[actrname].ID ||  !acttrprops[actrname].ID !==i) {
      actIDs[i] = null
    }
  }
  // встановлення ідентифікаторів актуаторів    
  for (actrname in acttrprops) {  
    const acttrprop = acttrprops[actrname];
    if (!acttrprop.ID || (actIDs[acttrprop.ID] !== actrname) ) { 
    //шукаємо вільний ідентифікатор в списку actIDs
      let found=false;
      for (let i=1; i<actIDs.length; i++) {
        if (actIDs[i] === null) {
          actIDs[i] = actrname; //якщо знайшли пишемо в це місце
          found = true;
          acttrprop.ID = i;
          break;
        } 
      }
      //якщо не знайшли пишемо в кінець масиву
      if (!found) {
        actIDs.push (actrname);
        acttrprop.ID = actIDs.length - 1;
      }
    }  
  }

  //отримання інформації зі специфікації
  for (acttrname in acttrprops) {
    let acttrprop = acttrprops[acttrname];
    position = acttrprop.position;
    if (masterdata.specific[position]) {
      acttrprop.specific = masterdata.specific[position];
    }  
  }
 
  //лінкування з тегами
  for (actrname in acttrprops) {
    attrlinktag (acttrprops[actrname], masterdata)
  }

  //форування текстового списку актуаторів у формі CSV
  let actlistlog = '';
  for (actrname in acttrprops) {
    let actprop = acttrprops[actrname];
    actlistlog += actprop.ID + '\t' + actrname + '\t' + actprop.description + '\r\n';
  }
  const csvfilename = masterdata.pathes.masterpath + 'actrs.csv'; 
  if (!fs.existsSync(path.dirname(csvfilename))) {
    fs.mkdirSync(path.dirname(csvfilename))
  }
  fs.writeFileSync(csvfilename, actlistlog , 'utf8');

}

//отримує привязує теги виконавчих механізмів до I/O 
function attrlinktag (acttrprop, masterdata) {
  let typename = acttrprop.type;
  let acttype = masterdata.acttrtypes[typename]; 
  if (typeof acttype === 'undefined') return;
  acttrprop.io = {unlinked: []};
  for (let ioname in acttype.io) {
    acttrprop.io [ioname] = ''
  }
  let acttps = masterdata.acttrtypes;
  for (tag of acttrprop.tags) {
    let tagname = tag.name;
    let tagnamear = tagname.split ('_');
    let sufix = tagnamear[tagnamear.length-1];
    // особливі правила
    if ((sufix !== 'GA001') && (sufix !== 'GA002') && (sufix !== 'CG301') && (sufix !== 'CG302') && (sufix !== 'CS301') && (sufix !== 'CS001') && !acttype.io['CFRW/AA102']) sufix = sufix.replace(/\d/g, '');
    //console.log (sufix);
    let found = false;
    for (ioname in acttrprop.io) {
      let ioar = ioname.split('/');
      for (let io of ioar){
        if (io === sufix) {
          found = true;
          acttrprop.io[ioname] += tagname;
        }
      } 
    }
    if (!found) {
      acttrprop.io.unlinked.push (tagname);
    } 
  }
} 

//отримання специфікації з EXCEL в т.ч. отримані з перетворювача https://www.pdf2go.com/ru/pdf-to-excel
function getdatafromspec (masterdata, xlsfile,  opts) {
  const wb = xlsx.readFile(xlsfile);
  const wss = wb.Sheets;
  const spectab = [];
  const namescolumns = {};  
  for (wsname in wss) {
    let wsspec = wss[wsname];
    const spec = xlsx.utils.sheet_to_json(wsspec);  
    let firstcolname;
    //console.log (spec);
    //пошук заголовка
    for (row of spec) {
      let foundheader = false; 
      for (colname in row) {
        let col = row[colname];
        if (col === opts.headertexts[0]) {
          firstcolname = colname;
          foundheader = true;
          break  
        }    
      }
      if (foundheader) {
        let i = 0;
        for (colname in row) {
          let col = row[colname];
          namescolumns [colname] = {headertext: opts.headertexts[i], headername:opts.headernames[i]}; ;
          i++;
        }
        //console.log (namescolumns);
        break
      }
    }
    //заповнення таблиці сепцифікації
    const spec1 = {};
    for (row of spec) {
      let row1 = {};
      if (parseInt(row[firstcolname])>0) {
        for (colname in row) {
          col = row[colname];
          col1name =  namescolumns [colname].headername;
          row1[col1name] = col.toString().replace(/[\n\r]/g, '');
        }
        if (row1.position.length>0 || typeof (row1.position)==='number') {
          if (!spec1[row1.position]) {
            spec1[row1.position] = [];
          }
          spec1[row1.position].push (row1);
        } else  {
          if (!spec1['unlocated']) {
            spec1['unlocated'] = [];
          }
          spec1['unlocated'].push (row1);
        }  

      } 
    }  
    //console.log (spec1);
    masterdata.specific = spec1;
  }
} 

//переірка на коректність назв
function checktagname (tagname) {
  let rforeign = /[^\u0000-\u007f]/;
  if (rforeign.test(tagname)) {
    console.error ('Кирилиця в імені ' +  tagname);
    return (false);
  }
  let regexp = /[\s ]/;
  if (regexp.test (tagname)) {
    console.error ('Недозволені символи в імені ' +  tagname);
    return (false);   
  }
  return (true);
} 

module.exports = {
  getmasterdata_fromxls, iomaptoplcform, iomaptoexcel, getactrtinfo, savemasterdatatofile, readmasterfromjson, getdatafromspec 
};
