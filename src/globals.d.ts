declare module '*.css';
declare module '@fontsource/*' {}
declare module '@fontsource-variable/*' {}
declare module '*.woff2';

declare function unreachable(v: never): never;

interface Window {
  tid?: string;
  _$HY?: {
    completed?: WeakSet<object>;
    events?: unknown[];
    r?: Record<string, unknown>;
    done?: boolean;
  };
}
