console.log('[NODIUM] Start preload hook...')

function buildProxy(target, handler) {
  const proxy = new Proxy(target, handler)
  proxy.originalTarget = target

  return proxy
}

function hook() {
  window.NODIUM_INJECTED = false
  apply_handler = {
    apply: function (target, thisArg, args) {
      if (!window.NODIUM_INJECTED) args[2]['configurable'] = true
      r = target.apply(thisArg, args)

      if (window.NODIUM_INJECTED) return r

      prop = args[1]
      try {
        if (
          r != undefined &&
          typeof r === 'object' &&
          r.hasOwnProperty(prop) &&
          !r.hasOwnProperty('constructor') &&
          typeof r[prop] === 'function' &&
          r[prop].length == 1
        ) {
          result = r[prop]('')
          if (
            typeof result === 'object' &&
            result !== null &&
            JSON.stringify(Object.keys(result)) ==
              JSON.stringify(['type', 'referrer'])
          ) {
            function t(e) {
              var linkId = (1 + Math.random()).toString(36).substring(2, 12)
              return {
                type: 'SET_REFERRER_ONCE',
                referrer: `https://t.co/${linkId}`,
              }
            }
            args[2] = {
              enumerable: true,
              get: () => t,
            }
            r = target.apply(thisArg, args)

            window.NODIUM_INJECTED = true
            // restore original Object.defineProperty
            Object.defineProperty = Object.defineProperty.originalTarget
            console.log('[NODIUM] Injected!')
          }
        }
      } catch (e) {}

      return r
    },
  }

  Object.defineProperty = buildProxy(Object.defineProperty, apply_handler)
}

checkingInterval = setInterval(function () {
  var html = document.getElementsByTagName('html')[0]
  // check for android meta tag
  console.log(html.innerHTML)
  if (html.innerHTML.indexOf('content="com.medium.reader"') != -1) {
    console.log('[NODIUM] The site is powered by Medium!')
    hook()
    clearInterval(checkingInterval)
  }
}, 50)

document.addEventListener('DOMContentLoaded', function (event) {
  clearInterval(checkingInterval)
})