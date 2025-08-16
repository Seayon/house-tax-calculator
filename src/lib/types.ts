// 个税申报方式
export type PitMode = 'exempt' | 'assessed1' | 'diff20'

// 卖方输入参数
export interface SellerInput {
  salePrice: number                    // 成交价
  originalPurchasePrice: number        // 原购房总价
  originalDeedTaxRate: number          // 原购房契税税率
  isOverTwoYears: boolean             // 是否满2年
  isOverFiveYears: boolean            // 是否满5年
  onlyHome: boolean                   // 是否家庭唯一住房
  vatRate: number                     // 增值税税率 (默认0.05)
  surchargeOnVAT: number              // 附加税系数 (相对VAT税额的比例)
  sellerAgentRate: number             // 卖方中介费率
  remainingLoan: number               // 贷款剩余金额
  bridgeMonthlyRate: number           // 过桥费月费率
  bridgeMonths: number                // 过桥费使用月数
  pitMode: PitMode                    // 个税申报方式
  allowedDeductibles: number          // 可扣除成本（装修等）
  paidLoanInterest: number            // 已还贷款利息（差额20%可扣除）
  otherSellerFees: number             // 其他卖方费用（登记费等）
  vatRateEditable: boolean            // 增值税税率是否可编辑
}

// 买方输入参数
export interface BuyerInput {
  salePrice: number                   // 成交价
  deedTaxRate: number                 // 买方契税税率
  buyerAgentRate: number              // 买方中介费率
  buyerLoanFees: number               // 买方贷款费用
}

// 卖方计算结果
export interface SellerResult {
  originalDeedTax: number             // 原购房契税
  vat: number                         // 增值税
  vatSurcharge: number                // 增值税附加税
  vatTotal: number                    // 增值税合计
  pit: number                         // 个人所得税
  sellerAgentFee: number              // 卖方中介费
  bridgeFee: number                   // 过桥费
  sellerTaxesAndFees: number          // 卖方税费合计
  difference: number                  // 历史差价（含原契税成本）
  netProfitBeforeLoan: number         // 本次交易盈亏（不考虑贷款）
  netCashAfterLoan: number            // 预计还清贷款后到手净额
}

// 买方计算结果
export interface BuyerResult {
  deedTax: number                     // 买方契税
  buyerAgentFee: number               // 买方中介费
  buyerTotal: number                  // 买方成交总成本
}

// 城市政策配置
export interface CityPolicy {
  name: string                        // 城市名称
  vatRate: number                     // 增值税税率
  surchargeOnVAT: number              // 附加税系数（常见12%或减半6%）
  pitDefault: PitMode                 // 本地常用个税申报方式
  deedTaxPresets: Array<{             // 契税预设档位
    label: string
    rate: number
  }>
}

// 表单验证错误
export interface ValidationError {
  field: string
  message: string
}

// 计算配置选项
export interface CalculationOptions {
  city: CityPolicy
  surchargeDiscount: boolean          // 附加税是否减半
  showBreakdown: boolean              // 是否显示明细
}