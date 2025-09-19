"use client"

import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {MoneyInput} from '@/components/inputs/MoneyInput'
import {PercentInput} from '@/components/inputs/PercentInput'
import {SwitchField} from '@/components/inputs/SwitchField'
import {CitySelect} from '@/components/inputs/CitySelect'
import {PitModeSelector} from '@/components/inputs/PitModeSelector'
import {SellerSummary} from '@/components/results/SellerSummary'
import {BuyerSummary} from '@/components/results/BuyerSummary'
import {Breakdown} from '@/components/results/Breakdown'
import {BuyerInput, CityPolicy, PitMode, SellerInput} from '@/lib/types'
import {calcBuyer, calcSeller, formatCurrency, validateBuyerInput, validateSellerInput} from '@/lib/calc'
import {DEFAULT_CITY, getCityByName} from '@/data/cities'
import {ExportData, generatePDF} from '@/lib/pdf-export'
import {Download, Edit3, Loader2, RefreshCw} from 'lucide-react'

const LAST_STATE_STORAGE_KEY = 'house-tax:last-state'
const SAVED_RECORDS_STORAGE_KEY = 'house-tax:saved-records'

type SavedRecord = {
  id: string
  name: string
  createdAt: number
  cityName: string
  surchargeDiscount: boolean
  sellerInput: SellerInput
  buyerInput: BuyerInput
}

type PersistedState = {
  sellerInput?: SellerInput
  buyerInput?: BuyerInput
  cityName?: string
  surchargeDiscount?: boolean
  activeRecordId?: string
}

const ensureSellerInputDefaults = (input: SellerInput): SellerInput => ({
  ...input,
  vatGuidePrice: input.vatGuidePrice > 0 ? input.vatGuidePrice : input.salePrice,
  paidLoanInterest: input.paidLoanInterest !== undefined ? input.paidLoanInterest : 0
})

const ensureBuyerInputDefaults = (input: BuyerInput): BuyerInput => ({
  ...input,
  assessedPrice: input.assessedPrice > 0 ? input.assessedPrice : input.salePrice
})

