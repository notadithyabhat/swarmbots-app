import type { ContextMenuState } from '../simulation/types';

interface Props {
  menu: ContextMenuState;
  onEnable: () => void;
  onDock: () => void;
}

export default function ContextMenu({ menu, onEnable, onDock }: Props) {
  if (!menu.visible) return null;
  return (
    <div
      className="fixed z-50 min-w-[140px] rounded-xl overflow-hidden shadow-2xl border border-white/10"
      style={{ left: menu.x, top: menu.y, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)' }}
    >
      <button
        onClick={onEnable}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-colors cursor-pointer"
      >
        {menu.enableLabel}
      </button>
      <div className="border-t border-white/10" />
      <button
        onClick={onDock}
        disabled={menu.dockDisabled}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {menu.dockLabel}
      </button>
    </div>
  );
}
