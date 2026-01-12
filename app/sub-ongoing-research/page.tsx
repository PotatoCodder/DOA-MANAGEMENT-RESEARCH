import React, { Suspense } from 'react';
import SubOngoingResearchClient from './SubOngoingResearchClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubOngoingResearchClient />
    </Suspense>
  );
}
