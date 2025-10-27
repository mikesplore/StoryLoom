import React from 'react';

interface LoadingBarProps {
  loading: boolean;
}

export default function LoadingBar({ loading }: LoadingBarProps) {
  return loading ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '4px',
      zIndex: 9999,
      background: 'linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%)',
      animation: 'loadingBar 1.2s linear infinite',
    }}>
      <style>{`
        @keyframes loadingBar {
          0% { opacity: 0.7; width: 0; }
          50% { opacity: 1; width: 100%; }
          100% { opacity: 0.7; width: 0; }
        }
      `}</style>
    </div>
  ) : null;
}
