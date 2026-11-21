import { Text, clx } from "@medusajs/ui"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import React from "react"

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
}

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>)

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, ...props }) => {
  return (
    /* x@ts-expect-error */
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  )
}

const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  triggerable,
  ...props
}) => {
  return (
    /* x@ts-expect-error */
    <AccordionPrimitive.Item
      {...props}
      className={clx(
        "border-[var(--surface-border)] group border-t last:mb-0 last:border-b",
        "py-3",
        className
      )}
    >
      {/* x@ts-expect-error */}
      <AccordionPrimitive.Header className="px-1">
        <div className="flex flex-col">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <Text className="text-[var(--text-primary)] text-sm font-semibold">{title}</Text>
            </div>
            {/* x@ts-expect-error */}
            <AccordionPrimitive.Trigger>
              {customTrigger || <MorphingTrigger />}
            </AccordionPrimitive.Trigger>
          </div>
          {subtitle && (
            <Text as="span" size="small" className="mt-1 text-[var(--text-secondary)]">
              {subtitle}
            </Text>
          )}
        </div>
      </AccordionPrimitive.Header>
      {/* x@ts-expect-error */}
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={clx(
          "data-[state=closed]:animate-accordion-close data-[state=open]:animate-accordion-open radix-state-closed:animate-accordion-close radix-state-open:animate-accordion-open overflow-hidden px-1"
        )}
      >
        <div className="text-[var(--text-secondary)]">
          {description && <Text className="mb-2 text-[var(--text-secondary)]">{description}</Text>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

Accordion.Item = Item

const MorphingTrigger = () => {
  return (
    <div className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full transition-colors">
      <svg
        className="w-4 h-4 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180 group-radix-state-open:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

export default Accordion
