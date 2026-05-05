export default function LogoMark({ align = 'left', compact = false, inverted = false }) {
  const alignmentClass =
    align === 'center' ? 'items-center text-center' : 'items-start text-left';
  const titleColor = inverted ? 'text-white' : 'text-[#16A34A]';
  const subtitleColor = inverted ? 'text-white/80' : 'text-slate-500';

  return (
    <div className={`flex flex-col ${alignmentClass}`}>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-3 w-3 rounded-full bg-[#16A34A]" />
        <span
          className={`tracking-tight ${titleColor} ${
            compact ? 'text-base font-black' : 'text-2xl font-black'
          }`}
        >
          HabarHub
        </span>
      </div>
      <span
        className={`mt-1 ${subtitleColor} ${
          compact ? 'text-[11px] font-semibold' : 'text-sm font-semibold'
        }`}
      >
        哈百通
      </span>
    </div>
  );
}
