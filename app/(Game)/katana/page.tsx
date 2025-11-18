import KatanaGame from '@/components/Games/KatanaGame';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white font-bold text-xl">Loading game...</div>}>
      <KatanaGame />
    </Suspense>
  );
}
