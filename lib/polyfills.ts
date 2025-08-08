// 核心polyfill库
import 'core-js/stable'
import 'regenerator-runtime/runtime'

// 检测和添加必要的polyfill
export function initPolyfills() {
  // Promise polyfill
  if (typeof Promise === 'undefined') {
    require('es6-promise/auto')
  }

  // fetch polyfill
  if (typeof fetch === 'undefined') {
    require('whatwg-fetch')
  }

  // Object.assign polyfill
  if (typeof Object.assign !== 'function') {
    Object.assign = function(target: any, ...sources: any[]) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object')
      }
      const to = Object(target)
      for (let index = 0; index < sources.length; index++) {
        const nextSource = sources[index]
        if (nextSource != null) {
          for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey]
            }
          }
        }
      }
      return to
    }
  }

  // Array.from polyfill
  if (!Array.from) {
    Array.from = function(arrayLike: any, mapFn?: any, thisArg?: any) {
      const C = this
      const items = Object(arrayLike)
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined')
      }
      const mapFunction = mapFn === undefined ? undefined : mapFn
      if (typeof mapFunction !== 'undefined' && typeof mapFunction !== 'function') {
        throw new TypeError('Array.from: when provided, the second argument must be a function')
      }
      const len = parseInt(items.length) || 0
      const A = typeof C === 'function' ? Object(new C(len)) : new Array(len)
      let k = 0
      let kValue
      while (k < len) {
        kValue = items[k]
        if (mapFunction) {
          A[k] = typeof thisArg === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(thisArg, kValue, k)
        } else {
          A[k] = kValue
        }
        k += 1
      }
      A.length = len
      return A
    }
  }

  // Array.find polyfill
  if (!Array.prototype.find) {
    Array.prototype.find = function(predicate: any) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined')
      }
      const o = Object(this)
      const len = parseInt(o.length) || 0
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function')
      }
      const thisArg = arguments[1]
      let k = 0
      while (k < len) {
        const kValue = o[k]
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue
        }
        k++
      }
      return undefined
    }
  }

  // Array.includes polyfill
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement: any, fromIndex?: number) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined')
      }
      const o = Object(this)
      const len = parseInt(o.length) || 0
      if (len === 0) {
        return false
      }
      const n = fromIndex | 0
      let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)
      while (k < len) {
        if (o[k] === searchElement) {
          return true
        }
        k++
      }
      return false
    }
  }

  // String.includes polyfill
  if (!String.prototype.includes) {
    String.prototype.includes = function(search: string, start?: number) {
      if (typeof start !== 'number') {
        start = 0
      }
      if (start + search.length > this.length) {
        return false
      } else {
        return this.indexOf(search, start) !== -1
      }
    }
  }

  // String.startsWith polyfill
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString: string, position?: number) {
      position = position || 0
      return this.substr(position, searchString.length) === searchString
    }
  }

  // String.endsWith polyfill
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString: string, length?: number) {
      if (length === undefined || length > this.length) {
        length = this.length
      }
      return this.substring(length - searchString.length, length) === searchString
    }
  }

  // Number.isNaN polyfill
  if (!Number.isNaN) {
    Number.isNaN = function(value: any) {
      return typeof value === 'number' && isNaN(value)
    }
  }

  // Number.parseInt polyfill
  if (!Number.parseInt) {
    Number.parseInt = parseInt
  }

  // classList polyfill for older browsers
  if (!('classList' in document.createElement('_'))) {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/classlist-polyfill@1.2.0/src/index.min.js'
    document.head.appendChild(script)
  }

  // IntersectionObserver polyfill
  if (typeof IntersectionObserver === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/intersection-observer@0.12.2/intersection-observer.js'
    document.head.appendChild(script)
  }

  // ResizeObserver polyfill
  if (typeof ResizeObserver === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/resize-observer-polyfill@1.5.1/dist/ResizeObserver.global.js'
    document.head.appendChild(script)
  }

  // requestAnimationFrame polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback: FrameRequestCallback) {
      return window.setTimeout(callback, 1000 / 60)
    }
  }

  // cancelAnimationFrame polyfill
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id: number) {
      clearTimeout(id)
    }
  }

  // CustomEvent polyfill
  if (typeof CustomEvent !== 'function') {
    function CustomEvent(event: string, params?: CustomEventInit) {
      params = params || { bubbles: false, cancelable: false, detail: null }
      const evt = document.createEvent('CustomEvent')
      evt.initCustomEvent(event, params.bubbles || false, params.cancelable || false, params.detail)
      return evt
    }
    ;(window as any).CustomEvent = CustomEvent
  }

  // URL polyfill
  if (typeof URL === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/url-polyfill@1.1.12/url-polyfill.min.js'
    document.head.appendChild(script)
  }

  // URLSearchParams polyfill
  if (typeof URLSearchParams === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/url-search-params-polyfill@8.1.1/index.js'
    document.head.appendChild(script)
  }
}

// 检测浏览器特性支持
export function checkBrowserSupport() {
  const support = {
    flexbox: CSS.supports('display', 'flex'),
    grid: CSS.supports('display', 'grid'),
    webp: false,
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof Storage !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator,
    webGL: !!window.WebGLRenderingContext,
    canvas: !!document.createElement('canvas').getContext,
    svg: !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect,
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    geolocation: 'geolocation' in navigator,
    deviceMotion: 'DeviceMotionEvent' in window,
    deviceOrientation: 'DeviceOrientationEvent' in window,
  }

  // 检测WebP支持
  const webpTest = new Image()
  webpTest.onload = webpTest.onerror = function() {
    support.webp = webpTest.height === 2
  }
  webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'

  return support
}

// 添加CSS兼容性类名
export function addCompatibilityClasses() {
  const html = document.documentElement
  const support = checkBrowserSupport()

  // 添加特性检测类名
  Object.keys(support).forEach(feature => {
    if (support[feature as keyof typeof support]) {
      html.classList.add(`supports-${feature}`)
    } else {
      html.classList.add(`no-${feature}`)
    }
  })

  // 添加浏览器检测类名
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('android')) {
    html.classList.add('android')
    const version = ua.match(/android\s([0-9\.]*)/)?.[1]
    if (version) {
      html.classList.add(`android-${version.split('.')[0]}`)
    }
  }
  if (ua.includes('iphone') || ua.includes('ipad')) {
    html.classList.add('ios')
  }
  if (ua.includes('wechat')) {
    html.classList.add('wechat')
  }
  if (ua.includes('micromessenger')) {
    html.classList.add('wechat-webview')
  }
}

// 修复iOS Safari的100vh问题
export function fixViewportHeight() {
  const setVH = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  setVH()
  window.addEventListener('resize', setVH)
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100)
  })
}

// 修复iOS Safari的滚动问题
export function fixIOSScrolling() {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.body.style.webkitOverflowScrolling = 'touch'
  }
}

// 防止双击缩放
export function preventDoubleClickZoom() {
  let lastTouchEnd = 0
  document.addEventListener('touchend', function(event) {
    const now = new Date().getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)
}

// 初始化所有兼容性处理
export function initCompatibility() {
  initPolyfills()
  addCompatibilityClasses()
  fixViewportHeight()
  fixIOSScrolling()
  preventDoubleClickZoom()
}
