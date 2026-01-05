
// src/utils/errors.ts

export type ErrorBoxData = {
  title: string;
  message: string;
  details: Record<string, string> | null; // <-- stringifiziert & hübsch benannt
};

/** interne Helfer: mappt Backend-Keys -> deutsche Label */
function labelFor(key: string): string {
  const map: Record<string, string> = {
    // häufige Backend-Keys
    vermietetVon: 'Vermietet von',
    vermietetBis: 'Vermietet bis',
    freiAb: 'Wieder frei ab',
    startDatum: 'Startdatum',
    endDatum: 'Enddatum',
    // „fallback“-Normalisierung
  };
  return map[key] ?? key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** macht aus beliebigen Details ein flaches Record<string,string> */
function normalizeDetails(maybeDetails: unknown): Record<string, string> | null {
  if (!maybeDetails || typeof maybeDetails !== 'object') return null;

  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(maybeDetails as Record<string, unknown>)) {
    if (v == null) continue;

    // Strings, die JSON enthalten, werden vorsichtig geparst
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          // wenn Objekt/Array -> auf Einzeiler reduzieren
          out[labelFor(k)] = Array.isArray(parsed) ? parsed.join(', ') : Object.values(parsed as any).join(', ');
          continue;
        } catch {
          // dann als normaler Text übernehmen
        }
      }
      out[labelFor(k)] = trimmed;
      continue;
    }

    // Primitive direkt in String
    if (typeof v !== 'object') {
      out[labelFor(k)] = String(v);
      continue;
    }

    // Objekte/Arrays nett aufbereiten (KEIN JSON)
    if (Array.isArray(v)) {
      out[labelFor(k)] = v.map((x) => String(x)).join(', ');
    } else {
      // flaches Objekt -> "key: value; key2: value2"
      const parts: string[] = [];
      for (const [ik, iv] of Object.entries(v as Record<string, unknown>)) {
        if (iv == null) continue;
        parts.push(`${labelFor(ik)}: ${String(iv)}`);
      }
      if (parts.length) out[labelFor(k)] = parts.join('; ');
    }
  }

  return Object.keys(out).length ? out : null;
}

/**
 * Formatiert rohe Fehler (Error-Objekte oder Strings) zu einer freundlichen Darstellung.
 * - unterstützt strukturierte Errors mit .message und .details
 * - erkennt dein Muster "HTTP 409 … — {json}" und extrahiert message & Details
 * - gibt Details stets als flaches Record<string,string> zurück (keine JSON-Anzeige)
 */
export function formatServerError(raw: unknown): ErrorBoxData {
  const fallback: ErrorBoxData = {
    title: 'Buchung nicht möglich',
    message: 'Die Buchung konnte nicht durchgeführt werden.',
    details: null,
  };

  // 1) Error-Objekt (empfohlen: rentAuto wirft message + details)
  if (raw && typeof raw === 'object') {
    const obj = raw as any;
    if (obj.message) {
      return {
        title: 'Buchung nicht möglich',
        message: String(obj.message),
        details: normalizeDetails(obj.details) // <- hübsch & flach
      };
    }
  }

  // 2) String analysieren & JSON-Teil extrahieren
  const text = String((raw as any)?.toString?.() ?? '').trim();
  if (!text) return fallback;

  // häufig: "HTTP 409 Conflict — {...}"
  const parts = text.split('—');
  let json: any = null;
  if (parts.length > 1) {
    try { json = JSON.parse(parts[1].trim()); } catch {}
  } else {
    try { json = JSON.parse(text); } catch {}
  }

  if (json && typeof json === 'object') {
    const message = json.message ?? json.error ?? fallback.message;
    const details = normalizeDetails({
      vermietetVon: json.vermietetVon,
      vermietetBis: json.vermietetBis,
      freiAb: json.freiAb,
      ...json.details, // falls Backend unter "details" liefert
    });
    return {
      title: 'Buchung nicht möglich',
      message: String(message),
      details,
    };
  }

  // 3) Fallback für HTTP-Fehler ohne JSON
  if (/HTTP\s+\d+/.test(text)) {
    return {
      title: 'Buchung nicht möglich',
      message: 'Dieses Auto ist im gewählten Zeitraum bereits vermietet.',
      details: null,
    };
  }

  return fallback;
}