export default function HomePage() {
  // 城市配置
  const [selectedCity, setSelectedCity] = useState<CityPolicy>(DEFAULT_CITY)
  const [surchargeDiscount, setSurchargeDiscount] = useState(false)

  // 导出状态
  const [isExporting, setIsExporting] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([])
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null)
  const skipInitialCitySync = useRef(true)


  // 卖方输入
  const [sellerInput, setSellerInput] = useState<SellerInput>({
    salePrice: 3000000,
    vatGuidePrice: 3000000,
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
    assessedPrice: 3000000,
    deedTaxRate: 0.01,
    buyerAgentRate: 0.01,
    buyerLoanFees: 0
  })

  // 验证错误
  const [sellerErrors, setSellerErrors] = useState<string[]>([])
  const [buyerErrors, setBuyerErrors] = useState<string[]>([])

  // 读取本地存储
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const storedState = localStorage.getItem(LAST_STATE_STORAGE_KEY)
      if (storedState) {
        const parsed: PersistedState = JSON.parse(storedState)
        if (typeof parsed.surchargeDiscount === 'boolean') {
          setSurchargeDiscount(parsed.surchargeDiscount)
        }
        if (parsed.cityName) {
          setSelectedCity(getCityByName(parsed.cityName))
        }
        if (parsed.sellerInput) {
          setSellerInput(prev => ensureSellerInputDefaults({ ...prev, ...parsed.sellerInput }))
        }
        if (parsed.buyerInput) {
          setBuyerInput(prev => ensureBuyerInputDefaults({ ...prev, ...parsed.buyerInput }))
        }
        if (parsed.activeRecordId) {
          setActiveRecordId(parsed.activeRecordId)
        }
      }
    } catch (error) {
      console.error('读取历史记录失败', error)
    }

    try {
      const storedRecords = localStorage.getItem(SAVED_RECORDS_STORAGE_KEY)
      if (storedRecords) {
        const parsedRecords: SavedRecord[] = (JSON.parse(storedRecords) as SavedRecord[]).map(record => ({
          ...record,
          sellerInput: ensureSellerInputDefaults(record.sellerInput),
          buyerInput: ensureBuyerInputDefaults(record.buyerInput)
        }))
        setSavedRecords(parsedRecords)
      }
    } catch (error) {
      console.error('读取保存列表失败', error)
    }

    setIsHydrated(true)
  }, [])

  // 持久化最近一次填写记录
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') {
      return
    }

    try {
      const payload: PersistedState = {
        sellerInput,
        buyerInput,
        cityName: selectedCity.name,
        surchargeDiscount,
        activeRecordId: activeRecordId || undefined
      }
      localStorage.setItem(LAST_STATE_STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.error('保存历史记录失败', error)
    }
  }, [sellerInput, buyerInput, selectedCity.name, surchargeDiscount, isHydrated])

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(SAVED_RECORDS_STORAGE_KEY, JSON.stringify(savedRecords))
    } catch (error) {
      console.error('保存历史列表失败', error)
    }
  }, [savedRecords, isHydrated])

  // 同步城市配置
  useEffect(() => {
    if (skipInitialCitySync.current) {
      skipInitialCitySync.current = false
      return
    }

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
    setBuyerInput(prev => {
      const nextSalePrice = sellerInput.salePrice
      const shouldSyncAssessedPrice = prev.assessedPrice === prev.salePrice
      return {
        ...prev,
        salePrice: nextSalePrice,
        assessedPrice: shouldSyncAssessedPrice ? nextSalePrice : prev.assessedPrice
      }
    })
  }, [sellerInput.salePrice])

  // 计算结果
  const sellerResult = calcSeller(sellerInput)
  const buyerResult = calcBuyer(buyerInput)

  const savedRecordSummaries = useMemo(() => {
    return savedRecords.map(record => ({
      record,
      sellerResult: calcSeller(record.sellerInput),
      buyerResult: calcBuyer(record.buyerInput)
    }))
  }, [savedRecords])

  useEffect(() => {
    if (!isHydrated || !activeRecordId) {
      return
    }

    const target = savedRecords.find(record => record.id === activeRecordId)
    if (!target) {
      setActiveRecordId(null)
      return
    }

    const currentSnapshot = JSON.stringify({
      sellerInput,
      buyerInput,
      cityName: selectedCity.name,
      surchargeDiscount
    })

    const recordSnapshot = JSON.stringify({
      sellerInput: target.sellerInput,
      buyerInput: target.buyerInput,
      cityName: target.cityName,
      surchargeDiscount: target.surchargeDiscount
    })

    if (currentSnapshot !== recordSnapshot) {
      setActiveRecordId(null)
    }
  }, [sellerInput, buyerInput, selectedCity.name, surchargeDiscount, activeRecordId, savedRecords, isHydrated])

  // 验证输入
  useEffect(() => {
    setSellerErrors(validateSellerInput(sellerInput))
  }, [sellerInput])

  useEffect(() => {
    setBuyerErrors(validateBuyerInput(buyerInput))
  }, [buyerInput])

  // 重置表单
  const handleReset = () => {
    setActiveRecordId(null)
    setSellerInput({
      salePrice: 0,
      vatGuidePrice: 0,
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
      assessedPrice: 0,
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

  const handleSaveRecord = () => {
    const now = new Date()
    const defaultName = `${selectedCity.name} ${now.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}`

    const nameInput = window.prompt('请输入记录名称', defaultName)
    if (nameInput === null) {
      return
    }

    const name = nameInput.trim() || defaultName
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

    const record: SavedRecord = {
      id,
      name,
      createdAt: Date.now(),
      cityName: selectedCity.name,
      surchargeDiscount,
      sellerInput: ensureSellerInputDefaults({ ...sellerInput }),
      buyerInput: ensureBuyerInputDefaults({ ...buyerInput })
    }

    setSavedRecords(prev => [record, ...prev])
    setActiveRecordId(id)
  }

  const handleApplyRecord = (record: SavedRecord) => {
    skipInitialCitySync.current = true
    setSelectedCity(getCityByName(record.cityName))
    setSurchargeDiscount(record.surchargeDiscount)
    setSellerInput(ensureSellerInputDefaults({ ...record.sellerInput }))
    setBuyerInput(ensureBuyerInputDefaults({ ...record.buyerInput }))
    setActiveRecordId(record.id)
  }

  const handleDeleteRecord = (id: string) => {
    setSavedRecords(prev => prev.filter(record => record.id !== id))
    if (activeRecordId === id) {
      setActiveRecordId(null)
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
                  onChange={(value) => setSellerInput(prev => {
                    const shouldSyncGuidePrice = prev.vatGuidePrice === prev.salePrice
                    const next = {
                      ...prev,
                      salePrice: value,
                      vatGuidePrice: shouldSyncGuidePrice ? value : prev.vatGuidePrice
                    }
                    return ensureSellerInputDefaults(next)
                  })}
                  placeholder="请输入成交价"
                />

                <MoneyInput
                  label="增值税计税价（指导价）"
                  value={sellerInput.vatGuidePrice}
                  onChange={(value) => setSellerInput(prev => ({
                    ...prev,
                    vatGuidePrice: value
                  }))}
                  placeholder="默认与成交价一致，可根据指导价调整"
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
                  label="截止目前已付利息"
                  value={sellerInput.paidLoanInterest}
                  onChange={(value) => setSellerInput(prev => ({ ...prev, paidLoanInterest: value }))}
                  placeholder="用于计算实际盈亏，可选填写"
                />

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

                <MoneyInput
                  label="契税评估价"
                  value={buyerInput.assessedPrice}
                  onChange={(value) => setBuyerInput(prev => ({
                    ...prev,
                    assessedPrice: value
                  }))}
                  placeholder="用于契税计算，默认与成交价一致"
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
          <Button onClick={handleExportPDF} className="flex-1" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? '导出中…' : '导出PDF'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>历史记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSaveRecord} className="w-full">
              暂存当前填写
            </Button>
            {savedRecordSummaries.length === 0 ? (
              <p className="text-sm text-gray-500">
                暂无保存记录，点击上方按钮保存当前数据，便于之后快速对比。
              </p>
            ) : (
              <div className="space-y-3">
                {savedRecordSummaries.map(({ record, sellerResult, buyerResult }) => {
                  const isActive = activeRecordId === record.id
                  return (
                    <div
                      key={record.id}
                      className={`rounded-lg border p-3 transition bg-background ${
                        isActive ? 'border-primary ring-1 ring-primary/50' : 'border-border'
                      }`}
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-medium">{record.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(record.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={isActive ? 'default' : 'secondary'}
                            onClick={() => handleApplyRecord(record)}
                            disabled={isActive}
                          >
                            {isActive ? '当前记录' : '应用'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                        <div>城市：{record.cityName}</div>
                        <div>附加税减半：{record.surchargeDiscount ? '是' : '否'}</div>
                        <div>成交价：{formatCurrency(record.sellerInput.salePrice)}</div>
                        <div>卖方税费合计：{formatCurrency(sellerResult.sellerTaxesAndFees)}</div>
                        <div>买方总成本：{formatCurrency(buyerResult.buyerTotal)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

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
          originalPurchasePrice={sellerInput.originalPurchasePrice}
        />

        <BuyerSummary
          result={buyerResult}
          salePrice={buyerInput.salePrice}
          assessedPrice={buyerInput.assessedPrice}
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
