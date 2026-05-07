import {
  HiOutlineBriefcase,
  HiOutlineBuildingStorefront,
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
  'route-car': HiOutlineTruck,
  business: HiOutlineBuildingStorefront
};

export default function CategoryTabs({ current, labels, onChange }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <div className="flex min-w-max gap-3">
      {categories.map((category) => {
        const active = current === category.id;
        const Icon = categoryIcons[category.id] || HiOutlineSquares2X2;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={`flex w-[92px] shrink-0 flex-col items-center justify-center gap-2 rounded-[24px] px-3 py-4 text-center text-sm font-semibold transition ${
              active
                ? 'bg-[#16A34A] text-white shadow-soft'
                : 'bg-white text-slate-700 shadow-soft hover:bg-slate-50'
            }`}
          >
            <Icon
              className={`shrink-0 text-[26px] ${active ? 'text-white' : 'text-[#16A34A]'}`}
              aria-hidden="true"
            />
            <span className="line-clamp-2 text-xs leading-4">{labels[category.id]}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
