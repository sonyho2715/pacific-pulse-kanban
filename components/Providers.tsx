'use client';

import { CommandPalette } from './CommandPalette';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
