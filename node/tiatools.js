/* модуль для конвертування змісту проекту TIA в Master Data
plcvars_to_tags 
VARCFG_to_tags
opts_to_tag
VARHMI_to_tags
plc_to_chs
CHHMI_to_chs
parsedb
parsesection
parsemember
parsesingle
addaddr
parseudtall
parsetypeudt
getAndReplacePlaceholders
*/

const fs = require ('fs');
const xmlparser = require('xml-js'); //https://www.npmjs.com/package/xml-js
const masterdatattools = require('./masterdatatools');
const path = require('path');

masterdatattools.opts.logfile = 'tiatools.log'; 
masterdatattools.opts.source = 'tiatools';


//скорочені назви функцій
const logmsg = masterdatattools.logmsg;
const writetolog = masterdatattools.writetolog;
const syncobs = masterdatattools.syncobs;

//тільки для тестування, закоментувати при використанні 
test();


function test () {
  //test_plc_tochs ();
  test_vars_totags ();
  //test_plcacts_toacts (); 
} 

function test_plcacts_toacts () {
  let pathfiles = './exampledata/';
  
  //отримання мастерданих про теги
  filemaster = pathfiles + 'acts.json';
  if (!fs.existsSync(filemaster)) {
    masteracts = {};
  } else {
    let content = fs.readFileSync (filemaster,'utf8');
    masteracts = JSON.parse (content);  
  }  

  let acttypes = ['ACTTR', 'VLVA', 'VLVD', 'VLVD0', 'VLVD1', 'VLVD5', 'VLVS', 'DRV2', 'DRVD', 'DRVS'];
  let listfiles = {udtfiles: [], xmlcfgfiles:['ACT'], xmlhmifiles:['ACTH']};
  listfiles.udtfiles = []
  for (acttype of acttypes) {
    listfiles.udtfiles.push (acttype + '_STA');
    listfiles.udtfiles.push (acttype + '_CFG');
    listfiles.udtfiles.push (acttype + '_ALM');
  }
  listfiles.udtfiles.push ('ACTTR_CMD');
  listfiles.udtfiles.push ('ACTTR_PRM');
  console.log (listfiles);
  plcacts_toacts(masteracts, pathfiles, listfiles);
  fs.writeFileSync (filemaster, JSON.stringify (masteracts), 'utf8');
} 

function test_vars_totags () {
  let pathfiles = './exampledata/';
  //отримання мастерданих про теги
  filemaster = pathfiles + 'tags.json';
  if (!fs.existsSync(filemaster)) {
    mastertags = {};
  } else {
    let content = fs.readFileSync (filemaster,'utf8');
    mastertags = JSON.parse (content);  
  }  
  
  let listfiles = {
    udtfiles: ["AIVAR_STA", "AIVAR_VALPRCSTA2", "AOVAR_STA", "DOVAR_STA", "DIVAR_STA",
    "AIVAR_CFG", "DIVAR_CFG", "AOVAR_CFG", "DOVAR_CFG", "NAIVAR_CFG", "NDIVAR_CFG", "NAOVAR_CFG", "NDOVAR_CFG", 
    "AIVAR_PRM", "DIVAR_PRM", "AOVAR_PRM", "DOVAR_PRM"],
    xmlcfgfiles : ["VAR"],
    xmlhmifiles: ["AIH", "DIH", "AOH", "DOH"]
  }

  plcvars_to_tags (mastertags, pathfiles, listfiles);
  fs.writeFileSync (filemaster, JSON.stringify (mastertags), 'utf8');
} 

function test_plc_tochs() {
  let pathfiles = './exampledata/';
  //отримання мастерданих про канали
  filemaster = pathfiles + 'chs.json';
  if (!fs.existsSync(filemaster)) {
    masterchs = {};
  } else {
    let content = fs.readFileSync (filemaster,'utf8');
    masterchs = JSON.parse (content);  
  } 
  if (!masterchs.iocfg) masterchs.iocfg = {};
  masterchs.iocfg.aibias = 200;
  masterchs.iocfg.aobias = 200;
  masterchs.iocfg.dibias = 0;
  masterchs.iocfg.dobias = 0;
  plc_to_chs (masterchs, pathfiles);
  fs.writeFileSync (filemaster, JSON.stringify (masterchs), 'utf8');
}

