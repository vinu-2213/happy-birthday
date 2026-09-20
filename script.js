// ============================================================
// ANEESHA — CLEAN PARTICLE BIRTHDAY BUILD
// ============================================================
// Keep TEST_MODE=true while developing. It makes the first countdown 10 seconds.
// For the real page set TEST_MODE=false. The real target is midnight IST on 21 Sep 2026.
const TEST_MODE = true;
const TEST_DELAY_MS = 10000;
const REAL_TARGET = new Date('2026-09-21T00:00:00+05:30').getTime();
const TARGET = TEST_MODE ? Date.now() + TEST_DELAY_MS : REAL_TARGET;

const $=id=>document.getElementById(id);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const screens={date:$('date-screen'),countdown:$('countdown-screen'),birthday:$('birthday-screen'),memory:$('memory-screen'),video:$('video-screen'),heart:$('heart-screen'),final:$('final-screen')};
let started=false;
function show(s){Object.values(screens).forEach(x=>x&&x.classList.remove('active'));s.classList.add('active')}

// ---------- Background music ----------
const bgMusic=$('bg-music');
let musicStarted=false;
let audioUnlocked=false;
let userHasInteracted=false;

// Try audible autoplay immediately. Browsers that allow it will start without
// any button or tap. Browsers that block audible autoplay are handled below.
if(bgMusic){
  bgMusic.preload='auto';
  bgMusic.volume=.42;
  bgMusic.muted=false;
  bgMusic.play().then(()=>{
    musicStarted=true;
  }).catch(()=>{});
}

// A normal page cannot override Chrome/Safari autoplay policy. On browsers
// that block sound, ONE tap anywhere unlocks audio — no volume button needed.
async function unlockAudio(){
  if(!bgMusic || audioUnlocked)return;
  audioUnlocked=true;
  userHasInteracted=true;
  bgMusic.muted=false;
  bgMusic.volume=.42;
  try{
    await bgMusic.play();
    musicStarted=true;
  }catch(e){}
}

async function startMusic(reset=false){
  if(!bgMusic)return;
  if(reset)bgMusic.currentTime=0;
  bgMusic.volume=.42;
  bgMusic.muted=false;
  try{
    await bgMusic.play();
    musicStarted=true;
  }catch(e){
    // If autoplay was blocked, the first user interaction above unlocks it.
  }
}

function pauseMusic(){if(bgMusic&&!bgMusic.paused)bgMusic.pause()}
function resumeMusic(){return startMusic()}

// Any first tap/click/touch/keypress works as the audio unlock gesture.
// The user never has to find or press a volume control.
['pointerdown','touchstart','click','keydown'].forEach(evt=>{
  addEventListener(evt,()=>{
    userHasInteracted=true;
    unlockAudio();
  },{passive:true});
});

// ---------- Permanent atmospheric background ----------
function makeAmbient(){
  const stars=$('stars'), hearts=$('hearts'), balloons=$('balloons');
  for(let i=0;i<48;i++){
    const e=document.createElement('span');e.className='star';e.textContent=Math.random()<.28?'✦':'·';
    e.style.setProperty('--x',Math.random()*100+'%');e.style.setProperty('--y',Math.random()*100+'%');
    e.style.setProperty('--size',(5+Math.random()*12)+'px');e.style.setProperty('--dur',(1.6+Math.random()*3.2)+'s');e.style.setProperty('--delay',(-Math.random()*4)+'s');stars.appendChild(e);
  }
  const heartChars=['♡','♥','♡','❤'];
  for(let i=0;i<18;i++){
    const e=document.createElement('span');e.className='ambient-heart';e.textContent=heartChars[i%heartChars.length];
    e.style.setProperty('--x',Math.random()*100+'%');e.style.setProperty('--size',(12+Math.random()*22)+'px');e.style.setProperty('--dur',(9+Math.random()*9)+'s');e.style.setProperty('--delay',(-Math.random()*14)+'s');e.style.setProperty('--drift',(-45+Math.random()*90)+'px');e.style.setProperty('--op',(.18+Math.random()*.32).toFixed(2));hearts.appendChild(e);
  }
  const colors=['#ff7eb7','#a998ff','#ffd1e6','#f6a5c9','#9f8cff'];
  for(let i=0;i<9;i++){
    const e=document.createElement('span');e.className='balloon';e.style.setProperty('--x',(4+Math.random()*92)+'%');e.style.setProperty('--c',colors[i%colors.length]);e.style.setProperty('--dur',(13+Math.random()*10)+'s');e.style.setProperty('--delay',(-Math.random()*18)+'s');e.style.setProperty('--drift',(-70+Math.random()*140)+'px');balloons.appendChild(e);
  }
}
makeAmbient();

