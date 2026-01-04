// validation.ts
export function validateBookingForm(
  startDatum: string,
  endDatum: string,
  insuranceOption: string
): string | null {
  if (!startDatum || !endDatum) {
    return 'Bitte Start- und Enddatum wählen.';
  }
  if (new Date(startDatum) >= new Date(endDatum)) {
    return 'Enddatum muss nach Startdatum liegen.';
  }
  if (!insuranceOption) {
    return 'Bitte eine Versicherung auswählen.';
  }
  return null; // alles gut
}

export function isBookingFormValid(
  startDatum: string,
  endDatum: string,
  insuranceOption: string
): boolean {
  return !!startDatum && !!endDatum && new Date(startDatum) < new Date(endDatum) && !!insuranceOption;
}
