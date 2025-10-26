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

const useWebStorage = <TValue>(
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

  const writeState = useCallback(
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

  const removeState = useCallback(
    () => removeFromStorage(key, storageArea),
    [key, storageArea]
  );

  return [state, writeState, removeState];
};

export default useWebStorage;
