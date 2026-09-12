import { isEnvBrowser } from "./misc";
import { NUI_MOCKS } from "./mockData";

/**
 * Simple wrapper around fetch API tailored for CEF/NUI use. This abstraction
 * can be extended to include AbortController if needed or if the response isn't
 * JSON. Tailor it to your needs.
 *
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 * @param mockData - Mock data to be returned if in the browser
 *
 * @return returnData - A promise for the data sent back by the NuiCallbacks CB argument
 */

export async function fetchNui<T = unknown>(
  eventName: string,
  data?: unknown,
  mockData?: T,
): Promise<T> {
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  };

  if (isEnvBrowser()) {
    if (mockData !== undefined) return mockData;
    if (NUI_MOCKS[eventName] !== undefined) return NUI_MOCKS[eventName] as T;
  }

  // When hosted inside a phone (sd-phone / lb-phone), use the host-injected
  // transport, which routes the request to this resource's NUI callbacks.
  const phoneFetch = (window as any).fetchNui;
  if (typeof phoneFetch === "function") {
    try {
      const res = await phoneFetch(eventName, data);
      return (res ?? {}) as T;
    } catch {
      return {} as T;
    }
  }

  let resourceName = "bs_groupsystem";
  if ((window as any).GetParentResourceName) {
    try {
      const parent = (window as any).GetParentResourceName();
      if (parent && !parent.includes("phone") && !parent.includes("mobile")) {
        resourceName = parent;
      }
    } catch {
      resourceName = "bs_groupsystem";
    }
  }

  try {
    const resp = await fetch(`https://${resourceName}/${eventName}`, options);
    const respFormatted = await resp.json();
    return respFormatted;
  } catch {
    return {} as T;
  }
}
