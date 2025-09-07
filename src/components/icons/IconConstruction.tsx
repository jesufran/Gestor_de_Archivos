
import React from 'react';

export const IconConstruction: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    <path d="M17 12h.01"></path>
    <path d="M12 12h.01"></path>
    <path d="M7 12h.01"></path>
    <path d="m2 18 2-4"></path>
    <path d="m22 18-2-4"></path>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
