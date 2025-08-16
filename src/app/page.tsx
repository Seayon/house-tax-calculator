"use client"

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoneyInput } from '@/components/inputs/MoneyInput'
import { PercentInput } from '@/components/inputs/PercentInput'
import { SwitchField } from '@/components/inputs/SwitchField'
import { CitySelect } from '@/components/inputs/CitySelect'
import { PitModeSelector } from '@/components/inputs/PitModeSelector'
import { SellerSummary } from '@/components/results/SellerSummary'
import { BuyerSummary } from '@/components/results/BuyerSummary'
import { Breakdown } from '@/components/results/Breakdown'
import { SellerInput, BuyerInput, CityPolicy, PitMode } from '@/lib/types'
import { calcSeller, calcBuyer, validateSellerInput, validateBuyerInput } from '@/lib/calc'
import { DEFAULT_CITY } from '@/data/cities'
import { generatePDF, ExportData } from '@/lib/pdf-export'
import { Download, RefreshCw, Loader2, Edit3 } from 'lucide-react'

export default function HomePage() {
  // 城市配置
  const [selectedCity, setSelectedCity] = useState<CityPolicy>(DEFAULT_CITY)
  const [surchargeDiscount, setSurchargeDiscount] = useState(false)
  
  // 导出状态
  const [isExporting, setIsExporting] = useState(false)

  // 卖方输入
  const [sellerInput, setSellerInput] = useState<SellerInput>({
    salePrice: 3000000,
    originalPurchasePrice: 2000000,
    originalDeedTaxRate: 0.015,
    isOverTwoYears: true,
    isOverFiveYears: false,
    onlyHome: false,
    vatRate: 0.053,
    surchargeOnVAT: 0.12,
    sellerAgentRate: 0.01,
    remainingLoan: 800000,
    bridgeMonthlyRate: 0.008,
    bridgeMonths: 1,
    pitMode: 'assessed1' as PitMode,
    allowedDeductibles: 0,
    paidLoanInterest: 0,
    otherSellerFees: 80,
    vatRateEditable: false
  })

  // 买方输入
  const [buyerInput, setBuyerInput] = useState<BuyerInput>({
    salePrice: 3000000,
    deedTaxRate: 0.01,
    buyerAgentRate: 0.01,
    buyerLoanFees: 0
  })

  // 验证错误
  const [sellerErrors, setSellerErrors] = useState<string[]>([])
  const [buyerErrors, setBuyerErrors] = useState<string[]>([])

  // 同步城市配置
  useEffect(() => {
    const effectiveSurcharge = surchargeDiscount ? selectedCity.surchargeOnVAT / 2 : selectedCity.surchargeOnVAT
    setSellerInput(prev => ({
      ...prev,
      vatRate: selectedCity.vatRate,
      surchargeOnVAT: effectiveSurcharge,
      pitMode: selectedCity.pitDefault
    }))
  }, [selectedCity, surchargeDiscount])

  // 同步成交价
  useEffect(() => {
    setBuyerInput(prev => ({
      ...prev,
      salePrice: sellerInput.salePrice
    }))
  }, [sellerInput.salePrice])

  // 计算结果
  const sellerResult = calcSeller(sellerInput)
  const buyerResult = calcBuyer(buyerInput)

  // 验证输入
  useEffect(() => {
    setSellerErrors(validateSellerInput(sellerInput))
  }, [sellerInput])

  useEffect(() => {
    setBuyerErrors(validateBuyerInput(buyerInput))
  }, [buyerInput])

  // 重置表单
  const handleReset = () => {
    setSellerInput({
      salePrice: 0,
      originalPurchasePrice: 0,
      originalDeedTaxRate: 0.015,
      isOverTwoYears: true,
      isOverFiveYears: false,
      onlyHome: false,
      vatRate: selectedCity.vatRate,
      surchargeOnVAT: selectedCity.surchargeOnVAT,
      sellerAgentRate: 0.01,
      remainingLoan: 0,
      bridgeMonthlyRate: 0.008,
      bridgeMonths: 1,
      pitMode: selectedCity.pitDefault,
      allowedDeductibles: 0,
      paidLoanInterest: 0,
      otherSellerFees: 80,
      vatRateEditable: false
    })
    setBuyerInput({
      salePrice: 0,
      deedTaxRate: 0.01,
      buyerAgentRate: 0.01,
      buyerLoanFees: 0
    })
  }

  // 导出PDF
  const handleExportPDF = async () => {
    if (sellerErrors.length > 0 || buyerErrors.length > 0) {
      alert('请先修正输入错误')
      return
    }

    if (sellerInput.salePrice === 0) {
      alert('请输入成交价')
      return
    }

    setIsExporting(true)
    try {
      const exportData: ExportData = {
        sellerInput,
        buyerInput,
        sellerResult,
        buyerResult,
        city: selectedCity,
        timestamp: new Date().toLocaleString('zh-CN')
      }
      
      await generatePDF(exportData)
    } catch (error) {
      console.error('PDF导出失败:', error)
      alert('PDF导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const isExempt = sellerInput.isOverFiveYears && sellerInput.onlyHome

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左侧：输入面板 */}
      <div className="space-y-6">
        {/* 城市配置 */}
        <Card>
          <CardHeader>
            <CardTitle>政策配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CitySelect
              value={selectedCity}
              onChange={setSelectedCity}
            />
            <SwitchField
              checked={surchargeDiscount}
              onCheckedChange={setSurchargeDiscount}
              label="附加税减半优惠"
              description="部分城市阶段性将附加税减半征收"
            />
          </CardContent>
        </Card>

        {/* 输入表单 */}
        <Tabs defaultValue="seller" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seller">卖方信息</TabsTrigger>
            <TabsTrigger value="buyer">买方信息</TabsTrigger>
          </TabsList>

          {/* 卖方输入 */}
          <TabsContent value="seller" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>房屋基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MoneyInput
                  label="成交价"
                  value={sellerInput.salePrice}
                  onChange={(value) => setSellerInput(prev => ({ ...prev, salePrice: value }))}
                  placeholder="请输入成交价"
                />
                
                <MoneyInput
                  label="原购房总价"
                  value={sellerInput.originalPurchasePrice}
                  onChange={(value) => setSellerInput(prev => ({ ...prev, originalPurchasePrice: value }))}
                  placeholder="请输入原购房总价"
                />

                <PercentInput
                  label="原购房契税税率"
                  value={sellerInput.originalDeedTaxRate}
                  onChange={(value) => setSellerInput(prev => ({ ...prev, originalDeedTaxRate: value }))}
                  max={5}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwitchField
                    checked={sellerInput.isOverTwoYears}
                    onCheckedChange={(checked) => setSellerInput(prev => ({ ...prev, isOverTwoYears: checked }))}
                    label="房龄满2年"
                    description="满2年免征增值税"
                  />
                  
                  <SwitchField
                    checked={sellerInput.isOverFiveYears}
                    onCheckedChange={(checked) => setSellerInput(prev => ({ ...prev, isOverFiveYears: checked }))}
                    label="房龄满5年"
                    description="满5年且唯一可免个税"
                  />
                </div>

                <SwitchField
                  checked={sellerInput.onlyHome}
                  onCheckedChange={(checked) => setSellerInput(prev => ({ ...prev, onlyHome: checked }))}
                  label="家庭唯一住房"
                  description="与满5年同时满足可免个税"
                />

                {/* 增值税税率编辑 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">增值税税率</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSellerInput(prev => ({ ...prev, vatRateEditable: !prev.vatRateEditable }))}
                      className="h-6 px-2"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                  {sellerInput.vatRateEditable ? (
                    <PercentInput
                      value={sellerInput.vatRate}
                      onChange={(value) => setSellerInput(prev => ({ ...prev, vatRate: value }))}
                      max={10}
                      placeholder="请输入增值税税率"
                    />
                  ) : (
                    <div className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm">
                      {(sellerInput.vatRate * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>个人所得税</CardTitle>
              </CardHeader>
              <CardContent>
                <PitModeSelector
                  value={sellerInput.pitMode}
                  onChange={(mode) => setSellerInput(prev => ({ ...prev, pitMode: mode }))}
                  isExempt={isExempt}
                />
                
                {sellerInput.pitMode === 'diff20' && (
                  <div className="mt-4 space-y-4">
                    <MoneyInput
                      label="可扣除成本"
                      value={sellerInput.allowedDeductibles}
                      onChange={(value) => setSellerInput(prev => ({ ...prev, allowedDeductibles: value }))}
                      placeholder="装修费、评估费等"
                    />
                    <MoneyInput
                      label="已还贷款利息"
                      value={sellerInput.paidLoanInterest}
                      onChange={(value) => setSellerInput(prev => ({ ...prev, paidLoanInterest: value }))}
                      placeholder="历史已还的贷款利息总额"
                    />
                    <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                      <p>差额20%计算公式：(成交价 - 原购房价 - 原契税 - 可扣除成本 - 已还贷款利息) × 20%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>费用设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PercentInput
                  label="卖方中介费率"
                  value={sellerInput.sellerAgentRate}
                  onChange={(value) => setSellerInput(prev => ({ ...prev, sellerAgentRate: value }))}
                  max={5}
                />

                <MoneyInput
                  label="贷款剩余金额"
                  value={sellerInput.remainingLoan}
                  onChange={(value) => setSellerInput(prev => ({ ...prev, remainingLoan: value }))}
                  placeholder="需要提前还清的贷款金额"
                />

                {sellerInput.remainingLoan > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <PercentInput
                      label="过桥费月费率"
                      value={sellerInput.bridgeMonthlyRate}
                      onChange={(value) => setSellerInput(prev => ({ ...prev, bridgeMonthlyRate: value }))}
                      max={5}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">使用月数</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.1"
                        value={sellerInput.bridgeMonths}
                        onChange={(e) => setSellerInput(prev => ({ ...prev, bridgeMonths: parseFloat(e.target.value) || 0 }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                <MoneyInput
                  label="其他费用"
                  value={sellerInput.otherSellerFees}
                  onChange={(value) => setSellerInput(prev => ({ ...prev, otherSellerFees: value }))}
                  placeholder="登记费等固定费用"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 买方输入 */}
          <TabsContent value="buyer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>买方费用</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MoneyInput
                  label="成交价"
                  value={buyerInput.salePrice}
                  onChange={(value) => setBuyerInput(prev => ({ ...prev, salePrice: value }))}
                  placeholder="与卖方成交价一致"
                  disabled
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">契税档位</label>
                  <select
                    value={buyerInput.deedTaxRate}
                    onChange={(e) => setBuyerInput(prev => ({ ...prev, deedTaxRate: parseFloat(e.target.value) }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {selectedCity.deedTaxPresets.map((preset, index) => (
                      <option key={index} value={preset.rate}>
                        {preset.label} - {(preset.rate * 100).toFixed(1)}%
                      </option>
                    ))}
                  </select>
                </div>

                {buyerInput.deedTaxRate === 0 && (
                  <PercentInput
                    label="自定义契税税率"
                    value={buyerInput.deedTaxRate}
                    onChange={(value) => setBuyerInput(prev => ({ ...prev, deedTaxRate: value }))}
                    max={5}
                  />
                )}

                <PercentInput
                  label="买方中介费率"
                  value={buyerInput.buyerAgentRate}
                  onChange={(value) => setBuyerInput(prev => ({ ...prev, buyerAgentRate: value }))}
                  max={5}
                />

                <MoneyInput
                  label="贷款相关费用"
                  value={buyerInput.buyerLoanFees}
                  onChange={(value) => setBuyerInput(prev => ({ ...prev, buyerLoanFees: value }))}
                  placeholder="评估费、担保费等"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleExportPDF} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            导出PDF
          </Button>
        </div>

        {/* 错误提示 */}
        {(sellerErrors.length > 0 || buyerErrors.length > 0) && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-sm text-red-600 space-y-1">
                {sellerErrors.map((error, index) => (
                  <p key={`seller-${index}`}>• {error}</p>
                ))}
                {buyerErrors.map((error, index) => (
                  <p key={`buyer-${index}`}>• {error}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 右侧：结果展示 */}
      <div className="space-y-6">
        <SellerSummary
          result={sellerResult}
          salePrice={sellerInput.salePrice}
        />
        
        <BuyerSummary
          result={buyerResult}
          salePrice={buyerInput.salePrice}
        />

        <Breakdown
          sellerInput={sellerInput}
          sellerResult={sellerResult}
          buyerInput={buyerInput}
          buyerResult={buyerResult}
        />
      </div>
    </div>
  )
}