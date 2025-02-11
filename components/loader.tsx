// Spinner.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

const Loader: React.FC<SpinnerProps> = ({ className }) => {
  return (
    <div className="w-full p-10 flex items-center justify-center">
      <Loader2 className={cn('animate-spin', className)} />
    </div>
  );
};

export default Loader;
