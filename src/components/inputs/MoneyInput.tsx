"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { parseAmount, formatAmountInput } from '@/lib/calc'
import { cn } from '@/lib/utils'

interface MoneyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
  error?: string
}

export function MoneyInput({
  value,
  onChange,
  placeholder = "请输入金额",
  className,
  disabled = false,
  label,
  error
}: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // 同步外部value到显示值
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatAmountInput(value) : '')
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)
    
    // 实时解析并更新数值
    const numericValue = parseAmount(inputValue)
    onChange(numericValue)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const numericValue = parseAmount(pastedText)
    
    if (numericValue > 0) {
      setDisplayValue(formatAmountInput(numericValue))
      onChange(numericValue)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    // 失焦时格式化显示
    if (value > 0) {
      setDisplayValue(formatAmountInput(value))
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
    
    // 允许中文数字单位
    if (['万', '千'].includes(e.key)) {
      return
    }
    
    // 阻止其他输入
    e.preventDefault()
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
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "money-input pr-8",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500 text-sm">元</span>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {value > 0 && (
        <p className="text-xs text-gray-500">
          约 {(value / 10000).toFixed(1)} 万元
        </p>
      )}
    </div>
  )
}