//заносить інформацію про теги в masteracts з даних про VAR
//ромзіщених в файлах listfiles по шляху pathfiles
function plcacts_toacts (masteracts, pathfiles, listfiles) {
  let xmlcontent, parsedata;
  parsedata = {};
 
  //отримання структур
  if (typeof (masteracts.types) !== "object") {masteracts.types = {}};//пошук структур якщо вони вже є в метаданих
  let udtfiles = listfiles.udtfiles;
  for (let i=0; i<udtfiles.length; i++) {
    udtfiles[i] = pathfiles + udtfiles[i] + '.udt';
    logmsg (`Отримую структуру з ${ udtfiles[i]}`);   
    parsetypeudt (udtfiles[i], masteracts.types);
  }
 
  //отримання інформації з ACTCFG
  let xmlcfgfiles = listfiles.xmlcfgfiles;
  for (let i=0; i<xmlcfgfiles.length; i++) {
    xmlcfgfiles[i] = pathfiles + xmlcfgfiles[i];
    logmsg (`Читаю файл ${xmlcfgfiles[i] + '.xml' }`);   
    xmlcontent = fs.readFileSync (xmlcfgfiles[i] + '.xml' ,'utf8');
    logmsg (`Отримую інфорфмацію з ACTCFG`);   
    dbcmplt = parsedb (xmlcontent, parsedata);
    fs.writeFileSync (pathfiles + 'actcfg_parse.json', JSON.stringify (dbcmplt), 'utf8');
    logmsg (`Файл парсингу записано в ${pathfiles + 'actcfg_parse.json'}`); 
    ACTCFG_to_acts (dbcmplt,masteracts);
  }
  

  return
  //отримання інфорфмації з VARHMI
  let fileparseresult;
  let xmlhmifiles = listfiles.xmlhmifiles;//  ["AIH", "DIH", "AOH", "DOH"];
  for (let i=0; i<xmlhmifiles.length; i++) {
    xmlhmifiles[i] = pathfiles + xmlhmifiles[i] ;
    logmsg (`Читаю файл ${xmlhmifiles[i] + '.xml' }`);   
    xmlcontent = fs.readFileSync (xmlhmifiles[i] + '.xml','utf8');
    logmsg (`Отримую інфорфмацію з VARHMI`); 
    dbcmplt = parsedb (xmlcontent, parsedata);
    fileparseresult = xmlhmifiles[i] + '.json'
    fs.writeFileSync (fileparseresult, JSON.stringify (dbcmplt), 'utf8');
    ACTHMI_to_acts (dbcmplt, masteracts);
  }   
  writetolog (1); 
  return
}

//пеетворення різних типів констант PLC  вдесяткову форму
function plcconst_to_dec (val) {
  if (typeof val === "undefined") return 0
  if (typeof val !== "string") return val
  let ar = val.split('#');
  if (ar.length>1) {
    switch (parseInt(ar[0])) { //система числення 16, 2
      case 16: val = parseInt(ar[1],16); break;  
      case 2: val = parseInt(ar[1],2); break;
        break;
      default:
        break;
    }
  } 
  return val;
}
//отримання інформації з ACTCFG
function ACTCFG_to_acts (parsedata, masteracts) {
  logmsg (`Перетворюю в майстер дані`); 
  if (typeof (masteracts.acts) !== "object") {masteracts.acts = {}};//за тегами
  if (typeof (masteracts.ids) !== "object") {masteracts.ids = {}};//індексація за ID
  for (actname in parsedata.data) {
    if (typeof masteracts.acts[actname] !== "object") masteracts.acts[actname] ={};
    let act = masteracts.acts[actname];
    let parseact = parsedata.data[actname];
    act.actname = actname;
    act.id = parseact.ID.startval;
    act.clsid = plcconst_to_dec (parseact.CLSID.startval);
    act.descr = parseact.descr;  
    act.plccfg = parseact;
    //------------------- обробка plccfg
    delete act.plccfg.descr; //видалення щоб не дублювати
    let acttype = masteracts.types[act.plccfg.type];//доступ до об'єкту-типу
    act.type = act.plccfg.type.split('_')[0];//назву типу беремо з назви типу PLC
    act.hmiprefix = 'ACTH';//префікс для змінних HMI
    act.alms={}; //видаляємо усі попередні тривоги перед парсингом
    //резервні змінні не аналізуємо
    if (act.actname.toLowerCase().substring(0,3) === 'rez') continue;
    
    //перебор полів структури 
    let descrorig = '', res = {}; 
    for (let fieldname in parseact) {
      if (typeof parseact[fieldname] !== 'object') continue;
      if (parseact[fieldname].descr && parseact[fieldname].descr.length>2) {
        descrorig = parseact.descr
      } else {
        if  (typeof acttype === "undefined") console.log (act.plccfg.type);
        descrorig = acttype[fieldname].descr
      }
      //пошук особливих міток
      res = getAndReplacePlaceholders (descrorig, "{", "}", ""); //
      //поки нічого обробляти на рівні структур
      //
      let fieldtype = parseact[fieldname].type;
      //якщо є відомі структури всередині
      if (fieldtype && masteracts.types[fieldtype]) {
        //перебираємо біти
        for (let bitname in parseact[fieldname]) {
          if (typeof parseact[fieldname][bitname] !== 'object') continue;
          if (parseact[fieldname][bitname].descr && parseact[fieldname][bitname].descr.length>2) {
            descrorig = parseact[fieldname][bitname].descr
          } else {
            //if  (typeof acttype === "undefined") console.log (act.plccfg.type);
            descrorig = masteracts.types[fieldtype][bitname].descr;
          }
          //пошук особливих міток
          if (descrorig) {
            //console.log  (descrorig);
            res = getAndReplacePlaceholders (descrorig, "{", "}", ""); //
            parseact[fieldname][bitname].descr = res.text;
            fieldname1 = fieldname;     
            opts_to_tag (res, act, fieldname1, bitname)  
          }              
        }
      }  

    }
    masteracts.ids[act.id] = actname;
  } 
}

