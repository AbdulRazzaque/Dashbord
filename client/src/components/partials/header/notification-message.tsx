"use client";

import { Bell } from "@/components/svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import shortImage from "@/public/images/all-img/short-image-2.png";
import { useEffect, useState } from "react";
import type { Notification } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNotifications, markNotification } from "@/lib/http/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const NotificationMessage = () => {
  const [getNotification, setNotification] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["getAllNotifications"],
    queryFn: async () => {
      return await getAllNotifications().then((res) => res.data);
    },
  });

  useEffect(() => {
    if (data) {
      setNotification(data);
    }
  }, [data]);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["markNotification"],
    mutationFn: async (data: any) => {
      return await markNotification(data);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["getAllNotifications"],
      });
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.errors[0].msg);
      } else {
        toast.error("Something went wrong!");
      }
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    if (!notification.isRead) {
      mutate({ markAll: false, id: notification._id });
    }
  };

  const unreadCount = getNotification.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 dark:hover:bg-default-200 
            data-[state=open]:bg-default-100  dark:data-[state=open]:bg-default-200 
             hover:text-primary text-default-500 dark:text-default-800  rounded-full"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="w-4 h-4 p-0 text-xs font-medium items-center justify-center absolute left-[calc(100%-18px)] bottom-[calc(100%-16px)] ring-2 ring-primary-foreground">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-[999] mx-4 lg:w-[412px] p-0"
        >
          <DropdownMenuLabel
            style={{ backgroundImage: `url(${shortImage.src})` }}
            className="w-full h-full bg-cover bg-no-repeat p-4 flex items-center"
          >
            <span className="text-base font-semibold text-white flex-1">
              Notification
            </span>
            <span
              onClick={() => mutate({ markAll: true, id: "" })}
              className="text-xs font-medium text-white flex-0 cursor-pointer hover:underline hover:decoration-default-100 dark:decoration-default-900"
            >
              Mark all as read{" "}
            </span>
          </DropdownMenuLabel>
          <div className="h-[300px] xl:h-[350px]">
            <ScrollArea className="h-full">
              {getNotification.map((item, index) => (
                <DropdownMenuItem
                  key={`inbox-${index}`}
                  className="flex gap-9 py-2 px-4 cursor-pointer dark:hover:bg-background"
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className="flex-1 flex items-center gap-2">
                    <div>
                      <div className="text-sm font-medium text-default-900 mb-[2px] whitespace-nowrap">
                        {item.orderId.refId}
                      </div>
                      <div className="text-xs text-default-900 truncate max-w-[100px] lg:max-w-[185px]">
                        {" "}
                        {item.message}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-xs font-medium text-default-900 whitespace-nowrap",
                      {
                        "text-default-600": !item.isRead,
                      }
                    )}
                  >
                    {new Date(item.createdAt).toDateString()}
                  </div>
                  <div
                    className={cn("w-2 h-2 rounded-full mr-2", {
                      "bg-primary": !item.isRead,
                    })}
                  ></div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </div>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notification Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="py-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">
                  Order: {selectedNotification.orderId.refId}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-base">{selectedNotification.message}</p>
              </div>
              {/* {selectedNotification.additionalInfo && (
                <div className="mt-4 bg-muted p-3 rounded-md">
                  <h4 className="font-medium mb-1">Additional Information</h4>
                  <p className="text-sm">
                    {selectedNotification.additionalInfo}
                  </p>
                </div>
              )} */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationMessage;
