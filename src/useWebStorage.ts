import { useCallback, useEffect, useState } from "react";
import {
  readStorage,
  HOOK_EVENT_NAME,
  type HookEventDetail,
  writeStorage,
  removeFromStorage,
  safelyParseJSON,
} from "./utils/storageHelpers";

interface UseWebStorageOptions<TValue> {
  defaultValue?: TValue | (() => TValue);
  storageArea?: Storage;
}

/**
 * A hook to enable updates to state via provided storage area (or localStorage if it wasn't).
 * This updates when the `writeStorage` function is used, when the returned function
 * is called, or when the "storage" event is fired from another tab in the browser.
 * This function takes an optional `options` object with `defaultValue` property to start off with and optional `storageArea` property
 * to specify which storage to use, `localStorage` is used if not specified.
 *
 * @example
 * ```js
 * const MyComponent = () => {
 * const { item, setItem, removeItem } = useStorage("item", {
 *   defaultValue: "something",
 *   storageArea: window.sessionStorage,
 * });
 *   return (
 *     <div>
 *       <p>{item}</p>
 *       <button onClick={() => setItem("something else")}>Update item</button>
 *       <button onClick={() => removeItem()}>Delete item</button>
 * );
 * };
 * ```
 *
 * @param key The key of the storage entry.
 * @param options.defaultValue Optional default value to initialize state with.
 * @param options.storageArea Optional property to specify which storage to use, `localStorage` by default.
 * @returns An array containing the value
 * associated with the key in position 0, a function to set the value in position 1,
 * and a function to delete the value from the storage in position 2.
 */
const useWebStorage = <TValue = unknown>(
  key: string,
  options?: UseWebStorageOptions<TValue>
) => {
  type StateType = TValue | string | null;
  const { defaultValue, storageArea = window.localStorage } = options || {};
  const [state, setState] = useState<StateType>(() => {
    const item = readStorage<StateType>(key, storageArea);
    if (!item) {
      return item;
    }
    if (defaultValue) {
      return typeof defaultValue === "function"
        ? (defaultValue as () => StateType)()
        : defaultValue;
    }
    return null;
  });

  useEffect(() => {
    const onStorageEvent = (event: StorageEvent): void => {
      if (event.key === key && event.storageArea === storageArea) {
        setState(
          event.newValue ? safelyParseJSON<StateType>(event.newValue) : null
        );
      }
    };
    const onCustomEvent = (
      event: CustomEvent<HookEventDetail<StateType>>
    ): void => {
      if (
        event.detail.key === key &&
        event.detail.storageArea === storageArea
      ) {
        setState(event.detail.value);
      }
    };

    // listening for events in other tabs
    window.addEventListener("storage", onStorageEvent);
    // listening for the custom event
    window.addEventListener(HOOK_EVENT_NAME, onCustomEvent as EventListener);

    let initValue = null;
    if (defaultValue) {
      initValue =
        typeof defaultValue === "function"
          ? (defaultValue as () => StateType)()
          : defaultValue;
    }
    if (readStorage(key, storageArea) === null && initValue !== null) {
      writeStorage<StateType>(key, initValue, storageArea);
    }
    return () => {
      window.removeEventListener("storage", onStorageEvent);
      window.removeEventListener(
        HOOK_EVENT_NAME,
        onCustomEvent as EventListener
      );
    };
  }, [key, storageArea, defaultValue]);

  const setItem = useCallback(
    (value: StateType | ((prevState: StateType) => StateType)) => {
      writeStorage(
        key,
        typeof value === "function"
          ? (value as (prevState: StateType) => StateType)(state)
          : value,
        storageArea
      );
    },
    [state, key, storageArea]
  );

  const removeItem = useCallback(
    () => removeFromStorage(key, storageArea),
    [key, storageArea]
  );

  return { item: state, setItem, removeItem };
};

export default useWebStorage;