//заносить інформацію про теги в mastertags з даних про VAR
//ромзіщених в файлах listfiles по шляху pathfiles
function plcvars_to_tags (mastertags, pathfiles, listfiles) {
  /*ID	TAGNAME	DESCRIPTION	TYPE	SRCADR	DEV	MODNMB	CH	MODNM	CHID	SUBTYPE	ALTNAME	SUBS	Note	EFIX	MODID	PLACE	ACTTR	ACTTYPE	UNIT	FRMT	SCALE	TRSCL	TOPN*/
  let xmlcontent, parsedata;
  parsedata = {};

  //отримання структур
  if (typeof (mastertags.types) !== "object") {mastertags.types = {}};//пошук структур якщо вони вже є в метаданих
  let udtfiles = listfiles.udtfiles;
  for (let i=0; i<udtfiles.length; i++) {
    udtfiles[i] = pathfiles + udtfiles[i] + '.udt';
    logmsg (`Отримую структуру з ${ udtfiles[i]}`);   
    parsetypeudt (udtfiles[i], mastertags.types);
  }
 
  //отримання інфорфмації з VARCFG
  let xmlcfgfiles = listfiles.xmlcfgfiles;//  ["AIH", "DIH", "AOH", "DOH"];
  for (let i=0; i<xmlcfgfiles.length; i++) {
    xmlcfgfiles[i] = pathfiles + xmlcfgfiles[i];
    logmsg (`Читаю файл ${xmlcfgfiles[i] + '.xml' }`);   
    xmlcontent = fs.readFileSync (xmlcfgfiles[i] + '.xml' ,'utf8');
    logmsg (`Отримую інфорфмацію з VARCFG`);
    parsedata = {};   
    dbcmplt = parsedb (xmlcontent, parsedata);    
    fs.writeFileSync (pathfiles + 'var_parse.json', JSON.stringify (dbcmplt), 'utf8');
    logmsg (`Файл парсингу записано в ${pathfiles + 'var_parse.json'}`);  
    VARCFG_to_tags (dbcmplt,mastertags);
  }

  //отримання інфорфмації з VARHMI
  let fileparseresult;
  let xmlhmifiles = listfiles.xmlhmifiles;//  ["AIH", "DIH", "AOH", "DOH"];
  for (let i=0; i<xmlhmifiles.length; i++) {
    xmlhmifiles[i] = pathfiles + xmlhmifiles[i] ;
    logmsg (`Читаю файл ${xmlhmifiles[i] + '.xml' }`);   
    xmlcontent = fs.readFileSync (xmlhmifiles[i] + '.xml','utf8');
    logmsg (`Отримую інфорфмацію з VARHMI`); 
    parsedata = {};
    dbcmplt = parsedb (xmlcontent, parsedata);
    fileparseresult = xmlhmifiles[i] + '.json'
    fs.writeFileSync (fileparseresult, JSON.stringify (dbcmplt), 'utf8');
    logmsg (`Файл парсингу записано в ${pathfiles + 'var_parse.json'}`); 
    VARHMI_to_tags (dbcmplt, mastertags);
  }   
  writetolog (1); 
  return
}
//переведення db, adr {byte, bit} string
function adr_to_string (adr, dbnum) {
  let sadr = '';
  if (typeof adr !== 'undefined') {
    sadr = 'DB' + dbnum + '.'; 
    if (typeof (adr.byte) !== 'undefined') sadr += adr.byte.toString();
    if (typeof (adr.bit) !== 'undefined') sadr += '.' + adr.bit.toString();
  }
  return sadr
} 

