import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBrand, deleteslider } from "@/lib/http/api";
import { AxiosError } from "axios";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

interface Props {
  id: string;
  //   name: string;
}

const DeleteSlider = ({ id }: Props) => {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["deleteslider"],
    mutationFn: async () => {
      return await deleteslider(id);
    },
    onSuccess: () => {
      setOpen(false);
      toast.success(`Slider has been successfully deleted.`);
      return queryClient.invalidateQueries({ queryKey: ["getSliders"] });
    },
    onError(error, variables, context) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.errors[0].msg);
      } else {
        toast.error("Something went wrong!");
      }
    },
  });

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className=" h-7 w-7"
            color="secondary"
          >
            <Icon icon="heroicons:trash" className=" h-4 w-4  " />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              Slider.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen(false)}
              className=" bg-secondary"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                mutate();
              }}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/80"
            >
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteSlider;
