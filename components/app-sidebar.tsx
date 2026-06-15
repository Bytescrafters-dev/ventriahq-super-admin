"use client";

import React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconListDetails,
  IconUsers,
  IconBallVolleyball,
  IconUsersPlus,
  IconPackages,
  IconShoppingCart,
  IconTopologyStar3,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: IconDashboard,
    collapsible: false,
    items: [],
  },
  {
    title: "Plans & packages",
    url: "/price-plans",
    icon: IconTopologyStar3,
    collapsible: true,
    items: [
      { title: "View Plans", url: "/price-plans" },
      { title: "Add New Plan", url: "/price-plans/create" },
    ],
  },

  {
    title: "Tenants",
    url: "/tenants",
    icon: IconUsers,
    collapsible: true,
    items: [
      { title: "View Tenants", url: "/tenants" },
      { title: "Add New Tenant", url: "/tenants/create" },
    ],
  },
  // {
  //   title: "Products",
  //   url: "/products",
  //   icon: IconBallVolleyball,
  //   collapsible: true,
  //   items: [
  //     { title: "View Products", url: "/products" },
  //     { title: "Add Product", url: "/products/create" },
  //   ],
  // },
  // {
  //   title: "Inventory",
  //   url: "/purchase-orders",
  //   icon: IconPackages,
  //   collapsible: true,
  //   items: [
  //     { title: "Purchase Orders", url: "/purchase-orders" },
  //     { title: "Stock Receipts", url: "/stock-receipts" },
  //   ],
  // },
  // {
  //   title: "Orders",
  //   url: "/orders",
  //   icon: IconShoppingCart,
  //   collapsible: true,
  //   items: [
  //     { title: "View Orders", url: "/orders" },
  //     { title: "New Order", url: "/orders/create" },
  //   ],
  // },
  // {
  //   title: "Suppliers",
  //   url: "/suppliers",
  //   icon: IconUsersPlus,
  //   collapsible: true,
  //   items: [
  //     { title: "View Suppliers", url: "/suppliers" },
  //     { title: "Add Supplier", url: "/suppliers/create" },
  //   ],
  // },
  // {
  //   title: "Leads",
  //   url: "/leads",
  //   icon: IconTopologyStar3,
  //   collapsible: true,
  //   items: [
  //     { title: "View Leads", url: "/leads" },
  //     { title: "Import Leads", url: "/leads/import" },
  //   ],
  // },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#">
                <span className="text-xl font-semibold">Super Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