//отримання інформації з VARCFG
function VARCFG_to_tags (dbcmplt, mastertags) {
  let tagtypes = {AIVAR_CFG:"AI", DIVAR_CFG:"DI",DOVAR_CFG:"DO",AOVAR_CFG:"AO",
  NAIVAR_CFG:"AI", NDIVAR_CFG:"DI", NDOVAR_CFG:"DO", NAOVAR_CFG:"AO",};//NDI, NDO, NAI, NAO
  if (typeof (mastertags.tags) !== "object") {mastertags.tags = {}};//за тегами
  if (typeof (mastertags.ids) !== "object") {mastertags.ids = {}};//індексація за ID
  let isrez = false;
  //------------- спочатку обробляємо з dbcmplt по назві тегу
  for (tagname in dbcmplt.data) {
    let parsetag = dbcmplt.data[tagname];
    let tag = {};
    tag.tagname = tagname;
    tag.id = parsetag.ID.startval;
    tag.clsid = plcconst_to_dec (parsetag.CLSID.startval);;
    tag.descr = parsetag.descr;  
    tag.plccfg = parsetag;
    //------------------- обробка plccfg
    delete tag.plccfg.descr; //видалення щоб не дублювати
    let tagtype = mastertags.types[tag.plccfg.type];
    tag.type = tagtypes [tag.plccfg.type];
    tag.hmiprefix = tag.type + 'H';//префікс для змінних HMI
    //резервні змінні мітимо, щоб десь не аналізувати 
    if (tag.tagname.toLowerCase().substring(0,3) === 'rez') {
      isrez=true;
    }
    //якщо є значення каналу за замвоченням пишемо в меп
    if (tag.plccfg.CHIDDF.startval) {
      tag.chid = tag.plccfg.CHIDDF.startval 
    } 
    //перебор полів структури 
    let descrorig = '', res = {}; 
    for (let fieldname in parsetag) {
      if (typeof parsetag[fieldname] !== 'object') continue;
      //зінюємо формат адреси полів до текстового
      tag.plccfg[fieldname].adr = adr_to_string (parsetag[fieldname].adr,dbcmplt.dbnum);
      if (parsetag[fieldname].descr && parsetag[fieldname].descr.length>2) {
        descrorig = parsetag.descr
      } else {
        if  (typeof tagtype === "undefined") console.log (tag.plccfg.type);
        descrorig = tagtype[fieldname].descr
      }
      //пошук особливих міток
      res = getAndReplacePlaceholders (descrorig, "{", "}", ""); //
      //поки нічого обробляти на рівні структур
      //
      let fieldtype = parsetag[fieldname].type;
      //якщо є відомі структури всередині
      if (fieldtype && mastertags.types[fieldtype]) {
        //перебираємо біти
        for (let bitname in parsetag[fieldname]) {
          //logmsg (fieldname + '-' + bitname);
          if (typeof parsetag[fieldname][bitname] !== 'object') continue;
          //зінюємо формат адреси полів до текстового
          tag.plccfg[fieldname][bitname].adr = adr_to_string (parsetag[fieldname][bitname].adr,dbcmplt.dbnum);
          if (parsetag[fieldname][bitname].descr && parsetag[fieldname][bitname].descr.length>2) {
            descrorig = parsetag[fieldname][bitname].descr
          } else {
            //if  (typeof tagtype === "undefined") console.log (tag.plccfg.type);
            descrorig = mastertags.types[fieldtype][bitname].descr;
          }
          //пошук особливих міток для змінних що не є резерованими
          if (descrorig && isrez==false) {
            //console.log  (descrorig);
            res = getAndReplacePlaceholders (descrorig, "{", "}", ""); //
            parsetag[fieldname][bitname].descr = res.text;
            if (fieldname === 'STA2')  { 
              fieldname1 = 'AIVAR_VALPRCSTA2' //кастом
            } else {
              fieldname1 = fieldname 
            }    
            opts_to_tag (res, tag, fieldname1, bitname)  
          }              
        }
      }    
      //tag.plccfg[fieldname].descr = res.text;

    }
    
    //------------- оновлення mastertag 
    let mastertag;
    if (typeof mastertags.tags[tagname] === "object") { //шукаємо спочатку за іменем, 
      mastertag = mastertags.tags[tagname];
    } else if (mastertags.ids[tag.id]) { // якщо не знаходимо, то шукаємо за ID
      let oldtagname = mastertags.ids[tag.id];
      logmsg (`Тег ${oldtagname} з id ${tag.id} переіменовано в ${tag.name}`);
      mastertag = mastertags.tags[tagname];
    } else { //новий тег
      mastertags.tags[tagname] = {}; 
      mastertag = mastertags.tags[tagname];
    }
    //синхронізація об'єктів
    syncobs (mastertag, tag);
    mastertags.ids[mastertag.id] = mastertag.tagname;
  } 
}

