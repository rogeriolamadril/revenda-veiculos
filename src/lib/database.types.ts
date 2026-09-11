import type { Database as Generated } from "./database.generated";

export type VehicleStatus = "disponivel" | "reservado" | "vendido";
type GeneratedVehicles = Generated["public"]["Tables"]["vehicles"];
// SQL text CHECK constraints are not inferred as unions by the generator.
type Vehicles = Omit<GeneratedVehicles, "Row" | "Insert" | "Update"> & {
  Row: Omit<GeneratedVehicles["Row"], "status"> & { status: VehicleStatus };
  Insert: Omit<GeneratedVehicles["Insert"], "status"> & {
    status?: VehicleStatus;
  };
  Update: Omit<GeneratedVehicles["Update"], "status"> & {
    status?: VehicleStatus;
  };
};
export type Database = Omit<Generated, "public"> & {
  public: Omit<Generated["public"], "Tables"> & {
    Tables: Omit<Generated["public"]["Tables"], "vehicles"> & {
      vehicles: Vehicles;
    };
  };
};
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type VehicleImage =
  Database["public"]["Tables"]["vehicle_images"]["Row"];
export type VehicleWithImages = Vehicle & { vehicle_images: VehicleImage[] };
