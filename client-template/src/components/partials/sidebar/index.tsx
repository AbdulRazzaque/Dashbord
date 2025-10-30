"use client";
import React from "react";
import { useSidebar } from "@/store";
import { useMediaQuery } from "@/hooks/use-media-query";
import PopoverSidebar from "./popover";
import MobileSidebar from "./mobile-sidebar";

const Sidebar = ({ trans }: { trans: string }) => {
  const { sidebarType } = useSidebar();

  const isDesktop = useMediaQuery("(min-width: 1280px)");

  let selectedSidebar = null;

  if (!isDesktop) {
    selectedSidebar = <MobileSidebar trans={trans} />;
  } else {
    const sidebarComponents: { [key: string]: JSX.Element } = {
      popover: <PopoverSidebar trans={trans} />,
    };

    selectedSidebar = sidebarComponents[sidebarType] || (
      <PopoverSidebar trans={trans} />
    );
  }

  return <div>{selectedSidebar}</div>;
};

export default Sidebar;
