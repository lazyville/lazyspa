declare module 'node:test' {
  export const describe: (...args: any[]) => void;
  export const it: (...args: any[]) => void;
}

declare module 'node:assert/strict' {
  const assert: any;
  export default assert;
}

declare module 'react' {
  export function useEffect(...args: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useRef<T>(value: T): { current: T };
  export function useState<T>(initial?: T | (() => T)): [T, (v: T | ((prev: T) => T)) => void];
  const React: any;
  export default React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

