// Animated pixel-art forest camp, drawn on a 200x120 canvas at 8fps
// Copied almost as-is from design/preamar-layout.html (an art asset, not app logic).
/* eslint-disable */
// @ts-nocheck

/** Starts drawing the forest on the canvas and returns a function that stops it. */
// HTMLCanvasElement is the TypeScript type for a <canvas> element on the page,
// <canvas> is an HTML element that works like a blank grid of pixels. You don't put text or buttons inside it.
// Instead, JavaScript paints on it, one pixel or rectangle at a time.
export function startForest(canvas: HTMLCanvasElement): () => void {
    let raf = 0;

    // Taken from design/preamar-layout.html, lines 76-199 (with slight changes to lines 76 and 199).
    // -------------------
    const cv=canvas,ctx=canvas.getContext('2d'),W=200,H=120,O='#070A06';
    const hs=(x,y)=>(((Math.round(x)*73856093)^(Math.round(y)*19349663))>>>0)%1000/1000;
    const lerp=(a,b,t)=>a+(b-a)*t,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),eo=t=>1-(1-t)*(1-t),eio=t=>t<.5?2*t*t:1-2*(1-t)*(1-t);
    const BY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>v/16),bay=(x,y)=>BY[(Math.round(y)&3)*4+(Math.round(x)&3)];
    const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const PAL={bark:['#0A0705','#1C130D','#302217','#4A3522','#6A4C31','#906A42'],leaf:['#040906','#0A160D','#122616','#1C3C20','#2A562C','#40763A'],deep:['#020403','#060C08','#0A160D','#11221A'],floor:['#0A0D08','#141E10','#1E2E17','#2A4020','#38522A','#4A6634'],water:['#04090F','#08131F','#0E2032','#163048','#224A64','#346A84'],bank:['#0C0A08','#1A1510','#282018','#382D22','#4A3C2E','#5E4E3C']};
    const PR={};for(const k in PAL)PR[k]=PAL[k].map(rgb);
    const hor=x=>66+3*Math.sin(x*.05),Zg=y=>lerp(-60,30,(y-66)/54),ybase=Z=>66+(Z+60)/90*54;
    const FX=-52,FY=22,FZ=Zg(95);let flick=1;
    function L(px,py,pz,nx,ny,nz){const dx=FX-px,dy=FY-py,dz=FZ-pz,d=Math.sqrt(dx*dx+dy*dy+dz*dz)+.01,df=Math.max(0,(nx*dx+ny*dy+nz*dz)/d);const amb=.26*Math.max(.25,1-d/170);return amb+1.0*df*flick/(1+d*d/3000)}
    const rc=y=>16+(y-64)*2.7+9*Math.sin(y*.11),rw=y=>2.5+(y-64)*.24;
    const canopy=x=>26+6*Math.sin(x*.09)+4*Math.cos(x*.23);
    const trunks=[[8,18,24],[192,16,20],[30,7,-30],[52,5,-48],[70,8,-40],[96,4,-58],[118,6,-50],[136,9,-34],[158,5,-55],[176,7,-42]].sort((a,b)=>a[2]-b[2]);
    const N=W*H,T=new Uint8Array(N),A=new Float32Array(N*6),J=new Float32Array(N),K=new Uint8Array(N),ZB=new Float32Array(N).fill(-999);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,X=x-100,Y=y-58;
    const ed=Math.min(x,W-1-x,y*1.6,(H-1-y)*2.2),vg=ed<10?ed/10:1;if(vg<1&&bay(x,y)>vg+.05*Math.sin(x*.3+y*.2)){T[i]=0;ZB[i]=999;continue}
    let hit=null;for(const tr of trunks){if(y<=ybase(tr[2])&&Math.abs(x-tr[0])<=tr[1]/2)hit=tr}
    if(hit){T[i]=2;K[i]=1;const hw=hit[1]/2,nx=cl((x-hit[0])/(hw+.5),-1,1),nz=Math.sqrt(1-nx*nx);A.set([X,Y,hit[2]+nz*hw,nx,0,nz],i*6);ZB[i]=hit[2]+nz*hw;J[i]=(Math.round(y*.7+nx*2+hit[0])%4===0?-.2:0)+(hs(x,y)<.07?-.25:0);continue}
    const sk=((x-150)/17)**2+((y-9)/6)**2;if(y<canopy(x)+2){if(sk<1){T[i]=6;J[i]=hs(x,y);continue}T[i]=2;K[i]=0;const v=Math.sin(x*.55+Math.sin(y*.45)*2)*Math.cos(y*.6+x*.18);A.set([X,Y,-45-v*8,v*.2,.62,.76],i*6);J[i]=v*.25+(hs(x,y)<.08?-.3:0)+(sk<1.4?-.2:0);continue}
    if(y<hor(x)){T[i]=7;A.set([X,Y,-75,0,0,1],i*6);J[i]=hs(x,y)<.12?.45:0;continue}
    const Z=Zg(y),dr=Math.abs(x-rc(y));if(dr<rw(y)){T[i]=4;A.set([X,30,Z,0,-1,0],i*6);J[i]=0;continue}
    if(dr<rw(y)+2+(y-66)*.04){T[i]=8;A.set([X,30,Z,(x>rc(y)?-1:1)*.3,-.9,.2],i*6);J[i]=0;continue}
    T[i]=3;A.set([X,30,Z,0,-1,0],i*6);J[i]=0}
    const img=ctx.createImageData(W,H);
    function base(t){for(let i=0;i<N;i++){const tp=T[i],o=i*4;img.data[o+3]=255;if(!tp){img.data[o]=img.data[o+1]=img.data[o+2]=0;continue}let c;const x=i%W,y=(i/W)|0;
    if(tp===6){c=[14,20,46];if(J[i]<.05)c=[176,172,206];const mx=x-158,my=y-7;if(mx*mx+my*my<=9&&(mx+1.5)**2+(my+.5)**2>5)c=[232,220,184]}
    else{const p=A.subarray(i*6,i*6+6);let j=J[i];if(tp===2&&!K[i])j+=.04*Math.sin(t*.5+x*.3+y*.2);if(tp===4)j+=.05*Math.sin(t*1.2-y*.9+x*.3);const l=L(p[0],p[1],p[2],p[3],p[4],p[5])+j,pal=tp===2?(K[i]?PR.bark:PR.leaf):tp===3?PR.floor:tp===4?PR.water:tp===8?PR.bank:PR.deep;const dith=(tp===3||tp===8)?(bay(x,y)-.5)*.6+.5:bay(x,y);c=pal[cl(Math.floor(l*(pal.length-1)+dith-.3),0,pal.length-1)]}
    img.data[o]=c[0];img.data[o+1]=c[1];img.data[o+2]=c[2]}ctx.putImageData(img,0,0)}
    let curZ=null;
    const P=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;const i=y*W+x;if(ZB[i]>=999)return;if(curZ!==null&&ZB[i]>curZ)return;ctx.fillStyle=c;ctx.fillRect(x,y,1,1)};
    const R=(x,y,w,h,c)=>{for(let j=0;j<Math.round(h);j++)for(let k=0;k<Math.round(w);k++)P(x+k,y+j,c)};
    const SP={teal:['#0A1C20','#173E40','#245E5E','#3A8A84','#5AB0A8','#9AD8C8'],ochre:['#200F06','#4A2C12','#7A4C1E','#B07A2A','#D9A040','#F2CC7A'],violet:['#140C22','#2E1C48','#4E3478','#7458A8','#9A7AC8','#C8B0E8'],red:['#1E0808','#481612','#782A22','#A84436','#C85A4A','#E89A80'],stem:['#1E1A18','#3E3632','#6A6052','#9A8E78','#C8BCA0','#F2ECDC'],wood:['#140A06','#2C180E','#4A2C18','#6E4424','#946038','#BC8650'],stone:['#0E0C10','#201C22','#36303A','#524A52','#78706E','#A0968A'],fern:['#050B06','#0E2210','#1A3A1A','#2A5A26','#3E7A32','#5E9A44'],leather:['#0C0704','#1A100A','#2A1A10','#3C2617','#523620','#6A4A2E'],patch:['#0E0C08','#1E1A12','#30291C','#433A28','#584D36','#6E6246'],steel:['#121418','#22262C','#363C44','#4E5660','#6A747E','#8A949C'],rust:['#3A1A0C','#5A2A14'],cent:['#1A0806','#3E140C','#6A2414','#9A3A1E','#C85A2A','#E8884A'],bat:['#0A060C','#160F1C','#22182A','#33283C','#4A3A54','#625070'],fung:['#120A04','#24160A','#3A2612','#52381C','#6A4A28','#866036'],moss:['#0A1408','#14240E','#1E3616','#2A4A1E','#3A6026','#4E7832']};
    const shadeP=(pal,l,x,y)=>pal[cl(Math.floor(l*(pal.length-1)+bay(x,y)-.25),0,pal.length-1)];
    function ell(cx,cy,rx,ry,pal,Z,half,out){const r=Math.ceil(Math.max(rx,ry))+1;const skip=(x,y)=>(half==='top'&&y>0);if(out!==false)for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(skip(x,y))continue;if((x/(rx+1))**2+(y/(ry+1))**2<=1)P(cx+x,cy+y,O)}
    for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(skip(x,y))continue;const lx=x/rx,ly=y/ry,d=lx*lx+ly*ly;if(d>1)continue;const nz=Math.sqrt(1-d);P(cx+x,cy+y,shadeP(pal,L(cx-100+x,cy-58+y,Z+nz*Math.min(rx,ry),lx*.8,ly*.8,nz),cx+x,cy+y))}}
    function cyl(x,y0,y1,w,pal,Z){for(let y=y0;y<=y1;y++){P(x-w-1,y,O);P(x+w+1,y,O);for(let i=-w;i<=w;i++){const nx=i/(w+.5),nz=Math.sqrt(1-nx*nx);P(x+i,y,shadeP(pal,L(x-100+i,y-58,Z+nz*w,nx,0,nz),x+i,y))}}}
    function shadow(cx,cy,rx){for(let x=-rx;x<=rx;x++)for(let y=-1;y<=1;y++)if((x/rx)**2+(y/1.6)**2<1&&(x+y)%2===0)P(cx+x,cy+y,'#040503')}
    const mossN=(x,y)=>Math.sin(x*.9+y*.4)+Math.sin(x*.37-y*1.1)*.8;
    function roots(tr){const[tx,w,Z]=tr,by=ybase(Z),hw=w/2,s=Math.max(.8,w/7);curZ=Z+2;
    for(let x=-hw-4*s;x<=hw+4*s;x++)for(let y=0;y<=1.6*s+1;y++)if((x/(hw+4*s))**2+(y/(1.6*s+1))**2<1&&(Math.round(x)+y)%2===0)P(tx+x,by+y+1,'#040503');
    const defs=[[-1,1,.95,0],[-1,.55,.7,1],[1,.6,.8,2],[1,1.05,1,3]];const segs=[];
    defs.forEach(([side,len,th,id])=>{const L0=(4+hs(tx,id)*3)*s*len+2,T0=th*s*1.6+.6,x0=tx+side*hw*.4,y0=by-2.6*s,x1=tx+side*(hw+L0),y1=by+.8+hs(tx,id+5)*1.4*s;if(Math.abs(x1-rc(y1))<rw(y1)+3)return;segs.push({x0,y0,cx:lerp(x0,x1,.35),cy:by-.6*s,x1,y1,T0})});
    const pt=(g,q)=>{const a=(1-q)*(1-q),b=2*(1-q)*q,c=q*q;return[a*g.x0+b*g.cx+c*g.x1,a*g.y0+b*g.cy+c*g.y1]};
    const disc=(x,y,r,f)=>{for(let j=-Math.ceil(r);j<=r;j++)for(let i=-Math.ceil(r);i<=r;i++)if(i*i+j*j<=r*r+.3)f(x+i,y+j,i/(r+.01),j/(r+.01))};
    segs.forEach(g=>{for(let q=0;q<=.93;q+=.04){const[x,y]=pt(g,q),r=g.T0*Math.pow(1-q,.75)+.5;disc(x,y,r+1,(px,py)=>P(px,py,O))}});
    segs.forEach(g=>{for(let q=0;q<=1;q+=.03){const[x,y]=pt(g,q),r=g.T0*Math.pow(1-q,.75)+.5;disc(x,y,r,(px,py,nx,ny)=>{const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));let l=L(px-100,py-58,Z+nz*r,nx*.5,ny*.9-.2,nz)+(ny<-.3?.08:0);if(q>.85)l-=.45*(q-.85)/.15;const mossy=ny<0&&q<.6&&mossN(px,py)>.4;P(px,py,mossy?shadeP(SP.moss,l+.05,px,py):shadeP(PAL.bark,l,px,py))})}});
    for(let y=by-3*s;y<=by;y++){const k=(y-(by-3*s))/(3*s),ww=hw+eio(k)*1.6*s;for(let x=-ww;x<=ww;x++){const nx=x/(ww+.5),nz=Math.sqrt(Math.max(0,1-nx*nx));const px=tx+x;let c=Math.abs(Math.abs(x)-ww)<.6?O:shadeP(PAL.bark,L(px-100,y-58,Z+nz*ww,nx,0,nz),px,y);if(k>.4&&Math.abs(x)<ww-.6&&mossN(px,y)>.7)c=shadeP(SP.moss,L(px-100,y-58,Z+nz*ww,nx,-.4,nz),px,y);P(px,y,c)}}curZ=null}
    const occ=[[34,62,74,101],[18,48,98,116],[154,178,88,110],[172,184,102,113],[146,154,98,106],[169,175,109,116],[77,91,103,116],[88,96,110,118],[14,26,80,92],[142,154,73,83],[62,74,106,116],[108,116,79,88],[170,182,84,94],[116,122,86,91],[184,190,88,93],[98,104,93,97],[58,62,77,81]];
    const free=(x,y,r)=>{for(const tr of trunks)if(y-r<=ybase(tr[2])+3&&Math.abs(x-tr[0])<tr[1]/2+r+tr[1]*.9)return false;for(const[a,b,c,d] of occ)if(x+r>=a&&x-r<=b&&y+r>=c&&y-r<=d)return false;return true};
    const tufts=[];for(let k=0;k<60&&tufts.length<16;k++){const x=6+hs(k,3)*188,y=70+hs(k,11)*46;const i=Math.round(y)*W+Math.round(x);if(T[i]!==3)continue;if(!free(x,y,3))continue;if(Math.abs(x-rc(y))<rw(y)+5)continue;tufts.push([x,y,hs(k,5)<.6?0:1,k])}
    function mush(x,by,h,rx,pal,ph,t,sq){const Z=Zg(by);curZ=Z;const b=Math.sin(t*1.2+ph)*.025,sx=1+(sq?sq[0]:0)-b*.5,sy=1+(sq?sq[1]:0)+b,ch=Math.round(h*(1+(sq?sq[1]:0)*.5));shadow(x,by,Math.round(rx*.8));const w=Math.max(1,Math.round(rx*.22));cyl(x,by-ch,by,w,SP.stem,Z);
    const cy=by-ch,rX=rx*sx,rY=rx*.62*sy;ell(x,cy,rX,rY,pal,Z,'top');R(x-rX+1,cy+1,rX*2-1,1,O);R(x-rX+2,cy,rX*2-3,1,pal[1]);for(const[a,b2] of[[-.45,-.5],[.15,-.75],[.5,-.3],[-.1,-.25]])if(rx>4)P(x+a*rX,cy+b2*rY,shadeP(pal,L(x-100,cy-58,Z,0,-.6,.8)+.35,x,cy));curZ=null}
    function fern(x,y,s,t,ph){curZ=Zg(y);for(let f=-3;f<=3;f++){const ang=-1.57+f*.38,len=Math.round((9-Math.abs(f))*s);const sw=Math.sin(t*.6+ph+f*.3)*.4;for(let k=0;k<len;k++){const q=k/len,px=x+Math.cos(ang)*k+f*k*.05+sw*q*q*len*.15,py=y+Math.sin(ang)*k*.85+k*k*.018*Math.abs(f),l=L(px-100,py-58,Zg(y),Math.cos(ang)*.4,-.5,.7);P(px,py,shadeP(SP.fern,l,px,py));if(k%2===0&&k>1&&k<len-1){P(px-1,py+1,shadeP(SP.fern,l-.15,px,py));P(px+1,py+1,shadeP(SP.fern,l-.15,px,py))}}}curZ=null}
    function grass(x,y,n,t,ph){curZ=Zg(y);for(let i=0;i<n;i++){const bx=x+i*1.3-n*.6,h=3+((i*7)%3),sw=Math.sin(t*.8+ph+i*.4)*.7;for(let k=0;k<h;k++){const q=k/h;P(bx+sw*q*q*1.6,y-k,shadeP(PAL.floor,L(bx-100,y-k-58,Zg(y),0,-.6,.6)+.2-q*.1,bx,y-k))}}curZ=null}
    function groundDetail(t){tufts.forEach(([x,y,kind,k])=>{if(kind===0)grass(x,y,3,t,k);else{curZ=Zg(y);const l=L(x-100,-28,Zg(y),0,-1,0);P(x,y,shadeP(SP.wood,l,x,y));P(x+1,y,shadeP(SP.wood,l-.1,x,y));curZ=null}})}
    function rock(x,y,rx,ry){curZ=Zg(y+ry);shadow(x,y+ry,Math.round(rx));ell(x,y,rx,ry,SP.stone,Zg(y+ry),null);curZ=null}
    function E2(x,y){for(let j=-2;j<=2;j++)for(let i=-1;i<=1;i++)if(i*i/2+j*j/5<1)P(x+i,y+j,Math.abs(j)===2?O:'#BC8650')}
    function river(t){for(let k=0;k<14;k++){const p=((t*.06+k/14)%1),y=66+p*54,x=rc(y)+((k*7)%5-2)*rw(y)*.32,len=1+Math.round(p*2);for(let j=0;j<len;j++){const yy=y+j*.4,xx=x+j;if(Math.abs(xx-rc(yy))<rw(yy)-.5)P(xx,yy,shadeP(PAL.water,L(xx-100,-28,Zg(yy),0,-1,0)+.5,xx,yy))}}
    for(const[ry2,dx,r] of[[80,1,2],[95,-3,2.5],[106,4,3],[112,-6,2.4]]){const x=rc(ry2)+dx;rock(x,ry2,r,r*.6);const f=Math.floor(t*2)%2,c=shadeP(PAL.water,L(x-100,-28,Zg(ry2),0,-1,0)+.6,x,ry2);P(x-r-1-f,ry2+1,c);P(x+r+1,ry2,c)}}
    const bankList=[[74,-1,2,1.6],[78,1,1,1.8],[86,-1,1,2.2],[90,1,2,1.6],[99,1,1,2.6],[103,-1,2,2],[109,1,3,2.2],[116,-1,1,3],[115,1,2,2.4],[71,1,1,1.3]].map(([y,s,dx,r])=>[rc(y)+s*(rw(y)+dx+r),y,r]).filter(([x,y,r])=>free(x,y,r));
    const rocksExtra=[[124,85,2.2],[64,82,1.8],[100,78,1.6]].filter(([x,y,r])=>free(x,y,r));
    function smoke(t){for(let i=0;i<3;i++){const p=(t*.08+i/3)%1,ease=p*p*.4+p*.6,x=48+ease*20+Math.sin(p*4+i*1.3)*2,y=76-ease*50,r=1.5+p*3.5;if(p>.85)continue;curZ=Zg(95)-p*20;
    const fade=(p<.1?p/.1:p>.55?(.85-p)/.3:1)*.45;for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){const d=(xx*xx+yy*yy)/(r*r);if(d>1)continue;if(bay(x+xx,y+yy)>fade*(1-d*.5))continue;P(x+xx,y+yy,(xx+yy<-r*.3)?'#3A3A40':'#2A2A30')}}curZ=null}
    function fire(t){const bx=48,by=95,st=[];curZ=Zg(by);for(let k=0;k<10;k++){const q=k/10*6.28;st.push([bx+Math.cos(q)*12,by+Math.sin(q)*3.6])}
    st.filter(s=>s[1]<by).forEach(([x,y])=>ell(x,y,2.6,1.8,SP.stone,Zg(y),null));
    for(const[x0,y0,x1,y1] of[[39,97,57,92],[39,92,57,97]]){for(let k=0;k<=20;k++){const x=lerp(x0,x1,k/20),y=lerp(y0,y1,k/20);for(let j=-2;j<=2;j++)P(x,y+j,Math.abs(j)===2?O:j<0?SP.wood[4]:j===0?SP.wood[3]:SP.wood[2])}E2(x0,y0);E2(x1,y1)}
    const fr=Math.floor(t*6)/6;for(let k=0;k<=15;k++){const h=k/15,w=6*Math.pow(1-h,.65)*(.88+.14*Math.sin(h*6-fr*9)),co=1.1*Math.sin(h*4-fr*7)*h;for(let x=-8;x<=8;x++){const d=Math.abs(x-co)/Math.max(w,.01);if(d>1)continue;P(bx+x,by-2-k,d>.9?'#7A1E14':d<.33&&h<.55?'#FFF0B0':d<.6&&h<.8?'#F8D060':d<.85?'#F08A2A':'#C8402A')}}
    for(let i=0;i<2;i++){const p=(t*1.1+i/2)%1,y=by-16-p*7,x=bx+Math.sin(p*5+i*2)*1.5,r=1.8*(1-p);if(r>.6)for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++)if(xx*xx+yy*yy<=r*r)P(x+xx,y+yy,(xx*xx+yy*yy)<r*r*.3?'#F8D060':'#F08A2A')}
    st.filter(s=>s[1]>=by).forEach(([x,y])=>ell(x,y,2.6,1.8,SP.stone,Zg(y),null));
    for(let i=0;i<3;i++){const p=(t*.35+i/3)%1;P(bx+Math.sin(p*6+i)*2.5+(i-1)*2,by-12-p*26,p<.4?'#F8D060':p<.7?'#E07A3A':'#6A2A2A')}curZ=null}
    function satchel(t){const x0=22,x1=40,y0=103,y1=113,Z=Zg(y1);curZ=Z;shadow(31,y1+1,10);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const cx=(x-x0)/(x1-x0)*2-1,cy=(y-y0)/(y1-y0)*2-1,sag=Math.abs(cx)>.75&&cy<-.4;if(sag&&hs(x,y)<.6)continue;
    const rough=hs(x,y*3)<.35;const edge=x===x0||x===x1||y===y0||y===y1;if(edge){if(!(rough&&y!==y1))P(x,y,O);continue}const nx=cx*.7,nz=Math.sqrt(1-nx*nx*.8);let l=L(x-100,y-58,Z+nz*4,nx,cy*.3,nz)*.85;if(hs(x+3,y)<.22)l-=.2;if(hs(x,y+7)<.08)l+=.12;P(x,y,shadeP(SP.leather,l,x,y))}
    for(let x=x0+1;x<x1;x++){const fy=y0+5+Math.round(1.4*Math.sin((x-x0)/(x1-x0)*Math.PI))+(hs(x,1)<.3?1:0);for(let y=y0+1;y<=fy;y++)P(x,y,shadeP(SP.leather,L(x-100,y-58,Z+5,((x-x0)/(x1-x0)*2-1)*.6,-.3,.8)*.9+(hs(x,y)<.2?-.2:.05),x,y));P(x,fy+1,O)}
    R(30,y0+5,3,4,O);P(31,y0+6,'#6A5A34');P(31,y0+7,'#4A3E24');
    for(let y=y1-5;y<=y1-2;y++)for(let x=x0+2;x<=x0+6;x++)P(x,y,(y===y1-5||y===y1-2||x===x0+2||x===x0+6)?((x+y)%2?'#5A503A':SP.patch[0]):shadeP(SP.patch,L(x-100,y-58,Z+4,-.6,0,.8)*.85,x,y));
    P(x1-3,y1-4,O);P(x1-4,y1-3,O);P(x1-3,y1-3,'#050302');P(x1-2,y1-3,O);P(x1-5,y1-2,'#5A4A30');P(x1-6,y1-1,'#5A4A30');
    for(let k=0;k<=18;k++){const x=x0+1+k,y=y0-Math.round(Math.sin(k/18*Math.PI)*5);P(x,y-1,O);P(x,y,SP.leather[2])}
    const tx=45,ty=114,hx=40,hy=104;for(let k=0;k<=11;k++){const x=lerp(tx,hx,k/11),y=lerp(ty,hy,k/11),ru=hs(k,7)<.3;P(x-1,y,O);P(x,y,ru?SP.rust[1]:shadeP(SP.steel,L(x-100,y-58,Z+3,-.5,-.2,.8)+.05,x,y));P(x+1,y,ru&&k%2?SP.rust[0]:shadeP(SP.steel,L(x-100,y-58,Z+3,.5,0,.8)*.85,x,y));P(x+2,y,O)}
    R(hx-3,hy-1,7,2,O);R(hx-2,hy-1,5,1,'#6A5428');P(hx+1,hy-1,'#4A3A1C');R(hx-1,hy-5,3,4,O);P(hx,hy-4,'#3A2414');P(hx,hy-3,'#4E3220');P(hx,hy-2,'#3A2414');R(hx-1,hy-7,3,2,O);P(hx,hy-6,'#7A6430');curZ=null;
    grass(24,114,5,t,0);grass(37,115,4,t,1.3);grass(44,115,3,t,2.2)}
    function cpath(s){if(s<62)return[214-s,92+1.2*Math.sin(s*.3)];if(s<71.4){const a=-Math.PI/2-(s-62)/3;return[152+Math.cos(a)*3,95+Math.sin(a)*3]}return[152+(s-71.4),98+1.2*Math.sin(s*.3)]}
    function centipede(t){const C=t%30;let s;if(C<10)s=C*6.4;else if(C<13)s=64+Math.sin((C-10)/3*Math.PI)*.5;else s=64+eio(Math.min(1,(C-13)/.6))*2+Math.max(0,C-13.6)*6.4;const pause=C>=10&&C<13,segs=[];
    for(let k=7;k>=0;k--){const ss=s-k*2.6;if(ss<0||ss>140)continue;const[x,y]=cpath(ss);segs.push({x,y:y+(pause?0:Math.sin(ss*1.1-t*6)*.4),k,ss})}
    segs.forEach(({x,y,k,ss})=>{const Z=Zg(y);curZ=Z;const ph=(Math.floor(t*8)+k)%4;if(k>0){const[x2,y2]=cpath(ss+1),dx=x2-x,dy=y2-y,m=Math.hypot(dx,dy)||1,nx=-dy/m,ny=dx/m;for(const sd of[-1,1]){const st=pause?0:[-.8,-.3,.8,.3][(ph+(sd>0?2:0))%4];const lx=x+nx*sd*2.2+st*dx/m,ly=y+ny*sd*1.2+1.5;P(lx,ly,O);P((x+lx)/2,(y+ly)/2+.5,SP.cent[1])}}
    const r=k===0?2.2:1.8-k*.05;ell(x,y,r,r*.8,SP.cent,Z,null);if(k>0&&k%2===0)P(x,y-1,SP.cent[3])});
    const h=segs.find(q=>q.k===0);if(h){curZ=Zg(h.y);const[x2]=cpath(s+1),dir=x2<h.x?-1:1,tw=pause?Math.sin(t*4):Math.sin(t*2.5)*.3,look=pause&&((t%3)>1.5)?1:0;P(h.x+dir,h.y-1,'#B8B0A0');P(h.x+dir*(1.5+look*.5),h.y-1,O);P(h.x,h.y-1,'#B8B0A0');P(h.x+dir*.4,h.y-1,O);
    for(let k=1;k<=4;k++){const q=k/4;P(h.x+dir*(1+k*.6),h.y-2-k*.7+tw*q*q*1.5,O);P(h.x+dir*(k*.4-.5),h.y-2-k*.9-tw*q*q*1.5,O)}P(h.x+dir*1.5,h.y+.5,'#8A4A52')}curZ=null}
    function br(x0,y0,x1,y1,Z,ph,t){const a=.025*Math.sin(t*.6+ph);return f=>{const dx=(x1-x0)*f,dy=(y1-y0)*f,an=a*f;return[x0+dx*Math.cos(an)-dy*Math.sin(an),y0+dx*Math.sin(an)+dy*Math.cos(an)+Math.sin(f*7)*.4*f]}}
    function branch(x0,y0,x1,y1,Z,ph,t,leaves){const at=br(x0,y0,x1,y1,Z,ph,t);curZ=Z+1;const n=Math.ceil(Math.hypot(x1-x0,y1-y0));for(let k=0;k<=n;k++){const[x,y]=at(k/n),w=k<n*.55?1:0;for(let j=-w-1;j<=w+1;j++)P(x,y+j,Math.abs(j)>w?O:shadeP(SP.wood,L(x-100,y-58+j,Z,0,j*.5,.8),x,y+j))}
    if(leaves)[[.6,-2],[.75,1.5],[.92,-1],[1,1],[.45,2]].forEach(([f,dy],i)=>{const[x,y0b]=at(f),fl=Math.sin(t*1.2+i*1.7+ph)*.35,y=y0b+dy+fl*.5;for(let a=-2;a<=2;a++)for(let b=-1;b<=1;b++)if(a*a/4+b*b<=1)P(x+a,y+b,shadeP(PAL.leaf,L(x-100,y-58,Z,0,.5,.8)+.12+(b<0?.08:0),x+a,y+b))});curZ=null;return at}
    function shelf(x,y,side,Z,r){curZ=Z+.5;for(let j=-1;j<=1;j++)for(let i=0;i<=r;i++){const d=(i/r)**2+(j/1.3)**2;if(d>1)continue;const px=x+side*i,py=y+j;P(px,py,j===1||d>.8?O:shadeP(SP.fung,L(px-100,py-58,Z,side*.3,-.6,.6)+(j<0?.1:-.05),px,py))}P(x+side*r*.5,y+1,O);curZ=null}
    function bat(at,f,ph,t,kind,Z){curZ=Z;const[ax,ay]=at(f),s=.07*Math.sin(t*.9+ph),c=(t+ph)%14;let sq=0,span=0,flap=0;
    if(kind===1){if(c>8.2&&c<8.5)sq=eo((c-8.2)/.3);else if(c>=8.5&&c<8.9){sq=1-eo((c-8.5)/.4);span=Math.round(eo((c-8.5)/.4)*6)}else if(c>=8.9&&c<10){span=6;flap=[-2,-1,1,0][Math.floor((c-8.9)*5)%4]}else if(c>=10&&c<10.4)span=Math.round((1-eo((c-10)/.4))*6)}
    const ry=4.2-sq*.6,rx=2.4+sq*.3,bx=ax+Math.sin(s)*(4+ry),byy=ay+Math.cos(s)*(1+ry);for(let k=0;k<=1;k++)P(lerp(ax,bx,k/2),lerp(ay,byy-ry,k/2),O);
    if(span>0){for(const fd of[-1,1])for(let k=1;k<=span;k++){const q=k/span,tipY=byy-1+flap*q+Math.abs(k-span/2)*.3;for(let y=byy-3+flap*q*.5;y<=tipY+1+(k<span?2:0);y++)P(bx+fd*(2+k),y,(k===span||y<=byy-3+flap*q*.5)?O:'#241C2C');if(k%2===0)P(bx+fd*(2+k),byy-2+flap*q*.5,'#0A060C')}}
    ell(bx,byy,rx,ry,SP.bat,Z,null);P(bx-1,byy+ry,O);P(bx+1,byy+ry,O);P(bx-2,byy+ry+1,O);P(bx+2,byy+ry+1,O);
    const bl=kind===2?((t+ph)%6)>5.8:((t+ph)%8)>7.8,yawn=kind===2&&c>11&&c<12.4,yo=yawn?(c<11.3?1:c>12.1?1:2):0;
    if(!bl&&!yawn){P(bx-1,byy+2,'#8A7440');P(bx+1,byy+2,'#8A7440')}else{P(bx-1,byy+2,O);P(bx+1,byy+2,O)}
    if(yo){R(bx-1,byy+3,3,yo,'#3A1420');P(bx,byy+3,O)}curZ=null}
    function firefly(t){const x=100+62*Math.sin(t*.06+1)+22*Math.sin(t*.14+2.3)+6*Math.sin(t*.33),y=62+22*Math.sin(t*.08+.4)+10*Math.sin(t*.18+1.7)+3*Math.sin(t*.43),z=-25+30*Math.sin(t*.05+.8);curZ=z;
    const pul=.4+.6*Math.max(0,Math.sin(t*1.2))**2;if(pul>.5){for(const[dx,dy] of[[-1,0],[1,0],[0,-1],[0,1]])if(bay(x+dx,y+dy)<pul*.6)P(x+dx,y+dy,'#8A7A1A')}
    P(x,y,pul>.6?'#FFF27A':pul>.45?'#F2D840':'#B89A28');curZ=null}
    let spores=[],lastPuff=-9,lf=-1;
    function frame(ms){const fi=Math.floor(ms/1000*8);if(fi!==lf){lf=fi;const t=fi/8;flick=1+.025*Math.round(Math.sin(t*.9)*2)/2;base(t);
    trunks.filter(tr=>tr[2]<0).forEach(roots);
    branch(115,40,103,36,-50,.4,t,true);branch(155,38,146,35,-55,1.1,t,true);branch(33,46,46,42,-30,2.3,t,true);branch(54,42,62,39,-48,3.1,t,false);
    const bb=branch(74,37,96,33,-40,0,t,true);branch(140,50,152,46,-34,1.7,t,true);branch(172,48,160,44,-42,2.8,t,true);branch(184,60,170,55,20,3.6,t,true);branch(17,54,32,50,24,4.4,t,true);
    bat(bb,.32,0,t,0,-40);bat(bb,.58,1.7,t,1,-40);bat(bb,.82,3.1,t,2,-40);
    for(const[y,r] of[[60,3],[66,2.5],[72,3]])shelf(140,y,1,-30,r);for(const[y,r] of[[62,2.5],[68,3]])shelf(66,y,-1,-36,r);
    river(t);groundDetail(t);bankList.forEach(([x,y,r])=>rock(x,y,r,r*.62));rocksExtra.forEach(([x,y,r])=>rock(x,y,r,r*.62));
    mush(146,80,5,3,SP.violet,.5,t);mush(151,81,3,2,SP.violet,1.5,t);
    grass(60,80,4,t,.5);grass(118,90,5,t,1.7);grass(186,92,4,t,2.9);grass(100,96,3,t,3.3);
    mush(22,88,6,4,SP.red,1,t);mush(17,90,4,2.5,SP.ochre,2,t);
    centipede(t);fern(176,92,.7,t,1.4);fire(t);smoke(t);
    rock(20,104,2.6,1.8);satchel(t);rock(50,113,2.4,1.6);rock(54,116,1.8,1.2);
    const pc=(t%11),sq=pc<.35?[.06*eo(pc/.35),-.12*eo(pc/.35)]:pc<.5?[.12,-.22]:pc<.65?[-.08,.16]:pc<.85?[.03,-.05]:[0,0];if(pc>=.5&&t-lastPuff>1){lastPuff=t;for(let k=0;k<4;k++)spores.push({x:166+(k-1.5)*3,y:90,vx:(k-1.5)*.15-.1,t0:t,ph:k})}
    fern(68,115,.8,t,2.1);fern(112,86,.6,t,.7);
    mush(166,108,16,10,SP.teal,0,t,sq);mush(178,111,8,5,SP.violet,1.2,t);mush(150,104,5,3,SP.red,2.4,t);mush(172,114,4,2.5,SP.ochre,.6,t);
    mush(84,114,9,6,SP.ochre,.3,t);mush(92,116,5,3,SP.red,1.9,t);
    trunks.filter(tr=>tr[2]>=0).forEach(roots);
    spores=spores.filter(s=>{const a=t-s.t0;if(a>2.6)return false;const x=s.x+s.vx*a*4+Math.sin(a*2+s.ph)*.8,y=s.y-a*6-s.ph%2,fade=1-a/2.6;if(bay(x,y)>fade*.85)return true;P(x,y,fade>.6?'#5A9A92':fade>.3?'#3A6A66':'#244440');return true});
    firefly(t)}
    raf = requestAnimationFrame(frame)}
    // -------------------

    // requestAnimationFrame(frame) tells the browser run the function frame we defined the next time it's about to update the screen.
    // At the end, frame asks again with another requestAnimationFrame(frame), so it's creating a loop that shows the animation constantly
    raf = requestAnimationFrame(frame);
    // We're handing back a function that can turn off the animation. requestAnimationFrame gives back a ticket number for that scheduled call,
    // we save it in raf. cancelAnimationFrame cancels that scheduled call.
    return () => cancelAnimationFrame(raf);
}