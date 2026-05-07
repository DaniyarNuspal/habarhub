export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <label className="flex items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white/95 px-4 py-3.5 shadow-soft backdrop-blur">
      <span className="text-lg text-slate-400">⌕</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
