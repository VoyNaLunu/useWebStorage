export const HOOK_EVENT_NAME = "storage-change";

/**
 * attempts to `JSON.parse` provided value and return the result, returns unmodified value if fails
 * @param json
 */
export const safelyParseJSON = <T>(json: string): T | string => {
  try {
    return JSON.parse(json);
  } catch {
    return json;
  }
};

/**
 * Use this function to read a value from specified storage.
 * @param key The key of the item you wish to read from specified storage.
 * @param storageArea The storage to read the value from.
 *
 * @example
 * ```js
 * window.localStorage.setItem('hello', 'world');
 * const value = readStorage('hello', window.localStorage);
 * console.log(value) // 'world'
 * ```
 */
export const readStorage = <TValue>(
  key: string,
  storageArea: Storage
): TValue | string | null => {
  const value = storageArea.getItem(key);
  return value ? safelyParseJSON<TValue>(value) : null;
};

export interface HookEventDetail<TValue> {
  key: string;
  value: TValue | string | null;
  storageArea: Storage;
}

/**
 * Use this instead of directly using setItem method of the specified storage
 * in order to correctly send events within the same window.
 *
 * @param key The key to write to in the specified storage.
 * @param value The value to write to in the specified storage.
 * @param storageArea The storage to write the value to.
 *
 * @example
 * ```js
 * writeStorage('hello', 'world', window.localStorage);
 * const value = window.localStorage.getItem('hello');
 * console.log(value) // 'world'
 * ```
 */
export const writeStorage = <TValue>(
  key: string,
  value: TValue,
  storageArea: Storage
): void => {
  storageArea.setItem(
    key,
    typeof value === "object" ? JSON.stringify(value) : `${value}`
  );
  window.dispatchEvent(
    new CustomEvent<HookEventDetail<TValue>>(HOOK_EVENT_NAME, {
      detail: { key, value, storageArea },
    })
  );
};

export const removeFromStorage = (key: string, storageArea: Storage): void => {
  storageArea.removeItem(key);
  window.dispatchEvent(
    new CustomEvent<HookEventDetail<null>>(HOOK_EVENT_NAME, {
      detail: { key, value: null, storageArea },
    })
  );
};
