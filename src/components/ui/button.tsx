import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    const sizeClass = size === "sm" ? "btn-sm" : "btn-md";
    const variantClass =
      variant === "primary" ? "btn-primary" :
      variant === "ghost"   ? "btn-ghost"   :
                              "";

    return (
      <button
        ref={ref}
        className={`btn ${sizeClass} ${variantClass} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
