// Will return whether the current environment is in a regular browser
// and not CEF
export const isEnvBrowser = (): boolean =>
  !(window as any).invokeNative && !(window as any).GetParentResourceName;

// Basic no operation function
export const noop = () => {};
