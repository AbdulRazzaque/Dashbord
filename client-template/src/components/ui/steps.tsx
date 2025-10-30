import React from "react";
import { cn } from "@/lib/utils";

interface StepProps {
  title: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export const Step: React.FC<StepProps> = ({ title, isActive, isCompleted }) => {
  return (
    <div
      className={cn(
        "flex items-center",
        isActive && "font-bold",
        isCompleted && "text-green-500"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center mr-2",
          isActive && "bg-primary text-primary-foreground",
          isCompleted && "bg-green-500 text-white",
          !isActive && !isCompleted && "bg-muted"
        )}
      >
        {isCompleted ? "✓" : ""}
      </div>
      <span>{title}</span>
    </div>
  );
};

interface StepsProps {
  activeStep: number;
  className?: string;
}

export const Steps: React.FC<
  StepsProps & React.HTMLAttributes<HTMLDivElement>
> = ({ activeStep, className, children, ...props }) => {
  return (
    <div className={cn("flex justify-between", className)} {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<StepProps>(child)) {
          return React.cloneElement(child, {
            isActive: index === activeStep,
            isCompleted: index < activeStep,
          });
        }
        return child;
      })}
    </div>
  );
};
