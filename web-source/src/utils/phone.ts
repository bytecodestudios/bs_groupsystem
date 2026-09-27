// Detects when the app is running inside a phone host (sd-phone / lb-phone).
// Those hosts inject their own `fetchNui` and `useNuiEvent` helpers onto the
// window of the app iframe, which we prefer over the standalone NUI transport.
export const isPhoneEnv = (): boolean =>
  typeof (window as any).fetchNui === "function" &&
  typeof (window as any).useNuiEvent === "function";

// Detects a laptop host (av_laptop via av_apps, kartik-laptop): the app page is
// mounted in a nested iframe inside the laptop frame (window.parent !== window.top),
// unlike the standalone FiveM overlay which is a direct child of CEF root (window.parent === window.top).
export const isLaptopEnv = (): boolean => {
  try {
    return window.parent !== window.top && !isPhoneEnv();
  } catch {
    return false;
  }
};
