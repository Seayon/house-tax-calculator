import { describe, it, expect } from 'vitest'
import { calcSeller, calcBuyer } from './calc'
import { SellerInput, BuyerInput } from './types'

const baseSellerInput: SellerInput = {
  salePrice: 3_000_000,
  vatGuidePrice: 3_000_000,
  originalPurchasePrice: 2_000_000,
  originalDeedTaxRate: 0.01,
  isOverTwoYears: false,
  isOverFiveYears: false,
  onlyHome: false,
  vatRate: 0.053,
  surchargeOnVAT: 0.12,
  sellerAgentRate: 0.01,
  remainingLoan: 0,
  bridgeMonthlyRate: 0.008,
  bridgeMonths: 0,
  pitMode: 'assessed1',
  allowedDeductibles: 0,
  paidLoanInterest: 0,
  otherSellerFees: 0,
  vatRateEditable: false
}

const baseBuyerInput: BuyerInput = {
  salePrice: 3_000_000,
  assessedPrice: 3_000_000,
  deedTaxRate: 0.01,
  buyerAgentRate: 0.01,
  buyerLoanFees: 0
}

describe('calcSeller', () => {
  it('uses vat guide price when calculating VAT', () => {
    const input: SellerInput = { ...baseSellerInput, vatGuidePrice: 3_300_000 }
    const result = calcSeller(input)

    const vatBase = input.vatGuidePrice / (1 + input.vatRate)
    const expectedVat = vatBase * input.vatRate

    expect(result.vat).toBeCloseTo(expectedVat, 2)
  })

  it('subtracts paid loan interest when computing difference and net profit', () => {
    const input: SellerInput = {
      ...baseSellerInput,
      isOverTwoYears: true,
      pitMode: 'exempt',
      sellerAgentRate: 0,
      paidLoanInterest: 100_000
    }

    const result = calcSeller(input)
    const originalDeedTax = input.originalPurchasePrice * input.originalDeedTaxRate
    const expectedDifference = input.salePrice - (input.originalPurchasePrice + originalDeedTax) - input.paidLoanInterest

    expect(result.difference).toBe(expectedDifference)
    expect(result.netProfitBeforeLoan).toBe(expectedDifference)
    expect(result.paidLoanInterest).toBe(input.paidLoanInterest)
  })
})

describe('calcBuyer', () => {
  it('uses assessed price for deed tax while keeping total cost with sale price', () => {
    const input: BuyerInput = { ...baseBuyerInput, assessedPrice: 3_200_000 }
    const result = calcBuyer(input)

    const expectedDeedTax = input.assessedPrice * input.deedTaxRate
    expect(result.deedTax).toBe(expectedDeedTax)

    const expectedTotal = input.salePrice + expectedDeedTax + (input.salePrice * input.buyerAgentRate) + input.buyerLoanFees
    expect(result.buyerTotal).toBe(expectedTotal)
  })
})
