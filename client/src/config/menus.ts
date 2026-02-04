

import { RolesEnum, RoleType } from "@/constants";
import {
  LayoutDashboard,Grid,UserCheck,Users,UserX, LayoutGrid
} from "lucide-react";

export interface MenuItemProps {
  title: string;
  icon: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu?: MenuItemProps[];
  nested?: MenuItemProps[];
  onClick?: () => void;
  requiredRole?: RoleType[]; // Update this to use RoleType
  isHeader?: boolean;
}

export const menusConfig = {
  mainNav: [] as MenuItemProps[],
  sidebarNav: {
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
 
  
      {
        title: "Attendance",
        icon: UserCheck ,
        href: "/dashboard/attendance",
        requiredRole: [RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN],
      },
      {
        title: "Employees",
        icon: Users ,
        href: "/dashboard/employees",
        requiredRole: [RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN],
      },
   
      {
        title: "Absent Employees",
        icon: UserX ,
        href: "/dashboard/absent",
        requiredRole: [RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN],
      },
   
      {
        title: "Report",
        icon: LayoutGrid ,
        href: "/dashboard/report",
        requiredRole: [RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN],
      },
   

    ] as MenuItemProps[],
  },
};

export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number];
export type MainNavType = (typeof menusConfig.mainNav)[number];
