!function(){function c(t,r){for(let e=0;e<t;e+=1)r(e,t)}function d(e,t){return{x:t*Math.cos(e),y:t*Math.sin(e)}}function O(e,t){return e.rotate(b/180*t.rx,b/180*t.ry,b/180*t.rz)}function W(e){var t=e["facing"];return O(new z(t,void 0,void 0),e)}function l(e,t=0,r=1){return e<t?t:r<e?r:e}function j(e,t,r){return t+l(e)*(r-t)}function p(e=1,t=0){return t+Math.random()*(e-t)}function h(e,t){var r=y.getElementById(e),n=r||y.createElement("canvas");return n.id=e,n.width=n.height=t,r||y.getElementById("loaded").appendChild(n),[n,n.getContext("2d"),t/2]}function o(e=4,t="#f00",r,n=.4,o=600){const[a,i,s]=h(r,o),l=(i.clearRect(0,0,o,o),i.beginPath(),te/e);return c(e,e=>{var{x:t,y:r}=d(l*e,s),{x:t,y:r}=(i.lineTo(s+t,s+r),d(l*e+l/2,s*n));i.lineTo(s+t,s+r)}),i.fillStyle=t,i.fill(),a}function U(e){const[t,s]=h("rabbit"+e,600);s.beginPath(),s.moveTo(10,600);var r=[[10,600],[50,550],[100,520],[270,480],[270,450]];return r.forEach(e=>s.lineTo(...e)),r.reverse().forEach(([e,t])=>s.lineTo(600-e,t)),s.fillStyle="#5796a1",s.fill(),s.closePath(),r=(e,t,r,n,o=0,a="#eee",i={})=>{s.beginPath(),s.ellipse(e,t,r,n,o,0,te),s.fillStyle=a,s.fill(),i.hook&&i.hook(),s.closePath()},e&&r(300,400,100,160,0,"#8bc7bf"),r(300,300,200,70),r(300,350,250,100),r(300,410,200,60),r(150,200,200,40,.4*w),r(450,200,200,40,.4*-w),e&&(r(430,320,20,30,0,"#445"),r(170,320,20,30,0,"#445"),r(440,290,16,40,-1.4*w,"#ccc"),r(160,290,16,40,1.4*w,"#ccc"),r(300,350,20,10,0,"#de8b6f"),s.beginPath(),s.moveTo(300,450),s.lineTo(150,400),s.lineTo(450,400),s.fillStyle="#222",s.fill(),s.closePath()),r(300,320,290,180,0,"#ffffff55",{hook:()=>{s.strokeStyle="#8bc7bf",s.lineWidth=10,s.stroke()}}),t}function K(e){const t="k"+e;var r={x:E(2e3),y:E(2e3),z:E(2e3)};e={n:t,...structuredClone(oe),...r,size:5,r:10,isGroup:1},k.group({n:t,g:"system",...r});const n={g:t,size:2.5,x:-1.5,b:"372b4e"};r={g:t,size:2,b:"471b6e"},k.cube({...n,n:t+"c",rx:45,b:"471b6e"}),c(4,e=>{k.cube({...n,n:t+"cc"+e,x:-2-e,size:2.5-.5*e})}),k.pyramid({n:t+"nose",rz:-90,g:t,size:1.5,b:"90d59c"}),k.longRect({...r,n:t+"wing1",y:2,rx:90,ry:45,rz:-45}),k.longRect({...r,n:t+"wing2",y:2,x:1.5,rx:90,ry:45,rz:45,b:"471b6e"}),k.longRect({...r,n:t+"wing3",y:-2,rx:90,ry:45,rz:45}),k.longRect({...r,n:t+"wing4",y:-2,x:1.5,rx:90,ry:45,rz:-45,b:"471b6e"}),k.sphere({n:t+"shield",g:t,size:10,b:"ebd69404"}),B.push(e),P[e.n]=e,ae.push(e)}function Y(e,r){k=e;const t=(e,t)=>{var r={n:e,rx:0,ry:0,rz:0};t&&(r.g=t),k.group(r),ie[e]=r},a=(t("system"),"sun ring p1 p2 p3 a1 a2 a3".split(" ").forEach(e=>t(e,"system")),["ship","skybox"].forEach(e=>k.group({n:e})),e={shape:"simpleSphere",b:"775b5b"},[{shape:"sphere",n:"outerSun",g:"sun",size:500,b:"#de8b6f88"},{shape:"sphere",n:"innerSun",g:"sun",size:480,b:"#de8b6f"},{shape:"billboard",n:"sunFlare",g:"sun",size:640,b:"#de8b6f",t:o(16,"#de8b6f88","sun",.7)},{shape:"sphere",n:"planet1",g:"p1",...d(.5,3e3),size:200,b:"775b5b",s:1},{shape:"sphere",n:"planet2",g:"p2",...d(.7,4e3),size:120,b:"#b0455a",s:1},{shape:"sphere",n:"planet3",g:"p3",...d(2,7e3),size:80,b:"775b5b",s:1},{...e,n:"asteroid1",g:"a1",...d(3,1e3),size:30},{...e,n:"asteroid2",g:"a2",...d(3.5,2e3/1.7),size:35},{...e,n:"asteroid3",g:"a3",...d(5,2e3/1.8),size:40}].forEach(e=>{k[e.shape](e),P[e.n]=e}),e=function(e,t){const[r,n]=h(e,800);return c(1400,()=>{n.rect(t.int(0,800),t.int(0,800),1,1)}),n.fillStyle="#ebd694",n.fill(),r}("sf",ne),[{z:-r,b:"0000",t:e},{y:-r,rx:-90,b:"0000",t:e},{y:r,rx:90,b:"0000",t:e},{x:-r,ry:90,b:"0000",t:e},{x:r,ry:-90,b:"0000",t:e},{z:r,rx:180,b:"0000",t:e}].forEach((e,t)=>{k.plane({b:"000",...e,n:"skybox"+t,g:"skybox",size:2*r})}),k.longPyramid({n:"shipBase",g:"ship",size:.18,y:.18,b:"5796a1"}),k.ufo({n:"shipBody",g:"ship",y:-.06,rx:90,size:.39,b:"5796a1",s:1}),k.ufo({n:"sCockpit",g:"ship",y:-.06,rx:90,z:.12,size:.15,b:"666c",s:1}),e={n:"shipComp1",g:"ship",x:-.09,y:-.21,ry:0,size:.12,b:"5796a1"},k.cube(e),k.cube({...e,n:"shipComp2",x:-e.x}),e={n:"shipEngine1",g:"ship",ry:45,rx:90,x:.33,y:-.09,size:.3,b:"8bc7bf"},k.longerRect(e),k.longerRect({...e,n:"shipEngine2",x:-.33}),e={n:"shipEngineBack1",g:"ship",x:.33,y:-.3,size:.3/3,b:"5796a1"},k.longPyramid(e),k.longPyramid({...e,n:"shipEngineBack2",x:-.33}),k.plank({n:"sWing1",g:"ship",rx:90,ry:90,x:-0,y:-.09,z:0,size:.03,b:"5796a1"}),e={g:"ship",n:"sFlame1",rx:180,x:.33,y:-.42,size:.078,b:"ebd69400"},k.longPyramid(e),k.longPyramid({...e,n:"sFlame2",x:-.33}),c(6,K),2*Math.PI);return c(32,(e,t)=>{var r=0===e?0:a*e/t,{x:n,y:o}=(t=180/b*r,d(r,2e3)),r="r"+e;k.group({n:r,g:"ring"}),k.plank({n:"ring"+e,g:r,x:n,y:o,rz:t,size:20,b:"#5796a1"}),k.cube({n:"ringBuilding"+e,g:r,x:n,y:o,rz:t,size:50,b:"478691"})}),c(200,e=>{k.billboard({n:"litter"+e,g:"system",x:E(3e3),y:E(3e3),z:E(3e3),size:1,b:"555e"})}),c(10,e=>{var t,r,n={x:E(3e3),y:E(3e3),z:E(3e3)},o={...new z(void 0,void 0,void 0)},a=(a="de8b6f 471b6e 524bb3 5796a1 464040 775b5b".split(" "))[[t,r=0]=[0,a.length],Math.floor(p(t,r))];e={n:"crate"+e,passType:"crate",passthru:["crate"],g:"system",...n,vel:o,size:20,r:20,b:a,rx:p(0,359),ry:p(0,359),rz:p(0,359),hp:3,drops:["parts"]},B.push(e),P[e.n]=e,k.cube(e)}),{groups:ie,ship:M,renderables:P,physicsEnts:B,klaxShips:ae}}function a(e,{x:t=.5,y:r=.5,z:n=.5}={}){f.add(e,{vertices:[t,r,n,-t,r,n,-t,-r,n,t,r,n,-t,-r,n,t,-r,n,t,r,-n,t,r,n,t,-r,n,t,r,-n,t,-r,n,t,-r,-n,t,r,-n,-t,r,-n,-t,r,n,t,r,-n,-t,r,n,t,r,n,-t,r,n,-t,r,-n,-t,-r,-n,-t,r,n,-t,-r,-n,-t,-r,n,-t,r,-n,t,r,-n,t,-r,-n,-t,r,-n,t,-r,-n,-t,-r,-n,t,-r,n,-t,-r,n,-t,-r,-n,t,-r,n,-t,-r,-n,t,-r,-n],uv:[1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0]})}function q(e,{x:t=.5,y:r=.5,z:n=.5}={}){f.add(e,{vertices:[-t,-r,n,t,-r,n,0,r,0,t,-r,n,t,-r,-n,0,r,0,t,-r,-n,-t,-r,-n,0,r,0,-t,-r,-n,-t,-r,n,0,r,0,t,-r,n,-t,-r,n,-t,-r,-n,t,-r,n,-t,-r,-n,t,-r,-n],uv:[0,0,1,0,.5,1,0,0,1,0,.5,1,0,0,1,0,.5,1,0,0,1,0,.5,1,1,1,0,1,0,0,1,1,0,0,1,0]})}function i(e,{x:t=2,y:r=2,z:n=2,precision:o=20,i:a,ai:i,j:s,aj:l,p1:c,p2:d,vertices:p=[],indices:h=[],uv:g=[]}={}){var{PI:m,sin:u,cos:y}=Math;for(s=0;s<=o;s++)for(l=s*m/o,a=0;a<=o;a++)p.push(+(u(i=2*a*m/o)*u(l)/t).toFixed(6),+(y(l)/r).toFixed(6),+(y(i)*u(l)/n).toFixed(6)),g.push(3.5*u(a/o),-u(s/o)),a<o&&s<o&&h.push(c=s*(o+1)+a,d=c+(o+1),c+1,c+1,d,d+1);f.add(e,{vertices:p,uv:g,indices:h})}function m(...e){se.play(...e)}function g(e){if(void 0!==e){if(D[e].done)return;D[e].done=1}e=T.klaxShips.filter(e=>0<e.hp).length;var r,t=_.ogKlaxShipCount-e;0===e&&(D[5].done=1),7<=(ship.inv.parts||0)&&(D[6].done=1),r=t,e=D.map(({t:e,done:t})=>`<li class="${t?"done":""}">${e.replace("{K}",r).replace("{S}",_.ogKlaxShipCount).replace("{P}",ship.inv.parts||0).replace("{M}",7)}</li>`).join(""),y.getElementById("goals").innerHTML=e,D.length===D.filter(e=>e.done).length&&H("You did it! With those parts we should be able to get the Ring powered up again.<p>Thank you!</p>")}function H(e){m(2.36,0,130.8128,.02,.51,.2,void 0,1.91,void 0,void 0,void 0,void 0,.08,void 0,void 0,void 0,.04,.5,void 0,.39),_.paused=1;const t=y.getElementById("dialog").classList,r=y.getElementById("goals").style;return r.opacity="0",u.unlock(),Q("pic",`<img src="${F.rabbit.toDataURL()}" />`),Q("txt",e+'<i data-key="Enter">Close [Enter]</i>'),t.add("show"),f.camera({x:0,y:100,z:0,a:200},500),_.W.move({n:"system",x:1e3,y:-500,z:-2500,a:2e3},500),_.nextEnter=()=>{r.opacity="1",t.remove("show"),_.paused=0,y.querySelector("main").classList.remove("ui--off")}}function r(){var e,t,r,n=y.getElementById("canvas");t=(e=n).clientWidth,(r=e.clientHeight)<t?(I.aspect=t/r,e.height=C(t,800),e.width=t/I.aspect):(e.width=e.height=C(t,800),I.aspect=1),u.setup({lockElt:n,keys:{Tab:()=>{g(0),u.toggleLock()},p:()=>{_.paused=!_.paused},Enter:()=>{_.nextEnter&&(_.nextEnter=_.nextEnter())}}}),F={tf:o(9,"#ebd694","tf",.3),plasma:o(11,"#de8b6f","plasma",.2),photon:o(13,"#b0455a","photon",.5),klaxPlasma:o(15,"#90d59c","klaxPlasma",.3),rabbit:U(1),pilot:U(0)},n.addEventListener("click",()=>{u.lock()}),f.reset(n),f.clearColor("2a242b"),f.light({x:-1,y:-1.2,z:.2}),f.ambient(.8),a("plank",{y:10,z:5,x:.3}),a("longRect",{x:.2,y:.2}),a("longerRect",{x:.2,y:.2,z:.7}),a("cube"),q("pyramid"),q("longPyramid",{y:.8}),i("sphere"),i("simpleSphere",{precision:6}),i("ufo",{y:3,precision:10}),T=Y(f,15e3),["renderables","ship","physicsEnts","klaxShips"].forEach(e=>{window[e]=T[e],_[e]=T[e]}),T.klaxShips.forEach((e,t)=>{f.billboard({n:"scan"+t,g:"system",x:e.x,y:e.y,z:e.z,size:100,b:"90d59c"})}),_.ogKlaxShipCount=T.klaxShips.length,g()}function V(e,t=0){var{x:t,y:r,z:n}=W(e).scale(t);e.thrust={x:t,y:r,z:n}}function X(e,t){var r,n,o;e.damage&&t.hp&&(r=t===ship,console.log("Damage",t),t.hp-=e.damage,t.hp<=0&&(console.log("Destroy",t),t.decay=0,t.drops&&(t.drops.forEach(e=>ship.inv[e]=(ship.inv[e]||0)+1),console.log(ship.inv)),g()),m(r?1.1:.5,void 0,416,.02,.21,.52,4,2.14,.2,void 0,void 0,void 0,void 0,1.7,void 0,.9,void 0,.44,.12,.23),r)&&(r="canvas",n="#b0455a",o=1500,new Animation(new KeyframeEffect(y.getElementById(r),[{borderColor:n},{borderColor:"#000"}],{duration:o,direction:"alternate",easing:"linear"}),y.timeline).play()),e.aggro+=1,t.aggro+=1,e.shieldOpacity+=5,t.shieldOpacity+=5}function $(t){c(t.length,e=>{var r,n;r=t[e],n=t,r.collided||c(n.length,e=>{var t,i,s;e=n[e],r.passthru&&r.passthru.includes(e.passType)||e.passthru&&e.passthru.includes(r.passType)||r===e||e.collided||(t=new z(r,void 0,void 0).distance(e))<=r.r+e.r&&(s=e,e=t,X(((i=r).collided=s).collided=i,s),X(s,i),e=new z(s,void 0,void 0).sub(i).normalize().scale((i.r+s.r-e)/2),new z(i,void 0,void 0).sub(e).copyTo(i),new z(s,void 0,void 0).add(e).copyTo(s),["x","y","z"].forEach(e=>{var t=i.mass||1,r=s.mass||1,n=t+r,o=i.vel[e],a=s.vel[e];i.vel[e]=(t-r)/n*o+2*r/n*a,s.vel[e]=2*t/n*o+(r-t)/n*a}))})})}function N(t,r){const{steerPercent:n=.01}=t;["rx","ry","rz"].forEach(e=>t[e]=j(n,t[e],r[e]))}function G(e,t,r,n){var{vScale:o,tScale:a,damage:i,size:s,sound:l}=pe[e],c=F[e],{x:d,y:p,z:h}=t,g=W(t);t=g.scale(o).add(t.vel),m(...l),e={n:e+r+String(Number(new Date)),g:"system",passType:r,x:d,y:p,z:h,vel:{...t},thrust:{...g.scale(a)},friction:0,decay:6,damage:i,r:5,passthru:n,mass:.01},physicsEnts.push(e),renderables[e.n]=e,f.billboard({...e,size:s,t:c})}function Z(t,e){var r=e.findIndex(e=>e.n===t);-1!==r&&e.splice(r,1)}function J(){var o,r,e,t,n,a,i,s;_.paused||(o=A/1e3,r=u["down"],r["]"]&&(I.targetFov+=.5),r["["]&&(I.targetFov-=.5),r.p)||(t=0,1<(e=r.Shift?2:1)&&g(4),r.s||r.S?(t=ship.thrustForce*e*-.5,r.w=0,r.W=0):(r.w||r.W)&&(t=ship.thrustForce*e),V(ship,t),i=0<t?"ebd694dd":"ebd69400",f.move({n:"sFlame1",b:i}),f.move({n:"sFlame2",b:i}),0===t?(f.delete("sIgnite1"),f.delete("sIgnite2")):(m(1<e?.15:.1,void 0,794,.02,.3,.32,void 0,3.96,void 0,.7,void 0,void 0,.16,2.1,void 0,1<e?.2:.8,.1,.31,.27),g(2),i={g:"ship",y:-.393,rx:70,size:.2,t:F.tf},f.billboard({...i,n:"sIgnite1",x:-.33}),f.billboard({...i,n:"sIgnite2",x:.33})),i=u.getClick(),0===ship.fireCooldown&&(r[" "]||i&&i.locked)&&(g(3),G(i&&i.right?"photon":"plasma",ship,"plasma",["ship","plasma","klaxPlasma"]),ship.fireCooldown=.3),r.c&&g(1),klaxShips.forEach((e,t)=>{f.move({n:"scan"+t,x:e.x,y:e.y,z:e.z,size:100,b:0<e.hp&&r.c?"90d59c":"0000"})}),ship.fireCooldown=L(ship.fireCooldown-o,0),klaxShips.forEach(e=>{var t,r;e.decay<=0||e.hp<=0||((r=(t=new z(e,void 0,void 0)).distance(ship))>2*e.sight?e.aggro=L(0,e.aggro-=.1):r<=e.sight&&(e.aggro=L(1,e.aggro)),e.aggro&&(N(e,t=t.toWAngles(ship)),e.thrustCooldown?e.thrustCooldown=L(e.thrustCooldown-o,0):(V(e,e.thrustForce),e.thrustCooldown=p(.5,1)),e.fireCooldown?e.fireCooldown=L(e.fireCooldown-o,0):(G("klaxPlasma",e,"klaxPlasma",["klaxShip","klaxPlasma","plasma"]),e.fireCooldown=p(.3,3))))}),$(physicsEnts),physicsEnts.forEach(e=>{var t,r,n;e.collided=0,r=o,e="number"==typeof(t=e).friction?.25*t.friction:.25,n=new z(t.vel,void 0,void 0),t.vel=n.sub(n.normalize(e)),["x","y","z"].forEach(e=>{t.vel[e]=l(t.vel[e]+(t.thrust&&t.thrust[e]||0)/(t.mass||1)/r,-800,800),t.vel[e]<1e-4&&-1e-4<t.vel[e]&&(t.vel[e]=0),t[e]=l(t[e]+t.vel[e]*r,-15e3,15e3)})}),ship.hp<=0?(_.paused=1,u.unlock(),y.querySelector("main").classList.add("end"),y.getElementById("end").style.display="flex"):(i=u.getLockMove(),R.ry-=i.x/10,R.rx=C(L(R.rx-i.y/10,-180),0),N(ship,R),i=O(new z(0,de.back,de.up),R),I.fov=j(.1,I.fov,I.targetFov+(t?t<0?-2:1<e?10:1:0)),e=.001<ce(I.fov-I.lastFov),I.lastFov=I.fov,t={...i,...function(e,t){var{rx:e,ry:r,rz:n}=e;return{rx:e+=t.rx,ry:r+=t.ry,rz:n+=t.rz}}(de,R),a:100},e&&(t={...t,...I}),f.camera(t),{rx:i,ry:a,rz:n}=ship,f.move({n:"ship",rx:i,ry:a,rz:n}),Object.keys(renderables).forEach(e=>{var t=renderables[e];"number"==typeof t.decay&&(t.decay-=o,t.decay<=0)&&(t.isGroup?f.move({n:t.n,x:6e4}):f.delete(t.n),Z(t.n,physicsEnts),Z(t.n,klaxShips),delete renderables[e])}),e={...renderables},t={x:-ship.x,y:-ship.y,z:-ship.z,a:A},S+=A/90,s={...e,system:t,innerSun:{rx:S,ry:.9*S},p1:{rz:.1*S},p2:{rz:.15*S},p3:{rz:.05*S},ring:{rz:.5*S},a1:{rz:.7*S},a2:{rz:.6*S},a3:{rz:.5*S}},Object.keys(s).forEach(e=>{f.move({n:e,...s[e]},0)}),a=(i=new z(ship.vel,void 0,void 0)).x>i.y&&i.x>i.z?"X":i.y>i.x&&i.y>i.z?"Y":"Z",i="<b>"+[`Velocity: ${le(i.length())} (${a})`,`Pitch: ${le(R.rx+90)}, Yaw: `+le(R.ry)%360,"Hull: "+ship.hp].join("</b><b>")+"</b>",y.getElementById("si").innerHTML=i))}let t,f={models:{},reset:e=>{f.canvas=e,f.objs=0,f.current={},f.next={},f.textures={},f.gl=e.getContext("webgl2"),f.gl.blendFunc(770,771),f.gl.activeTexture(33984),f.program=f.gl.createProgram(),f.gl.enable(2884),f.gl.shaderSource(t=f.gl.createShader(35633),"#version 300 es\n      precision highp float;                        // Set default float precision\n      in vec4 pos, col, uv, normal;                 // Vertex attributes: position, color, texture coordinates, normal (if any)\n      uniform mat4 pv, eye, m, im;                  // Uniform transformation matrices: projection * view, eye, model, inverse model\n      uniform vec4 bb;                              // If the current shape is a billboard: bb = [w, h, 1.0, 0.0]\n      out vec4 v_pos, v_col, v_uv, v_normal;        // Varyings sent to the fragment shader: position, color, texture coordinates, normal (if any)\n      void main() {                                 \n        gl_Position = pv * (                        // Set vertex position: p * v * v_pos\n          v_pos = bb.z > 0.                         // Set v_pos varying:\n          ? m[3] + eye * (pos * bb)                 // Billboards always face the camera:  p * v * distance + eye * (position * [w, h, 1.0, 0.0])\n          : m * pos                                 // Other objects rotate normally:      p * v * m * position\n        );                                          \n        v_col = col;                                // Set varyings \n        v_uv = uv;\n        v_normal = transpose(inverse(m)) * normal;  // recompute normals to match model thansformation\n      }"),f.gl.compileShader(t),f.gl.attachShader(f.program,t),console.log("vertex shader:",f.gl.getShaderInfoLog(t)||"OK"),f.gl.shaderSource(t=f.gl.createShader(35632),"#version 300 es\n      precision highp float;                  // Set default float precision\n      in vec4 v_pos, v_col, v_uv, v_normal;   // Varyings received from the vertex shader: position, color, texture coordinates, normal (if any)\n      uniform vec3 light;                     // Uniform: light direction, smooth normals enabled\n      uniform vec4 o;                         // options [smooth, shading enabled, ambient, mix]\n      uniform sampler2D sampler;              // Uniform: 2D texture\n      out vec4 c;                             // Output: final fragment color\n\n      // The code below displays colored / textured / shaded fragments\n      void main() {\n        c = mix(texture(sampler, v_uv.xy), v_col, o[3]);  // base color (mix of texture and rgba)\n        if(o[1] > 0.){                                    // if lighting/shading is enabled:\n          c = vec4(                                       // output = vec4(base color RGB * (directional shading + ambient light)), base color Alpha\n            c.rgb * (max(0., dot(light, -normalize(       // Directional shading: compute dot product of light direction and normal (0 if negative)\n              o[0] > 0.                                   // if smooth shading is enabled:\n              ? vec3(v_normal.xyz)                        // use smooth normals passed as varying\n              : cross(dFdx(v_pos.xyz), dFdy(v_pos.xyz))   // else, compute flat normal by making a cross-product with the current fragment and its x/y neighbours\n            )))\n            + o[2]),                                      // add ambient light passed as uniform\n            c.a                                           // use base color's alpha\n          );\n        }\n      }"),f.gl.compileShader(t),f.gl.attachShader(f.program,t),console.log("fragment shader:",f.gl.getShaderInfoLog(t)||"OK"),f.gl.linkProgram(f.program),f.gl.useProgram(f.program),console.log("program:",f.gl.getProgramInfoLog(f.program)||"OK"),f.gl.clearColor(1,1,1,1),f.clearColor=e=>f.gl.clearColor(...f.col(e)),f.clearColor("fff"),f.gl.enable(2929),f.light({y:-1}),f.camera({fov:30}),setTimeout(f.draw,16)},setState:(e,t,r)=>{var n,o,a,i,s;(n=e).n||(n.n="o"+f.objs++),e.size&&(e.w=e.h=e.d=e.size),e.t&&e.t.width&&!f.textures[e.t.id]&&(r=f.gl.createTexture(),f.gl.pixelStorei(37441,!0),f.gl.bindTexture(3553,r),f.gl.pixelStorei(37440,1),f.gl.texImage2D(3553,0,6408,6408,5121,e.t),f.gl.generateMipmap(3553),f.textures[e.t.id]=r),e.fov&&({near:s=1,far:o=1e3,fov:a,aspect:i=canvas.width/canvas.height}=e,r=1/Math.tan(a*Math.PI/180),n=1/(s-o),f.projection=new DOMMatrix([r/i,0,0,0,0,r,0,0,0,0,(o+s)*n,-1,0,0,2*s*o*n,0])),e={type:t,...f.current[e.n]=f.next[e.n]||{w:1,h:1,d:1,x:0,y:0,z:0,rx:0,ry:0,rz:0,b:"888",mode:4,mix:0},...e,f:0},null==(a=f.models[e.type])||!a.vertices||null!=(i=f.models)&&i[e.type].verticesBuffer||(f.gl.bindBuffer(34962,f.models[e.type].verticesBuffer=f.gl.createBuffer()),f.gl.bufferData(34962,new Float32Array(f.models[e.type].vertices),35044),!f.models[e.type].normals&&f.smooth&&f.smooth(e),f.models[e.type].normals&&(f.gl.bindBuffer(34962,f.models[e.type].normalsBuffer=f.gl.createBuffer()),f.gl.bufferData(34962,new Float32Array(f.models[e.type].normals.flat()),35044))),null!=(r=f.models[e.type])&&r.uv&&!f.models[e.type].uvBuffer&&(f.gl.bindBuffer(34962,f.models[e.type].uvBuffer=f.gl.createBuffer()),f.gl.bufferData(34962,new Float32Array(f.models[e.type].uv),35044)),null!=(s=f.models[e.type])&&s.indices&&!f.models[e.type].indicesBuffer&&(f.gl.bindBuffer(34963,f.models[e.type].indicesBuffer=f.gl.createBuffer()),f.gl.bufferData(34963,new Uint16Array(f.models[e.type].indices),35044)),e.t?e.t&&!e.mix&&(e.mix=0):e.mix=1,f.next[e.n]=e},draw:(e,t,r,n,o=[])=>{for(n in t=e-f.lastFrame,f.lastFrame=e,requestAnimationFrame(f.draw),f.next.camera.g&&f.render(f.next[f.next.camera.g],t,1),r=f.animation("camera"),null!=(e=f.next)&&null!=(e=e.camera)&&e.g&&r.preMultiplySelf(f.next[f.next.camera.g].M||f.next[f.next.camera.g].m),f.gl.uniformMatrix4fv(f.gl.getUniformLocation(f.program,"eye"),!1,r.toFloat32Array()),r.invertSelf(),r.preMultiplySelf(f.projection),f.gl.uniformMatrix4fv(f.gl.getUniformLocation(f.program,"pv"),!1,r.toFloat32Array()),f.gl.clear(16640),f.next)f.next[n].t||1!=f.col(f.next[n].b)[3]?o.push(f.next[n]):f.render(f.next[n],t);o.sort((e,t)=>f.dist(t)-f.dist(e)),f.gl.enable(3042);for(n of o)["plane","billboard"].includes(n.type)&&f.gl.depthMask(0),f.render(n,t),f.gl.depthMask(1);f.gl.disable(3042),f.gl.uniform3f(f.gl.getUniformLocation(f.program,"light"),f.lerp("light","x"),f.lerp("light","y"),f.lerp("light","z"))},render:(e,t,r=["camera","light","group"].includes(e.type),n)=>{e.t&&(f.gl.bindTexture(3553,f.textures[e.t.id]),f.gl.uniform1i(f.gl.getUniformLocation(f.program,"sampler"),0)),e.f<e.a&&(e.f+=t),e.f>e.a&&(e.f=e.a),f.next[e.n].m=f.animation(e.n),f.next[e.g]&&f.next[e.n].m.preMultiplySelf(f.next[e.g].M||f.next[e.g].m),f.gl.uniformMatrix4fv(f.gl.getUniformLocation(f.program,"m"),!1,(f.next[e.n].M||f.next[e.n].m).toFloat32Array()),f.gl.uniformMatrix4fv(f.gl.getUniformLocation(f.program,"im"),!1,new DOMMatrix(f.next[e.n].M||f.next[e.n].m).invertSelf().toFloat32Array()),r||(f.gl.bindBuffer(34962,f.models[e.type].verticesBuffer),f.gl.vertexAttribPointer(n=f.gl.getAttribLocation(f.program,"pos"),3,5126,!1,0,0),f.gl.enableVertexAttribArray(n),f.models[e.type].uvBuffer&&(f.gl.bindBuffer(34962,f.models[e.type].uvBuffer),f.gl.vertexAttribPointer(n=f.gl.getAttribLocation(f.program,"uv"),2,5126,!1,0,0),f.gl.enableVertexAttribArray(n)),(e.s||f.models[e.type].customNormals)&&f.models[e.type].normalsBuffer&&(f.gl.bindBuffer(34962,f.models[e.type].normalsBuffer),f.gl.vertexAttribPointer(n=f.gl.getAttribLocation(f.program,"normal"),3,5126,!1,0,0),f.gl.enableVertexAttribArray(n)),f.gl.uniform4f(f.gl.getUniformLocation(f.program,"o"),e.s,(3<e.mode||3<f.gl[e.mode])&&!e.ns?1:0,f.ambientLight||.2,e.mix),f.gl.uniform4f(f.gl.getUniformLocation(f.program,"bb"),e.w,e.h,"billboard"==e.type,0),f.models[e.type].indicesBuffer&&f.gl.bindBuffer(34963,f.models[e.type].indicesBuffer),f.gl.vertexAttrib4fv(f.gl.getAttribLocation(f.program,"col"),f.col(e.b)),f.models[e.type].indicesBuffer?f.gl.drawElements(+e.mode||f.gl[e.mode],f.models[e.type].indices.length,5123,0):f.gl.drawArrays(+e.mode||f.gl[e.mode],0,f.models[e.type].vertices.length/3))},lerp:(e,t)=>{var r;return null!=(r=f.next[e])&&r.a?f.current[e][t]+f.next[e].f/f.next[e].a*(f.next[e][t]-f.current[e][t]):f.next[e][t]},animation:(e,t=new DOMMatrix)=>f.next[e]?t.translateSelf(f.lerp(e,"x"),f.lerp(e,"y"),f.lerp(e,"z")).rotateSelf(f.lerp(e,"rx"),f.lerp(e,"ry"),f.lerp(e,"rz")).scaleSelf(f.lerp(e,"w"),f.lerp(e,"h"),f.lerp(e,"d")):t,dist:(e,t=f.next.camera)=>null!=e&&e.m&&null!=t&&t.m?(t.m.m41-e.m.m41)**2+(t.m.m42-e.m.m42)**2+(t.m.m43-e.m.m43)**2:0,ambient:e=>f.ambientLight=e,col:t=>[...t.replace("#","").match(t.length<5?/./g:/../g).map(e=>("0x"+e)/(t.length<5?15:255)),1],add:(t,e)=>{(f.models[t]=e).normals&&(f.models[t].customNormals=1),f[t]=e=>f.setState(e,t)},group:e=>f.setState(e,"group"),move:(e,t)=>setTimeout(()=>{f.setState(e)},t||1),delete:(e,t)=>setTimeout(()=>{delete f.next[e]},t||1),camera:(e,t)=>setTimeout(()=>{f.setState(e,e.n="camera")},t||1),light:(e,t)=>t?setTimeout(()=>{f.setState(e,e.n="light")},t):f.setState(e,e.n="light"),smooth:(e,t={},r=[],n,o,a,i,s,l,c,d,p,h,g,m,u)=>{for(f.models[e.type].normals=[],a=0;a<f.models[e.type].vertices.length;a+=3)r.push(f.models[e.type].vertices.slice(a,a+3));for(o=(n=f.models[e.type].indices)?1:(n=r,0),a=0;a<2*n.length;a+=3){var y;i=a%n.length,s=r[d=o?f.models[e.type].indices[i]:i],l=r[p=o?f.models[e.type].indices[1+i]:1+i],c=r[h=o?f.models[e.type].indices[2+i]:2+i],m=[l[0]-s[0],l[1]-s[1],l[2]-s[2]],u=[c[0]-l[0],c[1]-l[1],c[2]-l[2]],g=i<a?[0,0,0]:[m[1]*u[2]-m[2]*u[1],m[2]*u[0]-m[0]*u[2],m[0]*u[1]-m[1]*u[0]],t[y=s[0]+"_"+s[1]+"_"+s[2]]||(t[y]=[0,0,0]),t[y=l[0]+"_"+l[1]+"_"+l[2]]||(t[y]=[0,0,0]),t[y=c[0]+"_"+c[1]+"_"+c[2]]||(t[y]=[0,0,0]),f.models[e.type].normals[d]=t[s[0]+"_"+s[1]+"_"+s[2]]=t[s[0]+"_"+s[1]+"_"+s[2]].map((e,t)=>e+g[t]),f.models[e.type].normals[p]=t[l[0]+"_"+l[1]+"_"+l[2]]=t[l[0]+"_"+l[1]+"_"+l[2]].map((e,t)=>e+g[t]),f.models[e.type].normals[h]=t[c[0]+"_"+c[1]+"_"+c[2]]=t[c[0]+"_"+c[1]+"_"+c[2]].map((e,t)=>e+g[t])}}};f.add("plane",{vertices:[.5,.5,0,-.5,.5,0,-.5,-.5,0,.5,.5,0,-.5,-.5,0,.5,-.5,0],uv:[1,1,0,1,0,0,1,1,0,0,1,0]}),f.add("billboard",f.models.plane);const s=window.document;var u={lockMove:{x:0,y:0},move:{x:0,y:0},wheel:0,click:null,lockElt:null,down:{},isLocked:()=>!!s.pointerLockElement,async lock(){s.pointerLockElement||await this.lockElt.requestPointerLock()},async toggleLock(){s.pointerLockElement?await this.unlock():await this.lock()},async unlock(){await s.exitPointerLock()},getLockMove(){var e={...this.lockMove};return this.lockMove.x=0,this.lockMove.y=0,e},getWheel(){var e=this.wheel;return this.wheel=0,e},getClick(){var e=this.click;return this.click=null,e},setup(o={}){this.lockElt=o.lockElt,onmousemove=e=>{var t=this[s.pointerLockElement?"lockMove":"move"];t.x+=e.movementX,t.y+=e.movementY},onkeydown=e=>{this.down[e.key]=!0,!e.repeat&&o.keys&&o.keys[e.key]&&(o.keys[e.key](),e.preventDefault())},onkeyup=e=>{this.down[e.key]=!1},onwheel=e=>{this.wheel+=e.deltaY};oncontextmenu=onclick=e=>{var{clientX:t,clientY:r,button:n}=e;e=e.target.dataset.key,e&&o.keys&&o.keys[e]&&o.keys[e](),this.click={clientX:t,clientY:r,button:n,left:0===n,right:2===n,locked:!!s.pointerLockElement}}}};const y=document,Q=(e,t)=>y.getElementById(e).innerHTML=t,{sin:n,cos:x,atan2:v,PI:b,sqrt:ee}=Math;class z{constructor(e=0,t=0,r=0){"object"==typeof e&&(t=e.y,r=e.z,e=e.x),this.x=e,this.y=t,this.z=r}copy(){return new z(this.x,this.y,this.z)}copyTo(e){e.x=this.x,e.y=this.y,e.z=this.z}add(e){return new z(this.x+e.x,this.y+e.y,this.z+e.z)}sub(e){return new z(this.x-e.x,this.y-e.y,this.z-e.z)}length(){return this.lengthSquared()**.5}lengthSquared(){return this.x**2+this.y**2+this.z**2}distance(e){return this.distanceSquared(e)**.5}distanceSquared(e){return(this.x-e.x)**2+(this.y-e.y)**2+(this.z-e.z)**2}normalize(e=1){var t=this.length();return t?this.scale(e/t):new z(0,e,0)}scale(e){return new z(this.x*e,this.y*e,this.z*e)}cross(e){var{x:t,y:r,z:n}=this;return new z(r*e.z-n*e.y,n*e.x-t*e.z,t*e.y-r*e.x)}rotate(e,t,r){return this.rotateX(e).rotateY(t).rotateZ(r)}rotateX(e=0){var t=this.x,r=this.y*x(e)-this.z*n(e);return e=this.y*n(e)+this.z*x(e),new z(t,r,e)}rotateY(e=0){var t=this.x*x(e)+this.z*n(e),r=this.y;return e=-this.x*n(e)+this.z*x(e),new z(t,r,e)}rotateZ(e=0){var t=this.x*x(e)-this.y*n(e);return e=this.x*n(e)+this.y*x(e),new z(t,e,this.z)}toAngles(e){let{x:t,y:r,z:n}=this;e&&(t=e.x-t,r=e.y-r,n=e.z-n),e=v(r,t);var o=v(-n,ee(t*t+r*r)),a=0;return 0===t&&0===r||(a=ee(t*t+r*r),a=v(n,a)),{roll:a,pitch:o,yaw:e}}toWAngles(e){var{roll:e,pitch:t,yaw:r}=this.toAngles(e);return{rx:180/b*e,ry:180/b*t,rz:180/b*r}}}const w=Math["PI"],te=2*w,re=t=>new Promise(e=>setTimeout(e,t));let k,S=0;const ne=new class{constructor(e){this.seed=e}rand(e=1,t=0){return this.seed^=this.seed<<13,this.seed^=this.seed>>>17,this.seed^=this.seed<<5,t+(e-t)*Math.abs(this.seed%1e9)/1e9}int(e,t=0){return Math.floor(this.rand(e,t))}sign(){return 2*this.randInt(2)-1}}(1234),E=(e=15e3)=>ne.rand(-e,e),M={x:0,y:0,z:7500,rx:-90,ry:0,rz:0,vel:{x:0,y:0,z:0},thrust:{x:0,y:0,z:0},thrustForce:.1,fireCooldown:0,r:2,passType:"ship",passthru:["plasma"],shieldOpacity:0,sight:1500,aggro:0,thrustCooldown:0,hp:5,maxHp:5,facing:{x:0,y:1,z:0},inv:{parts:0},steerPercent:.05},oe={...structuredClone(M),thrustForce:.005,passType:"klaxShip",passthru:["klaxPlasma"],facing:{x:1,y:0,z:0},drops:["parts"]},ae=[],B=[M],P={},ie={},se={volume:.3,sampleRate:44100,x:new AudioContext,play:function(...e){return this.playSamples(this.buildSamples(...e))},playSamples:function(...e){const r=this.x.createBuffer(e.length,e[0].length,this.sampleRate),t=this.x.createBufferSource();return e.map((e,t)=>r.getChannelData(t).set(e)),t.buffer=r,t.connect(this.x.destination),t.start(),t},buildSamples:function(e=1,t=.05,r=220,n=0,o=0,a=.1,i=0,s=1,l=0,c=0,d=0,p=0,h=0,g=0,m=0,u=0,y=0,f=1,x=0,v=0){var b=2*Math.PI,z=this.sampleRate,w=l*=500*b/z/z;t=r*=(1+2*t*Math.random()-t)*b/z;let k=[],S=0,E=0,M=0,B=1,P=0,C=0,L=0,_;for(c*=500*b/z**3,m*=b/z,d*=b/z,p*=z,h=h*z|0,_=(n=n*z+9)+(x*=z)+(o*=z)+(a*=z)+(y*=z)|0;M<_;k[M++]=L)++C%(100*u|0)||(L=i?1<i?2<i?3<i?Math.sin((S%b)**3):Math.max(Math.min(Math.tan(S),1),-1):1-(2*S/b%2+2)%2:1-4*Math.abs(Math.round(S/b)-S/b):Math.sin(S),L=(h?1-v+v*Math.sin(b*M/h):1)*(0<L?1:-1)*Math.abs(L)**s*e*this.volume*(M<n?M/n:M<n+x?1-(M-n)/x*(1-f):M<n+x+o?f:M<_-y?(_-M-y)/a*f:0),L=y?L/2+(y>M?0:(M<_-y?1:(_-M)/y)*k[M-y|0]/2):L),z=(r+=l+=c)*Math.cos(m*E++),S+=z-z*g*(1-1e9*(Math.sin(M)+1)%2),B&&++B>p&&(r+=d,t+=d,B=0),!h||++P%h||(r=t,l=w,B=B||1);return k},getNote:function(e=0,t=440){return t*2**(e/12)}},{min:C,max:L,round:le,abs:ce}=Math,_={W:f,input:u,paused:0,nextEnter:0,ogKlaxShipCount:0};let T,F={};const A=1e3/60,de={back:-1.5,up:.6,rx:80,ry:0,rz:0},I={fov:30,targetFov:30,lastFov:31,aspect:1,near:.5,far:3e4},R={rx:-90,ry:0,rz:0},D="Check steering: [Tab] to toggle mouse-lock;Scan: Hold [C];Thrusters: [W] and [S];Fire weapons: [Space] or [Click];Boost: Hold [Shift];Klaxonian Ships Destroyed: {K} / {S};Ring Repair Parts: {P} / {M}".split(";").map(e=>({t:e,done:0})),pe={plasma:{vScale:45,tScale:.004,damage:1,size:1,sound:[,.1,295,.02,.01,.08,,1.72,-3.5,.2,,,,.2,,,.08,.62,.09]},photon:{vScale:25,tScale:.0012,damage:3,size:1,sound:[2.06,.35,212,.05,.08,.01,,1.66,-4.8,.2,50,,,1.7,,.5,.28,.65,.02]},klaxPlasma:{vScale:45,tScale:.002,damage:1,size:10,sound:[.3,.4,241,.04,.03,.08,,.46,-7.7,,,,,,,.2,,.53,.05,.2]}};addEventListener("DOMContentLoaded",async()=>{r(),await re(30),J(),await re(30);{_.paused=1,f.camera({x:0,y:0,z:0,rx:-13});const e=y.getElementById("hi").style;e.display="flex",_.nextEnter=()=>(e.display="none",H("<p>A Star-Hopper ship! You got our distress call? 📡 We're under attack by a Klaxonian fleet!</p><p>The entire sector is dependent on the POWER generated by our Bunson Ring. ⚡Please rescue us and help get the Ring operational again.</p>"))}setInterval(J,A)}),window.g=_}();