export const Roles = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  VENDOR: "vendor",
  RETAILER: "retailer",
  USER: "user",
  DELIVERY_PERSON: "deliveryPerson",
} as const;



export enum RolesEnum {
  ADMIN = "admin",
  SUPER_ADMIN = "superAdmin",
  VENDOR = "vendor",
  USER = "user",
  RETAILER = "retailer",
}

// Create a type from the enum values
export type RoleType = `${RolesEnum}`;
