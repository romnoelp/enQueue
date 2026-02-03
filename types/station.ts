export type CashierType = "payment" | "clinic" | "auditing" | "registrar";

export type Station = {
  id?: string;
  name: string;
  description: string;
  type: CashierType;
}

