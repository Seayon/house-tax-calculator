"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SellerResult, BuyerResult, SellerInput, BuyerInput } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/calc'
import { ChevronDown, ChevronUp, Calculator, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreakdownProps {
  sellerInput: SellerInput
  sellerResult: SellerResult
  buyerInput: BuyerInput
  buyerResult: BuyerResult
  className?: string
}

export function Breakdown({
  sellerInput,
  sellerResult,
  buyerInput,
  buyerResult,
  className
}: BreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const vatBase = sellerInput.isOverTwoYears ? 0 : sellerInput.salePrice / (1 + sellerInput.vatRate)

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-gray-600" />
            计算明细
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                收起 <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                展开 <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* 卖方计算明细 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">卖方税费计算</h3>
            
            {/* 增值税计算 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <Info className="h-4 w-4" />
                增值税及附加税
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">房龄满2年</span>
                    <span className={sellerInput.isOverTwoYears ? "text-green-600" : "text-red-600"}>
                      {sellerInput.isOverTwoYears ? "是" : "否"}
                    </span>
                  </div>
                  {!sellerInput.isOverTwoYears && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">增值税税率</span>
                        <span>{formatPercent(sellerInput.vatRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">含税成交价</span>
                        <span>{formatCurrency(sellerInput.salePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">不含税价格</span>
                        <span>{formatCurrency(vatBase)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">增值税</span>
                        <span className="text-red-600">{formatCurrency(sellerResult.vat)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">附加税系数</span>
                        <span>{formatPercent(sellerInput.surchargeOnVAT)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">附加税</span>
                        <span className="text-red-600">{formatCurrency(sellerResult.vatSurcharge)}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>增值税合计</span>
                    <span className={sellerResult.vatTotal > 0 ? "text-red-600" : "text-green-600"}>
                      {sellerResult.vatTotal > 0 ? formatCurrency(sellerResult.vatTotal) : "免征"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 个人所得税计算 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <Info className="h-4 w-4" />
                个人所得税
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">房龄满5年</span>
                    <span className={sellerInput.isOverFiveYears ? "text-green-600" : "text-red-600"}>
                      {sellerInput.isOverFiveYears ? "是" : "否"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">家庭唯一住房</span>
                    <span className={sellerInput.onlyHome ? "text-green-600" : "text-red-600"}>
                      {sellerInput.onlyHome ? "是" : "否"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">申报方式</span>
                    <span>
                      {sellerInput.pitMode === 'exempt' && "免征"}
                      {sellerInput.pitMode === 'assessed1' && "核定1%"}
                      {sellerInput.pitMode === 'diff20' && "差额20%"}
                    </span>
                  </div>
                  {sellerInput.pitMode === 'diff20' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">成交价</span>
                        <span>{formatCurrency(sellerInput.salePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">原购房价</span>
                        <span>-{formatCurrency(sellerInput.originalPurchasePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">原契税</span>
                        <span>-{formatCurrency(sellerResult.originalDeedTax)}</span>
                      </div>
                      {sellerInput.allowedDeductibles > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">可扣除成本</span>
                          <span>-{formatCurrency(sellerInput.allowedDeductibles)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">应税差额</span>
                        <span>{formatCurrency(Math.max(0, sellerInput.salePrice - sellerInput.originalPurchasePrice - sellerResult.originalDeedTax - sellerInput.allowedDeductibles))}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>个人所得税</span>
                    <span className={sellerResult.pit > 0 ? "text-red-600" : "text-green-600"}>
                      {sellerResult.pit > 0 ? formatCurrency(sellerResult.pit) : "免征"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 其他费用 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-800">其他费用</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">中介费率</span>
                    <span>{formatPercent(sellerInput.sellerAgentRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">中介费</span>
                    <span className="text-red-600">{formatCurrency(sellerResult.sellerAgentFee)}</span>
                  </div>
                  {sellerInput.remainingLoan > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">贷款余额</span>
                        <span>{formatCurrency(sellerInput.remainingLoan)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">过桥费率</span>
                        <span>{formatPercent(sellerInput.bridgeMonthlyRate)}/月</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">使用月数</span>
                        <span>{sellerInput.bridgeMonths}个月</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">过桥费</span>
                        <span className="text-red-600">{formatCurrency(sellerResult.bridgeFee)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 买方计算明细 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">买方费用计算</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-800">契税及费用</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">成交价</span>
                    <span>{formatCurrency(buyerInput.salePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">契税税率</span>
                    <span>{formatPercent(buyerInput.deedTaxRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">契税</span>
                    <span className="text-red-600">{formatCurrency(buyerResult.deedTax)}</span>
                  </div>
                  {buyerInput.buyerAgentRate > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">中介费率</span>
                        <span>{formatPercent(buyerInput.buyerAgentRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">中介费</span>
                        <span className="text-red-600">{formatCurrency(buyerResult.buyerAgentFee)}</span>
                      </div>
                    </>
                  )}
                  {buyerInput.buyerLoanFees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">贷款费用</span>
                      <span className="text-red-600">{formatCurrency(buyerInput.buyerLoanFees)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>总成本</span>
                    <span className="text-blue-600">{formatCurrency(buyerResult.buyerTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 计算公式说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">计算公式说明</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• 增值税 = 不含税价格 × 增值税税率，不含税价格 = 含税成交价 ÷ (1 + 增值税税率)</p>
              <p>• 附加税 = 增值税 × 附加税系数（通常12%，部分城市减半至6%）</p>
              <p>• 个税核定 = 成交价 × 1%</p>
              <p>• 个税差额 = (成交价 - 原价 - 原契税 - 可扣除成本 - 已还贷款利息) × 20%</p>
              <p>• 契税 = 成交价 × 契税税率</p>
              <p>• 过桥费 = 贷款余额 × 月费率 × 使用月数</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}