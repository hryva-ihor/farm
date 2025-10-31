export interface Detail {
  id: string;
  name: string;
  plan: number;
}

export type RoomName = 'четвірка' | 'основа_1' | 'основа_2' | 'курілка' | 'крило';

export interface RoomAllocation {
  id: string; // Unique ID for the allocation
  room: RoomName;
  detail_id: string;
  printers: number;
  started: number;
}

export interface PrintFarmData {
  details: Detail[];
  allocations: RoomAllocation[];
}

export interface Room {
  name: RoomName;
  capacity: number;
}

export interface AppError {
  error: string;
  context?: string;
}