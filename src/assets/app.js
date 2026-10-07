(function(){
var $=function(id){return document.getElementById(id)};
var CATN={n:"nombre",v:"verbo",adj:"adjetivo",adv:"adverbio",loc:"locución",pron:"pronombre",conj:"conjunción",prep:"preposición"};
var INFO=[];
function esc(x){return String(x).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}
function nk(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim()}
function cands(w){var c=[w],b;
  if(/(amos|emos|imos)$/.test(w)){b=w.slice(0,-4);c.push(b+"ar",b+"er",b+"ir")}
  if(/(an|en)$/.test(w)){b=w.slice(0,-2);c.push(b+"ar",b+"er",b+"ir")}
  if(/o$/.test(w)){b=w.slice(0,-1);c.push(b+"ar",b+"er",b+"ir")}
  if(/a$/.test(w)){b=w.slice(0,-1);c.push(b+"ar",b+"o")}
  if(/es$/.test(w))c.push(w.slice(0,-2));
  if(/s$/.test(w))c.push(w.slice(0,-1));
  return c}
var STOP="a al de del el la las los lo un una unos unas y o en con por para que se es son sobre vamos va voy está esta están estan estoy hay era fue soy eres".split(" ");
var LEMA={hablar:"HABLAR",hablamos:"HABLAR",importancia:"IMPORTANTE",importante:"IMPORTANTE",inclusión:"INCLUSIÓN",inclusion:"INCLUSIÓN",gracias:"GRACIAS",hola:"HOLA",hoy:"HOY",mañana:"MAÑANA",ayer:"AYER",personas:"PERSONA",sociedad:"SOCIEDAD",igualdad:"IGUALDAD",quiero:"QUERER",necesito:"NECESITAR",ayuda:"AYUDA",agua:"AGUA",casa:"CASA",colegio:"COLEGIO",doctor:"MÉDICO",médico:"MÉDICO",dónde:"DÓNDE",donde:"DÓNDE",qué:"QUÉ",cómo:"CÓMO",nombre:"NOMBRE"};
var TIEMPO=["HOY","MAÑANA","AYER"];
var step=0,timer=null,speed=1000,glosas=[],vid=$("vid"),lastK=-1;
function norm(t){return t.toLowerCase().replace(/[¿?¡!.,;:]/g," ").split(/\s+/).filter(Boolean)}
function glosar(t){
  var items=norm(t).filter(function(w){return STOP.indexOf(w)<0}).map(function(w){
    var lem=LEMA[w]||w.toUpperCase(),cs=cands(nk(lem)),e=null;
    for(var i=0;i<cs.length;i++){if(LEX[cs[i]]){e=LEX[cs[i]];break}}
    return {l:e?e[0]:w.toUpperCase().split("").join("-"),e:e,w:lem};
  });
  var tm=items.filter(function(x){return TIEMPO.indexOf(x.l)>=0});
  var rest=items.filter(function(x){return TIEMPO.indexOf(x.l)<0});
  var res=tm.concat(rest);
  if(/\?/.test(t))res.push({l:"PREGUNTA",e:false,w:"PREGUNTA"});
  return res;
}
function semantica(t,g){
  var cont=g.filter(function(w){return TIEMPO.indexOf(w)<0&&w!=="PREGUNTA"});
  var intent=/\?/.test(t)?"Preguntar":/gracias/i.test(t)?"Agradecer":/hola/i.test(t)?"Saludar":"Informar";
  var concepto=cont.slice().sort(function(a,b){return b.length-a.length})[0]||"—";
  return {tema:cont.length?cont[cont.length-1]:"—",concepto:concepto,intencion:intent,elementos:cont};
}
function pretty(s){return s.charAt(0)+s.slice(1).toLowerCase()}
function setStep(i){
  var els=document.querySelectorAll(".step");
  els.forEach(function(e,k){e.className="step"+(k<i?" done":k===i?" run":"")});
}
function run(){
  var t=$("txt").value.trim();
  if(!t){$("txt").focus();return}
  stop();$("out").classList.add("hidden");
  var i=0;setStep(0);
  var iv=setInterval(function(){
    i++;
    if(i>=4){clearInterval(iv);setStep(4);render(t);return}
    setStep(i);
  },550);
}
function render(t){
  var G=glosar(t);glosas=G.map(function(x){return x.l});INFO=G.map(function(x){return x.e});
  var s=semantica(t,G.map(function(x){return x.w}));
  var ok=INFO.filter(function(e){return e}).length,tot=INFO.filter(function(e){return e!==false}).length;
  $("info").innerHTML="<b>"+ok+" de "+tot+"</b> señas tienen entrada en el Diccionario Básico de la LSC. Las demás se deletrean con el alfabeto manual (borde punteado).";
  $("seq").innerHTML=glosas.map(function(w,k){return '<li data-k="'+k+'"'+(INFO[k]===null?' class="nf" title="Se deletrea"':'')+'>'+esc(w)+'</li>'}).join("");
  $("sem").innerHTML="<dt>Tema</dt><dd>"+pretty(s.tema)+"</dd><dt>Concepto clave</dt><dd>"+pretty(s.concepto)+"</dd><dt>Intención</dt><dd>"+s.intencion+"</dd><dt>Elementos</dt><dd>"+s.elementos.map(pretty).join(", ")+"</dd>";
  $("json").textContent=JSON.stringify({transcripcion:t,tema:s.tema.toLowerCase(),concepto_clave:s.concepto.toLowerCase(),intencion:s.intencion.toLowerCase(),glosas:glosas},null,2);
  $("word").textContent="Listo";$("bar").style.width="0";lastK=-1;
  $("hint").textContent=vid.getAttribute("src")?"Reproduce el video para ver las señas":"Pulsa reproducir";
  $("out").classList.remove("hidden");
  $("out").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function show(k){
  var items=$("seq").children;
  for(var j=0;j<items.length;j++)items[j].className=j===k?"on":"";
  $("word").textContent=glosas[k];
  $("hint").textContent="Seña "+(k+1)+" de "+glosas.length;
  $("bar").style.width=((k+1)/glosas.length*100)+"%";
  setPose(glosas[k]);
  var e=INFO[k];
  $("info").innerHTML=e===false?"<b>PREGUNTA</b>: marcador no manual. Se levantan las cejas durante la frase.":e===null?"<b>"+esc(glosas[k])+"</b>: no tiene entrada en el diccionario básico. Se deletrea letra por letra.":"<b>"+esc(e[0])+"</b> <i>("+(CATN[e[1]]||e[1])+")</i> "+esc(e[2])+"<p><b>Cómo se hace:</b> "+esc(e[4])+"</p><p class=\"note\">Ejemplo LSC: "+esc(e[3])+"</p>";
}
function stop(){if(timer){clearInterval(timer);timer=null}$("play").textContent="Reproducir";setPose("")}
function play(){
  if(vid.getAttribute("src")){if(vid.paused){lastK=-1;vid.play()}else vid.pause();return}
  if(timer){stop();return}
  if(!glosas.length)return;
  var k=0;show(k);$("play").textContent="Pausar";
  timer=setInterval(function(){
    k++;
    if(k>=glosas.length){stop();$("hint").textContent="Fin de la secuencia";return}
    show(k);
  },speed);
}
var SK="#e8b894",SL="#4a2a3a";
var SH={relax:[4,6,6,6,6],open:[9,15,16,15,12],flat:[3,15,16,15,12],fist:[2,3,3,3,3],point:[4,16,3,3,3],ily:[10,16,3,3,13]};
var R=[6,-6,"relax"];
var DICT={"":[6,-6,"relax",6,-6,"relax",0,1.5,0],
HOLA:[150,10,"open",6,-6,"relax",0,4,14],HOY:[10,-100,"flat",10,-100,"flat",0,1.5,5],
HABLAR:[150,140,"point",6,-6,"relax",0,5,9],GRACIAS:[150,150,"flat",6,-6,"relax",0,3,9],
"IMPORTANTE":[40,-150,"point",40,-150,"point",-3,1.5,7],"INCLUSIÓN":[20,-115,"open",20,-115,"open",0,2.5,12],
PREGUNTA:[55,-125,"open",55,-125,"open",-6,2,5],QUERER:[30,-100,"open",30,-100,"open",0,1.5,6],AYUDA:[20,-110,"fist",30,-100,"flat",0,1.5,4]};
var G=[[10,-90,"point"],[70,-100,"open"],[20,-140,"flat"],[40,-130,"ily"],[30,-105,"fist"]];
function hand(i){var f="";for(var j=0;j<4;j++)f+='<line id="f'+i+j+'" x1="'+(64-4.8+j*3.2)+'" y1="234" x2="'+(64-4.8+j*3.2)+'" y2="240" stroke="'+SK+'" stroke-width="3.4" stroke-linecap="round"/>';
return '<circle cx="64" cy="231" r="7" fill="'+SK+'"/>'+f+'<line id="f'+i+'t" x1="58" y1="229" x2="55" y2="233" stroke="'+SK+'" stroke-width="3.4" stroke-linecap="round"/>';}
function arm(i){return '<g id="s'+i+'"><line x1="64" y1="146" x2="64" y2="188" stroke="'+SL+'" stroke-width="13" stroke-linecap="round"/><g id="e'+i+'"><line x1="64" y1="188" x2="64" y2="226" stroke="'+SL+'" stroke-width="11" stroke-linecap="round"/>'+hand(i)+'</g><circle cx="64" cy="188" r="6" fill="'+SL+'"/></g>';}
$("arms").innerHTML=arm(0)+'<g transform="translate(200 0) scale(-1 1)">'+arm(1)+'</g>';
var cur={a0:6,b0:-6,a1:6,b1:-6,br:0,mo:1.5,w:0,f0:SH.relax.slice(),f1:SH.relax.slice()};
var tg={a0:6,b0:-6,a1:6,b1:-6,br:0,mo:1.5,w:0,f0:SH.relax,f1:SH.relax};
function setPose(g){
  var p=DICT[g];
  if(!p){var h=0;for(var i=0;i<g.length;i++)h+=g.charCodeAt(i);var q=G[h%G.length];p=q.concat(h%2?q:R,[0,2,5]);}
  tg.a0=p[0];tg.b0=p[1];tg.f0=SH[p[2]];tg.a1=p[3];tg.b1=p[4];tg.f1=SH[p[5]];tg.br=p[6];tg.mo=p[7];tg.w=p[8];
}
function tick(t){
  ["a0","b0","a1","b1","br","mo","w"].forEach(function(k){cur[k]+=(tg[k]-cur[k])*.14});
  for(var j=0;j<5;j++){cur.f0[j]+=(tg.f0[j]-cur.f0[j])*.2;cur.f1[j]+=(tg.f1[j]-cur.f1[j])*.2}
  for(var i=0;i<2;i++){
    var a=cur["a"+i],b=cur["b"+i],wv=a>15?cur.w*Math.sin(t/150+i*1.6):0,f=cur["f"+i];
    $("s"+i).setAttribute("transform","rotate("+a+" 64 146)");
    $("e"+i).setAttribute("transform","rotate("+(b+wv)+" 64 188)");
    for(var m=0;m<4;m++)$("f"+i+m).setAttribute("y2",234+f[m+1]);
    $("f"+i+"t").setAttribute("x2",58-f[0]*.5);$("f"+i+"t").setAttribute("y2",229+f[0]*.8);
  }
  $("mo").setAttribute("ry",cur.mo+(tg.mo>3?Math.abs(Math.sin(t/120))*2:0));
  $("br").setAttribute("transform","translate(0 "+cur.br+")");
  $("hd").setAttribute("transform","rotate("+(Math.sin(t/900)*1.6)+" 100 140)");
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
$("go").onclick=run;
$("play").onclick=play;
$("slow").onclick=function(){
  speed=speed===1000?1700:1000;
  this.textContent="Velocidad: "+(speed===1000?"normal":"lenta");
  if(timer){stop();play()}
};
vid.ontimeupdate=function(){
  if(!glosas.length||!vid.duration)return;
  var k=Math.min(glosas.length-1,Math.floor(vid.currentTime/vid.duration*glosas.length));
  if(k!==lastK){lastK=k;show(k)}
};
vid.onplay=function(){$("play").textContent="Pausar"};
vid.onpause=function(){$("play").textContent="Reproducir"};
vid.onended=function(){lastK=-1;setPose("")};
$("file").onchange=function(){
  var f=this.files[0];if(!f)return;
  stop();
  vid.src=URL.createObjectURL(f);
  $("vwrap").classList.add("hasvid");
  $("drop").firstChild.textContent="Video: "+f.name+" ";
  $("hint").textContent="Pulsa Traducir a LSC";
};
$("theme").onclick=function(){
  var r=document.documentElement,dark=r.getAttribute("data-theme")==="dark"||(!r.getAttribute("data-theme")&&matchMedia("(prefers-color-scheme:dark)").matches);
  r.setAttribute("data-theme",dark?"light":"dark");
};
})();
