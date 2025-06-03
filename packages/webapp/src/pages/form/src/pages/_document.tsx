import { Head, Html, Main, NextScript } from 'next/document'

function MyDocument(props: Any) {
  return (
    <Html lang={props.__NEXT_DATA__.props.pageProps.form?.settings?.locale || 'en'}>
      <Head>
        {/* Robots */}
        <meta content="noindex,nofollow" name="robots" />

        <script
          dangerouslySetInnerHTML={{
            __html: `;(function () {
            const userAgent = window.navigator.userAgent;
            const heyform = {};
    
            heyform.device = {
              ios: /iPad|iPhone|iPod/i.test(userAgent),
              android: /Android/i.test(userAgent),
              mobile: /Android|iPad|iPhone|iPod/i.test(userAgent),
              windowHeight: window.innerHeight,
              screenHeight: window.screen.height
            };
    
            window.DEVICE_INFO = heyform.device;
            window.heyform = heyform;
          })()`
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default MyDocument
