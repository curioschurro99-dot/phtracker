import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  ChevronRight,
  Copy,
  Check,
  Trash2,
  Heart,
  Volume2,
  X,
  Grid3X3,
  Bookmark,
} from "lucide-react";
import categoriesData from "./data/categories.json";
import subcategoriesData from "./data/subcategories.json";
import phrasesData from "./data/phrases.json";
import { getIcon } from "./lib/icons";
import { useLocalStorage, type CustomPhrase, type Favorite } from "./lib/store";
import { lookupWord, type DictionaryResult } from "./lib/dictionary";

type Category = (typeof categoriesData)[number];
type Subcategory = (typeof subcategoriesData)[number];
type Phrase = (typeof phrasesData)[number];

type View = "categories" | "favorites" | "search";

interface SearchResult {
  phrase: Phrase;
  subcategory_name: string;
  category_name: string;
}

export default function App() {
  const [view, setView] = useState<View>("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [favorites, setFavorites] = useLocalStorage<Favorite[]>(
    "phrasecraft-favorites",
    [],
  );
  const [customPhrases, setCustomPhrases] = useLocalStorage<CustomPhrase[]>(
    "phrasecraft-custom",
    [],
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    category: "",
    subcategory: "",
    text: "",
    context: "",
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const [dictWord, setDictWord] = useState<string | null>(null);
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictSpeaking, setDictSpeaking] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const selectedCategory = categoriesData.find(
    (c) => c.id === selectedCategoryId,
  );
  const selectedSubcategory = subcategoriesData.find(
    (s) => s.id === selectedSubcategoryId,
  );

  const subcategoriesForCategory = subcategoriesData
    .filter((s) => s.category_id === selectedCategoryId)
    .sort((a, b) => a.order - b.order);

  const phrasesForSubcategory = phrasesData
    .filter((p) => p.subcategory_id === selectedSubcategoryId)
    .concat(
      customPhrases
        .filter(
          (cp) =>
            cp.subcategory_id === selectedSubcategoryId &&
            cp.category_id === selectedCategoryId,
        )
        .map(
          (cp) =>
            ({
              id: cp.id,
              subcategory_id: cp.subcategory_id,
              text: cp.text,
              context: cp.context,
              created_at: cp.created_at,
            }) as Phrase,
        ),
    );

  const customPhrasesForSubcategory = customPhrases.filter(
    (cp) =>
      cp.subcategory_id === selectedSubcategoryId &&
      cp.category_id === selectedCategoryId,
  );

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    for (const phrase of phrasesData) {
      const sub = subcategoriesData.find(
        (s) => s.id === phrase.subcategory_id,
      );
      const cat = categoriesData.find((c) => c.id === sub?.category_id);
      if (!sub || !cat) continue;
      const match =
        phrase.text.toLowerCase().includes(q) ||
        phrase.context.toLowerCase().includes(q) ||
        sub.name.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q);
      if (match) {
        results.push({
          phrase,
          subcategory_name: sub.name,
          category_name: cat.name,
        });
      }
    }

    for (const cp of customPhrases) {
      const match =
        cp.text.toLowerCase().includes(q) ||
        cp.context.toLowerCase().includes(q) ||
        cp.subcategory_name.toLowerCase().includes(q) ||
        cp.category_name.toLowerCase().includes(q);
      if (match) {
        results.push({
          phrase: {
            id: cp.id,
            subcategory_id: cp.subcategory_id,
            text: cp.text,
            context: cp.context,
            created_at: cp.created_at,
          },
          subcategory_name: cp.subcategory_name,
          category_name: cp.category_name,
        });
      }
    }

    setSearchResults(results);
  }, [searchQuery, customPhrases]);

  const handleCopy = useCallback(
    async (text: string, id: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    },
    [],
  );

  const handleSpeak = useCallback(
    (text: string, id: string) => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  const handleDictSpeak = useCallback((word: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setDictSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-GB";
    utterance.rate = 0.9;
    utterance.onstart = () => setDictSpeaking(true);
    utterance.onend = () => setDictSpeaking(false);
    utterance.onerror = () => setDictSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const toggleFavorite = useCallback(
    (phrase: Phrase, subName: string, catName: string) => {
      setFavorites((prev) => {
        const exists = prev.find((f) => f.id === phrase.id);
        if (exists) return prev.filter((f) => f.id !== phrase.id);
        return [
          ...prev,
          {
            id: phrase.id,
            text: phrase.text,
            context: phrase.context,
            subcategory_name: subName,
            category_name: catName,
          },
        ];
      });
    },
    [setFavorites],
  );

  const isFav = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const handleOpenDict = useCallback(
    async (word: string) => {
      const clean = word.trim().toLowerCase().replace(/[.,!?;:"]$/g, "");
      if (!clean || clean.length < 2) return;
      setDictWord(clean);
      setDictResult(null);
      setDictLoading(true);
      try {
        const data = await lookupWord(clean);
        setDictResult(data[0] ?? null);
      } catch {
        setDictResult(null);
      } finally {
        setDictLoading(false);
      }
    },
    [],
  );

  const renderWords = useCallback(
    (text: string, key: string) =>
      text.split(/\s+/).map((word, i) => {
        const clean = word.replace(/[.,!?;:"]$/g, "");
        const isAlpha = /^[a-zA-Z]+$/.test(clean);
        return (
          <span key={`${key}-w-${i}`}>
            {isAlpha ? (
              <button
                onClick={() => handleOpenDict(word)}
                className="inline cursor-pointer underline decoration-dotted underline-offset-2 text-[#1D1D1F] hover:text-[#2C3E50] transition-colors"
              >
                {word}
              </button>
            ) : (
              <span>{word}</span>
            )}
            {i < text.split(/\s+/).length - 1 ? " " : ""}
          </span>
        );
      }),
    [handleOpenDict],
  );

  const handleAddPhrase = () => {
    const errors: Record<string, string> = {};
    if (!addForm.category) errors.category = "Select a category";
    if (!addForm.subcategory) errors.subcategory = "Select a subcategory";
    if (!addForm.text.trim()) errors.text = "Enter a phrase";
    if (!addForm.context.trim()) errors.context = "Enter a context example";
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const cat = categoriesData.find((c) => c.id === addForm.category);
    const sub = subcategoriesData.find((s) => s.id === addForm.subcategory);
    const newPhrase: CustomPhrase = {
      id: `custom-${Date.now()}`,
      text: addForm.text.trim(),
      context: addForm.context.trim(),
      category_id: addForm.category,
      subcategory_id: addForm.subcategory,
      category_name: cat?.name ?? "",
      subcategory_name: sub?.name ?? "",
      created_at: new Date().toISOString(),
    };
    setCustomPhrases((prev) => [...prev, newPhrase]);
    setAddForm({ category: "", subcategory: "", text: "", context: "" });
    setAddErrors({});
    setShowAddModal(false);
  };

  const deleteCustomPhrase = (id: string) => {
    setCustomPhrases((prev) => prev.filter((p) => p.id !== id));
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const goBack = () => {
    if (selectedSubcategoryId) {
      setSelectedSubcategoryId(null);
    } else if (selectedCategoryId) {
      setSelectedCategoryId(null);
    }
  };

  const navigateTo = (v: View) => {
    setView(v);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E8E8ED] border-t-[#2C3E50] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col max-w-md mx-auto relative shadow-2xl">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-[#E8E8ED] px-5 py-4">
        <div className="flex items-center justify-between">
          {selectedSubcategoryId ? (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-[#1D1D1F] hover:text-[#2C3E50] transition-colors"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : selectedCategoryId ? (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-[#1D1D1F] hover:text-[#2C3E50] transition-colors"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Bookmark size={22} strokeWidth={2} className="text-[#2C3E50]" />
              <h1 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
                PhraseCraft
              </h1>
            </div>
          )}
          <span className="text-xs text-[#86868B] font-medium">
            {selectedSubcategoryId
              ? selectedSubcategory?.name
              : selectedCategoryId
                ? selectedCategory?.name
                : "Categories"}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-24 px-4 pt-4">
        {view === "categories" && selectedSubcategoryId ? (
          <PhraseListView
            phrases={phrasesForSubcategory}
            customPhrases={customPhrasesForSubcategory}
            subcategoryName={selectedSubcategory?.name ?? ""}
            categoryName={selectedCategory?.name ?? ""}
            copiedId={copiedId}
            speakingId={speakingId}
            isFav={isFav}
            onCopy={handleCopy}
            onSpeak={handleSpeak}
            onToggleFav={toggleFavorite}
            renderWords={renderWords}
            onDeleteCustom={deleteCustomPhrase}
          />
        ) : view === "categories" && selectedCategoryId ? (
          <SubcategoryListView
            subcategories={subcategoriesForCategory}
            categoryName={selectedCategory?.name ?? ""}
            customPhrases={customPhrases}
            onSelect={setSelectedSubcategoryId}
          />
        ) : view === "categories" ? (
          <>
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider">
                Pick a category
              </h2>
            </div>
            <div className="space-y-3">
              {categoriesData.map((cat) => {
                const Icon = getIcon(cat.icon);
                const count = subcategoriesData.filter(
                  (s) => s.category_id === cat.id,
                ).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="w-full bg-white rounded-xl border border-[#E8E8ED] p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-[#2C3E50]/20 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center">
                        <Icon
                          size={20}
                          className="text-[#2C3E50]"
                          strokeWidth={1.8}
                        />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-[#1D1D1F]">
                          {cat.name}
                        </div>
                        <div className="text-xs text-[#86868B]">
                          {count} subcategories
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#86868B]" />
                  </button>
                );
              })}
            </div>
          </>
        ) : view === "favorites" ? (
          <FavoritesView
            favorites={favorites}
            copiedId={copiedId}
            speakingId={speakingId}
            onCopy={handleCopy}
            onSpeak={handleSpeak}
            onRemove={(id) =>
              setFavorites((prev) => prev.filter((f) => f.id !== id))
            }
          />
        ) : (
          <SearchView
            query={searchQuery}
            onQueryChange={setSearchQuery}
            results={searchResults}
            copiedId={copiedId}
            speakingId={speakingId}
            isFav={isFav}
            onCopy={handleCopy}
            onSpeak={handleSpeak}
            onToggleFav={toggleFavorite}
            renderWords={renderWords}
          />
        )}
      </main>

      {view === "categories" && !showAddModal && (
        <button
          onClick={() => setShowAddModal(true)}
          className="absolute bottom-20 right-4 w-12 h-12 bg-[#2C3E50] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 z-40"
        >
          <Plus size={22} className="text-white" strokeWidth={2.5} />
        </button>
      )}

      <nav className="bg-white/90 backdrop-blur-md border-t border-[#E8E8ED] sticky bottom-0 z-30">
        <div className="flex items-center justify-around py-2">
          <NavBtn
            active={view === "categories"}
            onClick={() => navigateTo("categories")}
            icon={Grid3X3}
            label="Categories"
          />
          <NavBtn
            active={view === "favorites"}
            onClick={() => navigateTo("favorites")}
            icon={Heart}
            label="Favorites"
          />
          <NavBtn
            active={view === "search"}
            onClick={() => navigateTo("search")}
            icon={Search}
            label="Search"
          />
        </div>
      </nav>

      {showAddModal && (
        <AddPhraseModal
          categories={categoriesData}
          subcategories={subcategoriesData}
          form={addForm}
          errors={addErrors}
          onFormChange={setAddForm}
          onErrorsChange={setAddErrors}
          onSave={handleAddPhrase}
          onClose={() => {
            setShowAddModal(false);
            setAddForm({ category: "", subcategory: "", text: "", context: "" });
            setAddErrors({});
          }}
        />
      )}

      {dictWord && (
        <DictionaryModal
          word={dictWord}
          result={dictResult}
          loading={dictLoading}
          speaking={dictSpeaking}
          onSpeak={handleDictSpeak}
          onClose={() => {
            setDictWord(null);
            setDictResult(null);
            window.speechSynthesis.cancel();
            setDictSpeaking(false);
          }}
        />
      )}
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Grid3X3;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
        active
          ? "text-[#2C3E50]"
          : "text-[#86868B] hover:text-[#1D1D1F]"
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function SubcategoryListView({
  subcategories,
  categoryName,
  customPhrases,
  onSelect,
}: {
  subcategories: Subcategory[];
  categoryName: string;
  customPhrases: CustomPhrase[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider">
          {categoryName}
        </h2>
        <span className="text-xs text-[#86868B]">
          {subcategories.length} subcategories
        </span>
      </div>
      {subcategories.map((sub) => {
        const phraseCount =
          phrasesData.filter((p) => p.subcategory_id === sub.id).length +
          customPhrases.filter(
            (cp) =>
              cp.subcategory_id === sub.id &&
              cp.category_id === sub.category_id,
          ).length;
        return (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className="w-full bg-white rounded-xl border border-[#E8E8ED] p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-[#2C3E50]/20 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center">
                <ChevronRight size={18} className="text-[#86868B]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#1D1D1F]">
                  {sub.name}
                </div>
                <div className="text-xs text-[#86868B]">
                  {phraseCount} phrases
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#86868B]" />
          </button>
        );
      })}
    </div>
  );
}

function PhraseListView({
  phrases,
  customPhrases,
  subcategoryName,
  categoryName,
  copiedId,
  speakingId,
  isFav,
  onCopy,
  onSpeak,
  onToggleFav,
  renderWords,
  onDeleteCustom,
}: {
  phrases: Phrase[];
  customPhrases: CustomPhrase[];
  subcategoryName: string;
  categoryName: string;
  copiedId: string | null;
  speakingId: string | null;
  isFav: (id: string) => boolean;
  onCopy: (text: string, id: string) => void;
  onSpeak: (text: string, id: string) => void;
  onToggleFav: (phrase: Phrase, subName: string, catName: string) => void;
  renderWords: (text: string, key: string) => React.ReactNode;
  onDeleteCustom: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider">
          {subcategoryName}
        </h2>
        <span className="text-xs text-[#86868B]">
          {phrases.length} phrases
        </span>
      </div>
      {phrases.map((phrase) => {
        const isCustom = customPhrases.some((cp) => cp.id === phrase.id);
        return (
          <div
            key={phrase.id}
            className="bg-white rounded-xl border border-[#E8E8ED] p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-sm leading-relaxed text-[#1D1D1F] font-normal">
              {renderWords(phrase.text, phrase.id)}
            </div>
            {phrase.context && (
              <div className="mt-2 text-xs text-[#86868B] italic">
                {phrase.context}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1">
              <button
                onClick={() => onCopy(phrase.text, phrase.id)}
                className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#86868B] transition-colors"
                title="Copy"
              >
                {copiedId === phrase.id ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
              <button
                onClick={() => onSpeak(phrase.text, phrase.id)}
                className={`p-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors ${
                  speakingId === phrase.id
                    ? "text-[#2C3E50]"
                    : "text-[#86868B]"
                }`}
                title="Read aloud"
              >
                <Volume2 size={16} />
              </button>
              {isCustom && (
                <button
                  onClick={() => onDeleteCustom(phrase.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-[#86868B] hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={() => onToggleFav(phrase, subcategoryName, categoryName)}
                className={`p-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors ${
                  isFav(phrase.id) ? "text-red-500" : "text-[#86868B]"
                }`}
                title="Favorite"
              >
                <Heart
                  size={16}
                  fill={isFav(phrase.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FavoritesView({
  favorites,
  copiedId,
  speakingId,
  onCopy,
  onSpeak,
  onRemove,
}: {
  favorites: Favorite[];
  copiedId: string | null;
  speakingId: string | null;
  onCopy: (text: string, id: string) => void;
  onSpeak: (text: string, id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-[#86868B] uppercase tracking-wider">
          Your Favorites
        </h2>
        <span className="text-xs text-[#86868B]">
          {favorites.length} saved
        </span>
      </div>
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Heart
            size={40}
            className="text-[#E8E8ED] mb-3"
            strokeWidth={1.5}
          />
          <p className="text-sm text-[#86868B]">No favorites yet.</p>
          <p className="text-xs text-[#86868B] mt-1">
            Heart a phrase to save it here.
          </p>
        </div>
      ) : (
        favorites.map((fav) => (
          <div
            key={fav.id}
            className="bg-white rounded-xl border border-[#E8E8ED] p-4 shadow-sm"
          >
            <div className="text-sm leading-relaxed text-[#1D1D1F] font-normal">
              {fav.text}
            </div>
            {fav.context && (
              <div className="mt-2 text-xs text-[#86868B] italic">
                {fav.context}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-medium text-[#86868B] bg-[#F5F5F7] px-2 py-1 rounded-full">
                {fav.category_name} / {fav.subcategory_name}
              </span>
              <div className="flex-1" />
              <button
                onClick={() => onCopy(fav.text, fav.id)}
                className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#86868B] transition-colors"
              >
                {copiedId === fav.id ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
              <button
                onClick={() => onSpeak(fav.text, fav.id)}
                className={`p-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors ${
                  speakingId === fav.id
                    ? "text-[#2C3E50]"
                    : "text-[#86868B]"
                }`}
              >
                <Volume2 size={16} />
              </button>
              <button
                onClick={() => onRemove(fav.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#86868B] hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function SearchView({
  query,
  onQueryChange,
  results,
  copiedId,
  speakingId,
  isFav,
  onCopy,
  onSpeak,
  onToggleFav,
  renderWords,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  results: SearchResult[];
  copiedId: string | null;
  speakingId: string | null;
  isFav: (id: string) => boolean;
  onCopy: (text: string, id: string) => void;
  onSpeak: (text: string, id: string) => void;
  onToggleFav: (phrase: Phrase, subName: string, catName: string) => void;
  renderWords: (text: string, key: string) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]"
        />
        <input
          type="text"
          placeholder="Search phrases, contexts, or categories..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full bg-white border border-[#E8E8ED] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#2C3E50] focus:ring-1 focus:ring-[#2C3E50] transition-all"
        />
      </div>
      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-xs text-[#86868B] text-center mt-4">
          Type at least 2 characters to search
        </p>
      )}
      {query.trim().length >= 2 && results.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Search size={32} className="text-[#E8E8ED] mb-2" />
          <p className="text-sm text-[#86868B]">No results found.</p>
        </div>
      )}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map(({ phrase, subcategory_name, category_name }) => (
            <div
              key={phrase.id}
              className="bg-white rounded-xl border border-[#E8E8ED] p-4 shadow-sm"
            >
              <div className="text-sm leading-relaxed text-[#1D1D1F] font-normal">
                {renderWords(phrase.text, phrase.id)}
              </div>
              {phrase.context && (
                <div className="mt-2 text-xs text-[#86868B] italic">
                  {phrase.context}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-medium text-[#86868B] bg-[#F5F5F7] px-2 py-1 rounded-full">
                  {category_name} / {subcategory_name}
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => onCopy(phrase.text, phrase.id)}
                  className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#86868B] transition-colors"
                >
                  {copiedId === phrase.id ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                <button
                  onClick={() => onSpeak(phrase.text, phrase.id)}
                  className={`p-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors ${
                    speakingId === phrase.id
                      ? "text-[#2C3E50]"
                      : "text-[#86868B]"
                  }`}
                >
                  <Volume2 size={16} />
                </button>
                <button
                  onClick={() =>
                    onToggleFav(phrase, subcategory_name, category_name)
                  }
                  className={`p-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors ${
                    isFav(phrase.id) ? "text-red-500" : "text-[#86868B]"
                  }`}
                >
                  <Heart
                    size={16}
                    fill={isFav(phrase.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddPhraseModal({
  categories,
  subcategories,
  form,
  errors,
  onFormChange,
  onErrorsChange,
  onSave,
  onClose,
}: {
  categories: Category[];
  subcategories: Subcategory[];
  form: { category: string; subcategory: string; text: string; context: string };
  errors: Record<string, string>;
  onFormChange: (f: typeof form) => void;
  onErrorsChange: (e: Record<string, string>) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const filteredSubs = form.category
    ? subcategories
        .filter((s) => s.category_id === form.category)
        .sort((a, b) => a.order - b.order)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1D1D1F]">
            Add Custom Phrase
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#86868B] mb-1 block">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => {
                onFormChange({
                  ...form,
                  category: e.target.value,
                  subcategory: "",
                });
                onErrorsChange({ ...errors, category: "" });
              }}
              className="w-full bg-[#F5F5F7] border border-[#E8E8ED] rounded-xl px-3 py-2.5 text-sm text-[#1D1D1F] focus:outline-none focus:border-[#2C3E50] transition-colors appearance-none"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-[#86868B] mb-1 block">
              Subcategory
            </label>
            <select
              value={form.subcategory}
              onChange={(e) => {
                onFormChange({ ...form, subcategory: e.target.value });
                onErrorsChange({ ...errors, subcategory: "" });
              }}
              disabled={!form.category}
              className="w-full bg-[#F5F5F7] border border-[#E8E8ED] rounded-xl px-3 py-2.5 text-sm text-[#1D1D1F] focus:outline-none focus:border-[#2C3E50] transition-colors appearance-none disabled:opacity-50"
            >
              <option value="">Select a subcategory</option>
              {filteredSubs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subcategory && (
              <p className="text-xs text-red-500 mt-1">
                {errors.subcategory}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-[#86868B] mb-1 block">
              Phrase
            </label>
            <textarea
              value={form.text}
              onChange={(e) => {
                onFormChange({ ...form, text: e.target.value });
                onErrorsChange({ ...errors, text: "" });
              }}
              placeholder="Enter a descriptive phrase..."
              rows={3}
              className="w-full bg-[#F5F5F7] border border-[#E8E8ED] rounded-xl px-3 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#2C3E50] transition-colors resize-none"
            />
            {errors.text && (
              <p className="text-xs text-red-500 mt-1">{errors.text}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-[#86868B] mb-1 block">
              Context Example
            </label>
            <textarea
              value={form.context}
              onChange={(e) => {
                onFormChange({ ...form, context: e.target.value });
                onErrorsChange({ ...errors, context: "" });
              }}
              placeholder="When would you use this phrase?"
              rows={2}
              className="w-full bg-[#F5F5F7] border border-[#E8E8ED] rounded-xl px-3 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#2C3E50] transition-colors resize-none"
            />
            {errors.context && (
              <p className="text-xs text-red-500 mt-1">{errors.context}</p>
            )}
          </div>
          <button
            onClick={onSave}
            className="w-full bg-[#2C3E50] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#1a252f] active:scale-[0.98] transition-all"
          >
            Save Phrase
          </button>
        </div>
      </div>
    </div>
  );
}

function DictionaryModal({
  word,
  result,
  loading,
  speaking,
  onSpeak,
  onClose,
}: {
  word: string;
  result: DictionaryResult | null;
  loading: boolean;
  speaking: boolean;
  onSpeak: (word: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[70vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#1D1D1F] capitalize">
              {word}
            </h3>
            <button
              onClick={() => onSpeak(word)}
              className={`p-1 rounded-lg hover:bg-[#F5F5F7] transition-colors ${
                speaking ? "text-[#2C3E50]" : "text-[#86868B]"
              }`}
            >
              <Volume2 size={18} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F5F5F7] text-[#86868B] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#E8E8ED] border-t-[#2C3E50] rounded-full animate-spin" />
          </div>
        ) : result ? (
          <div className="space-y-4">
            {result.phonetic && (
              <p className="text-xs text-[#86868B] font-mono">
                /{result.phonetic}/
              </p>
            )}
            {result.meanings.map((m, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-[#2C3E50] uppercase tracking-wider mb-1">
                  {m.partOfSpeech}
                </p>
                {m.definitions.map((def, j) => (
                  <div key={j} className="mb-2">
                    <p className="text-sm text-[#1D1D1F] leading-relaxed">
                      {j + 1}. {def.definition}
                    </p>
                    {def.synonyms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {def.synonyms.map((syn, k) => (
                          <span
                            key={k}
                            className="text-[10px] bg-[#F5F5F7] text-[#86868B] px-2 py-0.5 rounded-full"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#86868B] py-4 text-center">
            No definition found for "{word}".
          </p>
        )}
      </div>
    </div>
  );
}
