import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '二手房税费测算器',
  description: '专业的二手房交易税费与净到手测算工具，支持增值税、个人所得税、契税等各项费用计算',
  keywords: '二手房,税费计算,房产交易,增值税,个人所得税,契税',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">税</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">二手房税费测算器</h1>
                </div>
                <div className="text-sm text-gray-500">
                  仅供参考，以实际政策为准
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-sm text-gray-500">
                <p>本工具仅供测算参考，不构成税务或法律意见</p>
                <p className="mt-1">各地政策存在差异，请以当地税务部门实际执行为准</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}