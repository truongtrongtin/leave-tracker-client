// @ts-nocheck
import { useEffect, useRef } from 'react';

export default function useKeyPress(keys, onPress) {
  const isSingleKey = keys.length === 1;
  const pressedKeys = useRef([]);

  const addPressedKey = (key) => {
    pressedKeys.current = [...pressedKeys.current, key];
  };

  const removePressedKey = (key) => {
    let update = [...pressedKeys.current];
    const index = update.findIndex((sKey) => sKey === key);
    update = update.slice(0, index);
    pressedKeys.current = update;
  };

  useEffect(() => {
    const downHandler = (e) => {
      const key = e.key;
      if (!keys.includes(key)) return;
      addPressedKey(key);
    };

    const upHandler = (e) => {
      const key = e.key;
      if (!keys.includes(key)) return;
      if (isSingleKey) {
        pressedKeys.current = [];
        onPress(e);
      } else {
        const containsAll = keys.every((k) => pressedKeys.current.includes(k));
        if (containsAll) {
          onPress(e);
        }
      }
      removePressedKey(key);
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [isSingleKey, keys, onPress]);
}
