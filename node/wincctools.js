let path = require('path');
const fs = require ('fs');
const xlsx = require('xlsx');

test();


function test () {
  //test_mastertags_to_almlist ();
  test_masteracts_to_almlist();
} 

function test_mastertags_to_almlist () {
  let path1 = './exampledata/';
  //отримання мастерданих про теги
  let filemaster = path1 + 'tags.json';
  if (fs.existsSync(filemaster)) {
    let content = fs.readFileSync (filemaster,'utf8');
    mastertags = JSON.parse (content);
    let almlist = mastertags_to_almlist(mastertags.tags);
    //console.log (almlist);
    var BOM = "\uFEFF"; 
    var csvContent = BOM + almlist; //для кирилиці  
    fs.writeFileSync (path1 + 'wincc_almtags.csv', csvContent, {codepage:1251});    
  }
} 

function test_masteracts_to_almlist () {
  let path1 = './exampledata/';
  //отримання мастерданих про act
  let filemaster = path1 + 'acts.json';
  if (fs.existsSync(filemaster)) {
    let content = fs.readFileSync (filemaster,'utf8');
    masteracts = JSON.parse (content);
    let almlist = masteracts_to_almlist(masteracts.acts);
    //console.log (almlist);
    var BOM = "\uFEFF"; 
    var csvContent = BOM + almlist; //для кирилиці  
    fs.writeFileSync (path1 + 'wincc_almacts.csv', csvContent, {codepage:1251});    
  }
} 

//виведення тривог по тегам з мастерданих в список CSV
function mastertags_to_almlist (tags) {
  let almlist = [];
  for (let tagname in tags) {
    let tag = tags[tagname];
    for (let almname in  tag.alms){
      let almrec = [];
      let alm = tag.alms[almname]; 
      almrec.push (almname);
      almrec.push (alm.msg);
      almrec.push (alm.class);
      almrec.push (tag.hmiprefix +'_' + tagname + '.' + alm.word);
      almrec.push (alm.bit.toString());
      almrec.push ('Rising edge');
      if (alm.class !== 'MSG') {
        almrec.push (tag.hmiprefix +'_' + tagname + '_UDT.Alarm_Ack');
        almrec.push (alm.bit.toString());
      } else {
        almrec.push ('');
        almrec.push ('');
      }
      almrec.push (tag.hmiprefix +'_' + tagname + '_UDT.Alarm_Status');
      almrec.push (alm.bit.toString());
      almlist.push (almrec.join(';'));
    }
  }

  return (almlist.join ('\r\n'));
} 

//виведення тривог по ВМ з мастерданих в список CSV
function masteracts_to_almlist (acts) {
  let almlist = [];
  for (let actname in acts) {
    let act = acts[actname];
    for (let almname in  act.alms){
      let almrec = [];
      let alm = act.alms[almname]; 
      almrec.push (almname);
      almrec.push (alm.msg);
      almrec.push (alm.class);
      almrec.push (act.hmiprefix +'_' + actname + '.' + alm.word);
      almrec.push (alm.bit.toString());
      almrec.push ('Rising edge');
      if (alm.class !== 'MSG') {
        almrec.push (act.hmiprefix +'_' + actname + '_UDT.Alarm_Ack');
        almrec.push (alm.bit.toString());
      } else {
        almrec.push ('');
        almrec.push ('');
      }
      almrec.push (act.hmiprefix +'_' + actname + '_UDT.Alarm_Status');
      almrec.push (alm.bit.toString());
      almlist.push (almrec.join(';'));
    }
  }

  return (almlist.join ('\r\n'));
} 