import { useEffect, useRef, useState } from 'react';
import { languages } from '../i18n/translations';

const labels = {
  zh: '中文',
  ru: 'Русский',
  kk: 'Қазақша',
  en: 'English'
};

export default function LanguageSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-24 max-w-[96px] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-soft"
      >
        <span className="truncate whitespace-nowrap">{labels[current]}</span>
        <span className={`text-base leading-none text-slate-400 transition ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-full max-w-[96px] overflow-hidden rounded-2xl bg-white py-1.5 shadow-soft">
          {languages.map((language) => {
            const active = language === current;

            return (
              <button
                key={language}
                type="button"
                onClick={() => {
                  onChange(language);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-2 text-left text-xs font-semibold whitespace-nowrap ${
                  active
                    ? 'bg-[#16A34A] text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={labels[language]}
              >
                <span className="truncate">{labels[language]}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
