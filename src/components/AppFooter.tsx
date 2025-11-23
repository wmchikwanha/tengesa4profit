import * as React from 'react';

export const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 py-3 px-4 sm:py-4 sm:px-6 flex justify-center sm:justify-end items-center bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm z-10">
      <div className="text-center sm:text-right space-y-0.5">
        <div className="flex items-center justify-center sm:justify-end gap-1.5">
          <span className="text-muted-foreground/60 text-xs">©</span>
          <span className="text-muted-foreground/60 text-xs">{currentYear}</span>
          <span className="text-muted-foreground/70 text-xs sm:text-sm font-medium tracking-wide">
            StratedgeAI
          </span>
        </div>
        <p className="text-muted-foreground/50 text-[10px] sm:text-xs font-normal">
          Developed by Walt C
        </p>
      </div>
    </footer>
  );
};
