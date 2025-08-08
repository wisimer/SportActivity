import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ClientPolyfills } from "@/components/ClientPolyfills"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "2025成都世运会 - AI海报生成器",
  description: "上传你的照片，选择运动类型，AI为你生成专属运动海报",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  themeColor: "#ff6b6b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "2025成都世运会",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 添加兼容性meta标签 */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />
        <meta name="x5-orientation" content="portrait" />
        <meta name="x5-fullscreen" content="true" />
        <meta name="x5-page-mode" content="app" />
        
        {/* DNS预解析 */}
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* 预加载关键资源 */}
        <link rel="preload" href="/images/chengdu-logo.png" as="image" />
        <link rel="preload" href="/images/header.jpeg" as="image" />
        
        {/* 添加polyfill脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 检测是否需要polyfill
              (function() {
                var needsPolyfill = false;
                
                // 检测Promise支持
                if (typeof Promise === 'undefined') {
                  needsPolyfill = true;
                }
                
                // 检测fetch支持
                if (typeof fetch === 'undefined') {
                  needsPolyfill = true;
                }
                
                // 检测Object.assign支持
                if (typeof Object.assign !== 'function') {
                  needsPolyfill = true;
                }
                
                // 检测Array.from支持
                if (!Array.from) {
                  needsPolyfill = true;
                }
                
                // 如果需要polyfill，加载core-js
                if (needsPolyfill) {
                  var script = document.createElement('script');
                  script.src = 'https://cdn.jsdelivr.net/npm/core-js-bundle@3.32.0/minified.js';
                  script.async = false;
                  document.head.appendChild(script);
                  
                  // 加载fetch polyfill
                  var fetchScript = document.createElement('script');
                  fetchScript.src = 'https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.17/dist/fetch.umd.js';
                  fetchScript.async = false;
                  document.head.appendChild(fetchScript);
                }
                
                // 检测CSS支持
                var supportsCSS = window.CSS && CSS.supports;
                if (!supportsCSS) {
                  document.documentElement.className += ' no-css-supports';
                }
                
                // 检测flexbox支持
                if (!supportsCSS || !CSS.supports('display', 'flex')) {
                  document.documentElement.className += ' no-flexbox';
                }
                
                // 检测grid支持
                if (!supportsCSS || !CSS.supports('display', 'grid')) {
                  document.documentElement.className += ' no-grid';
                }
                
                // 检测backdrop-filter支持
                if (!supportsCSS || !CSS.supports('backdrop-filter', 'blur(1px)')) {
                  document.documentElement.className += ' no-backdrop-filter';
                }
                
                // 检测object-fit支持
                if (!supportsCSS || !CSS.supports('object-fit', 'cover')) {
                  document.documentElement.className += ' no-object-fit';
                }
                
                // 检测aspect-ratio支持
                if (!supportsCSS || !CSS.supports('aspect-ratio', '1 / 1')) {
                  document.documentElement.className += ' no-aspect-ratio';
                }
                
                // 检测gap支持
                if (!supportsCSS || !CSS.supports('gap', '1rem')) {
                  document.documentElement.className += ' no-gap';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ClientPolyfills />
        {children}
      </body>
    </html>
  )
}
