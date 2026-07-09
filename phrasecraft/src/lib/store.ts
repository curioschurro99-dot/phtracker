import { useState } from "react";

export interface CustomPhrase {
  id: string;
  text: string;
  context: string;
  category_id: string;
  subcategory_id: string;
  category_name: string;
  subcategory_name: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  text: string;
  context: string;
  subcategory_name: string;
  category_name: string;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => load(key, initial));
  const update = (next: T | ((prev: T) => T)) => {
    const resolved = next instanceof Function ? next(value) : next;
    setValue(resolved);
    save(key, resolved);
  };
  return [value, update] as const;
}
