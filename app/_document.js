import { useEffect } from "react";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onError={() => console.error("Failed to load Razorpay SDK")}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
