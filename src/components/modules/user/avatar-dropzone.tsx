"use client";

import { ImageUp, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUploadAvatar } from "@/hooks";
import { cn } from "@/lib/utils";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

interface AvatarDropzoneProps {
  avatarUrl: string | null;
  name: string;
  onUploaded?: () => void;
  className?: string;
}

/**
 * Drag-and-drop avatar upload. Validation happens client-side so a bad file
 * never reaches the gateway, and the preview comes from the server URL that
 * comes back after a successful upload.
 */
export function AvatarDropzone({
  avatarUrl,
  name,
  onUploaded,
  className,
}: AvatarDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const uploadAvatar = useUploadAvatar();

  const upload = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.add({
        title: "Unsupported file type",
        description: "Please upload a PNG, JPG or WebP image.",
        type: "error",
      });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.add({
        title: "Image too large",
        description: "Avatars must be 2 MB or smaller.",
        type: "error",
      });
      return;
    }

    setPreview(URL.createObjectURL(file));
    uploadAvatar.mutate(file, {
      onSuccess: () => {
        setPreview(null);
        onUploaded?.();
        toast.add({
          title: "Photo updated",
          description: "Your new avatar is live.",
          type: "success",
        });
      },
      onError: (error) => {
        setPreview(null);
        toast.add({
          title: "Upload failed",
          description: error.message ?? "Please try a different image.",
          type: "error",
        });
      },
    });
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Avatar className="size-16 border border-border">
        {preview ? (
          <AvatarImage src={preview} alt="Selected avatar preview" />
        ) : (
          <AvatarImage src={avatarUrl || undefined} alt={name} />
        )}
        <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-3 text-center text-xs transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted",
          )}
        >
          <ImageUp className="size-4 text-muted-foreground" />
          <span className="font-medium text-foreground">
            Drop an image or click to browse
          </span>
          <span className="text-muted-foreground">
            PNG, JPG or WebP · max 2 MB
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            event.target.value = "";
          }}
        />

        {uploadAvatar.isPending && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Spinner className="size-3" />
            Uploading your photo...
          </p>
        )}
      </div>
    </div>
  );
}

interface AvatarRemoveButtonProps {
  onRemove: () => void;
  disabled?: boolean;
}

/** Small companion used where an avatar can be cleared (admin/profile edges). */
export function AvatarRemoveButton({
  onRemove,
  disabled,
}: AvatarRemoveButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={onRemove}
      className="gap-1.5 text-destructive"
    >
      <Trash2 className="size-4" />
      Remove photo
    </Button>
  );
}
