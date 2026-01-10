export const isServerRuntime = import.meta.env.SSR;
export const isClientRuntime = !isServerRuntime;
export const isDevRuntime = import.meta.env.DEV;
