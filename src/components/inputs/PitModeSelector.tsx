"use client"

import React from 'react'
import { PitMode } from '@/lib/types'
import { PIT_MODE_DESCRIPTIONS } from '@/data/cities'
import { cn } from '@/lib/utils'

interface PitModeSelectorProps {
  value: PitMode
  onChange: (mode: PitMode) => void
  disabled?: boolean
  isExempt?: boolean // 是否满五唯一，自动免征
  className?: string
}

export function PitModeSelector({
  value,
  onChange,
  disabled = false,
  isExempt = false,
  className
}: PitModeSelectorProps) {
  const modes: { value: PitMode; label: string; description: string }[] = [
    {
      value: 'exempt',
      label: '免征',
      description: '满五唯一住房免征个人所得税'
    },
    {
      value: 'assessed1',
      label: '核定1%',
      description: '按成交价的1%核定征收'
    },
    {
      value: 'diff20',
      label: '差额20%',
      description: '按差额的20%征收（可扣除原价、契税、装修等）'
    }
  ]

  // 如果满五唯一，强制选择免征
  const effectiveValue = isExempt ? 'exempt' : value
  const effectiveDisabled = disabled || isExempt

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium text-gray-700">
        个人所得税申报方式
      </label>
      
      {isExempt && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            ✓ 满五唯一住房，个人所得税免征
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {modes.map((mode) => {
          const isSelected = effectiveValue === mode.value
          const isDisabledOption = effectiveDisabled && mode.value !== 'exempt'
          
          return (
            <div
              key={mode.value}
              className={cn(
                "relative flex cursor-pointer rounded-lg border p-4 transition-colors",
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-white hover:bg-gray-50",
                isDisabledOption && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                if (!isDisabledOption) {
                  onChange(mode.value)
                }
              }}
            >
              <div className="flex h-5 items-center">
                <input
                  type="radio"
                  name="pit-mode"
                  value={mode.value}
                  checked={isSelected}
                  onChange={() => {
                    if (!isDisabledOption) {
                      onChange(mode.value)
                    }
                  }}
                  disabled={isDisabledOption}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-blue-900" : "text-gray-900"
                  )}>
                    {mode.label}
                  </h3>
                  {mode.value === 'diff20' && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      需提供发票
                    </span>
                  )}
                </div>
                <p className={cn(
                  "mt-1 text-xs",
                  isSelected ? "text-blue-700" : "text-gray-500"
                )}>
                  {mode.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• 满五年且家庭唯一住房可免征个人所得税</p>
        <p>• 核定征收简单快捷，差额征收可能税负更低但需提供相关票据</p>
        <p>• 具体政策请咨询当地税务部门</p>
      </div>
    </div>
  )
}