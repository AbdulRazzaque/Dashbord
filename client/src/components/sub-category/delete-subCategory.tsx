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
import { AxiosError } from "axios";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

interface Props {
  id: string;
  name: string;
}

const DeleteSubCategory = ({ id, name }: Props) => {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();


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
              category &quot;{name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen(false)}
              className=" bg-secondary"
            >
              Cancel
            </AlertDialogCancel>
           
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteSubCategory;