//з масиву опцій opts формує тривоги для tag та act, 
//для ALM з посиланям на поле fieldname та bitname в структурі HMI
function opts_to_tag (opts, tag, fieldname, bitname) {
  let tagname;
  if (tag.tagname) {
    tagname = tag.tagname;
  }else if (tag.actname) {
    tagname = tag.actname;
  }  
  let msg = "";
  let alm = {name:'', msg: '', word:'', bit:0, class:''}; 
  let ar = [];
  for (opt of opts.ar){
    ar = opt.split('.');
    switch (ar[0]) {
      case 'A': //тривоги
        if (!tag.alms) tag.alms = {};

        alm.name = tag.hmiprefix + '_' + tagname + '_' + bitname;
        alm.class = ar[1];
        alm.word = fieldname;
        alm.bit = parseInt (ar[2]);
        alm.msg = tag.descr + ': ' + opts.text;
        tag.alms[alm.name] = alm;       
        break;    
      default:
        break;
    } 
    
    //tag.alm  
  
  }    
}  

//отримання інформації зі структур HMI
function VARHMI_to_tags (dbcmplt, mastertags) {
  let sadr;
  for (tagname in dbcmplt.data) {
    let tagplchmi = {};
    let parsetag = dbcmplt.data[tagname];
    tagplchmi = parsetag;
    //------------------- обробка plchmi
    delete tagplchmi.descr; //видалення щоб не дублювати
    //перебор полів структури 
    for (let fieldname in parsetag) {
      if (typeof parsetag[fieldname] !== 'object') continue;
      //зінюємо формат адреси полів до текстового
      sadr = adr_to_string (parsetag[fieldname].adr, dbcmplt.dbnum);
      parsetag[fieldname].adr = sadr;
    }
    //якщо такого тегу ще немає - вивести помилку
    if (typeof mastertags.tags[tagname] !== "object") { 
      logmsg (`ERR: Тегу ${tagname} для HMI не існує `);
      continue
    }
    if (!mastertags.tags[tagname].plchmi) mastertags.tags[tagname].plchmi = {}
    let mastertaghmi = mastertags.tags[tagname].plchmi;
    //синхронізація об'єктів   
    tagplchmi.name = tagname;
    syncobs (mastertaghmi, tagplchmi);
    //console.log (mastertaghmi); 
    //process.exit();       
  }
}

//парсити усі дані з PLC в Masterdata
function plc_to_chs (masterchs, pathfiles) {
  let xmlcontent, parsedata, chs;
  parsedata = {};
  
  //отримання структур
  if (typeof (masterchs.types) !== "object") {masterchs.types = {}};//пошук структур якщо вони вже є в метаданих
  let udtfiles = ["CH_STA", "CH_CFG", "CH_HMI", "CH_BUF", "CH_STA"]
  for (let i=0; i<udtfiles.length; i++) {
    udtfiles[i] = pathfiles + udtfiles[i] + '.udt'
    parsetypeudt (udtfiles[i], masterchs.types);
  } 
 
  //канали зчитуються з HMI
  if (!masterchs.chs) masterchs.chs = {};
  chs = masterchs.chs; 
  let filename = pathfiles + 'CH.xml';
  xmlcontent = fs.readFileSync (filename,'utf8');
  dbcmplt = parsedb (xmlcontent, parsedata);
  CHHMI_to_chs (dbcmplt,chs);
} 

