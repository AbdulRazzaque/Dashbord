"use client";

import { CupBar, NoteIcon, CheckShape, Spam } from "@/components/svg";
import { cn } from "@/lib/utils";
import { Counts } from "@/types";
import { Icon } from "@iconify/react";

interface Props {
  data: Counts;
}

const EcommerceStats = ({ data }: Props) => {
  // const daata = [
  //   {
  //     text: "Total Sales",
  //     total: "42,750.98",
  //     color: "primary",
  //     icon: <CupBar className="w-3.5 h-3.5" />,
  //   },
  //   {
  //     text: "Today Orders",
  //     total: "536,23,3",
  //     color: "warning",
  //     icon: <NoteIcon className="w-3.5 h-3.5" />,
  //   },
  //   {
  //     text: "Completed Orders",
  //     total: "234,1",
  //     color: "success",
  //     icon: <CheckShape className="w-3.5 h-3.5" />,
  //   },
  //   {
  //     text: "Pending Orders",
  //     total: "332,34",
  //     color: "destructive",
  //     icon: <Spam className="w-3.5 h-3.5" />,
  //   },
  // ];

  return (
    <>
      {/* {daata.map((item, index) => (
        <div
          key={`reports-state-${index}`}
          className={cn(
            "flex flex-col gap-1.5 p-4 rounded-sm overflow-hidden bg-primary/10  items-start relative before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-1 before:h-[2px] before:w-9 before:bg-primary/50 dark:before:bg-primary-foreground before:hidden ",
            {
              "bg-primary/40  dark:bg-primary/70": item.color === "primary",
              "bg-orange-50 dark:bg-orange-500": item.color === "warning",
              "bg-green-50 dark:bg-green-500": item.color === "success",
              "bg-red-50 dark:bg-red-500 ": item.color === "destructive",
            }
          )}
        >
          <span
            className={cn(
              "h-[95px] w-[95px] rounded-full bg-primary/40 absolute -top-8 -right-8 ring-[20px] ring-primary/30",
              {
                "bg-primary/50  ring-primary/20 dark:bg-primary dark:ring-primary/40":
                  item.color === "primary",
                "bg-orange-200 ring-orange-100 dark:bg-orange-300 dark:ring-orange-400":
                  item.color === "warning",
                "bg-green-200 ring-green-100 dark:bg-green-300 dark:ring-green-400":
                  item.color === "success",
                "bg-red-200 ring-red-100 dark:bg-red-300 dark:ring-red-400":
                  item.color === "destructive",
              }
            )}
          ></span>
          <div
            className={`w-8 h-8 grid place-content-center rounded-full border border-dashed border-${item.color} dark:border-primary-foreground/60`}
          >
            <span
              className={cn(
                `h-6 w-6 rounded-full grid place-content-center  bg-${item.color}`,
                {
                  "dark:bg-[#EFF3FF]/30": item.color === "primary",
                  "dark:bg-[#FFF7ED]/30": item.color === "warning",
                  "dark:bg-[#ECFDF4]/30": item.color === "success",
                  "dark:bg-[#FEF2F2]/30": item.color === "destructive",
                }
              )}
            >
              {item.icon}
            </span>
          </div>
          <span className="mt-3 text-sm text-default-800 dark:text-primary-foreground font-medium capitalize relative z-10">
            {item.text}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-default-900  dark:text-primary-foreground">
              {item.total}
            </span>
            <Icon
              icon="heroicons:arrow-trending-up"
              className={`w-5 h-5 text-${item.color} dark:text-primary-foreground`}
            />
          </div>
        </div>
      ))} */}
      <div
        className={cn(
          "flex flex-col gap-1.5 p-4 rounded-sm overflow-hidden   items-start relative before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-1 before:h-[2px] before:w-9 before:bg-primary/50 dark:before:bg-primary-foreground before:hidden bg-primary/40  dark:bg-primary/70"
        )}
      >
        <span
          className={cn(
            "h-[95px] w-[95px] rounded-full absolute -top-8 -right-8 ring-[20px]  bg-primary/50  ring-primary/20 dark:bg-primary dark:ring-primary/40"
          )}
        ></span>
        <div
          className={`w-8 h-8 grid place-content-center rounded-full border border-dashed border-primary dark:border-primary-foreground/60`}
        >
          <span
            className={cn(
              `h-6 w-6 rounded-full grid place-content-center bg-primary dark:bg-[#EFF3FF]/30`
            )}
          >
            <CupBar className="w-3.5 h-3.5" />
          </span>
        </div>
        <span className="mt-3 text-sm text-default-800 dark:text-primary-foreground font-medium capitalize relative z-10">
          Total Sales
        </span>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold text-default-900  dark:text-primary-foreground">
            {data.totalSales ? data.totalSales : 0}
          </span>
          <Icon
            icon="heroicons:arrow-trending-up"
            className={`w-5 h-5 text-primary-500 dark:text-primary-foreground`}
          />
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col gap-1.5 p-4 rounded-sm overflow-hidden   items-start relative before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-1 before:h-[2px] before:w-9 before:bg-primary/50 dark:before:bg-primary-foreground before:hidden bg-orange-50 dark:bg-orange-500"
        )}
      >
        <span
          className={cn(
            "h-[95px] w-[95px] rounded-full absolute -top-8 -right-8 ring-[20px]  bg-orange-200 ring-orange-100 dark:bg-orange-300 dark:ring-orange-400"
          )}
        ></span>
        <div
          className={`w-8 h-8 grid place-content-center rounded-full border border-dashed border-warning dark:border-warning-foreground/60`}
        >
          <span
            className={cn(
              `h-6 w-6 rounded-full grid place-content-center bg-warning dark:bg-[#FFF7ED]/30`
            )}
          >
            <NoteIcon className="w-3.5 h-3.5" />
          </span>
        </div>
        <span className="mt-3 text-sm text-default-800 dark:text-primary-foreground font-medium capitalize relative z-10">
          Today Orders
        </span>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold text-default-900  dark:text-primary-foreground">
            {data.todaysOrders ? data.todaysOrders : 0}
          </span>
          <Icon
            icon="heroicons:arrow-trending-up"
            className={`w-5 h-5 text-warning dark:text-primary-foreground`}
          />
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col gap-1.5 p-4 rounded-sm overflow-hidden   items-start relative before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-1 before:h-[2px] before:w-9 before:bg-primary/50 dark:before:bg-primary-foreground before:hidden bg-green-50 dark:bg-green-500"
        )}
      >
        <span
          className={cn(
            "h-[95px] w-[95px] rounded-full absolute -top-8 -right-8 ring-[20px]  bg-green-200 ring-green-100 dark:bg-green-300 dark:ring-green-400"
          )}
        ></span>
        <div
          className={`w-8 h-8 grid place-content-center rounded-full border border-dashed border-success dark:border-warning-foreground/60`}
        >
          <span
            className={cn(
              `h-6 w-6 rounded-full grid place-content-center bg-success dark:bg-[#ECFDF4]/30`
            )}
          >
            <CheckShape className="w-3.5 h-3.5" />
          </span>
        </div>
        <span className="mt-3 text-sm text-default-800 dark:text-primary-foreground font-medium capitalize relative z-10">
          Completed Orders
        </span>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold text-default-900  dark:text-primary-foreground">
            {data.completedOrders ? data.completedOrders : 0}
          </span>
          <Icon
            icon="heroicons:arrow-trending-up"
            className={`w-5 h-5 text-success dark:text-primary-foreground`}
          />
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col gap-1.5 p-4 rounded-sm overflow-hidden   items-start relative before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-1 before:h-[2px] before:w-9 before:bg-primary/50 dark:before:bg-primary-foreground before:hidden bg-red-50 dark:bg-red-500 "
        )}
      >
        <span
          className={cn(
            "h-[95px] w-[95px] rounded-full absolute -top-8 -right-8 ring-[20px]  bg-red-200 ring-red-100 dark:bg-red-300 dark:ring-red-400"
          )}
        ></span>
        <div
          className={`w-8 h-8 grid place-content-center rounded-full border border-dashed border-success dark:border-warning-foreground/60`}
        >
          <span
            className={cn(
              `h-6 w-6 rounded-full grid place-content-center bg-destructive dark:bg-[#FEF2F2]/30`
            )}
          >
            <Spam className="w-3.5 h-3.5" />
          </span>
        </div>
        <span className="mt-3 text-sm text-default-800 dark:text-primary-foreground font-medium capitalize relative z-10">
          Pending Orders
        </span>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold text-default-900  dark:text-primary-foreground">
            {data.pendingOrders ? data.pendingOrders : 0}
          </span>
          <Icon
            icon="heroicons:arrow-trending-up"
            className={`w-5 h-5 text-destructive dark:text-primary-foreground`}
          />
        </div>
      </div>
    </>
  );
};

export default EcommerceStats;
