"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SellerResult } from '@/lib/types'
import { formatCurrency } from '@/lib/calc'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SellerSummaryProps {
  result: SellerResult
  salePrice: number
  className?: string
}

export function SellerSummary({ result, salePrice, className }: SellerSummaryProps) {
  const isProfit = result.netProfitBeforeLoan > 0
  const profitRate = salePrice > 0 ? (result.netProfitBeforeLoan / salePrice) * 100 : 0
  const taxRate = salePrice > 0 ? (result.sellerTaxesAndFees / salePrice) * 100 : 0

  return (
    <Card className={cn("result-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          卖方收益测算
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 核心指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">到手净额（含贷款）</span>
              {result.netCashAfterLoan < 0 && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className={cn(
              "text-2xl font-bold",
              result.netCashAfterLoan >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(result.netCashAfterLoan)}
            </div>
            <p className="text-xs text-gray-500">
              扣除贷款余额后的实际到手金额
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-gray-600">交易盈亏（不含贷款）</span>
            <div className={cn(
              "text-2xl font-bold flex items-center gap-2",
              isProfit ? "text-green-600" : "text-red-600"
            )}>
              {isProfit ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {formatCurrency(result.netProfitBeforeLoan)}
            </div>
            <p className="text-xs text-gray-500">
              收益率: {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* 详细分解 */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-gray-900">收益分解</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">成交价</span>
              <span className="font-medium">{formatCurrency(salePrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">历史差价</span>
              <span className={cn(
                "font-medium",
                result.difference >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {result.difference >= 0 ? '+' : ''}{formatCurrency(result.difference)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">税费合计</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(result.sellerTaxesAndFees)}
              </span>
            </div>

            <div className="text-xs text-gray-500 ml-4 space-y-1">
              {result.vatTotal > 0 && (
                <div className="flex justify-between">
                  <span>• 增值税及附加</span>
                  <span>-{formatCurrency(result.vatTotal)}</span>
                </div>
              )}
              {result.pit > 0 && (
                <div className="flex justify-between">
                  <span>• 个人所得税</span>
                  <span>-{formatCurrency(result.pit)}</span>
                </div>
              )}
              {result.sellerAgentFee > 0 && (
                <div className="flex justify-between">
                  <span>• 中介费</span>
                  <span>-{formatCurrency(result.sellerAgentFee)}</span>
                </div>
              )}
              {result.bridgeFee > 0 && (
                <div className="flex justify-between">
                  <span>• 过桥费</span>
                  <span>-{formatCurrency(result.bridgeFee)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-2 flex justify-between font-medium">
              <span>净收益（不含贷款）</span>
              <span className={cn(
                result.netProfitBeforeLoan >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {result.netProfitBeforeLoan >= 0 ? '+' : ''}{formatCurrency(result.netProfitBeforeLoan)}
              </span>
            </div>
          </div>
        </div>

        {/* 税负分析 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">税负分析</span>
            <span className="text-sm text-gray-600">{taxRate.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(taxRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            税费占成交价比例
          </p>
        </div>

        {/* 风险提示 */}
        {(result.netCashAfterLoan < 0 || taxRate > 10) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">注意事项</p>
                <ul className="mt-1 text-yellow-700 space-y-1">
                  {result.netCashAfterLoan < 0 && (
                    <li>• 到手净额为负，需要额外资金补足</li>
                  )}
                  {taxRate > 10 && (
                    <li>• 税负较重，建议核实政策优惠</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}