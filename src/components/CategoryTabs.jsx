import {
  HiOutlineBriefcase,
  HiOutlineHome,
  HiOutlineTruck,
  HiOutlineSquares2X2,
  HiOutlineTag,
  HiOutlineWrenchScrewdriver
} from 'react-icons/hi2';
import { categories } from '../data/listings';

const categoryIcons = {
  all: HiOutlineSquares2X2,
  housing: HiOutlineHome,
  jobs: HiOutlineBriefcase,
  services: HiOutlineWrenchScrewdriver,
  market: HiOutlineTag,
  'route-car': HiOutlineTruck
};

export default function CategoryTabs({ current, labels, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 sm:grid-cols-3">
      {categories.map((category) => {
        const active = current === category.id;
        const Icon = categoryIcons[category.id] || HiOutlineSquares2X2;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={`flex min-w-0 items-center justify-center gap-[6px] rounded-2xl px-3.5 py-1.5 text-sm font-semibold transition ${
              active
                ? 'bg-[#16A34A] text-white shadow-soft'
                : 'bg-white text-slate-600 shadow-soft hover:bg-slate-50'
            }`}
          >
            <Icon
              className={`shrink-0 text-[18px] ${active ? 'text-white' : 'text-slate-700'}`}
              aria-hidden="true"
            />
            <span className="truncate">{labels[category.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
