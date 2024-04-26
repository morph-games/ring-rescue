(function(){function Ra(a,b="#b0455a",d=1500){(new Animation(new KeyframeEffect(w.getElementById(a),[{borderColor:b},{borderColor:"#000"}],{duration:d,direction:"alternate",easing:"linear"}),w.timeline)).play()}function F(a,b){for(let d=0;d<a;d+=1)b(d,a)}function K(a,b){return{x:b*Math.cos(a),y:b*Math.sin(a)}}function sa(){return String(Number(new Date))+ta(999)}function za(a,b){return a.rotate(Q/180*b.rx,Q/180*b.ry,Q/180*b.rz)}function Aa(a){const {facing:b}=a;return za(new t(b,void 0,void 0),a)}
function Sa(a,b){let {rx:d,ry:e,rz:f}=a;d+=b.rx;e+=b.ry;f+=b.rz;return{rx:d,ry:e,rz:f}}function W(a,b=0,d=1){return a<b?b:a>d?d:a}function ma(a,b,d){return b+W(a)*(d-b)}function C(a=1,b=0){return b+Math.random()*(a-b)}function ta(a,b=0){return Math.floor(C(a,b))}function na(a,b){const d=w.getElementById(a),e=d||w.createElement("canvas");e.id=a;e.width=e.height=b;d||w.getElementById("loaded").appendChild(e);return[e,e.getContext("2d"),b/2]}function Ta(a,b){const [d,e]=na(a,800);F(1400,()=>{e.rect(b.int(0,
800),b.int(0,800),1,1)});e.fillStyle="#ebd694";e.fill();return d}function X(a=4,b="#f00",d,e=.4,f=600){const [h,m,k]=na(d,f);m.clearRect(0,0,f,f);const l=[],g=Ba/a,n=(r,u)=>{const {x:D,y:x}=K(r,u);l.push([k+D,k+x])};F(a,r=>{n(g*r,k);n(g*r+g/2,k*e)});Y(m,l,b);return h}function Y(a,b,d,e){a.beginPath();"function"===typeof b?b():(a.moveTo(...b[0]),b.forEach(f=>a.lineTo(...f)));d&&(a.fillStyle=d,a.fill());e&&(a.strokeStyle=e[0],a.lineWidth=e[1],a.stroke());a.closePath()}function Ca(a){const [b,d]=na("rabbit"+
a,600);d.beginPath();d.moveTo(10,600);var e=[[10,600],[50,550],[100,520],[270,480],[270,450]];e.forEach(f=>d.lineTo(...f));e.reverse().forEach(([f,h])=>d.lineTo(600-f,h));d.fillStyle="#5796a1";d.fill();d.closePath();e=(f,h,m,k,l=0,g="#eee",n)=>{Y(d,()=>{d.ellipse(f,h,m,k,l,0,Ba)},g,n)};a&&e(300,400,100,160,0,"#8bc7bf");e(300,300,200,70);e(300,350,250,100);e(300,410,200,60);e(150,200,200,40,.4*ha);e(450,200,200,40,.4*-ha);a&&(e(430,320,20,30,0,"#445"),e(170,320,20,30,0,"#445"),e(440,290,16,40,-1.4*
ha,"#ccc"),e(160,290,16,40,1.4*ha,"#ccc"),e(300,350,20,10,0,"#de8b6f"),Y(d,[[300,450],[150,400],[450,400]],"#222"));e(300,320,290,180,0,"#ffffff55",["#8bc7bf",10]);return b}function Da(a,b){const [d,e]=na(`hopArmor${a}${b}`,50);Y(e,[[0,0],[0,50],[50,50],[50,0],[0,0]],a,[b,6]);Y(e,[[10,0],[10,10],[40,10],[40,0]],null,[b,2]);Y(e,[[0,30],[20,30],[20,40],[50,40]],null,[b,2]);return d}function Ua(a){const b=`k${a}`;var d={x:Z(2E3),y:Z(2E3),z:Z(2E3)};a={n:b,...structuredClone(Va),...d,size:5,r:10,isGroup:1};
p.group({n:b,g:"system",...d});const e={g:b,size:2.5,x:-1.5,b:"372b4e"},f={g:b,size:2,b:"471b6e"};p.cube({...e,n:b+"c",rx:45,b:"471b6e"});F(4,h=>{p.cube({...e,n:`${b}cc${h}`,x:-2-h,size:2.5-.5*h})});p.pyramid({n:b+"nose",rz:-90,g:b,size:1.5,b:"90d59c"});d=(h,m)=>p.longRect({...f,n:b+"wing"+h,...m});d(1,{y:2,rx:90,ry:45,rz:-45});d(2,{y:2,x:1.5,rx:90,ry:45,rz:45,b:"471b6e"});d(3,{y:-2,rx:90,ry:45,rz:45});d(4,{y:-2,x:1.5,rx:90,ry:45,rz:-45,b:"471b6e"});p.simpleSphere({n:b+"shield",g:b,size:10,b:"ebd69404"});
oa[a.n]=a}function Wa(a,b,d){p=a;const e=(k,l)=>{k={n:k,rx:0,ry:0,rz:0};l&&(k.g=l);p.group(k)};e("system");"sun ring p1 p2 p3 a1 a2 a3".split(" ").forEach(k=>e(k,"system"));["ship","skybox"].forEach(k=>p.group({n:k}));a={shape:"simpleSphere",b:"775b5b"};[{shape:"sphere",n:"outerSun",g:"sun",size:500,b:"#de8b6f88"},{shape:"sphere",n:"innerSun",g:"sun",size:480,b:"#de8b6f"},{shape:"billboard",n:"sunFlare",g:"sun",size:640,b:"#de8b6f",t:X(16,"#de8b6f88","sun",.7)},{shape:"sphere",n:"planet1",g:"p1",
...K(.5,3E3),size:200,b:"775b5b",s:1},{shape:"sphere",n:"planet2",g:"p2",...K(.7,4E3),size:120,b:"#b0455a",s:1},{shape:"sphere",n:"planet3",g:"p3",...K(2,7E3),size:80,b:"775b5b",s:1},{...a,n:"asteroid1",g:"a1",...K(3,1E3),size:30},{...a,n:"asteroid2",g:"a2",...K(3.5,2E3/1.7),size:35},{...a,n:"asteroid3",g:"a3",...K(5,2E3/1.8),size:40}].forEach(k=>{p[k.shape](k);oa[k.n]=k});a=Ta("sf",Ea);[{z:-b,b:"0000",t:a},{y:-b,rx:-90,b:"0000",t:a},{y:b,rx:90,b:"0000",t:a},{x:-b,ry:90,b:"0000",t:a},{x:b,ry:-90,
b:"0000",t:a},{z:b,rx:180,b:"0000",t:a}].forEach((k,l)=>{p.plane({b:"000",...k,n:`skybox${l}`,g:"skybox",size:2*b})});var f=Da("#8bc7bf","#7bb7af");a=Da("#5796a1","#478691");p.longPyramid({n:"shipBase",g:"ship",size:.18,y:.18,b:"#5796a1",t:a});p.ufo({n:"shipBody",g:"ship",y:-.06,rx:90,size:.39,b:"#5796a1",s:1});p.ufo({n:"sCockpit",g:"ship",y:-.06,rx:90,z:.12,size:.15,b:"666c",s:1});const h={n:"shipComp1",g:"ship",x:-.09,y:-.21,ry:0,rz:-90,size:.12,b:"#5796a1",t:a};p.cube(h);p.cube({...h,n:"shipComp2",
rz:90,x:-h.x});f={n:"shipEngine1",g:"ship",ry:45,rx:90,x:.33,y:-.09,size:.3,b:"#8bc7bf",t:f};p.longerRect(f);p.longerRect({...f,n:"shipEngine2",rz:180,x:-.33});f={n:"shipEngineBack1",g:"ship",x:.33,y:-.3,size:.3/3,b:"#5796a1"};p.longPyramid(f);p.longPyramid({...f,n:"shipEngineBack2",x:-.33});p.plank({n:"sWing1",g:"ship",rx:90,ry:90,x:-0,y:-.09,z:0,size:.03,b:"#5796a1",t:a});a={g:"ship",n:"sFlame1",rx:180,x:.33,y:-.42,size:.078,b:"ebd69400"};p.longPyramid(a);p.longPyramid({...a,n:"sFlame2",x:-.33});
d={g:"ship",y:-.393,rx:70,size:.2,t:d.tf};p.billboard({...d,n:"sIgnite1",x:-.33});p.billboard({...d,n:"sIgnite2",x:.33});p.simpleSphere({n:"sShield",g:"ship",size:1.2,b:"de8b6f00",mode:2,size:.01});F(6,Ua);const m=2*Math.PI;F(32,(k,l)=>{var g=0===k?0:m*k/l;l=180/Q*g;let {x:n,y:r}=K(g,2E3);g=`r${k}`;p.group({n:g,g:"ring"});p.plank({n:`ring${k}`,g,x:n,y:r,rz:l,size:20,b:"#5796a1"});p.cube({n:`ringB${k}`,g,x:n,y:r,rz:l,size:50,b:"478691"})});F(14,k=>{var l="de8b6f 471b6e 524bb3 5796a1 464040 775b5b".split(" ");
l=l[ta(0,l.length)];var g={x:Z(3E3),y:Z(3E3),z:Z(3E3)};k={n:`crate${k}`,passType:"crate",passthru:["crate"],g:"system",...g,vel:{...(new t(void 0,void 0,void 0))},size:20,r:20,b:l,rx:C(0,359),ry:C(0,359),rz:C(0,359),hp:3,drops:["parts"],explodes:{colors:["464040",l],size:2,count:10},p:1};oa[k.n]=k;p.cube(k)});return{ship:Fa,renderables:oa}}function pa(a,{x:b=.5,y:d=.5,z:e=.5}={}){c.add(a,{vertices:[b,d,e,-b,d,e,-b,-d,e,b,d,e,-b,-d,e,b,-d,e,b,d,-e,b,d,e,b,-d,e,b,d,-e,b,-d,e,b,-d,-e,b,d,-e,-b,d,-e,
-b,d,e,b,d,-e,-b,d,e,b,d,e,-b,d,e,-b,d,-e,-b,-d,-e,-b,d,e,-b,-d,-e,-b,-d,e,-b,d,-e,b,d,-e,b,-d,-e,-b,d,-e,b,-d,-e,-b,-d,-e,b,-d,e,-b,-d,e,-b,-d,-e,b,-d,e,-b,-d,-e,b,-d,-e],uv:[1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0]})}function Ga(a,{x:b=.5,y:d=.5,z:e=.5}={}){c.add(a,{vertices:[-b,-d,e,b,-d,e,0,d,0,b,-d,e,b,-d,-e,0,d,0,b,-d,-e,-b,-d,-e,0,d,0,-b,-d,-e,-b,-d,e,0,d,0,b,-d,e,-b,-d,e,-b,-d,-e,b,-d,e,
-b,-d,-e,b,-d,-e],uv:[0,0,1,0,.5,1,0,0,1,0,.5,1,0,0,1,0,.5,1,0,0,1,0,.5,1,1,1,0,1,0,0,1,1,0,0,1,0]})}function ua(a,{x:b=2,y:d=2,z:e=2,precision:f=20,i:h,ai:m,j:k,aj:l,p1:g,p2:n,vertices:r=[],indices:u=[],uv:D=[]}={}){const {PI:x,sin:y,cos:z}=Math;for(k=0;k<=f;k++)for(l=k*x/f,h=0;h<=f;h++)m=2*h*x/f,r.push(+(y(m)*y(l)/b).toFixed(6),+(z(l)/d).toFixed(6),+(z(m)*y(l)/e).toFixed(6)),D.push(3.5*y(h/f),-y(k/f)),h<f&&k<f&&u.push(g=k*(f+1)+h,n=g+(f+1),g+1,g+1,n,n+1);c.add(a,{vertices:r,uv:D,indices:u})}function R(...a){return Xa.play(...a)}
function L(a){if(void 0!==a){if(S[a].done)return;S[a].done=1}a=q.ogKlaxShipCount-q.klaxShipLeft;0>=q.klaxShipLeft&&(S[6].done=1);7<=(ship.inv.parts||0)&&(S[7].done=1);Ya(a);S.length===S.filter(b=>b.done).length&&Ha("You did it! With those parts we should be able to get the Ring powered up again.<p>Thank you!</p><p>(Refresh page to play again.)")}function Ya(a){const b=S.map(({t:d,done:e})=>`<li class="${e?"done":""}">${d.replace("{K}",a).replace("{S}",q.ogKlaxShipCount).replace("{P}",ship.inv.parts||
0).replace("{M}",7)}</li>`).join("");w.getElementById("goals").innerHTML=b}function Za(){q.paused=1;c.camera({x:0,y:0,z:0,rx:-13});w.getElementById("hi").style.display="flex";q.nextEnter=()=>{w.getElementById("hi").style.display="none";return Ha("<p>A Star-Hopper ship! You heard our distress call? \ud83d\udce1 We're under attack by a Klaxonian fleet!\n\t\tThey've disabled our defenses and solar farms.</p><p>The entire sector is dependent on the POWER generated by our Bunson Ring. \u26a1Please rescue us and help get the Ring operational again.</p>")}}
function $a(a){const b=a.clientWidth,d=a.clientHeight;b>d?(A.aspect=b/d,a.height=ia(b,800),a.width=b/A.aspect):(a.width=a.height=ia(b,800),A.aspect=1)}function Ha(a){R(...[2.36,0,130.8128,.02,.51,.2,,1.91,,,,,.08,,,,.04,.5,,.39]);q.paused=1;const b=w.getElementById("dialog").classList,d=w.getElementById("goals").style;d.opacity="0";G.unlock();Ia("pic",`<img src="${ja.rabbit.toDataURL()}" />`);Ia("txt",a+'<i data-key="Enter">Close [Enter]</i>');b.add("show");c.camera({x:0,y:100,z:0,a:200},500);c.move({n:"system",
x:1E3,y:-500,z:-2500,a:2E3},500);return q.nextEnter=()=>{R(...[.5,,259,.02,.02,.01,2,.19,,,-48,.01,,,3.4,.8,,.13,.01]);d.opacity="1";b.remove("show");q.paused=0;w.querySelector("main").classList.remove("ui--off")}}function ab(){var a=w.getElementById("canvas");$a(a);G.setup({lockElt:a,keys:{Tab:()=>{L(0);G.toggleLock()},p:()=>{q.paused=!q.paused},t:()=>{q.trail=!q.trail},Enter:()=>{q.nextEnter&&(q.nextEnter=q.nextEnter())}}});ja={tf:X(9,"#ebd694","tf",.3),plasma:X(11,"#de8b6f","plasma",.2),photon:X(13,
"#b0455a","photon",.5),klaxPlasma:X(15,"#90d59c","klaxPlasma",.3),rabbit:Ca(1),pilot:Ca(0),scan:X(8,"#90d59c","scan",1)};a.addEventListener("click",()=>{G.lock()});c.reset(a);c.clearColor("2a242b");c.light({x:-1,y:-1.2,z:.2});c.ambient(.8);pa("plank",{y:10,z:5,x:.3});pa("longRect",{x:.2,y:.2});pa("longerRect",{x:.2,y:.2,z:.7});pa("cube");Ga("pyramid");Ga("longPyramid",{y:.8});ua("sphere");ua("simpleSphere",{precision:6});ua("ufo",{y:3,precision:10});va=Wa(c,15E3,ja);["renderables","ship"].forEach(b=>
{window[b]=va[b];q[b]=va[b]});a=Object.entries(renderables).filter(([,b])=>b.isKlax);a.forEach(([,b],d)=>{b.isKlax&&(d=`scan${d}`,b={n:d,g:"system",x:b.x,y:b.y,z:b.z,size:120,t:ja.scan},renderables[d]=b,c.billboard(b))});q.ogKlaxShipCount=q.klaxShipLeft=a.length;L()}function Ja(a,b=0){const {x:d,y:e,z:f}=Aa(a).scale(b);a.thrust={x:d,y:e,z:f}}function Ka(a){return 0<["x","y","z"].filter(b=>15E3<=a[b]||-15E3>=a[b]).length}function bb(a,b){var {friction:d=1}=a;d*=.25;Ka(a)&&(d*=10);const e=new t(a.vel,
void 0,void 0),f=(new t(a.thrust||void 0,void 0,void 0)).scale(1/(a.mass||1));a.vel=e.sub(e.normalize(d)).add(f.scale(1/b));d=a.vel.length();800<d?a.vel=a.vel.normalize(800):1E-4>d&&(a.vel=new t(void 0,void 0,void 0));["x","y","z"].forEach(h=>{a[h]=W(a[h]+a.vel[h]*b,-15E3,15E3);Ka(a)&&a.decay&&(a.decay=0)})}function La(a,b){if(a.damage&&b.hp){const d=b===ship,e=W(b.shields/100,0,1);b.hp-=a.damage*(1-e);a.destroyOnDamage&&(a.decay=0);0>=b.hp?(b.decay=0,b.drops&&b.drops.forEach(f=>ship.inv[f]=(ship.inv[f]||
0)+1),b.explodes&&qa(b,b.explodes)):qa({x:b.x,y:b.y,z:b.z},{count:8});R(...[d?1.5:.7,,416,.02,.21,.52,4,2.14,.2,,,,,1.7,,.9,,.44,.12,.23]);d&&Ra("canvas")}a.aggro+=1;b.aggro+=1}function cb(a,b,d){a.collided=b;b.collided=a;La(a,b);La(b,a);d=(new t(b,void 0,void 0)).sub(a).normalize().scale((a.r+b.r-d)/2);(new t(a,void 0,void 0)).sub(d).copyTo(a);(new t(b,void 0,void 0)).add(d).copyTo(b);["x","y","z"].forEach(e=>{const f=a.mass||1,h=b.mass||1,m=f+h,k=a.vel[e],l=b.vel[e];a.vel[e]=(f-h)/m*k+2*h/m*l;b.vel[e]=
2*f/m*k+(h-f)/m*l})}function db(a,b){a.collided||1!==a.p||F(b.length,d=>{d=b[d];if(!(1!==a.p||1!==d.p||a.passthru&&a.passthru.includes(d.passType)||1!==d.p||1!==a.p||d.passthru&&d.passthru.includes(a.passType)||a===d||d.collided)){var e=(new t(a,void 0,void 0)).distance(d);e<=a.r+d.r&&cb(a,d,e)}})}function Ma(a,b,d=0){const {steerPercent:e=.01}=a;["rx","ry","rz"].forEach(f=>a[f]=ma(e,a[f],b[f]));d&&(a.ry=ma(.1,a.ry,b.ry+d))}function Na(a,b,d,e){const {vScale:f,tScale:h,damage:m,size:k,sound:l}=eb[a],
g=ja[a],n=Aa(b),{x:r,y:u,z:D}=(new t(b,void 0,void 0)).add(n.normalize(b.size));b=n.scale(f).add(b.vel);R(...l);a={n:a+d+sa(),g:"system",passType:d,x:r,y:u,z:D,vel:{...b},thrust:{...n.scale(h)},decay:5,damage:m,r:5,passthru:e,mass:.01,size:k,destroyOnDamage:1,p:1};renderables[a.n]=a;c.billboard({...a,t:g})}function qa(a,b){let {x:d,y:e,z:f}=a;const {count:h=20,size:m=2,colors:k=["464040","de8b6f","b0455a"],maxDecay:l=10}=b||a.explodes||{};F(h,()=>{const g=fb(a.vel||{x:0,y:0,z:0});["x","y","z"].forEach(r=>
{g[r]+=C(-20,20)});const n={n:`explosion${sa()}`,x:d+C(-.5,.5),y:e+C(-.5,.5),z:f+C(-.5,.5),vel:g,decay:C(1,l),r:1,g:"system",size:I(m+C(-m/2,m/2),.2),passType:"dust",passthru:["dust"],mass:.01,b:k[ta(0,k.length)],destroyOnDamage:1,p:2};renderables[n.n]=n;c.billboard({...n})})}function gb(a,b){if(a.trailCooldown)a.trailCooldown=I(a.trailCooldown-b,0);else if(ship.trailCooldown=.1,0!==(new t(a.vel,void 0,void 0)).length()){var {x:d,y:e,z:f}=a;a={n:`${a.n}trail${sa()}`,x:d,y:e,z:f,decay:10,g:"system",
size:C(.1,.3),b:"7666"};renderables[a.n]=a;c.billboard({...a})}}function ra(a,b){let d="";F(Math.floor(a/b*10),()=>d+="-");return d}function hb(){var a=new t(ship.vel,void 0,void 0),b=a.x>a.y&&a.x>a.z?"X":a.y>a.x&&a.y>a.z?"Y":"Z";a=a.length();b=(q.paused?"<b>Paused</b>":"")+"<b>"+[`Velocity: ${ib(a)} (${b}) ${ra(a,800)}`,`Power: ${wa(ship.power)} ${ra(ship.power,ship.maxPower)}`,`Shields: ${wa(ship.shields)} ${ra(ship.shields,100)}`,`Hull: ${wa(10*ship.hp)/10} ${ra(ship.hp,ship.maxHp)}`].join("</b><b>")+
"</b>";w.getElementById("si").innerHTML=b}function Oa(){R(...[.5,,144,.01,.04,.17,1,.77,,,-119,.09,,,31,.1,,.84,.03,.06])}function Pa(){if(!q.paused){q.tick++;1E5<q.tick&&(q.tick=0);var a=aa/1E3,{down:b}=G;b["]"]&&(A.targetFov+=.5);b["["]&&(A.targetFov-=.5);var d=G.getWheel();if(b["-"]||0<d)M.zoom=W(M.zoom+.1,0,100);if(b["="]||b["+"]||0>d)M.zoom=W(M.zoom+-.1,0,100);if(!b.p){var e=b.a?90:b.d?-90:0;d=b.Shift?2:1;var f=0;1<d&&L(4);0>=ship.power||(b.s?(f=ship.thrustForce*d*-.5,b.w=0):b.w&&(f=ship.thrustForce*
d));Ja(ship,f);var h=0<f?"ebd694dd":"ebd69400";c.move({n:"sFlame1",b:h});c.move({n:"sFlame2",b:h});ship.ignition=ma(.2,ship.ignition,f?ship.ignitionSize:1E-4);c.move({n:"sIgnite1",size:ship.ignition,y:.3*(0>f?.6:-1.31)});c.move({n:"sIgnite2",size:ship.ignition,y:.3*(0>f?.6:-1.31)});f&&(ship.power-=ship.enginePowerUsage,R(...[1<d?.15:.1,,794,.02,.3,.32,,3.96,,.7,,,.16,2.1,,1<d?.2:.8,.1,.31,.27]),L(2));h=G.getClick();0===ship.fireCooldown&&(b.f||b.r||h&&h.locked)&&(L(3),ship.power<ship.weaponPowerUsage?
Oa():(ship.power-=ship.weaponPowerUsage,Na(h&&h.right||b.r?"photon":"plasma",ship,"plasma",["ship","plasma","klaxPlasma"]),ship.fireCooldown=.3));b[" "]&&(12<ship.power?(h=ia(ship.power,ship.shieldPower-ship.shields),ship.shields+=h,ship.power-=h,R(...[.4,,99,,.23,.12,3,1.07,,5,,,.06,,,1,,.7,.24,.32]),L(5)):Oa());b.y&&qa(ship,ship.explodes);b.c&&L(1);var m=[ship],k=[];Object.entries(renderables).forEach(([,g])=>{g.p&&m.push(g);g.isKlax&&k.push(g)});q.klaxShipLeft=k.length;k.forEach((g,n)=>{if(!(0>=
g.decay||0>=g.hp)){var r=new t(g,void 0,void 0),u=r.distance(ship);u>2*g.sight?g.aggro=I(0,g.aggro-=.1):u<=g.sight&&(g.aggro=I(1,g.aggro));g.aggro&&(r=r.toWAngles(ship),Ma(g,r),g.thrustCooldown?g.thrustCooldown=I(g.thrustCooldown-a,0):(Ja(g,g.thrustForce),g.thrustCooldown=C(.5,1)),g.fireCooldown?g.fireCooldown=I(g.fireCooldown-a,0):(Na("klaxPlasma",g,"klaxPlasma",["klaxShip","klaxPlasma","plasma"]),g.fireCooldown=C(.3,3)))}renderables[`scan${n}`]={...renderables[`scan${n}`],...(b.c&&0<g.hp?{x:g.x,
y:g.y,z:g.z,size:110,b:"90d59c"}:{size:.1,b:"0000"})}});F(m.length,g=>db(m[g],m));m.forEach(g=>{g.collided=0;bb(g,a)});ship.fireCooldown=I(ship.fireCooldown-a,0);ship.power=ia(ship.maxPower,ship.power+ship.recharge);ship.shields=I(0,ship.shields-ship.shieldsDecayAmount);0>=ship.hp&&(ship.size=.01,qa(ship),(async()=>{await xa(1500);q.paused=1;G.unlock();w.querySelector("main").classList.add("end");w.getElementById("end").style.display="flex"})());h=G.getLockMove();T.ry-=h.x/10;T.rx=ia(I(T.rx-h.y/10,
-180),0);Ma(ship,T,e);e=za((new t(0,M.back,M.up)).scale(M.zoom),T);A.fov=ma(.1,A.fov,A.targetFov+(f?0>f?-2:1<d?10:1:0));d=.001<jb(A.fov-A.lastFov);A.lastFov=A.fov;f={...e,...Sa(M,T),a:aa};d&&(f={...f,...A});c.camera(f);q.trail&&gb(ship,a);Object.keys(renderables).forEach(g=>{const n=renderables[g];"number"===typeof n.decay&&(n.decay-=a,0>=n.decay&&(n.isGroup?c.move({n:n.n,x:6E4}):c.delete(n.n),delete renderables[g],L()))});d=W(ship.shields,10,99);c.move({n:"sShield",b:`de8b6f${d}`,size:ship.shields?
1.2:.01,a:100});d={...ship,x:0,y:0,z:0};f={...renderables};e={x:-ship.x,y:-ship.y,z:-ship.z,a:aa};H+=aa/90;var l={ship:d,...f,system:e,innerSun:{rx:H,ry:.9*H},p1:{rz:.1*H},p2:{rz:.15*H},p3:{rz:.05*H},ring:{rz:.5*H},a1:{rz:.7*H},a2:{rz:.6*H},a3:{rz:.5*H}};Object.keys(l).forEach(g=>{c.move({n:g,...l[g],a:aa},0)});0===q.tick%4&&hb()}}}let N,c={models:{},reset:a=>{c.canvas=a;c.objs=0;c.current={};c.next={};c.textures={};c.gl=a.getContext("webgl2");c.gl.blendFunc(770,771);c.gl.activeTexture(33984);c.program=
c.gl.createProgram();c.gl.enable(2884);c.gl.shaderSource(N=c.gl.createShader(35633),"#version 300 es\n      precision highp float;\n      in vec4 pos, col, uv, normal;\n      uniform mat4 pv, eye, m, im;\n      uniform vec4 bb;\n      out vec4 v_pos, v_col, v_uv, v_normal;\n      void main() {\n        gl_Position = pv * (v_pos = bb.z > 0. ? m[3] + eye * (pos * bb) : m * pos);                                          \n        v_col = col;\n        v_uv = uv;\n        v_normal = transpose(inverse(m)) * normal;\n      }");
c.gl.compileShader(N);c.gl.attachShader(c.program,N);console.log("vertex shader:",c.gl.getShaderInfoLog(N)||"OK");c.gl.shaderSource(N=c.gl.createShader(35632),"#version 300 es\n      precision highp float;\n      in vec4 v_pos, v_col, v_uv, v_normal;\n      uniform vec3 light;\n      uniform vec4 o;\n      uniform sampler2D sampler;\n      out vec4 c;\n      void main() {\n        c = mix(texture(sampler, v_uv.xy), v_col, o[3]);\n        if(o[1] > 0.){\n          c = vec4(c.rgb * (max(0., dot(light, -normalize(o[0] > 0. ? vec3(v_normal.xyz) : cross(dFdx(v_pos.xyz), dFdy(v_pos.xyz)))))\n            + o[2]),\n            c.a\n          );\n        }\n      }");
c.gl.compileShader(N);c.gl.attachShader(c.program,N);console.log("fragment shader:",c.gl.getShaderInfoLog(N)||"OK");c.gl.linkProgram(c.program);c.gl.useProgram(c.program);console.log("program:",c.gl.getProgramInfoLog(c.program)||"OK");c.gl.clearColor(1,1,1,1);c.clearColor=b=>c.gl.clearColor(...c.col(b));c.clearColor("fff");c.gl.enable(2929);c.light({y:-1});c.camera({fov:30});setTimeout(c.draw,16)},setState:(a,b,d)=>{var e;(e=a).n||(e.n="o"+c.objs++);a.size&&(a.w=a.h=a.d=a.size);a.t&&a.t.width&&!c.textures[a.t.id]&&
(d=c.gl.createTexture(),c.gl.pixelStorei(37441,!0),c.gl.bindTexture(3553,d),c.gl.pixelStorei(37440,1),c.gl.texImage2D(3553,0,6408,6408,5121,a.t),c.gl.generateMipmap(3553),c.textures[a.t.id]=d);if(a.fov){const {near:l=1,far:g=1E3,fov:n,aspect:r=canvas.width/canvas.height}=a;d=1/Math.tan(n*Math.PI/180);e=1/(l-g);c.projection=new DOMMatrix([d/r,0,0,0,0,d,0,0,0,0,(g+l)*e,-1,0,0,2*l*g*e,0])}a={type:b,...(c.current[a.n]=c.next[a.n]||{w:1,h:1,d:1,x:0,y:0,z:0,rx:0,ry:0,rz:0,b:"888",mode:4,mix:0}),...a,f:0};
let f,h;null==(f=c.models[a.type])||!f.vertices||null!=(h=c.models)&&h[a.type].verticesBuffer||(c.gl.bindBuffer(34962,c.models[a.type].verticesBuffer=c.gl.createBuffer()),c.gl.bufferData(34962,new Float32Array(c.models[a.type].vertices),35044),!c.models[a.type].normals&&c.smooth&&c.smooth(a),c.models[a.type].normals&&(c.gl.bindBuffer(34962,c.models[a.type].normalsBuffer=c.gl.createBuffer()),c.gl.bufferData(34962,new Float32Array(c.models[a.type].normals.flat()),35044)));let m;(null==(m=c.models[a.type])?
0:m.uv)&&!c.models[a.type].uvBuffer&&(c.gl.bindBuffer(34962,c.models[a.type].uvBuffer=c.gl.createBuffer()),c.gl.bufferData(34962,new Float32Array(c.models[a.type].uv),35044));let k;(null==(k=c.models[a.type])?0:k.indices)&&!c.models[a.type].indicesBuffer&&(c.gl.bindBuffer(34963,c.models[a.type].indicesBuffer=c.gl.createBuffer()),c.gl.bufferData(34963,new Uint16Array(c.models[a.type].indices),35044));a.t?a.t&&!a.mix&&(a.mix=0):a.mix=1;c.next[a.n]=a},draw:(a,b,d,e,f=[])=>{b=a-c.lastFrame;c.lastFrame=
a;requestAnimationFrame(c.draw);c.next.camera.g&&c.render(c.next[c.next.camera.g],b,1);d=c.animation("camera");let h,m;(null==(h=c.next)?0:null==(m=h.camera)?0:m.g)&&d.preMultiplySelf(c.next[c.next.camera.g].M||c.next[c.next.camera.g].m);c.gl.uniformMatrix4fv(c.gl.getUniformLocation(c.program,"eye"),!1,d.toFloat32Array());d.invertSelf();d.preMultiplySelf(c.projection);c.gl.uniformMatrix4fv(c.gl.getUniformLocation(c.program,"pv"),!1,d.toFloat32Array());c.gl.clear(16640);for(e in c.next)c.next[e].t||
1!=c.col(c.next[e].b)[3]?f.push(c.next[e]):c.render(c.next[e],b);f.sort((k,l)=>c.dist(l)-c.dist(k));c.gl.enable(3042);for(e of f)["plane","billboard"].includes(e.type)&&c.gl.depthMask(0),c.render(e,b),c.gl.depthMask(1);c.gl.disable(3042);c.gl.uniform3f(c.gl.getUniformLocation(c.program,"light"),c.lerp("light","x"),c.lerp("light","y"),c.lerp("light","z"))},render:(a,b,d=["camera","light","group"].includes(a.type),e)=>{a.t&&(c.gl.bindTexture(3553,c.textures[a.t.id]),c.gl.uniform1i(c.gl.getUniformLocation(c.program,
"sampler"),0));a.f<a.a&&(a.f+=b);a.f>a.a&&(a.f=a.a);c.next[a.n].m=c.animation(a.n);c.next[a.g]&&c.next[a.n].m.preMultiplySelf(c.next[a.g].M||c.next[a.g].m);c.gl.uniformMatrix4fv(c.gl.getUniformLocation(c.program,"m"),!1,(c.next[a.n].M||c.next[a.n].m).toFloat32Array());c.gl.uniformMatrix4fv(c.gl.getUniformLocation(c.program,"im"),!1,(new DOMMatrix(c.next[a.n].M||c.next[a.n].m)).invertSelf().toFloat32Array());d||(c.gl.bindBuffer(34962,c.models[a.type].verticesBuffer),c.gl.vertexAttribPointer(e=c.gl.getAttribLocation(c.program,
"pos"),3,5126,!1,0,0),c.gl.enableVertexAttribArray(e),c.models[a.type].uvBuffer&&(c.gl.bindBuffer(34962,c.models[a.type].uvBuffer),c.gl.vertexAttribPointer(e=c.gl.getAttribLocation(c.program,"uv"),2,5126,!1,0,0),c.gl.enableVertexAttribArray(e)),(a.s||c.models[a.type].customNormals)&&c.models[a.type].normalsBuffer&&(c.gl.bindBuffer(34962,c.models[a.type].normalsBuffer),c.gl.vertexAttribPointer(e=c.gl.getAttribLocation(c.program,"normal"),3,5126,!1,0,0),c.gl.enableVertexAttribArray(e)),c.gl.uniform4f(c.gl.getUniformLocation(c.program,
"o"),a.s,(3<a.mode||3<c.gl[a.mode])&&!a.ns?1:0,c.ambientLight||.2,a.mix),c.gl.uniform4f(c.gl.getUniformLocation(c.program,"bb"),a.w,a.h,"billboard"==a.type,0),c.models[a.type].indicesBuffer&&c.gl.bindBuffer(34963,c.models[a.type].indicesBuffer),c.gl.vertexAttrib4fv(c.gl.getAttribLocation(c.program,"col"),c.col(a.b)),c.models[a.type].indicesBuffer?c.gl.drawElements(+a.mode||c.gl[a.mode],c.models[a.type].indices.length,5123,0):c.gl.drawArrays(+a.mode||c.gl[a.mode],0,c.models[a.type].vertices.length/
3))},lerp:(a,b)=>{let d;return(null==(d=c.next[a])?0:d.a)?c.current[a][b]+c.next[a].f/c.next[a].a*(c.next[a][b]-c.current[a][b]):c.next[a][b]},animation:(a,b=new DOMMatrix)=>c.next[a]?b.translateSelf(c.lerp(a,"x"),c.lerp(a,"y"),c.lerp(a,"z")).rotateSelf(c.lerp(a,"rx"),c.lerp(a,"ry"),c.lerp(a,"rz")).scaleSelf(c.lerp(a,"w"),c.lerp(a,"h"),c.lerp(a,"d")):b,dist:(a,b=c.next.camera)=>(null==a?0:a.m)&&(null==b?0:b.m)?(b.m.m41-a.m.m41)**2+(b.m.m42-a.m.m42)**2+(b.m.m43-a.m.m43)**2:0,ambient:a=>c.ambientLight=
a,col:a=>[...a.replace("#","").match(5>a.length?/./g:/../g).map(b=>("0x"+b)/(5>a.length?15:255)),1],add:(a,b)=>{c.models[a]=b;b.normals&&(c.models[a].customNormals=1);c[a]=d=>c.setState(d,a)},group:a=>c.setState(a,"group"),move:(a,b)=>setTimeout(()=>{c.setState(a)},b||1),delete:(a,b)=>setTimeout(()=>{delete c.next[a]},b||1),camera:(a,b)=>setTimeout(()=>{c.setState(a,a.n="camera")},b||1),light:(a,b)=>b?setTimeout(()=>{c.setState(a,a.n="light")},b):c.setState(a,a.n="light"),smooth:(a,b={},d=[],e,f,
h,m,k,l,g,n,r,u,D,x,y)=>{c.models[a.type].normals=[];for(h=0;h<c.models[a.type].vertices.length;h+=3)d.push(c.models[a.type].vertices.slice(h,h+3));(e=c.models[a.type].indices)?f=1:(e=d,f=0);for(h=0;h<2*e.length;h+=3){m=h%e.length;k=d[n=f?c.models[a.type].indices[m]:m];l=d[r=f?c.models[a.type].indices[m+1]:m+1];g=d[u=f?c.models[a.type].indices[m+2]:m+2];x=[l[0]-k[0],l[1]-k[1],l[2]-k[2]];y=[g[0]-l[0],g[1]-l[1],g[2]-l[2]];D=h>m?[0,0,0]:[x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]];let z,
ba;(z=b)[ba=k[0]+"_"+k[1]+"_"+k[2]]||(z[ba]=[0,0,0]);let O,ka;(O=b)[ka=l[0]+"_"+l[1]+"_"+l[2]]||(O[ka]=[0,0,0]);let E,v;(E=b)[v=g[0]+"_"+g[1]+"_"+g[2]]||(E[v]=[0,0,0]);c.models[a.type].normals[n]=b[k[0]+"_"+k[1]+"_"+k[2]]=b[k[0]+"_"+k[1]+"_"+k[2]].map((U,J)=>U+D[J]);c.models[a.type].normals[r]=b[l[0]+"_"+l[1]+"_"+l[2]]=b[l[0]+"_"+l[1]+"_"+l[2]].map((U,J)=>U+D[J]);c.models[a.type].normals[u]=b[g[0]+"_"+g[1]+"_"+g[2]]=b[g[0]+"_"+g[1]+"_"+g[2]].map((U,J)=>U+D[J])}}};c.add("plane",{vertices:[.5,.5,0,
-.5,.5,0,-.5,-.5,0,.5,.5,0,-.5,-.5,0,.5,-.5,0],uv:[1,1,0,1,0,0,1,1,0,0,1,0]});c.add("billboard",c.models.plane);const ca=window.document;var G={lockMove:{x:0,y:0},move:{x:0,y:0},wheel:0,click:null,lockElt:null,down:{},isLocked:()=>!!ca.pointerLockElement,async lock(){ca.pointerLockElement||await this.lockElt.requestPointerLock()},async toggleLock(){ca.pointerLockElement?await this.unlock():await this.lock()},async unlock(){await ca.exitPointerLock()},getLockMove(){const a={...this.lockMove};this.lockMove.x=
0;this.lockMove.y=0;return a},getWheel(){const a=this.wheel;this.wheel=0;return a},getClick(){const a=this.click;this.click=null;return a},setup(a={}){this.lockElt=a.lockElt;onmousemove=e=>{const f=this[ca.pointerLockElement?"lockMove":"move"];f.x+=e.movementX;f.y+=e.movementY};const b=e=>1===e.key.length?e.key.toLowerCase():e.key;onkeydown=e=>{const f=b(e);this.down[f]=!0;!e.repeat&&a.keys&&a.keys[f]&&(a.keys[f](),e.preventDefault())};onkeyup=e=>{this.down[b(e)]=!1};onwheel=e=>{this.wheel+=e.deltaY};
const d=e=>{const {clientX:f,clientY:h,button:m}=e;({key:e}=e.target.dataset);if(e&&a.keys&&a.keys[e])a.keys[e]();this.click={clientX:f,clientY:h,button:m,left:0===m,right:2===m,locked:!!ca.pointerLockElement}};oncontextmenu=onclick=d}};const w=document,Ia=(a,b)=>w.getElementById(a).innerHTML=b,fb=(a,b,d)=>new t(a,b,d),{sin:da,cos:ea,atan2:ya,PI:Q,sqrt:Qa}=Math;class t{constructor(a=0,b=0,d=0){"object"===typeof a&&(b=a.y,d=a.z,a=a.x);this.x=a;this.y=b;this.z=d}copy(){return new t(this.x,this.y,this.z)}copyTo(a){a.x=
this.x;a.y=this.y;a.z=this.z}add(a){return new t(this.x+a.x,this.y+a.y,this.z+a.z)}sub(a){return new t(this.x-a.x,this.y-a.y,this.z-a.z)}length(){return this.lengthSquared()**.5}lengthSquared(){return this.x**2+this.y**2+this.z**2}distance(a){return this.distanceSquared(a)**.5}distanceSquared(a){return(this.x-a.x)**2+(this.y-a.y)**2+(this.z-a.z)**2}normalize(a=1){const b=this.length();return b?this.scale(a/b):new t(0,a,0)}scale(a){return new t(this.x*a,this.y*a,this.z*a)}cross(a){const {x:b,y:d,z:e}=
this;return new t(d*a.z-e*a.y,e*a.x-b*a.z,b*a.y-d*a.x)}rotate(a,b,d){return this.rotateX(a).rotateY(b).rotateZ(d)}rotateX(a=0){var b=this.x,d=this.y*ea(a)-this.z*da(a);a=this.y*da(a)+this.z*ea(a);return new t(b,d,a)}rotateY(a=0){var b=this.x*ea(a)+this.z*da(a),d=this.y;a=-this.x*da(a)+this.z*ea(a);return new t(b,d,a)}rotateZ(a=0){var b=this.x*ea(a)-this.y*da(a);a=this.x*da(a)+this.y*ea(a);return new t(b,a,this.z)}toAngles(a){let {x:b,y:d,z:e}=this;a&&(b=a.x-b,d=a.y-d,e=a.z-e);a=ya(d,b);const f=ya(-e,
Qa(b*b+d*d));var h=0;if(0!==b||0!==d)h=Qa(b*b+d*d),h=ya(e,h);return{roll:h,pitch:f,yaw:a}}toWAngles(a){const {roll:b,pitch:d,yaw:e}=this.toAngles(a);return{rx:180/Q*b,ry:180/Q*d,rz:180/Q*e}}}const {PI:ha}=Math,Ba=2*ha,xa=a=>new Promise(b=>setTimeout(b,a));class kb{constructor(a){this.seed=a}rand(a=1,b=0){this.seed^=this.seed<<13;this.seed^=this.seed>>>17;this.seed^=this.seed<<5;return b+(a-b)*Math.abs(this.seed%1E9)/1E9}int(a,b=0){return Math.floor(this.rand(a,b))}sign(){return 2*this.randInt(2)-
1}}let p,H=0;const Ea=new kb(1234),Z=(a=15E3)=>Ea.rand(-a,a),Fa={x:0,y:0,z:7500,rx:-90,ry:0,rz:0,vel:{x:0,y:0,z:0},thrust:{x:0,y:0,z:0},thrustForce:.06,fireCooldown:0,r:2,passType:"ship",passthru:["plasma"],sight:1500,aggro:0,thrustCooldown:0,trailCooldown:0,hp:9,maxHp:9,power:100,maxPower:100,recharge:.2,weaponPowerUsage:6,shieldPower:100,enginePowerUsage:.4,shields:0,shieldsDecayAmount:.4,p:1,ignition:0,ignitionSize:.2,facing:{x:0,y:1,z:0},inv:{parts:0},steerPercent:.05,explodes:{colors:["464040",
"5796a1"],size:1,count:16}},Va={...structuredClone(Fa),thrustForce:.008,hp:5,passType:"klaxShip",passthru:["klaxPlasma"],facing:{x:1,y:0,z:0},drops:["parts"],explodes:{colors:["464040","702782"],size:5,count:16},isKlax:1},oa={},Xa={volume:.3,sampleRate:44100,x:new AudioContext,play:function(...a){return this.playSamples(this.buildSamples(...a))},playSamples:function(...a){const b=this.x.createBuffer(a.length,a[0].length,this.sampleRate),d=this.x.createBufferSource();a.map((e,f)=>b.getChannelData(f).set(e));
d.buffer=b;d.connect(this.x.destination);d.start();return d},buildSamples:function(a=1,b=.05,d=220,e=0,f=0,h=.1,m=0,k=1,l=0,g=0,n=0,r=0,u=0,D=0,x=0,y=0,z=0,ba=1,O=0,ka=0){let E=2*Math.PI;var v=this.sampleRate;let U=l*=500*E/v/v;b=d*=(1+2*b*Math.random()-b)*E/v;let J=[],V=0,lb=0,B=0,la=1,mb=0,nb=0,P=0,fa;e=e*v+9;O*=v;f*=v;h*=v;z*=v;g*=500*E/v**3;x*=E/v;n*=E/v;r*=v;u=u*v|0;for(fa=e+O+f+h+z|0;B<fa;J[B++]=P)++nb%(100*y|0)||(P=m?1<m?2<m?3<m?Math.sin((V%E)**3):Math.max(Math.min(Math.tan(V),1),-1):1-(2*
V/E%2+2)%2:1-4*Math.abs(Math.round(V/E)-V/E):Math.sin(V),P=(u?1-ka+ka*Math.sin(E*B/u):1)*(0<P?1:-1)*Math.abs(P)**k*a*this.volume*(B<e?B/e:B<e+O?1-(B-e)/O*(1-ba):B<e+O+f?ba:B<fa-z?(fa-B-z)/h*ba:0),P=z?P/2+(z>B?0:(B<fa-z?1:(fa-B)/z)*J[B-z|0]/2):P),v=(d+=l+=g)*Math.cos(x*lb++),V+=v-v*D*(1-1E9*(Math.sin(B)+1)%2),la&&++la>r&&(d+=n,b+=n,la=0),!u||++mb%u||(d=b,l=U,la=la||1);return J},getNote:function(a=0,b=440){return b*2**(a/12)}},{min:ia,max:I,round:ib,abs:jb,floor:wa}=Math,q={W:c,input:G,paused:0,trail:0,
nextEnter:0,ogKlaxShipCount:0,klaxShipLeft:0,start(){this.i=setInterval(Pa,aa)},stop(){clearInterval(this.i)},tick:0};let va,ja={};const aa=1E3/60,M={back:-1.5,up:.6,rx:80,ry:0,rz:0,zoom:1},A={fov:30,targetFov:30,lastFov:31,aspect:1,near:.5,far:3E4},T={rx:-90,ry:0,rz:0},S="Check steering: [Tab] to toggle mouse-lock;Scan: Hold [C];Thrusters: [W] and [S];Fire weapons: [Click], [F], or [R];Boost: Hold [Shift] with [W] or [S];Shields: [Space];Klaxonian Ships Destroyed: {K} / {S};Ring Repair Parts: {P} / {M}".split(";").map(a=>
({t:a,done:0})),eb={plasma:{vScale:45,tScale:.004,damage:1,size:2,sound:[,.1,295,.02,.01,.08,,1.72,-3.5,.2,,,,.2,,,.08,.62,.09]},photon:{vScale:25,tScale:.0012,damage:3,size:2,sound:[2.06,.35,212,.05,.08,.01,,1.66,-4.8,.2,50,,,1.7,,.5,.28,.65,.02]},klaxPlasma:{vScale:45,tScale:.002,damage:1,size:10,sound:[.3,.4,241,.04,.03,.08,,.46,-7.7,,,,,,,.2,,.53,.05,.2]}};addEventListener("DOMContentLoaded",async()=>{ab();await xa(30);Pa();await xa(30);Za();q.start()});window.g=q})();
