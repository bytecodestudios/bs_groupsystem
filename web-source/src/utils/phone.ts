// Detects when the app is running inside a phone host (sd-phone / lb-phone).
// Those hosts inject their own `fetchNui` and `useNuiEvent` helpers onto the
// window of the app iframe, which we prefer over the standalone NUI transport.
export const isPhoneEnv = (): boolean =>
  typeof (window as any).fetchNui === "function" &&
  typeof (window as any).useNuiEvent === "function";
