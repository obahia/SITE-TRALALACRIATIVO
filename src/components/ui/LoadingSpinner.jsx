import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 32, className = '' }) => (
  <Loader2 className={`animate-spin text-brand-blue ${className}`} size={size} />
);

export default LoadingSpinner;