// ---------- Date countdown ----------
function pad(n){return String(Math.max(0,n)).padStart(2,'0')}
function tick(){
  const remaining=Math.max(0,TARGET-Date.now()), sec=Math.floor(remaining/1000);
  $('days').textContent=pad(Math.floor(sec/86400));
  $('hours').textContent=pad(Math.floor(sec%86400/3600));
  $('minutes').textContent=pad(Math.floor(sec%3600/60));
  $('seconds').textContent=pad(sec%60);
  if(remaining<=0&&!started){started=true;runSequence()}
}
setInterval(tick,100);tick();

// ---------- Cinematic 3-2-1 ----------
async function showNumber(n){
  const el=$('big-number');el.textContent=n;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');
  const halo=document.querySelector('.countdown-halo');
  if(halo){halo.animate([{transform:'scale(.3)',opacity:0},{transform:'scale(18)',opacity:.45},{transform:'scale(45)',opacity:0}],{duration:850,easing:'cubic-bezier(.15,.75,.25,1)'})}
  await wait(900);
}

// ---------- Reliable particle text/cake engine ----------
const canvas=$('birthday-canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
let W=innerWidth,H=innerHeight,D=1,particles=[],animationId=0;
function resize(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*D;canvas.height=H*D;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(D,0,0,D,0,0)}
addEventListener('resize',resize);resize();

function sampleText(text){
  const off=document.createElement('canvas');
  const ow=Math.floor(W);
  const oh=Math.floor(H);
  off.width=ow; off.height=oh;
  const o=off.getContext('2d',{willReadFrequently:true});

  o.clearRect(0,0,ow,oh);
  o.textAlign='center';
  o.textBaseline='middle';

  // Large enough to be beautiful, but always fit the COMPLETE word.
  let size=Math.min(170,H*.19);
  if(text==='HAPPY') size=Math.min(190,H*.20);
  if(text==='BIRTHDAY') size=Math.min(145,H*.155);
  if(text==='ANEESHA') size=Math.min(175,H*.18);

  const maxWidth=Math.min(W*.88,900);
  for(let i=0;i<100 && size>42;i++){
    o.font=`700 ${Math.floor(size)}px "Cormorant Garamond", Georgia, serif`;
    if(o.measureText(text).width<=maxWidth) break;
    size-=2;
  }

  o.fillStyle='#fff';
  o.fillText(text,ow/2,oh/2);

  const data=o.getImageData(0,0,ow,oh).data;
  const step=Math.max(2,Math.min(3,Math.floor(Math.min(W,H)/320)));
  const pts=[];

  for(let y=0;y<oh;y+=step){
    for(let x=0;x<ow;x+=step){
      if(data[(y*ow+x)*4+3]>90){
        pts.push({x,y});
      }
    }
  }

  // Keep enough targets for a dense, readable particle word.
  // Downsample only if necessary for mobile performance.
  if(pts.length>3600){
    const stride=pts.length/3600;
    const reduced=[];
    for(let i=0;i<pts.length;i+=stride) reduced.push(pts[Math.floor(i)]);
    return reduced;
  }
  return pts;
}
function addParticles(targets){
  particles=[];
  const count=targets.length;
  for(let i=0;i<count;i++){
    const t=targets[i];
    const a=Math.random()*Math.PI*2;
    const r=Math.max(W,H)*(.42+Math.random()*.55);
    particles.push({
      x:W/2+Math.cos(a)*r,
      y:H/2+Math.sin(a)*r,
      tx:t.x,ty:t.y,vx:0,vy:0,
      size:1.05+Math.random()*1.35,
      alpha:.78+Math.random()*.22,
      phase:Math.random()*Math.PI*2
    });
  }
}
function render(now,fade=1){
  ctx.clearRect(0,0,W,H);
  ctx.globalCompositeOperation='lighter';

  for(const p of particles){
    const dx=p.tx-p.x,dy=p.ty-p.y;
    p.vx+=dx*.021;
    p.vy+=dy*.021;
    p.vx*=.875;
    p.vy*=.875;
    p.x+=p.vx;
    p.y+=p.vy;

    const tw=.82+.18*Math.sin(now*.003+p.phase);
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size*(.95+.15*tw),0,Math.PI*2);
    ctx.fillStyle=`rgba(255,${205+Math.floor(45*tw)},${225+Math.floor(25*tw)},${p.alpha*fade})`;
    ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
}
async function formText(text,hold){
  cancelAnimationFrame(animationId);
  const targets=sampleText(text);
  addParticles(targets);

  const start=performance.now();
  await new Promise(resolve=>{
    function f(now){
      const p=Math.min(1,(now-start)/2300);
      const e=1-Math.pow(1-p,4);
      render(now,.18+.82*e);
      if(p<1) animationId=requestAnimationFrame(f);
      else resolve();
    }
    animationId=requestAnimationFrame(f);
  });

  // Let the completed word breathe for a moment so it is clearly readable.
  const settled=performance.now();
  await new Promise(resolve=>{
    function f(now){
      render(now,1);
      if(now-settled<hold) requestAnimationFrame(f);
      else resolve();
    }
    requestAnimationFrame(f);
  });

  await disperse(1500);
}
async function disperse(duration){
  const cx=W/2,cy=H/2,start=performance.now();
  for(const p of particles){const dx=p.x-cx,dy=p.y-cy,l=Math.hypot(dx,dy)||1;p.vx=dx/l*(2.5+Math.random()*5);p.vy=dy/l*(2.5+Math.random()*5)}
  await new Promise(resolve=>{function f(now){const k=Math.min(1,(now-start)/duration);ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vx*=.992;p.vy*=.992;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.283);ctx.fillStyle=`rgba(255,205,230,${p.alpha*(1-k)})`;ctx.fill()}ctx.globalCompositeOperation='source-over';if(k<1)requestAnimationFrame(f);else{ctx.clearRect(0,0,W,H);resolve()}}requestAnimationFrame(f)})
}