//перетворення рзпарсеного блоку CHHMI в стандартизовану структуру chs   
function CHHMI_to_chs (parsedata, chs) {
  let CHDIs = parsedata.data.CHDI.data;
  let CHDOs = parsedata.data.CHDO.data;
  let CHAIs = parsedata.data.CHAI.data;
  let CHAOs = parsedata.data.CHAO.data;
  if (typeof (chs.chdis) !== "object") {chs.chdis = {}} 
  if (typeof (chs.chdos) !== "object") {chs.chdos = {}} 
  if (typeof (chs.chais) !== "object") {chs.chais = {}} 
  if (typeof (chs.chaos) !== "object") {chs.chaos = {}} 
  let adrbyte, adrbit;
  for (let i=0; i<CHDIs.length; i++) {
    let id = i.toString();
    if (typeof chs.chdis[id] === "undefined") chs.chdis[id]={};
    let ch = chs.chdis[id];   
    ch.id = id;
    adrbyte = +masterchs.iocfg.dibias + Math.trunc(((+id-1)/8)); adrbit = (+id - 1) % 8; 
    ch.adr = 'I' + adrbyte + '.' + adrbit;
    if (typeof chs.chdis[id].plchmi === "undefined") chs.chdis[id].plchmi={};
    let chhmi = chs.chdis[id].plchmi
    chhmi.type = "CH_HMI";
    chhmi.adr = 'DB' + parsedata.dbnum + '.' + CHDIs[i].adr.byte + "." + CHDIs[i].adr.bit
  }  
  for (let i=0; i<CHDOs.length; i++) {
    let id = i.toString();
    if (typeof chs.chdos[id] === "undefined") chs.chdos[id]={};
    let ch = chs.chdos[id];
    ch.id = id;
    adrbyte = +masterchs.iocfg.dobias + Math.trunc(((+id-1)/8)); adrbit = (+id - 1) % 8; 
    ch.adr = 'Q' + adrbyte + '.' + adrbit;       
    if (typeof chs.chdos[id].plchmi === "undefined") chs.chdos[id].plchmi={};
    let chhmi = chs.chdos[id].plchmi
    chhmi.type = "CH_HMI";
    chhmi.adr = 'DB' + parsedata.dbnum + '.' + CHDOs[i].adr.byte + "." + CHDOs[i].adr.bit
  }  
  for (let i=0; i<CHAIs.length; i++) {
    let id = i.toString();
    if (typeof chs.chais[id] === "undefined") chs.chais[id]={};
    let ch = chs.chais[id];   
    ch.id = id;
    adrbyte = +masterchs.iocfg.aibias + (+id - 1)*2; 
    ch.adr = 'IW' + adrbyte;     
    if (typeof chs.chais[id].plchmi === "undefined") chs.chais[id].plchmi={};
    let chhmi = chs.chais[id].plchmi
    chhmi.type = "CH_HMI";
    chhmi.adr = 'DB' + parsedata.dbnum + '.' + CHAIs[i].adr.byte + "." + CHAIs[i].adr.bit
  }  
  for (let i=0; i<CHAOs.length; i++) {
    let id = i.toString();
    if (typeof chs.chaos[id] === "undefined") chs.chaos[id]={};
    let ch = chs.chaos[id];   
    ch.id = id;
    adrbyte = +masterchs.iocfg.aobias + (+id - 1)*2; 
    ch.adr = 'QW' + adrbyte;       
    if (typeof chs.chaos[id].plchmi === "undefined") chs.chaos[id].plchmi={};
    let chhmi = chs.chaos[id].plchmi
    chhmi.type = "CH_HMI";
    chhmi.adr = 'DB' + parsedata.dbnum + '.' + CHAOs[i].adr.byte + "." + CHAOs[i].adr.bit
  }  
} 

