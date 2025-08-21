export type K = 'nine' | 'three';
export type P = 1 | -1;
export type Phase = 'placing' | 'moving' | 'removing';

export type Variant = {
  key: K;
  points: [number, number][];
  adj: number[][];
  mills: number[][];
  drawLines: (sx: number, o: number) => JSX.Element[];
  initialPieces: number;
  allowFlyingDefault: boolean;
};

const VNINE: Variant = {
  key: 'nine',
  points: [[0,0],[3,0],[6,0],[1,1],[3,1],[5,1],[2,2],[3,2],[4,2],[0,3],[1,3],[2,3],[4,3],[5,3],[6,3],[2,4],[3,4],[4,4],[1,5],[3,5],[5,5],[0,6],[3,6],[6,6]],
  adj: [[1,9],[0,2,4],[1,14],[4,10],[1,3,5,7],[4,13],[7,11],[4,6,8,16],[7,12],[0,10,21],[3,9,11],[6,10,15],[8,13,17],[5,12,14],[2,13,23],[11,16],[7,15,17,19],[12,16],[19,10],[16,18,20,22],[19,13],[9,22],[19,21,23],[14,22]],
  mills: [[0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[18,19,20],[21,22,23],[0,9,21],[3,10,18],[6,11,15],[1,4,7],[16,19,22],[8,12,17],[5,13,20],[2,14,23]],
  drawLines:(sx:number,o:number)=>{const L:JSX.Element[]=[];const ln=(a:number,b:number,c:number,d:number,k:string)=>(<line key={k} x1={o+a*sx} y1={o+b*sx} x2={o+c*sx} y2={o+d*sx} stroke="currentColor" strokeWidth={2}/>);[[0,0,6,0],[6,0,6,6],[6,6,0,6],[0,6,0,0]].forEach((v,i)=>L.push(ln(v[0],v[1],v[2],v[3],"o"+i)));[[1,1,5,1],[5,1,5,5],[5,5,1,5],[1,5,1,1]].forEach((v,i)=>L.push(ln(v[0],v[1],v[2],v[3],"m"+i)));[[2,2,4,2],[4,2,4,4],[4,4,2,4],[2,4,2,2]].forEach((v,i)=>L.push(ln(v[0],v[1],v[2],v[3],"i"+i)));[[3,0,3,2],[3,4,3,6],[0,3,2,3],[4,3,6,3]].forEach((v,i)=>L.push(ln(v[0],v[1],v[2],v[3],"c"+i)));return L;},
  initialPieces:9,
  allowFlyingDefault:true
};

const VTHREE: Variant = {
  key: 'three',
  points: [[0,0],[3,0],[6,0],[0,3],[3,3],[6,3],[0,6],[3,6],[6,6]],
  adj: [[1,3],[0,2,4],[1,5],[0,4,6],[1,3,5,7],[2,4,8],[3,7],[4,6,8],[5,7]],
  mills: [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8]],
  drawLines:(sx:number,o:number)=>{const L:JSX.Element[]=[];const ln=(a:number,b:number,c:number,d:number,k:string)=>(<line key={k} x1={o+a*sx} y1={o+b*sx} x2={o+c*sx} y2={o+d*sx} stroke="currentColor" strokeWidth={2}/>);[[0,0,6,0],[6,0,6,6],[6,6,0,6],[0,6,0,0],[0,3,6,3],[3,0,3,6]].forEach((v,i)=>L.push(ln(v[0],v[1],v[2],v[3],"t"+i)));return L;},
  initialPieces:3,
  allowFlyingDefault:false
};

export const VARIANTS: Record<K, Variant> = {
  nine: VNINE,
  three: VTHREE
};
