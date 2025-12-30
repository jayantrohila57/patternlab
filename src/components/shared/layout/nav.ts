import {
  HomeIcon,
  LeftToRightListStarIcon,
  UserIcon,
  Settings02Icon,
  DashboardCircleIcon,
  Bookmark02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export type AppRouteId =
  | "dashboard"
  | "problems"
  | "workspace"
  | "my_list"
  | "profile"
  | "settings";

export type NavItem = {
  id: AppRouteId;
  label: string;
  icon: IconSvgElement;
  enabled: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: "main",
    label: "Main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: DashboardCircleIcon,
        enabled: false,
      },
      {
        id: "problems",
        label: "Problems",
        icon: HomeIcon,
        enabled: true,
      },
      {
        id: "workspace",
        label: "Workspace",
        icon: LeftToRightListStarIcon,
        enabled: true,
      },
      {
        id: "my_list",
        label: "My List",
        icon: Bookmark02Icon,
        enabled: false,
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      {
        id: "profile",
        label: "Profile",
        icon: UserIcon,
        enabled: false,
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings02Icon,
        enabled: false,
      },
    ],
  },
];