// --------------- DB XML -----------------------------
//парсить xmlcontent і заносить дані полів по DB parsedata та dbcmplt
//має надлищковість, варто оптимізувати
function parsedb (xmlcontent, parsedata) {
  let docs = xmlparser.xml2js(xmlcontent, {compact: true, spaces: 4}).Document;
  //якщо блок не GlobalDB - завершити виконання
  if (!docs['SW.Blocks.GlobalDB']) {
    console.log (docs);
    return; 
  }
  let ob = docs['SW.Blocks.GlobalDB']['AttributeList'];
  let dbcmplt = {rowparse: ob.Interface};   
  let adrob = {byte:0, bit:0};
  parsesection (parsedata, dbcmplt.rowparse.Sections.Section, adrob);
  dbcmplt.data = parsedata;
  dbcmplt.dbnum = ob.Number._text;
  return dbcmplt;
}
//парсить Section, відноситься до parsedb 
function parsesection (parsedata, Section, adrob) {
  //Корінь дерева - Static
  //поля є елементами масиву, якщо це не масив - тільки одне поле на цьому рівні   
  if (Section.Member.length !== undefined) { 
    for (memberitem of Section.Member) {
      parsemember (parsedata, memberitem, adrob);
    }
    if (adrob.bit>0) {// якщо були біти в попередніх полях 11.09.21
      adrob.byte ++;//зробити приріст на байт
      if ((adrob.byte % 2)!==0) { //якщо непаний - вирівнювання по парному 
        adrob.byte ++;
      }
    }      
    adrob.bit = 0;
    return
  } else {
    let memberitem = Section.Member;
    parsemember (parsedata, memberitem, adrob);   
    if (adrob.bit>0) {// якщо були біти в попередніх полях 11.09.21
      adrob.byte ++;//зробити приріст на байт
      if ((adrob.byte % 2)!==0) { //якщо непаний - вирівнювання по парному 
        adrob.byte ++;
      }
    }  
    adrob.bit = 0; 
    return 
  }
      
}
//парсить memberitem, відноситься до parsedb 
function parsemember (parsedata, memberitem, adrob) {
  //Member може мати інші Member або бути кінцевим
  if (memberitem.Sections) { //якщо має гілки 
    let filedtype = memberitem._attributes.Datatype;
    let fieldname = memberitem._attributes.Name;
    let ob = parsedata [fieldname] = {type: filedtype.replace(/"/g,'')};          
    if (memberitem.Comment) ob.descr = memberitem.Comment.MultiLanguageText._text;  
    //перевірка чи тип є масивом інших типів
    //якщо масив інших типів то секція - це опис одного типу 
    filedtype = filedtype.toLowerCase().replace(/"/g,'');
    if (filedtype.search ('array') !=-1) { 
      filedtype = filedtype.replace ('array[', '').replace(']', '').replace('..', ' ').replace(/"/g,'') ; 
      let typear = filedtype.split (' ');
      let strti = typear[0];
      let endi = typear[1];
      let typei = typear[3];
      parsedata [fieldname].data = [];
      for (let i=strti; i<=endi; i++) {
        //let memberitem
        parsedata [fieldname].data [i] = {adr: {byte : adrob.byte, bit: adrob.bit}};
        parsesection (parsedata [fieldname].data [i] , memberitem.Sections.Section, adrob) 
        //parsemember (parsedata, memberitem, adrob) 
      }      
    } else { 
      parsesection (ob, memberitem.Sections.Section, adrob)
    }            
  } else { //якщо це кінцева гілка гілки 
    parsesingle (parsedata, memberitem, adrob);    
    return 
  }     
}
//парсить скалярні типи, відноситься до parsedb 
function parsesingle (parsedata, memberitem, adrob) {
  let fieldname = memberitem._attributes.Name;
  let filedtype =  memberitem._attributes.Datatype.toLowerCase().replace(/"/g,''); 
  parsedata [fieldname] = {type: filedtype};
  if (memberitem.StartValue) {//07.12.21
    //console.log (memberitem.StartValue);
    let startvalob = memberitem.StartValue["_text"];
    parsedata [fieldname].startval = startvalob; 
  }
  parsedata [fieldname].adr = {byte : adrob.byte, bit: adrob.bit};
  if (filedtype.search ('array') !=-1) {
    filedtype = filedtype.replace ('array[', '').replace(']', '').replace('..', ' ').replace(/"/g,''); 
    let typear = filedtype.split (' ');
    let strti = typear[0];
    let endi = typear[1];
    let typei = typear[3];
    parsedata [fieldname].data = [];
    for (let i=strti; i<=endi; i++) {
      parsedata [fieldname].data [i] = {adr: {byte : adrob.byte, bit: adrob.bit}};
      addaddr (typei, adrob); 
    }
  } else {
    addaddr (filedtype, adrob);      
  }
  newsection = false;//відмітка про те, що це не нова секція 11.09.21
}

//фнкція розрахунку адреси для наступного поля скалярного типу 
//приймає type, adrob:{byte, bit} поепереднє і модифікує його  
function addaddr (type, adrob) {
  let addbyte=0, addbit=0;
  switch (type) {
    case 'bool':
      addbit = 1;
      break;      
    case 'int':
    case 'uint':
      addbyte = 2;
      break;
    case 'real':
    case 'dint':  
    case 'udint':  
      addbyte = 4;
    default:
      //return -1; 
      break;
  }
  adrob.bit += addbit;
  if (adrob.bit>7) {
    adrob.bit = 0; 
    addbyte = 1; 
  }
  if (addbit===0 && (adrob.byte % 2)!==0) {
    adrob.byte ++; 
  }    
  adrob.byte += addbyte;
} 

// --------------------------- udt
//запускає parsetypeudt для усіх файлів .udt що мають в своєму імені 
//_STA  _ALM
function parseudtall (types, udtpath) {
  const udtfiles = [];
  let filelist = fs.readdirSync(udtpath);
  for (filename of filelist){
    //console.log (filename);
    if (filename.search('.udt')>0 && ((filename.search('_STA')>0) || (filename.search('_ALM')>0) || (filename.search('PLC_ALM')>0))) { 
      //console.log ('->' + filename);
      udtfiles.push (udtpath + filename)
    }
  }
  for (filename of udtfiles) {
    parsetypeudt (filename, types);
  }
}

//парсить структуру UDT з filename повертає розпаресені струткури в plctypes
function parsetypeudt (filename, plctypes) {
  let ob = {};
  let udtcontent;
  let lines;
  if (fs.existsSync(filename)) {
    udtcontent = fs.readFileSync (filename,'utf8');
  } else {
    return
  }
  //---------- змінено 11.12.21 добавлено опис descr та коментар comment
  ob.structdescr = '';
  ob.structcomment = '';  
  lines = udtcontent.split(/\r?\n/);
  //шукаємо descr і comment і name в перших 5-ти рядах
  for (let i=0; i<5; i++) {
    let line = lines[i];
    if (line.search ('TYPE')>=0) { //TYPE "ACTTR_CFG"
      structname = line.split('"')[1];
      //console.log (structname);
    }
    if (line.search ('TITLE')>=0) { //TITLE = Універсальний тип
      ob.structdescr = line.split('= ')[1];
      //console.log (ob.structdescr );
    }
    let l = line.search ('//');
    if (l>=0 && l<3 ) { // //Цей тип використовується...
      ob.structcomment = line.substring(l+2, line.length);
      //console.log (ob.structcomment);
    }
  }  
  //----------------
  let structstart = 'STRUCT', structend = 'END_STRUCT', version = 'VERSION';
  let n = udtcontent.search (structstart);
  let m = udtcontent.search (structend);
  let structbody = udtcontent.substring (n + structstart.length , m);
  n = 0; m = udtcontent.search (version); 
  //structname =  udtcontent.substring(n,m).replace (/["\r\n]/g, '').split(' ')[1]; 
  lines = structbody.split(/\r?\n/);
  let byte = 0, bit = 0;  
  let prevtype = '';
  for (line of lines) {
    let res = getAndReplacePlaceholders (line, "{ ", "}", ""); //замінити {} на пусті 
    line = res.text; 
    let ar = line.replace(':','|').replace('//','|').split ('|');
    if (ar.length >= 2) {
      n = line.search ('{');  m = line.search ('}');
      if (n> 1 && m>1) line = line.slice (0, n) + line.slice (m+1);
      let fieldname = ar[0].replace (/ /g, '');
      if (!ar[2]) ar[2] = 'No comments';
      ob[fieldname] = {
      type: ar[1].replace (/[ ;]/g, '').toLowerCase(),      
      descr: ar[2].replace (' ', '')}
      switch (prevtype) {
        case 'bool':
          bit++;
          if (bit>7) {
            byte++;
            bit = 0;
          }
          break;
        case 'int':
        case 'uint':
          byte += 2;
          break;
        case 'dint':
        case 'udint':
        case 'real':
          byte +=4;
          break;
        default:
          break;
      }
      ob[fieldname].byte = byte;
      ob[fieldname].bit = bit;
      prevtype = ob[fieldname].type;
    }
  }
  plctypes[structname] = ob;
}

//шукає в txt замінник в форматі (startsymb текст endsymb) замінює його на replacer
//повертає об'єкт з масивом знайдених текстів і вичищений текст 
function getAndReplacePlaceholders (txt, startsymb, endsymb, replacer) {
  let ar = [];
  let regexp;
  let ar1 = txt.split (startsymb); 
  for (el of ar1) {
      ar2 = el.split(endsymb);
      if (ar2.length>1) {
          ar.push (ar2[0]);
          regexp = new RegExp (startsymb + ar2[0] + endsymb, "g")
          txt = txt.replace (regexp, replacer)  
      } 
  }
  return {text : txt, ar: ar };
}  

module.exports = {
  parsedb, parsetypeudt, parseudtall
};

