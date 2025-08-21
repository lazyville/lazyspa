declare module 'node:test' {
  export const describe: (...args: any[]) => void;
  export const it: (...args: any[]) => void;
}

declare module 'node:assert/strict' {
  const assert: any;
  export default assert;
}

declare module 'react' {
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

