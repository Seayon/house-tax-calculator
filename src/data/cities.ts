import { CityPolicy } from '@/lib/types'

// 默认通用配置
export const DEFAULT_CITY: CityPolicy = {
  name: '通用口径',
  vatRate: 0.053, // 5.3%
  surchargeOnVAT: 0.12, // 城建税7% + 教育费附加3% + 地方教育附加2% = 12%
  pitDefault: 'assessed1',
  deedTaxPresets: [
    { label: '首套住房 ≤90㎡', rate: 0.01 },
    { label: '首套住房 90-140㎡', rate: 0.015 },
    { label: '首套住房 >140㎡', rate: 0.03 },
    { label: '二套住房 ≤90㎡', rate: 0.01 },
    { label: '二套住房 90-140㎡', rate: 0.02 },
    { label: '二套住房 >140㎡', rate: 0.03 },
    { label: '三套及以上', rate: 0.03 },
    { label: '自定义', rate: 0 },
  ],
}

// 上海配置（附加税阶段性减半）
export const SHANGHAI_CITY: CityPolicy = {
  name: '上海',
  vatRate: 0.053,
  surchargeOnVAT: 0.06, // 附加税减半
  pitDefault: 'diff20', // 上海常用差额20%
  deedTaxPresets: [
    { label: '首套住房 ≤90㎡', rate: 0.01 },
    { label: '首套住房 90-140㎡', rate: 0.015 },
    { label: '首套住房 >140㎡', rate: 0.03 },
    { label: '二套住房', rate: 0.03 },
    { label: '自定义', rate: 0 },
  ],
}

// 北京配置
export const BEIJING_CITY: CityPolicy = {
  name: '北京',
  vatRate: 0.053,
  surchargeOnVAT: 0.12,
  pitDefault: 'diff20',
  deedTaxPresets: [
    { label: '首套住房 ≤90㎡', rate: 0.01 },
    { label: '首套住房 90-140㎡', rate: 0.015 },
    { label: '首套住房 >140㎡', rate: 0.03 },
    { label: '二套住房', rate: 0.03 },
    { label: '自定义', rate: 0 },
  ],
}

// 深圳配置
export const SHENZHEN_CITY: CityPolicy = {
  name: '深圳',
  vatRate: 0.053,
  surchargeOnVAT: 0.12,
  pitDefault: 'assessed1',
  deedTaxPresets: [
    { label: '首套住房 ≤90㎡', rate: 0.01 },
    { label: '首套住房 90-140㎡', rate: 0.015 },
    { label: '首套住房 >140㎡', rate: 0.03 },
    { label: '二套住房', rate: 0.03 },
    { label: '自定义', rate: 0 },
  ],
}

// 广州配置
export const GUANGZHOU_CITY: CityPolicy = {
  name: '广州',
  vatRate: 0.053,
  surchargeOnVAT: 0.12,
  pitDefault: 'assessed1',
  deedTaxPresets: [
    { label: '首套住房 ≤90㎡', rate: 0.01 },
    { label: '首套住房 90-140㎡', rate: 0.015 },
    { label: '首套住房 >140㎡', rate: 0.03 },
    { label: '二套住房', rate: 0.03 },
    { label: '自定义', rate: 0 },
  ],
}

// 杭州配置
export const HANGZHOU_CITY: CityPolicy = {
  name: '杭州',
  vatRate: 0.053,
  surchargeOnVAT: 0.12,
  pitDefault: 'assessed1',
  deedTaxPresets: [
    { label: '首套住房 ≤90㎡', rate: 0.01 },
    { label: '首套住房 90-140㎡', rate: 0.015 },
    { label: '首套住房 >140㎡', rate: 0.03 },
    { label: '二套住房', rate: 0.03 },
    { label: '自定义', rate: 0 },
  ],
}

// 南京配置
export const NANJING_CITY: CityPolicy = {
  name: '南京',
  vatRate: 0.053,
  surchargeOnVAT: 0.12,
  pitDefault: 'assessed1',
  deedTaxPresets: [
    { label: '首套住房 ≤90㎡', rate: 0.01 },
    { label: '首套住房 90-140㎡', rate: 0.015 },
    { label: '首套住房 >140㎡', rate: 0.03 },
    { label: '二套住房', rate: 0.03 },
    { label: '自定义', rate: 0 },
  ],
}

// 所有城市配置
export const CITIES: CityPolicy[] = [
  DEFAULT_CITY,
  SHANGHAI_CITY,
  BEIJING_CITY,
  SHENZHEN_CITY,
  GUANGZHOU_CITY,
  HANGZHOU_CITY,
  NANJING_CITY,
]

// 根据名称查找城市配置
export function getCityByName(name: string): CityPolicy {
  return CITIES.find(city => city.name === name) || DEFAULT_CITY
}

// 个税申报方式说明
export const PIT_MODE_DESCRIPTIONS = {
  exempt: '满五唯一免征',
  assessed1: '核定征收1%',
  diff20: '差额征收20%'
}

// 常见费用说明
export const FEE_DESCRIPTIONS = {
  vat: '增值税：不满2年的住房转让需缴纳，税率5.3%',
  vatSurcharge: '增值税附加税：城建税+教育费附加+地方教育附加，通常为增值税额的12%',
  pit: '个人所得税：满五唯一免征，否则按核定1%或差额20%征收',
  deedTax: '契税：买方承担，根据房屋面积和套数确定税率',
  agentFee: '中介费：买卖双方各自承担，通常为成交价的1-2%',
  bridgeFee: '过桥费：用于提前还清贷款的短期资金成本',
  registrationFee: '不动产登记费：住宅80元/件'
}