// src/api/calculatePrice.ts
import axios from 'axios';
import type { PriceRequestDto } from './types';
import { fetchCarById } from './client';

const API_BASE_URL = '/api/bookings';

/** Preis abfragen */
export async function calculatePrice(request: PriceRequestDto): Promise<number> {
  try {
    const response = await axios.post<number>(`${API_BASE_URL}/price`, request);
    return response.data;
  } catch {
    return 0; // Falls Backend nicht antwortet, zeige 0
  }
}

/** Payload für Buchung */
export type RentAutoPayload = {
  autoId: number;
  customerId: number | string;
  startDatum: string;
  endDatum: string;
  insuranceOption?: 'TEILKASKO' | 'VOLLKASKO';
};

/** Hilfsfunktion: Tage zwischen zwei Daten */
function daysBetween(startISO: string, endISO: string): number {
  const toUTCDate = (d: string) => {
    const [y, m, dd] = d.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, dd));
  };
  const start = toUTCDate(startISO);
  const end = toUTCDate(endISO);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / msPerDay));
}

/** Auto mieten → gibt den Gesamtpreis zurück */
export async function rentAuto(payload: RentAutoPayload): Promise<number> {
  const res = await fetch(`/api/autos/${payload.autoId}/vermieten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg}`);
  }

  const rawText = await res.text().catch(() => '');
  if (!rawText) {
    // Wenn kein Inhalt zurückkommt, Preis lokal berechnen
    const car = await fetchCarById(payload.autoId);
    const tage = daysBetween(payload.startDatum, payload.endDatum);
    return Number(((car.preisProTag ?? 0) * tage).toFixed(2));
  }

  try {
    const data = JSON.parse(rawText);
    if (typeof data === 'number') return data;
    if (data?.preis != null) return Number(data.preis);
    if (data?.totalPrice != null) return Number(data.totalPrice);

    const carRaw = data?.auto ?? data?.car;
    const tage =
      data?.tage ??
      daysBetween(data?.startDatum ?? payload.startDatum, data?.endDatum ?? payload.endDatum);

    if (carRaw) {
      const car = await fetchCarById(payload.autoId);
      return Number(((car.preisProTag ?? 0) * tage).toFixed(2));
    }

    return Number(data?.preis_pro_tag ?? 0) * tage;
  } catch {
    const car = await fetchCarById(payload.autoId);
    const tage = daysBetween(payload.startDatum, payload.endDatum);
    return Number(((car.preisProTag ?? 0) * tage).toFixed(2));
  }
}
