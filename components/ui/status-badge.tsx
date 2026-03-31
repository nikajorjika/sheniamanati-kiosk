import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * StatusBadge — maps domain status strings to semantic colors.
 *
 * PickupRequest statuses: "pending" | "received" | "rejected"
 * Package statuses:       "arrived" | "received"
 */
const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap",
  {
    variants: {
      status: {
        // PickupRequest
        // Ghost rings per spec (outline_variant/15 fallback, not solid borders)
        pending:  "bg-primary/10 text-primary ring-1 ring-primary/20",
        received: "bg-success/10 text-success ring-1 ring-success/20",
        rejected: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
        arrived:  "bg-primary/10 text-primary ring-1 ring-primary/20",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
)

type StatusValue = "pending" | "received" | "rejected" | "arrived"

interface StatusBadgeProps
  extends Omit<React.ComponentProps<"span">, "children">,
    VariantProps<typeof statusBadgeVariants> {
  status: StatusValue
  /** Override the display label. Defaults to a Georgian label for the status. */
  label?: string
}

const STATUS_LABELS: Record<StatusValue, string> = {
  pending:  "მოლოდინში",
  received: "გაცემულია",
  rejected: "უარყოფილია",
  arrived:  "მოვიდა",
}

function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      data-status={status}
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {label ?? STATUS_LABELS[status]}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants, type StatusValue }
