export type Cashier = {
    id: string;
    uid: string;
    email: string;
    name: string;
    role: "cashier"
    stationId: string | null;
    counterId: string | null
  }