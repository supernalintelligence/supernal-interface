import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID

  useEffect(() => {
    // Initialize GTM dataLayer
    if (typeof window !== 'undefined' && gtmId) {
      (window as any).dataLayer = (window as any).dataLayer || []
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', gtmId)
    }
  }, [gtmId])

  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
      <Component {...pageProps} />
    </>
  )
}
