import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FloatingSelectProps {
  id?: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
  options?: { value: string; label: string }[];
}

const FloatingSelect = React.forwardRef<HTMLButtonElement, FloatingSelectProps>(
  ({ id, label, value, onValueChange, required, className, children, options, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const hasValue = value && value.length > 0;

    return (
      <div className={cn("relative", className)}>
        <Select 
          value={value} 
          onValueChange={onValueChange}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger
            ref={ref}
            id={id}
            className={cn(
              "h-10 pt-4 pb-1 peer"
            )}
            {...props}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {children}
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label
          htmlFor={id}
          className={cn(
            "absolute left-3 transition-all duration-200 pointer-events-none",
            "text-muted-foreground bg-background px-1",
            isOpen || hasValue
              ? "top-0 -translate-y-1/2 text-xs"
              : "top-1/2 -translate-y-1/2 text-sm"
          )}
        >
          {label}
          {required && " *"}
        </label>
      </div>
    );
  }
);

FloatingSelect.displayName = "FloatingSelect";

export { FloatingSelect };
