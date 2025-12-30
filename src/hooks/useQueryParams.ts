
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useQueryParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  function setParams(partial: Record<string, string | number | undefined | null>) {
    const next = new URLSearchParams(location.search);
    Object.entries(partial).forEach(([k, v]) => {
      if (v === undefined || v === null || String(v).trim() === '') next.delete(k);
      else next.set(k, String(v));
    });
    navigate({ pathname: location.pathname, search: next.toString() }, { replace: false });
  }

  return { params, setParams };
}
