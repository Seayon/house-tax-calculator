"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PercentInputProps {
  value: number // 0.01 表示 1%
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
  error?: string
  min?: number
  max?: number
  step?: number
}

export function PercentInput({
  value,
  onChange,
  placeholder = "请输入百分比",
  className,
  disabled = false,
  label,
  error,
  min = 0,
  max = 100,
  step = 0.1
}: PercentInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // 将小数转换为百分比显示
  const toPercent = (decimal: number): string => {
    return (decimal * 100).toFixed(2).replace(/\.?0+$/, '')
  }

  // 将百分比转换为小数
  const toDecimal = (percent: string): number => {
    const num = parseFloat(percent)
    return isNaN(num) ? 0 : num / 100
  }

  // 同步外部value到显示值
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? toPercent(value) : '')
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)
    
    // 实时解析并更新数值
    const decimalValue = toDecimal(inputValue)
    
    // 应用最小最大值限制
    const clampedValue = Math.max(min / 100, Math.min(max / 100, decimalValue))
    onChange(clampedValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    // 失焦时格式化显示
    if (value > 0) {
      setDisplayValue(toPercent(value))
    } else {
      setDisplayValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 允许数字、小数点、删除键、方向键等
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ]
    
    if (allowedKeys.includes(e.key)) {
      return
    }
    
    // 允许数字
    if (e.key >= '0' && e.key <= '9') {
      return
    }
    
    // 允许小数点（但只能有一个）
    if (e.key === '.' && !displayValue.includes('.')) {
      return
    }
    
    // 阻止其他输入
    e.preventDefault()
  }

  const handleIncrement = () => {
    const newValue = Math.min(max / 100, value + step / 100)
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(min / 100, value - step / 100)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-16",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || value >= max / 100}
              className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || value <= min / 100}
              className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              ▼
            </button>
          </div>
          <span className="text-gray-500 text-sm pr-3">%</span>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {value > 0 && (
        <p className="text-xs text-gray-500">
          小数值: {value.toFixed(4)}
        </p>
      )}
    </div>
  )
}