
// src/utils/errors.ts

export type ErrorBoxData = {
  title: string;
  message: string;
  details: Record<string, any> | null;
};

/**
 * Formatiert rohe Fehler (Error-Objekte oder Strings) zu einer freundlichen Darstellung.
 * - Unterstützt strukturierte Errors mit .message und .details (empfohlen)
 * - Fängt auch dein bestehendes Muster "HTTP 409 ... — { ...json... }" ab
 */
export function formatServerError(raw: unknown): ErrorBoxData {
  const fallback: ErrorBoxData = {
    title: 'Buchung nicht möglich',
    message: 'Die Buchung konnte nicht durchgeführt werden.',
    details: null,
  };

  // 1) Error-Objekt mit message (+ optional details vom Backend via rentAuto)
  if (raw && typeof raw === 'object') {
    const obj = raw as any;
    if (obj.message) {
      const details =
        obj.details && typeof obj.details === 'object' ? obj.details : null;
      return {
        title: 'Buchung nicht möglich',
        message: String(obj.message),
        details,
      };
    }
  }

  // 2) Versuch: Text analysieren und JSON-Teil extrahieren
  const text = String((raw as any)?.toString?.() ?? '');
  if (!text) return fallback;

  // Häufiges Muster: "HTTP 409 Conflict — {...json...}"
  const parts = text.split('—');
  let json: any = null;

  if (parts.length > 1) {
    try {
      json = JSON.parse(parts[1].trim());
    } catch {
      // kein JSON, ignorieren
    }
  } else {
    try {
      json = JSON.parse(text.trim());
    } catch {
      // kein JSON, ignorieren
    }
  }

  if (json && typeof json === 'object') {
    const message = json.message ?? json.error ?? fallback.message;
    const details: Record<string, any> = {};
    if (json.vermietetVon) details['Vermietet von'] = json.vermietetVon;
    if (json.vermietetBis) details['Vermietet bis'] = json.vermietetBis;
    if (json.freiAb) details['Wieder frei ab'] = json.freiAb;

    return {
      title: 'Buchung nicht möglich',
      message: String(message),
      details: Object.keys(details).length ? details : null,
    };
  }

  // 3) Fallback: HTTP-Text freundlich umformulieren
  if (/HTTP\s+\d+/.test(text)) {
    return {
      title: 'Buchung nicht möglich',
      message: 'Dieses Auto ist im gewählten Zeitraum bereits vermietet.',
      details: null,
    };
  }

  return fallback;
}
