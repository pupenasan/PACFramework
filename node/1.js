console.log (to2sym(5));

function to2sym (num){
    let s = num.toString();
    s = (s.length===1) ? '0'+ s: s;
   return s 
}
