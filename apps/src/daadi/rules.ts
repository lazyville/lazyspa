import { K, P, Phase, Variant } from './variants';

export const inMill = (b:number[], i:number, p:P, m:number[][]):boolean =>
  m.some(x => x.includes(i) && x.every(j => b[j] === p));

export const collectMill = (b:number[], p:P, m:number[][]):Set<number> => {
  const s = new Set<number>();
  for (const x of m) if (x.every(i => b[i] === p)) x.forEach(i => s.add(i));
  return s;
};

export const removables = (b:number[], rem:P, m:number[][]):Set<number> => {
  const vic = rem === 1 ? -1 : 1;
  const S = collectMill(b, vic as P, m);
  const tot = b.filter(v => v === vic).length;
  const R = new Set<number>();
  b.forEach((v,i)=>{ if(v===vic) if(!S.has(i) || S.size===tot) R.add(i); });
  return R;
};

export const canPlace = (tp:{p1:number;p2:number}, p:P):boolean => p===1?tp.p1>0:tp.p2>0;

export const enterMoving = (tp:{p1:number;p2:number}, mr:P|null):boolean => tp.p1===0 && tp.p2===0 && mr===null;

export const winnerAfterRemoval = (b:number[], rem:P, vk:K, ph:Phase):P|0 =>
  (ph!== 'placing' && vk==='nine' && b.filter(v=>v=== (rem===1?-1:1)).length<=2 ? rem : 0) as P|0;

export const destinationsFor = (
  b:number[],
  variant:Variant,
  idx:number,
  p:P,
  vk:K,
  flying:boolean
):number[]=>{
  const cnt=b.filter(v=>v===p).length;
  const canFly=flying && vk==='nine' && cnt===3;
  return canFly ? b.map((v,i)=>v===0?i:-1).filter(i=>i!==-1) : variant.adj[idx].filter(n=>b[n]===0);
};

export const checkWin = (
  nb:number[],
  toMove:P,
  ph:Phase,
  variant:Variant,
  vk:K,
  flying:boolean
):P|0=>{
  const my=toMove,
        mc=nb.filter(v=>v===my).length,
        oc=nb.filter(v=>v===-my as P).length;
  if(ph!=='placing' && vk==='nine' && oc<=2) return my;
  const canFly=flying && vk==='nine' && mc===3;
  let has=false;
  if(canFly) has=nb.some(v=>v===0);
  else {
    for(let i=0;i<nb.length;i++)
      if(nb[i]===my && variant.adj[i].some(n=>nb[n]===0)) {has=true;break;}
  }
  return ph!=='placing' && !has ? -my as P : 0;
};
