import * as React from 'react';

export const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 px-6 flex justify-end items-center">
      <div className="text-right space-y-0.5">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-muted-foreground/60 text-xs">©</span>
          <span className="text-muted-foreground/60 text-xs">{currentYear}</span>
          <span className="text-muted-foreground/70 text-xs font-medium tracking-wide">
            StratedgeAI
          </span>
        </div>
        <p className="text-muted-foreground/50 text-[10px] font-normal">
          Developed by Walt C
        </p>
      </div>
    </footer>
  );
};
