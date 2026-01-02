export const isServerRuntime = import.meta.env.SSR;
export const isClientRuntime = !isServerRuntime;
