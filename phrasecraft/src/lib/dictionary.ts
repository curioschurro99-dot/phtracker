const API = "https://api.dictionaryapi.dev/api/v2/entries/en";

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      synonyms: string[];
    }[];
  }[];
}

export async function lookupWord(word: string): Promise<DictionaryResult[]> {
  const clean = word.trim().toLowerCase().replace(/[.,!?;:"]$/g, "");
  if (!clean || clean.length < 2) throw new Error("Word too short");
  const res = await fetch(`${API}/${encodeURIComponent(clean)}`);
  if (!res.ok) throw new Error("Not found");
  return res.json() as Promise<DictionaryResult[]>;
}
