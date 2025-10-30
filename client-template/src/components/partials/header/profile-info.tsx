"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { logoutAction } from "@/lib/actions/logout";
import { getProfile } from "@/lib/http/api";
import { useAuthStore } from "@/store";
import { UserData } from "@/types";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProfileInfo = () => {
  const router = useRouter();

  const [getUser, setUserState] = useState<UserData>();
  const { logoutSession } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);

  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await getProfile().then((res) => res.data);
    },
  });

  useEffect(() => {
    if (data) {
      setUserState(data);
      setUser({
        role: data.role,
      });
    }
  }, [data]);

  const logoutHandler = async () => {
    const logged = await logoutAction();

    if (logged.type === "success") {
      logoutSession();
      toast.success("Successfully logged out");
      router.push("/login");
    }

    if (logged.type === "error") {
      toast.error(logged.message);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className=" cursor-pointer">
        <div className=" flex items-center  ">
          <Avatar>
            <AvatarImage src={getUser?.avatar} />
            <AvatarFallback>
              {getUser?.firstName[0]}
              {getUser?.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          <Avatar>
            <AvatarImage src={getUser?.avatar} />
            <AvatarFallback>
              {getUser?.firstName[0]}
              {getUser?.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium text-default-800 capitalize ">
              {getUser?.firstName + " " + getUser?.lastName}
            </div>
            <Link
              href="/dashboard"
              className="text-xs text-default-600 hover:text-primary"
            >
              {getUser?.role}
            </Link>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {[
            {
              name: "profile",
              icon: "heroicons:user",
              href: "/dashboard/profile",
            },
            // {
            //   name: "Billing",
            //   icon: "heroicons:megaphone",
            //   href: "/dashboard",
            // },
            {
              name: "Settings",
              icon: "heroicons:paper-airplane",
              href: "/dashboard",
            },
            // {
            //   name: "Keyboard shortcuts",
            //   icon: "heroicons:language",
            //   href: "/dashboard",
            // },
          ].map((item, index) => (
            <Link
              href={item.href}
              key={`info-menu-${index}`}
              className="cursor-pointer"
            >
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                <Icon icon={item.icon} className="w-4 h-4" />
                {item.name}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
        {/* <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/dashboard" className="cursor-pointer">
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
              <Icon icon="heroicons:user-group" className="w-4 h-4" />
              team
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background">
              <Icon icon="heroicons:user-plus" className="w-4 h-4" />
              Invite user
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {[
                  {
                    name: "email",
                  },
                  {
                    name: "message",
                  },
                  {
                    name: "facebook",
                  },
                ].map((item, index) => (
                  <Link
                    href="/dashboard"
                    key={`message-sub-${index}`}
                    className="cursor-pointer"
                  >
                    <DropdownMenuItem className="text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                      {item.name}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <Link href="/dashboard">
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
              <Icon icon="heroicons:variable" className="w-4 h-4" />
              Github
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
              <Icon icon="heroicons:phone" className="w-4 h-4" />
              Support
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {[
                  {
                    name: "portal",
                  },
                  {
                    name: "slack",
                  },
                  {
                    name: "whatsapp",
                  },
                ].map((item, index) => (
                  <Link href="/dashboard" key={`message-sub-${index}`}>
                    <DropdownMenuItem className="text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                      {item.name}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup> */}
        <DropdownMenuSeparator className="mb-0 dark:bg-background" />
        <DropdownMenuItem
          onClick={logoutHandler}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default ProfileInfo;
