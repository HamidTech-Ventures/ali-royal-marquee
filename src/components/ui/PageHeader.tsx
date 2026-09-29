import React from 'react';


interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  actions?: React.ReactNode;
  onBack?: () => void;
}

export const PageHeader = ({ title, description, icon, category, actions, onBack }: PageHeaderProps) => {
  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-surface-container-highest mb-6">
      <div className="space-y-1.5 max-w-2xl">
        <div className="flex items-center gap-2 text-[#b0891d] font-label-md text-[11px] uppercase tracking-widest font-bold mb-1">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center justify-center p-1 -ml-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface"
              title="Go Back"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
          )}
          {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
          <span>{category}</span>
        </div>
        <h1 className="font-serif text-3xl md:font-display md:text-display text-[#4a1420] md:text-primary tracking-tight font-bold">
          {title}
        </h1>
        {description && (
          <p className="font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {actions}
      </div>
    </div>
  );
};
