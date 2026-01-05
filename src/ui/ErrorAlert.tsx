
// src/ui/ErrorAlert.tsx
import React from 'react';
import type { ErrorBoxData } from '../utils/errors';

type Props = {
  error: ErrorBoxData;
  className?: string;
  style?: React.CSSProperties;
};

export default function ErrorAlert({ error, className, style }: Props) {
  const baseStyle: React.CSSProperties = {
    marginTop: 12,
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #f5c2c7',
    background: '#f8d7da',
    color: '#58151c',
  };

  const titleStyle: React.CSSProperties = { fontWeight: 700, marginBottom: 8, fontSize: 18 };
  const listStyle: React.CSSProperties = { margin: '8px 0 0 0', paddingLeft: 18, lineHeight: 1.4 };

  return (
    <div role="alert" aria-live="assertive" className={className} style={{ ...baseStyle, ...style }}>
      <div style={titleStyle}>Buchung nicht möglich</div>
      <div>{error.message}</div>

      {error.details && (
        <ul style={listStyle}>
          {Object.entries(error.details).map(([label, value]) => (
            <li key={label}>
              <strong>{label}:</strong> {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
