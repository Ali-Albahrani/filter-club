// LazyComponent.js - Higher-order component for lazy loading with suspense

import React, { Suspense } from 'react';

export const LazyComponent = (importFunc, fallback = <div className="p-8 text-center">Loading...</div>) => {
  const Component = React.lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

export default LazyComponent;