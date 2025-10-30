"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: File | string;
  onChange?: (file: File | null) => void;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  disabled,
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof value === "string") {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    disabled,
    maxFiles: 1,
    onDrop: (acceptedFiles: (File | null)[]) => {
      if (acceptedFiles?.[0]) {
        onChange?.(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors",
          isDragActive && "border-primary bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed",
          "cursor-pointer"
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative aspect-square w-full max-w-[200px] mx-auto overflow-hidden rounded-lg">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            {!disabled && (
              <Button
                type="button"
                variant="soft"
                color="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={(e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  onChange?.(null);
                  onRemove?.();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop an image here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP up to 2MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
