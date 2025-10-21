import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputId = id || `floating-input-${label.replace(/\s+/g, '-').toLowerCase()}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    React.useEffect(() => {
      setHasValue(!!props.value || !!props.defaultValue);
    }, [props.value, props.defaultValue]);

    const isFloating = isFocused || hasValue || !!props.value;

    return (
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "peer flex h-12 w-full rounded-md border bg-white px-3 py-3 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            isFocused ? "border-primary ring-2 ring-primary/20" : "border-input",
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
          placeholder=" "
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-3 text-sm transition-all pointer-events-none duration-200 ease-out",
            isFloating
              ? "-top-2.5 text-xs px-1 bg-white text-primary"
              : "top-3 text-muted-foreground"
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)

FloatingInput.displayName = "FloatingInput"

export { FloatingInput }
