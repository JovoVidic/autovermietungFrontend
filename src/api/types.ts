// types.ts
// types.ts
export const InsuranceOption = {
  VOLLKASKO: 'VOLLKASKO',
  TEILKASKO: 'TEILKASKO',
} as const;

export type InsuranceOption = typeof InsuranceOption[keyof typeof InsuranceOption];

export interface PriceRequestDto {
  autoId: number;
  startDate: string;   // Format "YYYY-MM-DD"
  endDate: string;     // Format "YYYY-MM-DD"
  insuranceOption: InsuranceOption;
}
