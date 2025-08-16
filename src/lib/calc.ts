import { SellerInput, SellerResult, BuyerInput, BuyerResult } from './types'

/**
 * 计算卖方相关税费和净收益
 */
export function calcSeller(input: SellerInput): SellerResult {
  // 1. 计算原购房契税
  const originalDeedTax = input.originalPurchasePrice * input.originalDeedTaxRate

  // 2. 计算增值税及附加税
  let vat = 0
  let vatSurcharge = 0
  let vatTotal = 0

  if (!input.isOverTwoYears) {
    // 不满2年需要缴纳增值税
    const vatBase = input.salePrice / (1 + input.vatRate)
    vat = vatBase * input.vatRate
    vatSurcharge = vat * input.surchargeOnVAT
    vatTotal = vat + vatSurcharge
  }

  // 3. 计算个人所得税
  let pit = 0
  
  // 满五唯一免征个税
  if (input.isOverFiveYears && input.onlyHome) {
    pit = 0
  } else {
    switch (input.pitMode) {
      case 'assessed1':
        // 核定征收1%
        pit = input.salePrice * 0.01
        break
      case 'diff20':
        // 差额20%（本次计税价-原购房发票价-抵扣项）*20%
        // 抵扣项包含已还的贷款利息、原契税金额、装修费等
        const profitBase = input.salePrice - input.originalPurchasePrice - originalDeedTax - input.allowedDeductibles - input.paidLoanInterest
        pit = Math.max(profitBase, 0) * 0.2
        break
      case 'exempt':
        pit = 0
        break
    }
  }

  // 4. 计算中介费
  const sellerAgentFee = input.salePrice * input.sellerAgentRate

  // 5. 计算过桥费
  const bridgeFee = input.remainingLoan * input.bridgeMonthlyRate * input.bridgeMonths

  // 6. 计算总税费
  const sellerTaxesAndFees = vatTotal + pit + sellerAgentFee + bridgeFee + input.otherSellerFees

  // 7. 计算收益指标
  const difference = input.salePrice - (input.originalPurchasePrice + originalDeedTax)
  const netProfitBeforeLoan = difference - sellerTaxesAndFees
  const netCashAfterLoan = input.salePrice - sellerTaxesAndFees - input.remainingLoan

  return {
    originalDeedTax,
    vat,
    vatSurcharge,
    vatTotal,
    pit,
    sellerAgentFee,
    bridgeFee,
    sellerTaxesAndFees,
    difference,
    netProfitBeforeLoan,
    netCashAfterLoan
  }
}

/**
 * 计算买方相关费用
 */
export function calcBuyer(input: BuyerInput): BuyerResult {
  // 1. 计算买方契税
  const deedTax = input.salePrice * input.deedTaxRate

  // 2. 计算买方中介费
  const buyerAgentFee = input.salePrice * input.buyerAgentRate

  // 3. 计算买方总成本
  const buyerTotal = input.salePrice + deedTax + buyerAgentFee + input.buyerLoanFees

  return {
    deedTax,
    buyerAgentFee,
    buyerTotal
  }
}

/**
 * 格式化金额显示（人民币）
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * 格式化百分比显示
 */
export function formatPercent(rate: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(rate)
}

/**
 * 解析金额输入（支持中文数字和千分位）
 */
export function parseAmount(value: string): number {
  if (!value) return 0
  
  // 移除千分位分隔符和货币符号
  const cleaned = value.replace(/[,，￥¥\s]/g, '')
  
  // 处理中文数字单位
  let result = cleaned
  result = result.replace(/万/g, '0000')
  result = result.replace(/千/g, '000')
  
  const num = parseFloat(result)
  return isNaN(num) ? 0 : num
}

/**
 * 格式化金额输入显示（添加千分位）
 */
export function formatAmountInput(amount: number): string {
  if (amount === 0) return ''
  return new Intl.NumberFormat('zh-CN').format(amount)
}

/**
 * 验证输入参数
 */
export function validateSellerInput(input: Partial<SellerInput>): string[] {
  const errors: string[] = []

  if (!input.salePrice || input.salePrice <= 0) {
    errors.push('成交价必须大于0')
  }

  if (!input.originalPurchasePrice || input.originalPurchasePrice <= 0) {
    errors.push('原购房总价必须大于0')
  }

  if (input.originalDeedTaxRate === undefined || input.originalDeedTaxRate < 0 || input.originalDeedTaxRate > 1) {
    errors.push('原购房契税税率必须在0-100%之间')
  }

  if (input.sellerAgentRate === undefined || input.sellerAgentRate < 0 || input.sellerAgentRate > 1) {
    errors.push('中介费率必须在0-100%之间')
  }

  if (input.remainingLoan === undefined || input.remainingLoan < 0) {
    errors.push('贷款余额不能为负数')
  }

  if (input.bridgeMonthlyRate === undefined || input.bridgeMonthlyRate < 0 || input.bridgeMonthlyRate > 1) {
    errors.push('过桥费月费率必须在0-100%之间')
  }

  if (input.bridgeMonths === undefined || input.bridgeMonths < 0) {
    errors.push('过桥费使用月数不能为负数')
  }

  if (input.paidLoanInterest === undefined || input.paidLoanInterest < 0) {
    errors.push('已还贷款利息不能为负数')
  }

  return errors
}

export function validateBuyerInput(input: Partial<BuyerInput>): string[] {
  const errors: string[] = []

  if (!input.salePrice || input.salePrice <= 0) {
    errors.push('成交价必须大于0')
  }

  if (input.deedTaxRate === undefined || input.deedTaxRate < 0 || input.deedTaxRate > 1) {
    errors.push('契税税率必须在0-100%之间')
  }

  if (input.buyerAgentRate === undefined || input.buyerAgentRate < 0 || input.buyerAgentRate > 1) {
    errors.push('中介费率必须在0-100%之间')
  }

  if (input.buyerLoanFees === undefined || input.buyerLoanFees < 0) {
    errors.push('贷款费用不能为负数')
  }

  return errors
}