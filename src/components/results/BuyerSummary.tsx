"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BuyerResult } from '@/lib/types'
import { formatCurrency } from '@/lib/calc'
import { ShoppingCart, Receipt, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BuyerSummaryProps {
  result: BuyerResult
  salePrice: number
  className?: string
}

export function BuyerSummary({ result, salePrice, className }: BuyerSummaryProps) {
  const totalCostRate = salePrice > 0 ? (result.buyerTotal / salePrice) * 100 : 0
  const taxRate = salePrice > 0 ? (result.deedTax / salePrice) * 100 : 0

  return (
    <Card className={cn("result-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-green-600" />
          买方成本测算
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 核心指标 */}
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-600">购房总成本</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(result.buyerTotal)}
          </div>
          <p className="text-xs text-gray-500">
            包含成交价、税费及相关费用
          </p>
        </div>

        {/* 成本分解 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            成本分解
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">成交价</span>
              <span className="font-medium">{formatCurrency(salePrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">契税</span>
              <span className="font-medium text-orange-600">
                +{formatCurrency(result.deedTax)}
              </span>
            </div>

            {result.buyerAgentFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">中介费</span>
                <span className="font-medium text-orange-600">
                  +{formatCurrency(result.buyerAgentFee)}
                </span>
              </div>
            )}

            <div className="border-t pt-2 flex justify-between font-medium">
              <span>总成本</span>
              <span className="text-blue-600">
                {formatCurrency(result.buyerTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* 成本结构图 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">成本结构</h4>
          
          <div className="space-y-2">
            {/* 成交价占比 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">成交价</span>
              <span>{((salePrice / result.buyerTotal) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(salePrice / result.buyerTotal) * 100}%` }}
              />
            </div>

            {/* 契税占比 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">契税</span>
              <span>{((result.deedTax / result.buyerTotal) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${(result.deedTax / result.buyerTotal) * 100}%` }}
              />
            </div>

            {/* 中介费占比 */}
            {result.buyerAgentFee > 0 && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">中介费</span>
                  <span>{((result.buyerAgentFee / result.buyerTotal) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(result.buyerAgentFee / result.buyerTotal) * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 税负分析 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">契税负担</span>
            <span className="text-sm text-gray-600">{taxRate.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(taxRate * 10, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            契税占成交价比例
          </p>
        </div>

        {/* 贷款提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">贷款提醒</p>
              <p className="mt-1 text-blue-700">
                如需贷款，还需考虑首付比例、贷款利率、月供等因素
              </p>
            </div>
          </div>
        </div>

        {/* 费用说明 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 契税：根据房屋面积、套数等确定税率</p>
          <p>• 中介费：通常为成交价的1-2%</p>
          <p>• 不含：评估费、贷款手续费、装修等其他费用</p>
        </div>
      </CardContent>
    </Card>
  )
}