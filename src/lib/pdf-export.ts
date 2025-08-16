import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { SellerInput, BuyerInput, SellerResult, BuyerResult, CityPolicy } from './types'
import { formatCurrency, formatPercent } from './calc'

export interface ExportData {
  sellerInput: SellerInput
  buyerInput: BuyerInput
  sellerResult: SellerResult
  buyerResult: BuyerResult
  city: CityPolicy
  timestamp: string
}

/**
 * 生成PDF测算报告
 */
export async function generatePDF(data: ExportData): Promise<void> {
  try {
    // 创建临时的打印容器
    const printContainer = document.createElement('div')
    printContainer.className = 'print-container'
    printContainer.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 210mm;
      background: white;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
    `

    // 生成HTML内容
    printContainer.innerHTML = generateReportHTML(data)
    document.body.appendChild(printContainer)

    // 等待字体和样式加载
    await new Promise(resolve => setTimeout(resolve, 500))

    // 生成canvas
    const canvas = await html2canvas(printContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4宽度 (210mm * 3.78)
      height: 1123 // A4高度 (297mm * 3.78)
    })

    // 创建PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210 // A4宽度
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

    // 如果内容超过一页，添加新页
    if (imgHeight > 297) {
      const totalPages = Math.ceil(imgHeight / 297)
      for (let i = 1; i < totalPages; i++) {
        pdf.addPage()
        const yOffset = -297 * i
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
      }
    }

    // 下载PDF
    const filename = `二手房税费测算_${data.timestamp.replace(/[:\s]/g, '_')}.pdf`
    pdf.save(filename)

    // 清理临时元素
    document.body.removeChild(printContainer)
  } catch (error) {
    console.error('PDF生成失败:', error)
    throw new Error('PDF生成失败，请重试')
  }
}

/**
 * 生成报告HTML内容
 */
function generateReportHTML(data: ExportData): string {
  const { sellerInput, buyerInput, sellerResult, buyerResult, city, timestamp } = data
  
  const isExempt = sellerInput.isOverFiveYears && sellerInput.onlyHome
  const vatBase = sellerInput.isOverTwoYears ? 0 : sellerInput.salePrice / (1 + sellerInput.vatRate)

  return `
    <div style="max-width: 100%; margin: 0 auto;">
      <!-- 标题 -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px; color: #2563eb; font-weight: bold;">二手房税费测算报告</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">生成时间: ${timestamp}</p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">政策口径: ${city.name}</p>
      </div>

      <!-- 基本信息 -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; color: #1f2937; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 10px;">房屋基本信息</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <div style="margin-bottom: 8px;"><strong>成交价:</strong> ${formatCurrency(sellerInput.salePrice)}</div>
            <div style="margin-bottom: 8px;"><strong>原购房价:</strong> ${formatCurrency(sellerInput.originalPurchasePrice)}</div>
            <div style="margin-bottom: 8px;"><strong>原契税税率:</strong> ${formatPercent(sellerInput.originalDeedTaxRate)}</div>
          </div>
          <div>
            <div style="margin-bottom: 8px;"><strong>房龄满2年:</strong> ${sellerInput.isOverTwoYears ? '是' : '否'}</div>
            <div style="margin-bottom: 8px;"><strong>房龄满5年:</strong> ${sellerInput.isOverFiveYears ? '是' : '否'}</div>
            <div style="margin-bottom: 8px;"><strong>家庭唯一:</strong> ${sellerInput.onlyHome ? '是' : '否'}</div>
          </div>
        </div>
      </div>

      <!-- 卖方测算结果 -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; color: #1f2937; margin-bottom: 15px; border-left: 4px solid #059669; padding-left: 10px;">卖方收益测算</h2>
        
        <!-- 核心指标 -->
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px;">到手净额（含贷款）</div>
              <div style="font-size: 20px; font-weight: bold; color: ${sellerResult.netCashAfterLoan >= 0 ? '#059669' : '#dc2626'};">
                ${formatCurrency(sellerResult.netCashAfterLoan)}
              </div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px;">交易盈亏（不含贷款）</div>
              <div style="font-size: 20px; font-weight: bold; color: ${sellerResult.netProfitBeforeLoan >= 0 ? '#059669' : '#dc2626'};">
                ${formatCurrency(sellerResult.netProfitBeforeLoan)}
              </div>
            </div>
          </div>
        </div>

        <!-- 税费明细 -->
        <div style="background: #fafafa; border-radius: 6px; padding: 15px;">
          <h3 style="font-size: 14px; margin-bottom: 10px; color: #374151;">税费明细</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #666;">增值税及附加</td>
              <td style="padding: 8px 0; text-align: right; color: ${sellerResult.vatTotal > 0 ? '#dc2626' : '#059669'};">
                ${sellerResult.vatTotal > 0 ? formatCurrency(sellerResult.vatTotal) : '免征'}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #666;">个人所得税</td>
              <td style="padding: 8px 0; text-align: right; color: ${sellerResult.pit > 0 ? '#dc2626' : '#059669'};">
                ${sellerResult.pit > 0 ? formatCurrency(sellerResult.pit) : '免征'}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #666;">中介费</td>
              <td style="padding: 8px 0; text-align: right; color: #dc2626;">
                ${formatCurrency(sellerResult.sellerAgentFee)}
              </td>
            </tr>
            ${sellerResult.bridgeFee > 0 ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #666;">过桥费</td>
              <td style="padding: 8px 0; text-align: right; color: #dc2626;">
                ${formatCurrency(sellerResult.bridgeFee)}
              </td>
            </tr>
            ` : ''}
            <tr style="border-top: 2px solid #374151; font-weight: bold;">
              <td style="padding: 8px 0;">税费合计</td>
              <td style="padding: 8px 0; text-align: right; color: #dc2626;">
                ${formatCurrency(sellerResult.sellerTaxesAndFees)}
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- 买方测算结果 -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; color: #1f2937; margin-bottom: 15px; border-left: 4px solid #7c3aed; padding-left: 10px;">买方成本测算</h2>
        
        <div style="background: #faf5ff; border: 1px solid #a855f7; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">购房总成本</div>
            <div style="font-size: 20px; font-weight: bold; color: #7c3aed;">
              ${formatCurrency(buyerResult.buyerTotal)}
            </div>
          </div>
        </div>

        <div style="background: #fafafa; border-radius: 6px; padding: 15px;">
          <h3 style="font-size: 14px; margin-bottom: 10px; color: #374151;">成本明细</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #666;">成交价</td>
              <td style="padding: 8px 0; text-align: right;">
                ${formatCurrency(buyerInput.salePrice)}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #666;">契税</td>
              <td style="padding: 8px 0; text-align: right; color: #dc2626;">
                ${formatCurrency(buyerResult.deedTax)}
              </td>
            </tr>
            ${buyerResult.buyerAgentFee > 0 ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #666;">中介费</td>
              <td style="padding: 8px 0; text-align: right; color: #dc2626;">
                ${formatCurrency(buyerResult.buyerAgentFee)}
              </td>
            </tr>
            ` : ''}
            ${buyerInput.buyerLoanFees > 0 ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; color: #666;">贷款费用</td>
              <td style="padding: 8px 0; text-align: right; color: #dc2626;">
                ${formatCurrency(buyerInput.buyerLoanFees)}
              </td>
            </tr>
            ` : ''}
            <tr style="border-top: 2px solid #374151; font-weight: bold;">
              <td style="padding: 8px 0;">总成本</td>
              <td style="padding: 8px 0; text-align: right; color: #7c3aed;">
                ${formatCurrency(buyerResult.buyerTotal)}
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- 计算说明 -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; color: #1f2937; margin-bottom: 15px; border-left: 4px solid #f59e0b; padding-left: 10px;">计算说明</h2>
        <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px;">
          <div style="font-size: 12px; line-height: 1.6; color: #92400e;">
            <p style="margin: 0 0 8px 0;"><strong>增值税计算:</strong> ${sellerInput.isOverTwoYears ? '满2年免征' : `不含税价格 ${formatCurrency(vatBase)} × 5% = ${formatCurrency(sellerResult.vat)}`}</p>
            <p style="margin: 0 0 8px 0;"><strong>附加税计算:</strong> ${sellerResult.vatSurcharge > 0 ? `增值税 ${formatCurrency(sellerResult.vat)} × ${formatPercent(sellerInput.surchargeOnVAT)} = ${formatCurrency(sellerResult.vatSurcharge)}` : '无增值税，无附加税'}</p>
            <p style="margin: 0 0 8px 0;"><strong>个税计算:</strong> ${
              isExempt ? '满五唯一，免征个税' :
              sellerInput.pitMode === 'assessed1' ? `核定征收 ${formatCurrency(sellerInput.salePrice)} × 1% = ${formatCurrency(sellerResult.pit)}` :
              sellerInput.pitMode === 'diff20' ? `差额征收 (${formatCurrency(sellerInput.salePrice)} - ${formatCurrency(sellerInput.originalPurchasePrice)} - ${formatCurrency(sellerResult.originalDeedTax)}${sellerInput.allowedDeductibles > 0 ? ` - ${formatCurrency(sellerInput.allowedDeductibles)}` : ''}) × 20% = ${formatCurrency(sellerResult.pit)}` :
              '免征'
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>契税计算:</strong> ${formatCurrency(buyerInput.salePrice)} × ${formatPercent(buyerInput.deedTaxRate)} = ${formatCurrency(buyerResult.deedTax)}</p>
            ${sellerResult.bridgeFee > 0 ? `<p style="margin: 0 0 8px 0;"><strong>过桥费计算:</strong> ${formatCurrency(sellerInput.remainingLoan)} × ${formatPercent(sellerInput.bridgeMonthlyRate)} × ${sellerInput.bridgeMonths}个月 = ${formatCurrency(sellerResult.bridgeFee)}</p>` : ''}
          </div>
        </div>
      </div>

      <!-- 免责声明 -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 30px;">
        <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 15px;">
          <h3 style="font-size: 14px; color: #dc2626; margin-bottom: 10px;">重要提示</h3>
          <div style="font-size: 11px; line-height: 1.5; color: #991b1b;">
            <p style="margin: 0 0 5px 0;">1. 本测算结果仅供参考，不构成税务或法律意见</p>
            <p style="margin: 0 0 5px 0;">2. 各地政策存在差异，实际执行标准请以当地税务、不动产登记部门为准</p>
            <p style="margin: 0 0 5px 0;">3. 税费政策可能调整，请及时关注最新政策变化</p>
            <p style="margin: 0;">4. 建议在实际交易前咨询专业税务顾问或相关部门</p>
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * 导出为图片
 */
export async function exportAsImage(elementId: string): Promise<void> {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('找不到要导出的元素')
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    // 创建下载链接
    const link = document.createElement('a')
    link.download = `二手房税费测算_${new Date().toLocaleString('zh-CN').replace(/[:\s]/g, '_')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('图片导出失败:', error)
    throw new Error('图片导出失败，请重试')
  }
}