import { useCallback, useLayoutEffect, useState } from 'react';

// Dark, light, or whatever the OS prefers, remembered between visits. Dark is
// the default; light is a white wall with the signs still black. The mode
// lives on <html data-mode>, so it reaches everything, portals included.
// Call this once, near the root.
//
//   const [mode, setMode] = useColorMode();
//
// To avoid a flash of dark on a light reload, run applyColorMode() before
// React renders (it reads the same stored choice).

export type ColorMode = 'dark' | 'light' | 'system';

const MODES: ColorMode[] = ['dark', 'light', 'system'];

/** the stored choice, or dark */
export function storedColorMode(key = 'headway-mode'): ColorMode {
  try {
    const v = localStorage.getItem(key);
    return MODES.includes(v as ColorMode) ? (v as ColorMode) : 'dark';
  } catch {
    return 'dark';
  }
}

/** put a mode on <html>: dark is the default, so it clears the attribute */
export function applyColorMode(mode: ColorMode = storedColorMode()) {
  const root = document.documentElement;
  if (mode === 'dark') delete root.dataset.mode;
  else root.dataset.mode = mode;
}

export function useColorMode(key = 'headway-mode'): [ColorMode, (mode: ColorMode) => void] {
  const [mode, setState] = useState<ColorMode>(() => storedColorMode(key));
  useLayoutEffect(() => applyColorMode(mode), [mode]);
  const setMode = useCallback(
    (next: ColorMode) => {
      setState(next);
      try {
        localStorage.setItem(key, next);
      } catch {
        // private windows and blocked storage: the choice lasts for this visit
      }
    },
    [key],
  );
  return [mode, setMode];
}
