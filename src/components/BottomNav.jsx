import { HiOutlineHome, HiOutlineUserCircle, HiPlus } from 'react-icons/hi2';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav({ labels }) {
  const location = useLocation();
  const items = [
    { id: 'home', label: labels.home, icon: HiOutlineHome, to: '/' },
    { id: 'publish', label: labels.publish, icon: HiPlus, to: '/create' },
    { id: 'my', label: labels.my, icon: HiOutlineUserCircle, to: '/my-listings' }
  ];

  return (
    <nav className="sticky bottom-0 z-30 border-t border-white/15 bg-[#16A34A]/95 px-5 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.14)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1560px]">
        <div className="grid grid-cols-3 items-end">
          {items.map((item) => {
            const active = location.pathname === item.to;
            const isPublish = item.id === 'publish';
            const Icon = item.icon;

            if (isPublish) {
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`mx-auto -mt-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-center shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition ${
                    active ? 'scale-[1.02]' : ''
                  }`}
                  aria-label={labels.publish}
                  title={labels.publish}
                >
                  <Icon className="text-[24px] text-[#16A34A]" aria-hidden="true" />
                </Link>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex min-w-0 flex-col items-center gap-1 py-1 text-[10px] font-semibold ${
                  active ? 'text-white' : 'text-white/70'
                }`}
              >
                <Icon className="text-[20px] leading-none" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
