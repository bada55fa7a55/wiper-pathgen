export const isServer = import.meta.env.SSR;
export const isClient = !isServer;
