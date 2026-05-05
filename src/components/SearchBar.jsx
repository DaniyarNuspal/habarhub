export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-soft">
      <span className="text-lg text-slate-400">⌕</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
