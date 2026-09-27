// Detects when the app is running inside a phone host (sd-phone / lb-phone).
// Those hosts inject their own `fetchNui` and `useNuiEvent` helpers onto the
// window of the app iframe, which we prefer over the standalone NUI transport.
export const isPhoneEnv = (): boolean =>
  typeof (window as any).fetchNui === "function" &&
  typeof (window as any).useNuiEvent === "function";

// Detects a laptop host (av_laptop via av_apps, kartik-laptop): the app page is
// mounted in the host's iframe and the host injects no helpers of its own.
export const isLaptopEnv = (): boolean => {
  try {
    return window.parent !== window && !isPhoneEnv();
  } catch {
    // Cross-origin parent access throws, which only happens when framed.
    return !isPhoneEnv();
  }
};
