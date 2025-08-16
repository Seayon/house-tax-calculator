"use client"

import React from 'react'
import { CityPolicy } from '@/lib/types'
import { CITIES } from '@/data/cities'
import { cn } from '@/lib/utils'

interface CitySelectProps {
  value: CityPolicy
  onChange: (city: CityPolicy) => void
  className?: string
  disabled?: boolean
  label?: string
}

export function CitySelect({
  value,
  onChange,
  className,
  disabled = false,
  label = "选择城市"
}: CitySelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        value={value.name}
        onChange={(e) => {
          const selectedCity = CITIES.find(city => city.name === e.target.value)
          if (selectedCity) {
            onChange(selectedCity)
          }
        }}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {CITIES.map((city) => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
      <div className="text-xs text-gray-500 space-y-1">
        <p>增值税附加税: {(value.surchargeOnVAT * 100).toFixed(1)}%</p>
        <p>常用个税方式: {value.pitDefault === 'assessed1' ? '核定1%' : value.pitDefault === 'diff20' ? '差额20%' : '免征'}</p>
      </div>
    </div>
  )
}