import "styles/globals.scss";
import { useEffect } from "react";

function App({ Component, pageProps }) {
  useEffect(() => {
    if (window.navigator.userAgent.includes("Firefox")) {
      document.getElementsByTagName("html")[0].setAttribute("class", "Firefox");
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default App;