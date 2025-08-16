"use client"

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface SwitchFieldProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export function SwitchField({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className
}: SwitchFieldProps) {
  return (
    <div className={cn("flex items-center justify-between space-x-4", className)}>
      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}