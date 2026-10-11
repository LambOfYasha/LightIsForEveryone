import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ResponsiveButtonProps extends React.ComponentProps<typeof Button> {
  mobileText?: string
  desktopText?: string
  mobileIcon?: React.ReactNode
  desktopIcon?: React.ReactNode
  fullWidthOnMobile?: boolean
  compactOnMobile?: boolean
}

export function ResponsiveButton({
  children,
  mobileText,
  desktopText,
  mobileIcon,
  desktopIcon,
  fullWidthOnMobile = false,
  compactOnMobile = false,
  className,
  ...props
}: ResponsiveButtonProps) {
  const buttonContent = (
    <>
      {/* Mobile icon */}
      {mobileIcon && (
        <span className="sm:hidden">
          {mobileIcon}
        </span>
      )}
      
      {/* Desktop icon */}
      {desktopIcon && (
        <span className="hidden sm:inline">
          {desktopIcon}
        </span>
      )}
      
      {/* Mobile text */}
      {mobileText && (
        <span className="sm:hidden">
          {mobileText}
        </span>
      )}
      
      {/* Desktop text */}
      {desktopText && (
        <span className="hidden sm:inline">
          {desktopText}
        </span>
      )}
      
      {/* Default children */}
      {!mobileText && !desktopText && children}
    </>
  )

  return (
    <Button
      className={cn(
        fullWidthOnMobile && 'w-full sm:w-auto',
        compactOnMobile && 'px-2 py-1 text-sm sm:px-4 sm:py-2 sm:text-base',
        className
      )}
      {...props}
    >
      {buttonContent}
    </Button>
  )
}
