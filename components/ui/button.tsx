import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Spec: gradient fill 135° primary → primary-container, no flat bg
        default:
          "bg-primary-gradient text-primary-foreground shadow-sm hover:brightness-110 active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20",
        // Spec: surface_variant bg, no border (secondary button)
        outline:
          "bg-surface-container-lowest shadow-xs hover:bg-surface-container hover:text-on-surface",
        secondary:
          "bg-surface-container text-secondary-foreground hover:bg-surface-container-high",
        ghost:
          "hover:bg-surface-container hover:text-on-surface",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        // Kiosk touch sizes — spec min 72dp, title-lg (1.375rem) text
        kiosk: "h-[72px] rounded-2xl px-8 text-[1.375rem] font-bold has-[>svg]:px-6 [&_svg:not([class*='size-'])]:size-6",
        "kiosk-sm": "h-14 rounded-xl px-6 text-lg font-semibold has-[>svg]:px-4 [&_svg:not([class*='size-'])]:size-5",
        "icon-kiosk": "size-[72px] rounded-2xl [&_svg:not([class*='size-'])]:size-7",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
