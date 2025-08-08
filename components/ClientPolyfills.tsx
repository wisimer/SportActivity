"use client"

import { useEffect } from 'react'
import { initCompatibility } from '@/lib/polyfills'

export function ClientPolyfills() {
  useEffect(() => {
    // 初始化所有兼容性处理
    initCompatibility()
    
    // 添加错误处理
    window.addEventListener('error', (event) => {
      console.warn('JavaScript Error:', event.error)
      // 可以在这里添加错误上报逻辑
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('Unhandled Promise Rejection:', event.reason)
      // 可以在这里添加错误上报逻辑
    })
    
    // 检测WebView版本并添加相应的类名
    const ua = navigator.userAgent.toLowerCase()
    const html = document.documentElement
    
    // 检测Android版本
    if (ua.includes('android')) {
      const version = ua.match(/android\s([0-9\.]*)/)?.[1]
      if (version) {
        const majorVersion = parseInt(version.split('.')[0])
        html.classList.add(`android-${majorVersion}`)
        
        // 老版本Android的特殊处理
        if (majorVersion <= 4) {
          html.classList.add('old-android')
        }
      }
    }
    
    // 检测iOS版本
    if (ua.includes('iphone') || ua.includes('ipad')) {
      const version = ua.match(/os\s([0-9_]*)/)?.[1]
      if (version) {
        const majorVersion = parseInt(version.split('_')[0])
        html.classList.add(`ios-${majorVersion}`)
        
        // 老版本iOS的特殊处理
        if (majorVersion <= 10) {
          html.classList.add('old-ios')
        }
      }
    }
    
    // 检测微信WebView
    if (ua.includes('micromessenger')) {
      html.classList.add('wechat-webview')
      const version = ua.match(/micromessenger\/([0-9\.]*)/)?.[1]
      if (version) {
        html.classList.add(`wechat-${version.split('.')[0]}`)
      }
    }
    
    // 检测QQ浏览器
    if (ua.includes('qqbrowser')) {
      html.classList.add('qq-browser')
    }
    
    // 检测UC浏览器
    if (ua.includes('ucbrowser')) {
      html.classList.add('uc-browser')
    }
    
    // 检测华为浏览器
    if (ua.includes('huawei')) {
      html.classList.add('huawei-browser')
    }
    
    // 检测小米浏览器
    if (ua.includes('miuibrowser')) {
      html.classList.add('miui-browser')
    }
    
  }, [])
  
  return null
}
