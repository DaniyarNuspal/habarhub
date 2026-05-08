import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const AUTO_ROW_SIZE = 10;
const GRID_GAP = 12;

export default function MasonryGrid({ items, renderItem, className = '' }) {
  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const [spans, setSpans] = useState({});

  const updateSpans = useCallback(() => {
    const nextSpans = {};

    itemRefs.current.forEach((node, key) => {
      const contentNode = node.firstElementChild || node;
      const height = contentNode.getBoundingClientRect().height;
      nextSpans[key] = Math.max(
        1,
        Math.ceil((height + GRID_GAP) / (AUTO_ROW_SIZE + GRID_GAP))
      );
    });

    setSpans((currentSpans) => {
      const currentKeys = Object.keys(currentSpans);
      const nextKeys = Object.keys(nextSpans);

      if (
        currentKeys.length === nextKeys.length &&
        nextKeys.every((key) => currentSpans[key] === nextSpans[key])
      ) {
        return currentSpans;
      }

      return nextSpans;
    });
  }, []);

  const setItemRef = useCallback(
    (key) => (node) => {
      if (node) {
        itemRefs.current.set(String(key), node);
      } else {
        itemRefs.current.delete(String(key));
      }
    },
    []
  );

  useLayoutEffect(() => {
    updateSpans();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateSpans);
      return () => window.removeEventListener('resize', updateSpans);
    }

    const observer = new ResizeObserver(() => {
      updateSpans();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    itemRefs.current.forEach((node) => observer.observe(node));
    window.addEventListener('resize', updateSpans);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSpans);
    };
  }, [items, updateSpans]);

  return (
    <div
      ref={containerRef}
      className={`grid auto-rows-[10px] grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {items.map((item) => {
        const key = String(item.id);

        return (
          <div
            key={key}
            ref={setItemRef(key)}
            className="min-w-0"
            style={{ gridRowEnd: `span ${spans[key] || 1}` }}
          >
            <div>{renderItem(item)}</div>
          </div>
        );
      })}
    </div>
  );
}
