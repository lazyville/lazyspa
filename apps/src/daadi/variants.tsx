export type K = 'nine' | 'three';
export type P = 1 | -1;
export type Phase = 'placing' | 'moving' | 'removing';

export type Variant = {
  key: K;
  /** All board points in [x,y] coordinates */
  points: [number, number][];
  /** Adjacency list describing legal moves */
  adj: number[][];
  /** All possible mills (three in a row) */
  mills: number[][];
  /** Draw board lines with given scale and offset */
  drawLines: (scale: number, offset: number) => JSX.Element[];
  initialPieces: number;
  allowFlyingDefault: boolean;
};

const drawSegments = (
  segments: [number, number, number, number][],
): ((scale: number, offset: number) => JSX.Element[]) => {
  return (scale, offset) =>
    segments.map(([a, b, c, d], i) => (
      <line
        key={i}
        x1={offset + a * scale}
        y1={offset + b * scale}
        x2={offset + c * scale}
        y2={offset + d * scale}
        stroke="currentColor"
        strokeWidth={2}
      />
    ));
};

const VNINE: Variant = {
  key: 'nine',
  points: [
    [0, 0], [3, 0], [6, 0],
    [1, 1], [3, 1], [5, 1],
    [2, 2], [3, 2], [4, 2],
    [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3],
    [2, 4], [3, 4], [4, 4],
    [1, 5], [3, 5], [5, 5],
    [0, 6], [3, 6], [6, 6],
  ],
  adj: [
    [1, 9],           // 0
    [0, 2, 4],        // 1
    [1, 14],          // 2
    [4, 10],          // 3
    [1, 3, 5, 7],     // 4
    [4, 13],          // 5
    [7, 11],          // 6
    [4, 6, 8, 16],    // 7
    [7, 12],          // 8
    [0, 10, 21],      // 9
    [3, 9, 11],       // 10
    [6, 10, 15],      // 11
    [8, 13, 17],      // 12
    [5, 12, 14],      // 13
    [2, 13, 23],      // 14
    [11, 16],         // 15
    [7, 15, 17, 19],  // 16
    [12, 16],         // 17
    [19, 10],         // 18
    [16, 18, 20, 22], // 19
    [19, 13],         // 20
    [9, 22],          // 21
    [19, 21, 23],     // 22
    [14, 22],         // 23
  ],
  mills: [
    [0, 1, 2],   [3, 4, 5],   [6, 7, 8],
    [9, 10, 11], [12, 13, 14], [15, 16, 17],
    [18, 19, 20], [21, 22, 23],
    [0, 9, 21],   [3, 10, 18], [6, 11, 15],
    [1, 4, 7],    [16, 19, 22],
    [8, 12, 17],  [5, 13, 20],
    [2, 14, 23],
  ],
  drawLines: drawSegments([
    // outer square
    [0, 0, 6, 0], [6, 0, 6, 6], [6, 6, 0, 6], [0, 6, 0, 0],
    // middle square
    [1, 1, 5, 1], [5, 1, 5, 5], [5, 5, 1, 5], [1, 5, 1, 1],
    // inner square
    [2, 2, 4, 2], [4, 2, 4, 4], [4, 4, 2, 4], [2, 4, 2, 2],
    // connections
    [3, 0, 3, 2], [3, 4, 3, 6], [0, 3, 2, 3], [4, 3, 6, 3],
  ]),
  initialPieces: 9,
  allowFlyingDefault: true,
};

const VTHREE: Variant = {
  key: 'three',
  points: [
    [0, 0], [3, 0], [6, 0],
    [0, 3], [3, 3], [6, 3],
    [0, 6], [3, 6], [6, 6],
  ],
  adj: [
    [1, 3],        // 0
    [0, 2, 4],     // 1
    [1, 5],        // 2
    [0, 4, 6],     // 3
    [1, 3, 5, 7],  // 4
    [2, 4, 8],     // 5
    [3, 7],        // 6
    [4, 6, 8],     // 7
    [5, 7],        // 8
  ],
  mills: [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
  ],
  drawLines: drawSegments([
    [0, 0, 6, 0], [6, 0, 6, 6], [6, 6, 0, 6], [0, 6, 0, 0],
    [0, 3, 6, 3], [3, 0, 3, 6],
  ]),
  initialPieces: 3,
  allowFlyingDefault: false,
};

export const VARIANTS: Record<K, Variant> = {
  nine: VNINE,
  three: VTHREE,
};
