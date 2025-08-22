
import React, { useEffect, useMemo, useRef, useState } from "react";
import { VARIANTS, K, P, Phase } from "./variants";
import { inMill, collectMill, removables, canPlace, enterMoving, winnerAfterRemoval, destinationsFor, checkWin } from "./rules";

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
    <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const nt=(t:P)=>t===1?-1:1;

export const hEval=(b:number[],p:P,ph:Phase,tp:{p1:number;p2:number},vk:K,flying:boolean)=>{
  const o=-p as P;let s=0, pcP=0,pcO=0,twP=0,twO=0,millP=0,millO=0;
  for(let i=0;i<b.length;i++){
    if(b[i]===p){pcP++; s+=VARIANTS[vk].adj[i].length;}
    else if(b[i]===o){pcO++; s-=VARIANTS[vk].adj[i].length;}
  }
  for(const m of VARIANTS[vk].mills){
    const cntP=m.reduce((a,i)=>a+(b[i]===p?1:0),0), cntO=m.reduce((a,i)=>a+(b[i]===o?1:0),0);
    const emp=m.some(i=>b[i]===0); if(cntP===3)millP++; if(cntO===3)millO++;
    if(emp&&cntP===2)twP++; if(emp&&cntO===2)twO++;
  }
  s+= (pcP-pcO)*120 + (millP-millO)*90 + (twP-twO)*30;
  if(ph==='moving'){
    const mob=(pl:P)=>{let c=0;for(let i=0;i<b.length;i++) if(b[i]===pl) c+=destinationsFor(b,VARIANTS[vk],i,pl,vk,flying).length; return c};
    s+= (mob(p)-mob(o))*4;
  }
  if(vk==='nine'&&ph!=='placing'){
    if(pcO<=2)s+=8000; if(pcP<=2)s-=8000;
  }
  return s;
};

export const cpuBestRemoval=(board:number[],phase:Phase,toPlace:{p1:number;p2:number},vk:K,flying:boolean):number|null=>{
  const R=[...removables(board,-1,VARIANTS[vk].mills)];
  if(!R.length) return null;
  let best=R[0],bestVal=-Infinity;
  for(const r of R){
    const b2=board.slice();b2[r]=0;
    const val=hEval(b2,-1,phase,toPlace,vk,flying);
    if(val>bestVal){bestVal=val;best=r;}
  }
  return best;
};

export const runTests=()=>{const V=VARIANTS.nine;const r: {name:string;pass:boolean}[]=[];let b:number[];
b=Array(24).fill(0);b[0]=b[1]=b[2]=1;r.push({name:"mill h [0,1,2]",pass:inMill(b,1,1 as P,V.mills)});
b=Array(24).fill(0);b[0]=b[1]=b[2]=-1;b[3]=-1;b[9]=1;const R=removables(b,1 as P,V.mills);r.push({name:"removable prefers non-mill",pass:R.has(3)&&!R.has(0)});
b=Array(24).fill(0);b[0]=b[14]= -1;r.push({name:"no win on placing ≤2",pass:winnerAfterRemoval(b,1 as P,'nine','placing')===0});
b=Array(24).fill(0);b[0]=b[14]=-1;r.push({name:"win on moving ≤2",pass:winnerAfterRemoval(b,1 as P,'nine','moving')===1});
r.push({name:"CPU no fly when >3", pass:(()=>{const b2=Array(24).fill(0); b2[22]=-1; b2[0]=-1; b2[2]=-1; b2[14]=-1;
  const adjSet=new Set(V.adj[22].filter((n:number)=>b2[n]===0));
  const d=destinationsFor(b2,V,22,-1 as P,'nine',true);
  return d.every(i=>adjSet.has(i)) && d.length===adjSet.size;})()});
return r;}