// ---------- Cake with real candle phases ----------
function cakeTargets(){
  const pts=[],cx=W/2,scale=Math.min(W,H)/900,base=H*.68;
  function layer(x1,x2,y1,y2){const step=Math.max(4,4.5*scale);for(let y=y1;y<=y2;y+=step)for(let x=x1;x<=x2;x+=step){if(x-x1<8*scale||x2-x<8*scale||y-y1<8*scale||y2-y<8*scale||Math.random()<.33)pts.push({x,y,type:'cake'})}}
  layer(cx-230*scale,cx+230*scale,base-95*scale,base-35*scale);
  layer(cx-185*scale,cx+185*scale,base-165*scale,base-95*scale);
  layer(cx-135*scale,cx+135*scale,base-225*scale,base-165*scale);
  // frosting drips
  for(let i=0;i<35;i++){const x=cx-225*scale+i*13*scale,len=(i%4+1)*7*scale;for(let y=0;y<len;y+=4*scale)pts.push({x,y:base-35*scale+y,type:'frost'})}
  // candles and flames
  [-85,0,85].forEach((dx,index)=>{
    for(let y=base-315*scale;y<base-225*scale;y+=4.5*scale)pts.push({x:cx+dx*scale,y,type:'candle',candle:index});
    for(let i=0;i<30;i++){const q=i/29;pts.push({x:cx+dx*scale+(Math.random()-.5)*16*scale*(1-q),y:base-350*scale+q*34*scale,type:'flame',candle:index})}
  });
  return pts;
}
async function formCake(){
  const targets=cakeTargets();
  particles=[];
  const count=Math.min(2400,Math.max(1500,targets.length));

  for(let i=0;i<count;i++){
    const t=targets[i%targets.length];
    const a=Math.random()*Math.PI*2;
    const r=Math.max(W,H)*(.55+Math.random()*.65);
    particles.push({
      x:W/2+Math.cos(a)*r,
      y:H/2+Math.sin(a)*r,
      tx:t.x,ty:t.y,vx:0,vy:0,
      size:.75+Math.random()*1.7,
      alpha:.65+Math.random()*.35,
      type:t.type,candle:t.candle,phase:Math.random()*6.28
    });
  }

  // Make the candles/flames visibly denser than the cake body.
  const cx=W/2,scale=Math.min(W,H)/900,base=H*.68;
  [-85,0,85].forEach((dx,index)=>{
    for(let i=0;i<75;i++){
      const q=i/74;
      particles.push({
        x:W/2+(Math.random()-.5)*W,
        y:H/2+(Math.random()-.5)*H,
        tx:cx+dx*scale+(Math.random()-.5)*5*scale,
        ty:base-(350-q*34)*scale,
        vx:0,vy:0,size:1+Math.random()*1.5,
        alpha:.8+Math.random()*.2,type:'flame',candle:index,
        phase:Math.random()*6.28
      });
    }
  });

  // FORM CAKE
  const start=performance.now();
  await new Promise(resolve=>{
    function frame(now){
      const p=Math.min(1,(now-start)/2800);
      const e=1-Math.pow(1-p,3);
      ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation='lighter';

      for(const q of particles){
        q.vx+=(q.tx-q.x)*(.018+.025*e);
        q.vy+=(q.ty-q.y)*(.018+.025*e);
        q.vx*=.89;q.vy*=.89;
        q.x+=q.vx;q.y+=q.vy;

        let rgb='255,205,230';
        let radius=q.size;
        if(q.type==='flame'){
          rgb='255,178,75';
          radius=q.size*1.9;
        }else if(q.type==='candle'){
          rgb='255,235,245';
          radius=q.size*1.15;
        }else if(q.type==='frost'){
          rgb='255,220,238';
        }

        ctx.beginPath();
        ctx.arc(q.x,q.y,radius,0,Math.PI*2);
        ctx.fillStyle=`rgba(${rgb},${q.alpha*(.45+.55*e)})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation='source-over';

      if(p<1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });

  $('cake-caption').style.opacity='1';
  await wait(900);

  // CANDLE FLICKER — deliberately obvious for 2.8 seconds.
  const flickerStart=performance.now();
  await new Promise(resolve=>{
    function frame(now){
      const elapsed=now-flickerStart;
      ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation='lighter';

      for(const q of particles){
        if(q.type==='flame'){
          q.x += Math.sin(now*.018+q.phase)*.55;
          q.y += Math.sin(now*.021+q.phase)*.25;
          const pulse=1.15+.35*Math.sin(now*.014+q.phase);
          ctx.beginPath();
          ctx.arc(q.x,q.y,q.size*pulse*2,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,175,70,${q.alpha})`;
          ctx.fill();
        }else{
          ctx.beginPath();
          ctx.arc(q.x,q.y,q.size,0,Math.PI*2);
          const rgb=q.type==='candle'?'255,235,245':'255,205,230';
          ctx.fillStyle=`rgba(${rgb},${q.alpha})`;
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation='source-over';

      if(elapsed<2800) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });

  // CANDLE BLOW-OUT — flames shoot upward and sideways, shrink, and vanish.
  const blowStart=performance.now();
  await new Promise(resolve=>{
    function frame(now){
      const k=Math.min(1,(now-blowStart)/1700);
      ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation='lighter';

      for(const q of particles){
        if(q.type==='flame'){
          q.x += 1.2 + k*7 + Math.sin(q.phase)*.35;
          q.y -= 1.5 + k*5;
          const a=q.alpha*Math.max(0,1-k);
          ctx.beginPath();
          ctx.arc(q.x,q.y,q.size*(1.8-1.1*k),0,Math.PI*2);
          ctx.fillStyle=`rgba(255,180,80,${a})`;
          ctx.fill();

          // little smoke/spark trail
          if(k<.7){
            ctx.beginPath();
            ctx.arc(q.x-3,q.y+8,q.size*.55,0,Math.PI*2);
            ctx.fillStyle=`rgba(235,225,240,${a*.35})`;
            ctx.fill();
          }
        }else{
          ctx.beginPath();
          ctx.arc(q.x,q.y,q.size,0,Math.PI*2);
          const rgb=q.type==='candle'?'255,235,245':'255,205,230';
          ctx.fillStyle=`rgba(${rgb},${q.alpha})`;
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation='source-over';

      if(k<1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });

  await wait(450);
  $('cake-caption').style.opacity='0';
  await wait(350);
  await disperseCake(1500);
  ctx.clearRect(0,0,W,H);
}
async function disperseCake(duration){const start=performance.now();for(const p of particles){const dx=p.x-W/2,dy=p.y-H*.62,l=Math.hypot(dx,dy)||1;p.vx=dx/l*(1.5+Math.random()*4);p.vy=dy/l*(1.5+Math.random()*4)}await new Promise(resolve=>{function f(now){const k=Math.min(1,(now-start)/duration);ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vx*=.993;p.vy*=.993;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.283);ctx.fillStyle=`rgba(255,210,230,${p.alpha*(1-k)})`;ctx.fill()}ctx.globalCompositeOperation='source-over';if(k<1)requestAnimationFrame(f);else resolve()}requestAnimationFrame(f)})}

// ---------- Reference heart ending ----------
// Direct JavaScript recreation of the Python turtle code visible in the supplied reference:
// heart(t, scale) + 10,000 soft random strokes + 3,500 brighter outline strokes.
const heartCanvas=$('heart-canvas');
const hctx=heartCanvas?heartCanvas.getContext('2d'):null;
let HW=innerWidth,HH=innerHeight,HD=1;
function resizeHeart(){
  if(!heartCanvas)return;
  HD=Math.min(devicePixelRatio||1,2); HW=innerWidth; HH=innerHeight;
  heartCanvas.width=HW*HD; heartCanvas.height=HH*HD;
  heartCanvas.style.width=HW+'px'; heartCanvas.style.height=HH+'px';
  hctx.setTransform(HD,0,0,HD,0,0);
}
addEventListener('resize',resizeHeart); resizeHeart();
function heartPoint(a,scale){
  const x=16*Math.pow(Math.sin(a),3)*scale;
  const y=(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*scale;
  return [x,y];
}
function drawReferenceHeart(){
  if(!hctx)return;
  const cx=HW/2,cy=HH*.47;
  const scale=Math.min(HW,HH)/950;
  const soft=[];
  const bright=[];
  // Same random distributions as the supplied Python: 10,000 background strokes.
  for(let i=0;i<10000;i++){
    const a=Math.random()*Math.PI*2;
    const sc=.5+Math.random()*15;
    const [x,y]=heartPoint(a,sc*scale);
    const ang=Math.atan2(y,x)+(-.5+Math.random());
    const len=4+Math.random()*10;
    soft.push({x:cx+x,y:cy-y,x2:cx+x+len*Math.cos(ang),y2:cy-y-len*Math.sin(ang),w:.5+Math.random()*.7,
      r:1,g:.25+Math.random()*.4,b:.55+Math.random()*.4,a:.35+Math.random()*.55});
  }
  // Same second pass: 3,500 brighter outline strokes.
  for(let i=0;i<3500;i++){
    const a=Math.random()*Math.PI*2;
    const [x,y]=heartPoint(a,16*scale);
    const ang=Math.atan2(y,x)+(-.35+Math.random()*.7);
    const len=18+Math.random()*14;
    const jx=-2+Math.random()*4, jy=-2+Math.random()*4;
    bright.push({x:cx+x+jx,y:cy-y-jy,x2:cx+x+len*Math.cos(ang),y2:cy-y-len*Math.sin(ang),w:.4+Math.random()*.5,
      r:1,g:.45+Math.random()*.3,b:.65+Math.random()*.3,a:.55+Math.random()*.45});
  }
  const begin=performance.now();
  const batches=[{arr:soft,chunk:90},{arr:bright,chunk:70}];
  let stage=0,index=0;
  hctx.clearRect(0,0,HW,HH); hctx.globalCompositeOperation='lighter';
  return new Promise(resolve=>{
    function frame(){
      const b=batches[stage];
      if(!b){
        hctx.globalCompositeOperation='source-over';
        resolve();return;
      }
      const end=Math.min(index+b.chunk,b.arr.length);
      for(let i=index;i<end;i++){
        const q=b.arr[i];
        hctx.beginPath(); hctx.moveTo(q.x,q.y); hctx.lineTo(q.x2,q.y2);
        hctx.lineWidth=q.w;
        hctx.strokeStyle=`rgba(${Math.round(q.r*255)},${Math.round(q.g*255)},${Math.round(q.b*255)},${q.a})`;
        hctx.stroke();
      }
      index=end;
      if(index>=b.arr.length){stage++;index=0;}
      setTimeout(()=>requestAnimationFrame(frame),8);
    }
    requestAnimationFrame(frame);
  });
}
async function playReferenceHeart(){
  if(!heartCanvas)return;
  hctx.clearRect(0,0,HW,HH);
  await drawReferenceHeart();
  // Keep the completed heart on screen, just as turtle.done() leaves the drawing visible.
  await wait(5000);
}

// ---------- Main sequence ----------
async function runSequence(){
  show(screens.countdown);await wait(350);await showNumber(3);await wait(100);await showNumber(2);await wait(100);await showNumber(1);await wait(450);
  await startMusic(true);show(screens.birthday);await wait(250);
  await formText('HAPPY',1200);await formText('BIRTHDAY',1200);await formText('ANEESHA',1500);
  await wait(350);await formCake();await wait(500);
  show(screens.memory);await wait(5600);show(screens.video);
}

// Test shortcut: ?skip=1 jumps directly into the 3-2-1 sequence.
if(TEST_MODE){const b=document.createElement('button');b.className='debug';b.textContent='TEST BIRTHDAY';b.onclick=()=>{if(!started){started=true;runSequence()}};document.body.appendChild(b)}

// Video controls + music gap. The background track pauses for the message video
// and resumes automatically when the video finishes, then continues through the heart ending.
function wireVideo(id,buttonId){
  const v=$(id),b=$(buttonId);
  if(!v||!b)return;
  b.onclick=async()=>{
    try{await v.play();b.classList.add('hidden');}
    catch(e){v.controls=true}
  };
  v.onplay=()=>{b.classList.add('hidden'); if(id==='message-video')pauseMusic();};
  v.onpause=()=>{if(!v.ended)b.classList.remove('hidden')};
}
wireVideo('message-video','play-video');
wireVideo('final-video','final-play');

const messageVideo=$('message-video');
if(messageVideo){
  messageVideo.addEventListener('ended',async()=>{
    await resumeMusic();
    show(screens.heart);
    await wait(250);
    await playReferenceHeart();
  });
}

window.addEventListener('error',e=>console.error('Birthday page error:',e.error||e.message));
