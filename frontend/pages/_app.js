import React from 'react'
import './style.css'

import Head from 'next/head'
import { GlobalProvider } from '../global-context'
export default function MyApp({ Component, pageProps }) {
  return (
    <React.Fragment>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </Head>
      <GlobalProvider>
        <Component {...pageProps} />
      </GlobalProvider>
    </React.Fragment>
  )
}