export default function Gameplay(){
  const [vk,setVk]=useState<K>("nine"); const V=useMemo(()=>VARIANTS[vk],[vk]);
  const [board,setBoard]=useState<number[]>(()=>Array(V.points.length).fill(0));
  const [turn,setTurn]=useState<P>(1); const [phase,setPhase]=useState<Phase>("placing");
  const [toPlace,setTP]=useState({p1:V.initialPieces,p2:V.initialPieces});
  const [sel,setSel]=useState<number|null>(null); const [mustRem,setMustRem]=useState<P|null>(null);
  const [flying,setFlying]=useState<boolean>(V.allowFlyingDefault); const [last,setLast]=useState<{from:number|null;to:number|null}|null>(null);
  const [msg,setMsg]=useState("Place pieces. Make a mill to remove."); const [cpu,setCPU]=useState(true);
  const [tests,setTests]=useState<ReturnType<typeof runTests>|null>(null); const [winner,setWinner]=useState<P|0>(0);
  const [dbg,setDbg]=useState(false); const [dbgActor,setDbgActor]=useState<P>(1);
  const [ply,setPly]=useState(1);
  const [p1Name,setP1Name]=useState("Player 1");
  const [p2Name,setP2Name]=useState("CPU");
  const [p1Color,setP1Color]=useState("#0f0f0f");
  const [p2Color,setP2Color]=useState("#ffffff");
  const [dark,setDark]=useState(false);
  const [editing,setEditing]=useState<P|null>(null);
  const [maxBoard,setMaxBoard]=useState(false);
  useEffect(()=>{const s=localStorage.getItem('theme');if(s==='dark')setDark(true);},[]);
  useEffect(()=>{document.documentElement.classList.toggle('dark',dark);localStorage.setItem('theme',dark?'dark':'light');},[dark]);
  type Snap={board:number[];turn:P;phase:Phase;toPlace:{p1:number;p2:number};sel:number|null;mustRem:P|null;flying:boolean;last:{from:number|null;to:number|null}|null;msg:string;ply:number};
  const [hist,setHist]=useState<Snap[]>([]);const push=()=>setHist(h=>[...h,{board:[...board],turn,phase,toPlace:{...toPlace},sel,mustRem,flying,last: last?{...last}:null,msg,ply}]);
  const undo=()=>setHist(h=>{if(!h.length)return h;const s=h[h.length-1];setBoard(s.board);setTurn(s.turn);setPhase(s.phase);setTP(s.toPlace);setSel(s.sel);setMustRem(s.mustRem);setFlying(s.flying);setLast(s.last);setMsg(s.msg);setPly(s.ply);setWinner(0);return h.slice(0,-1)});
  const reset=(keepV?:boolean)=>{const v=keepV?V:VARIANTS[vk];setBoard(Array(v.points.length).fill(0));setTurn(1);setPhase("placing");setTP({p1:v.initialPieces,p2:v.initialPieces});setSel(null);setMustRem(null);setFlying(v.allowFlyingDefault);setLast(null);setMsg("Place pieces. Make a mill to remove.");setHist([]);setTests(null);setWinner(0);setDbg(false);setPly(1)};
  useEffect(()=>{reset(true)},[vk]);
  const counts=useMemo(()=>{let p1=0,p2=0;board.forEach(v=>{if(v===1)p1++;else if(v===-1)p2++});return {p1,p2}},[board]);
  const stateStr=useMemo(()=>JSON.stringify({variant:vk,board,turn,phase,toPlace,mustRem,flying},null,2),[vk,board,turn,phase,toPlace,mustRem,flying]);
  const legal=(i:number,p:P)=>{ if(board[i]!==p||phase!=='moving'||mustRem!==null||winner!==0) return []; return destinationsFor(board,V,i,p,vk,flying); };
  const moveMsg=()=>`All pieces placed. Move along lines${vk==='nine'&&flying?' (or fly at 3)':''}.`;
  const nameOf=(p:P)=>p===1?p1Name:p2Name;
  const colorOf=(p:P)=>p===1?p1Color:p2Color;

  const click=(idx:number)=>{
    if((cpu&&turn===-1)||winner!==0)return;
    if(dbg&&phase==='placing'&&mustRem===null){push();const nb=board.slice();nb[idx]=nb[idx]===0?dbgActor:0;setBoard(nb);setMsg(`Debug: ${nb[idx]===0?'cleared':(nb[idx]===1?'P1':'P2')} at ${idx}.`);return}
    if(mustRem!==null){const rem=mustRem; if(board[idx]!== (rem===1?-1:1))return; const R=[...removables(board,rem,V.mills)]; if(!R.includes(idx))return; push(); const nb=board.slice(); nb[idx]=0; setBoard(nb); setMustRem(null); const immediate=winnerAfterRemoval(nb,rem,vk,phase); if(immediate){setWinner(immediate);setMsg(`${nameOf(immediate as P)} wins!`);setPhase('removing');return;} const ntp=nt(turn); setTurn(ntp); setPly(p=>p+1); if(phase==='placing'){ if(enterMoving(toPlace,null)){setPhase('moving');setMsg(moveMsg())} else setMsg(`${nameOf(ntp)}: place`); } else { setMsg(`${nameOf(ntp)} to move.`); } const w=checkWin(nb,ntp,phase,V,vk,flying); if(w){setMsg(`${nameOf(w as P)} wins!`);setPhase('removing');setWinner(w);} return }
    if(phase==='placing'){ if(!canPlace(toPlace,turn)||board[idx]!==0)return; push(); const nb=board.slice(); nb[idx]=turn; setBoard(nb); const nextTP=turn===1?{p1:toPlace.p1-1,p2:toPlace.p2}:{p1:toPlace.p1,p2:toPlace.p2-1}; setTP(nextTP); if(inMill(nb,idx,turn as P,V.mills)){setMustRem(turn);setMsg(`${nameOf(turn)} formed a mill! Remove one.`)} else { const ntp=nt(turn); setTurn(ntp); setPly(p=>p+1); if(enterMoving(nextTP,null)){setPhase('moving');setMsg(moveMsg())} else setMsg(`${nameOf(ntp)}: place`); } return }
    if(phase==='moving'){ if(sel===null){ if(board[idx]!==turn)return; if(!legal(idx,turn).length)return; setSel(idx); setMsg('Select a target.'); } else { if(board[idx]===turn){ if(!legal(idx,turn).length)return; setSel(idx); return } const L=legal(sel,turn); if(!L.includes(idx))return; push(); const nb=board.slice(); nb[sel]=0; nb[idx]=turn; setBoard(nb); setLast({from:sel,to:idx}); setSel(null); if(inMill(nb,idx,turn,V.mills)){setMustRem(turn);setMsg(`${nameOf(turn)} formed a mill! Remove one.`);return} const ntp=nt(turn); setTurn(ntp); setPly(p=>p+1); setMsg(`${nameOf(ntp)} to move.`); const w=checkWin(nb,ntp,'moving',V,vk,flying); if(w){setMsg(`${nameOf(w as P)} wins!`);setPhase('removing');setWinner(w);} }}
  };

  // CPU
  const thinking=useRef(false); type Act={type:'place';to:number}|{type:'move';from:number;to:number}|{type:'remove';idx:number};
  const actions=(p:P):Act[]=>{ if(mustRem===p)return [...removables(board,p,V.mills)].map(idx=>({type:'remove',idx})); if(phase==='placing'){ if(!canPlace(toPlace,p))return []; return board.map((v,i)=>v===0?{type:'place',to:i} as Act:null).filter(Boolean) as Act[] } if(phase==='moving'){ const a:Act[]=[]; for(let i=0;i<board.length;i++) if(board[i]===p){ const t=destinationsFor(board,V,i,p,vk,flying); t.forEach(to=>a.push({type:'move',from:i,to})) } return a } return []};
  // ---------- Stronger AI: iterative deepening negamax + ordering ----------
  const evalBoard=(b:number[],p:P,ph:Phase,tp:{p1:number;p2:number})=>hEval(b,p,ph,tp,vk,flying);
  const canPlaceTP=(tp:{p1:number;p2:number},p:P)=>p===1?tp.p1>0:tp.p2>0;
  type RootPick={act:Act, remove?:number};
  const level:'max'|'strong'|'fast'='max';
  const searchBest=(p:P):RootPick|null=>{
    const budget = level==='max'?800: level==='strong'?350:120; const Dmax = level==='max'?6: level==='strong'?4:2; const start=Date.now();
    let rootBest:RootPick|null=null; let rootScore=-Infinity;
    const negamax=(b:number[],ph:Phase,tp:{p1:number;p2:number},pl:P,depth:number,alpha:number,beta:number):number=>{
      if(Date.now()-start>budget) return evalBoard(b,pl,ph,tp);
      const w=checkWin(b,pl,ph,VARIANTS[vk],vk,flying); if(w===pl) return 1e6-(Dmax-depth); if(w===-pl) return -1e6+(Dmax-depth); if(depth===0) return evalBoard(b,pl,ph,tp);
      const base:({t:'place';to:number}|{t:'move';from:number;to:number})[]=[];
      if(ph==='placing'&&canPlaceTP(tp,pl)){ for(let i=0;i<b.length;i++) if(b[i]===0) base.push({t:'place',to:i}); }
      else { for(let i=0;i<b.length;i++) if(b[i]===pl){ const ds=destinationsFor(b,VARIANTS[vk],i,pl,vk,flying); for(const to of ds) base.push({t:'move',from:i,to}); } }
      const needBlock=(()=>{const S=new Set<number>(),o=-pl as P; for(const m of VARIANTS[vk].mills){const oc=m.filter(i=>b[i]===o).length, emp=m.filter(i=>b[i]===0); if(oc===2&&emp.length===1) S.add(emp[0]); } return S;})()
      base.sort((a,bb)=>{const am=(()=>{const t=b.slice(); if(a.t==='place') t[a.to]=pl; else {t[(a as any).from]=0; t[a.to]=pl;} return inMill(t,a.to,pl,VARIANTS[vk].mills);})(); const bm=(()=>{const t=b.slice(); if(bb.t==='place') t[bb.to]=pl; else {t[(bb as any).from]=0; t[bb.to]=pl;} return inMill(t,bb.to,pl,VARIANTS[vk].mills);})(); if(am!==bm) return am?-1:1; const aB=needBlock.has(a.to); const bB=needBlock.has(bb.to); return aB===bB?0:(aB?-1:1)});
      let best=-Infinity; let bestLocal:RootPick|undefined;
      for(const a of base){ let b2=b.slice(), tp2={...tp}, ph2=ph; const landing=a.to; if(a.t==='place'){ b2[a.to]=pl; if(pl===1)tp2.p1--; else tp2.p2--; if(tp2.p1===0&&tp2.p2===0) ph2='moving'; }
        else { b2[(a as any).from]=0; b2[a.to]=pl; }
        const mill = inMill(b2,landing,pl,VARIANTS[vk].mills);
        if(mill){ const rs=[...removables(b2,pl,VARIANTS[vk].mills)]; if(!rs.length){ const val=-negamax(b2,ph2,tp2,-pl as P,depth-1,-beta,-alpha); if(val>best){best=val; bestLocal={act:(a.t==='place'?{type:'place',to:a.to}:{type:'move',from:(a as any).from,to:a.to})}; if(depth===Dmax&&val>rootScore){rootScore=val; rootBest={act:bestLocal.act};} } }
          for(const r of rs){ const b3=b2.slice(); b3[r]=0; const imm=winnerAfterRemoval(b3,pl,vk,ph2); let val:number; if(imm===pl) val=1e6-(Dmax-depth); else val=-negamax(b3,ph2,tp2,-pl as P,depth-1,-beta,-alpha);
            if(val>best){ best=val; bestLocal={act:(a.t==='place'?{type:'place',to:a.to}:{type:'move',from:(a as any).from,to:a.to}), remove:r}; if(depth===Dmax&&val>rootScore){rootScore=val; rootBest={act:bestLocal.act, remove:r}; } }
            if(best>alpha) alpha=best; if(alpha>=beta) break; }
        } else { const val=-negamax(b2,ph2,tp2,-pl as P,depth-1,-beta,-alpha); if(val>best){best=val; bestLocal={act:(a.t==='place'?{type:'place',to:a.to}:{type:'move',from:(a as any).from,to:a.to})}; if(depth===Dmax&&val>rootScore){rootScore=val; rootBest={act:bestLocal.act};} } if(best>alpha) alpha=best; if(alpha>=beta) break; }
      }
      return best;
    };
    for(let d=1; d<=Dmax; d++){ negamax(board,phase,toPlace,p,d,-1e9,1e9); if(Date.now()-start>budget) break; }
    return rootBest;
  };
  const doCPU=(a:Act)=>{ if(winner!==0)return; if(a.type==='remove'){push();const nb=board.slice();nb[a.idx]=0;setBoard(nb);setMustRem(null);const imm=winnerAfterRemoval(nb,-1,vk,phase);if(imm){setWinner(imm);setMsg(`${nameOf(-1)} wins!`);setPhase('removing');return;} const ntp=nt(turn);setTurn(ntp); setPly(p=>p+1); if(phase==='placing'){ if(enterMoving(toPlace,null)){setPhase('moving');setMsg(moveMsg())} else setMsg(`${nameOf(ntp)}: place`); } else { setMsg(`${nameOf(1)} to move.`); } const w=checkWin(nb,ntp,phase,V,vk,flying); if(w){setMsg(`${nameOf(w as P)} wins!`);setPhase('removing');setWinner(w);} return }
    if(phase==='placing'&&a.type==='place'){push();const nb=board.slice();nb[a.to]=-1;setBoard(nb);const tp={p1:toPlace.p1,p2:toPlace.p2-1};setTP(tp); if(inMill(nb,a.to,-1,VARIANTS[vk].mills)){setMustRem(-1);setMsg(`${nameOf(-1)} formed a mill! Removing...`);} else {const ntp=nt(-1);setTurn(ntp); if(enterMoving(tp,null)){setPhase('moving');setMsg(moveMsg())} else setMsg(`${nameOf(1)}: place`);} return }
    if(phase==='moving'&&a.type==='move'){push();const allowed=destinationsFor(board,VARIANTS[vk],a.from,-1 as P,vk,flying); if(!allowed.includes(a.to)) { return; } const nb=board.slice();nb[a.from]=0;nb[a.to]=-1;setBoard(nb);setLast({from:a.from,to:a.to}); if(inMill(nb,a.to,-1,VARIANTS[vk].mills)){setMustRem(-1);setMsg(`${nameOf(-1)} formed a mill! Removing...`);} else {const ntp=nt(-1);setTurn(ntp);setMsg(`${nameOf(1)} to move.`);const w=checkWin(nb,ntp,'moving',V,vk,flying); if(w){setMsg(`${nameOf(w as P)} wins!`);setPhase('removing');setWinner(w);}} } };
  useEffect(()=>{
    if(!cpu||winner!==0||(dbg&&phase!=='moving')||turn!==-1||thinking.current)return;
    if(mustRem!==null&&mustRem!==-1)return;
    thinking.current=true;
    const t=setTimeout(()=>{
      if(mustRem===-1){
        const best=cpuBestRemoval(board,phase,toPlace,vk,flying);
        if(best!==null) doCPU({type:'remove',idx:best});
      } else {
        const pick=searchBest(-1 as P);
        if(pick){ if(pick.remove!==undefined){ doCPU({type:'remove', idx: pick.remove}); } else { doCPU(pick.act); } }
      }
      thinking.current=false;
    },320);
    return()=>{clearTimeout(t);thinking.current=false}
  },[cpu,turn,phase,board,mustRem,flying,vk,toPlace,winner,dbg]);

  const sx=80, off=20, toXY=(p:[number,number])=>({cx:off+p[0]*sx,cy:off+p[1]*sx});
  const mill1=collectMill(board,1,VARIANTS[vk].mills), mill2=collectMill(board,-1,VARIANTS[vk].mills);
  const remSet=useMemo(()=>mustRem===null?new Set<number>():removables(board,mustRem,VARIANTS[vk].mills),[board,mustRem,vk]);
  const Title= vk==='nine'? 'Daadi • Navakankari' : 'Chinna Daadi';

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="w-full px-4 py-2 flex items-center justify-between bg-white/80 dark:bg-zinc-800/80 backdrop-blur shadow">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold" onClick={(e:any)=>{ if(e.detail===3){ const t = !dbg; setDbg(t); setMsg(`Debug mode: ${t ? 'ON' : 'OFF'} (triple‑click title to toggle)`);} }}>{Title}</span>
          {dbg && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Debug</span>}
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <span className="capitalize">{phase==='placing'?"Placing":phase==='moving'?"Moving":mustRem!==null?"Removing":"Game Over"}</span>
          <span>Turn: {nameOf(turn)}</span>
          <span>Move: {ply}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} title="Undo" className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 dark:bg-zinc-700 dark:border-zinc-600 dark:hover:bg-zinc-600">↺</button>
          <button onClick={()=>reset(true)} title="Reset" className="text-sm px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">🔄</button>
          <button onClick={()=>setMaxBoard(m=>!m)} title={maxBoard?"Show panel":"Hide panel"} className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 dark:bg-zinc-700 dark:border-zinc-600 dark:hover:bg-zinc-600">{maxBoard?"☰":"⛶"}</button>
          <button onClick={()=>setDark(d=>!d)} title="Toggle theme" className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 dark:bg-zinc-700 dark:border-zinc-600 dark:hover:bg-zinc-600">{dark?"🌞":"🌙"}</button>
        </div>
      </header>

      <div className="flex-1 w-full flex flex-col md:flex-row items-start gap-6 p-4 md:p-6 lg:p-8 relative">
        <div className="flex-1 flex items-center justify-center relative">
          <div className={`w-full ${maxBoard?'max-w-full':'max-w-3xl'} aspect-square bg-white dark:bg-zinc-800 rounded-2xl shadow p-2 sm:p-4 md:p-6`}>
            <svg viewBox={`0 0 ${off*2+6*sx} ${off*2+6*sx}`} className="w-full h-full text-zinc-700 dark:text-zinc-300 touch-manipulation select-none">
              <g>{VARIANTS[vk].drawLines(sx,off)}</g>
              {VARIANTS[vk].points.map((p,i)=>{const {cx,cy}=toXY(p);const o=board[i];const seld=sel===i;const lastHit=last&&(last.from===i||last.to===i);const canGo=sel!==null&&legal(sel,turn).includes(i);const canPlaceHere=phase==='placing'&&board[i]===0&&mustRem===null&&(turn===1||!cpu)&&canPlace(toPlace,turn)&&!dbg;const canRem=mustRem!==null&&remSet.has(i)&&board[i]===(mustRem===1?-1:1);const inM=o===1?mill1.has(i):o===-1?mill2.has(i):false;return (
                <g key={i} onClick={()=>click(i)} className={cpu&&turn===-1?"cursor-not-allowed":"cursor-pointer"}>
                  {board[i]===0&&(canGo||canPlaceHere)&&<circle cx={cx} cy={cy} r={18} className="fill-emerald-200/50"/>}
                  {o!==0&&<circle cx={cx} cy={cy} r={18} className={`stroke-zinc-900 dark:stroke-zinc-200 stroke-[1.5px]${seld?" ring-4 ring-blue-300":""}${canRem?" ring-4 ring-rose-300":""}`} style={{fill:colorOf(o as P)}}/>}
                  {o===0&&<circle cx={cx} cy={cy} r={7} className="fill-zinc-700 dark:fill-zinc-400"/>}
                  {inM&&<circle cx={cx} cy={cy} r={4} className="fill-amber-400"/>}
                  {lastHit&&<circle cx={cx} cy={cy} r={22} className="fill-transparent stroke-blue-400 dark:stroke-blue-300 stroke-2"/>}
                </g>)})}
            </svg>
          </div>
          {maxBoard && (
            <button onClick={()=>setMaxBoard(false)} title="Show panel" className="absolute top-2 left-2 z-10 px-3 py-2 rounded-lg border border-zinc-300 bg-white/80 hover:bg-white dark:bg-zinc-800/80 dark:border-zinc-600 dark:hover:bg-zinc-700">☰</button>
          )}
        </div>

        <div className={`w-full md:w-80 flex flex-col gap-4 transition-transform duration-300 md:transform ${maxBoard? 'hidden md:block md:absolute md:right-0 md:translate-x-full' : 'md:translate-x-0'}`}>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow p-4">
            <p className="text-sm leading-relaxed">{msg}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border" style={{background:p1Color}}></span>
                <span className="flex items-center gap-1">
                  {p1Name}
                  <button onClick={()=>setEditing(1)} title="Edit" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    <PencilIcon className="w-4 h-4"/>
                  </button>
                </span>
                <span className="ml-1">on board: {counts.p1} &nbsp; to place: {toPlace.p1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border" style={{background:p2Color}}></span>
                <span className="flex items-center gap-1">
                  {p2Name}
                  <button onClick={()=>setEditing(-1)} title="Edit" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    <PencilIcon className="w-4 h-4"/>
                  </button>
                </span>
                <span className="ml-1">on board: {counts.p2} &nbsp; to place: {toPlace.p2}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow p-4">
            <div className="flex items-center justify-between gap-2"><span className="text-lg font-semibold">Options</span>{dbg && (<button onClick={()=>setTests(runTests())} className="text-xs px-2 py-1 rounded border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">Run tests</button>)}</div>
            <div className="mt-3 text-sm space-y-3">
              <label className="flex items-center gap-2 select-none"><input type="checkbox" checked={cpu} onChange={e=>{setCPU(e.target.checked); if(e.target.checked) setP2Name('CPU'); else if(p2Name==='CPU') setP2Name('Player 2');}}/><span>CPU as Player 2</span></label>
              {vk==='nine'&&<label className="flex items-center gap-2 select-none"><input type="checkbox" checked={flying} onChange={e=>setFlying(e.target.checked)}/><span>Allow flying at 3</span></label>}
              {dbg && (<label className="flex items-center gap-2 select-none"><input type="checkbox" checked={dbg} onChange={e=>setDbg(e.target.checked)}/><span>Test / Debug mode</span></label>)}
              {dbg&&<div className="ml-5 space-y-2">
                <div className="flex items-center gap-3"><span className="text-zinc-600 dark:text-zinc-400">Place as:</span><label className="flex items-center gap-1"><input type="radio" name="dbgActor" checked={dbgActor===1} onChange={()=>setDbgActor(1)}/><span>Player 1</span></label><label className="flex items-center gap-1"><input type="radio" name="dbgActor" checked={dbgActor===-1} onChange={()=>setDbgActor(-1)}/><span>Player 2</span></label></div>
                <div className="flex gap-2"><button onClick={()=>{setBoard(Array(VARIANTS[vk].points.length).fill(0));setSel(null);setMustRem(null)}} className="px-2 py-1 rounded border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">Clear board</button><button onClick={()=>{setPhase('moving');setTP({p1:0,p2:0});setMustRem(null);setMsg('Debug: entered moving phase.')}} className="px-2 py-1 rounded bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">Start from current position</button><button onClick={()=>setTurn(t=>-t as P)} className="px-2 py-1 rounded border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">Swap turn</button></div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button onClick={async()=>{try{await navigator.clipboard.writeText(stateStr);setMsg('Debug: state copied to clipboard');}catch(e){setMsg('Debug: copy failed');}}} className="px-2 py-1 rounded border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">Copy state</button>
                    <button onClick={()=>{console.log('DAADI_STATE',{variant:vk,board,turn,phase,toPlace,mustRem,flying});setMsg('Debug: state logged to console');}} className="px-2 py-1 rounded border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">Log state</button>
                  </div>
                  <textarea readOnly value={stateStr} rows={4} className="w-full border rounded p-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-900"/>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Click any point to place/remove without phase rules.</p>
              </div>}
              <div className="flex items-center gap-2"><span className="w-20 shrink-0 text-zinc-600 dark:text-zinc-400">Variant</span><select value={vk} onChange={e=>setVk(e.target.value as K)} className="border rounded px-2 py-1 w-full"><option value="nine">Nine Men's Morris</option><option value="three">Three Men's Morris (Chinna Daadi)</option></select></div>
            </div>
            {tests&&<div className="mt-3 text-sm"><div className="font-medium mb-1">Test Results</div><ul className="list-disc pl-5 space-y-1">{tests.map((t,i)=>(<li key={i} className={t.pass?"text-emerald-700":"text-rose-700"}>{t.pass?"✔":"✘"} {t.name}</li>))}</ul></div>}
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow p-4">
            <details className="group" open>
              <summary className="flex items-center justify-between text-base font-medium cursor-pointer select-none"><span>Rules & How to Play</span><span className="text-xs px-2 py-0.5 rounded bg-zinc-100 group-open:hidden dark:bg-zinc-700">show</span><span className="text-xs px-2 py-0.5 rounded bg-zinc-100 hidden group-open:inline dark:bg-zinc-700">hide</span></summary>
              <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Each player gets <b>{VARIANTS[vk].initialPieces}</b> pieces.</li>
                  <li><b>Placing:</b> Place on any empty point. Making a mill (3 in a row) lets you remove one opponent piece (prefer pieces not in mills).</li>
                  <li><b>Moving:</b> After all pieces are placed, move along connected lines{vk==='nine'&&flying?", or fly anywhere when at 3 pieces":""}.</li>
                  <li><b>Win:</b> (Not during placing) reduce opponent to 2 or leave them with no legal move.</li>
                </ul>
                <div className="pt-2 border-t text-zinc-600 dark:text-zinc-400"><p className="font-medium mb-1">Tips</p><ul className="list-disc pl-5 space-y-1"><li>Set up double threats.</li><li>Block while developing.</li><li>Keep pieces connected.</li></ul></div>
              </div>
            </details>
          </div>
        </div>
      </div>

      <footer className="mt-6 text-xs text-center text-zinc-500 dark:text-zinc-400">Built with ❤️ – Daadi (Navakankari) & Chinna Daadi</footer>

      {editing!==null && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center p-4 z-40">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow p-4 w-full max-w-xs">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <input type="color" value={editing===1?p1Color:p2Color} onChange={e=>editing===1?setP1Color(e.target.value):setP2Color(e.target.value)} className="h-8 w-8 p-0 border rounded"/>
                <input type="text" value={editing===1?p1Name:p2Name} onChange={e=>editing===1?setP1Name(e.target.value):setP2Name(e.target.value)} disabled={editing===-1 && cpu} className="flex-1 border rounded px-2 py-1 disabled:opacity-50"/>
              </div>
              <div className="flex justify-end">
                <button onClick={()=>setEditing(null)} className="text-xs px-2 py-1 rounded border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {winner!==0&&(<div className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center p-4 z-50"><div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 w-full max-w-sm text-center relative overflow-hidden">
        <style>{`@keyframes blink{0%,80%,100%{opacity:.25}40%{opacity:1}}@keyframes dash{from{stroke-dashoffset:140}to{stroke-dashoffset:0}}`}</style>
        <div className="flex items-center justify-center mb-3"><svg width="180" height="40" viewBox="0 0 180 40">{(()=>{const isP1=winner===1;const d=colorOf(isP1?1:-1);const common:any={r:6};return(<g><circle cx="20" cy="20" {...common} fill={d} stroke="#0f0f0f" style={{animation:"blink 1.2s infinite" as any}}/><circle cx="90" cy="20" {...common} fill={d} stroke="#0f0f0f" style={{animation:"blink 1.2s .2s infinite" as any}}/><circle cx="160" cy="20" {...common} fill={d} stroke="#0f0f0f" style={{animation:"blink 1.2s .4s infinite" as any}}/><line x1="26" y1="20" x2="84" y2="20" stroke={d} strokeWidth="3" strokeDasharray="140" strokeDashoffset="140" style={{animation:"dash 1.2s ease forwards" as any}}/><line x1="96" y1="20" x2="154" y2="20" stroke={d} strokeWidth="3" strokeDasharray="140" strokeDashoffset="140" style={{animation:"dash 1.2s .2s ease forwards" as any}}/></g>)})()}</svg></div>
        <div className="text-2xl font-semibold mb-1">🏆 {nameOf(winner as P)} wins!</div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">Good game.</p>
        <button onClick={()=>reset(true)} className="px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">New game</button>
      </div></div>)}
    </div>
  );
}
