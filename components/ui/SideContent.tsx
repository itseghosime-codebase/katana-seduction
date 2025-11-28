"use client";

import Script from "next/script";

export default function SideContentWrapper() {
  return (
    <>
      {/* Container the script will inject into */}
      <div id="side-content" />

      {/* External side-content script */}
      <Script
        src="https://cryptocasino.vegas/win/games/side-content.js?v=1.4.0"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Side-content script loaded in Next.js, firing DOMContentLoaded");

          // Many legacy scripts wait on DOMContentLoaded, but we've already passed it
          try {
            const evt = new Event("DOMContentLoaded");
            document.dispatchEvent(evt);
          } catch (e) {
            console.warn("Failed to dispatch DOMContentLoaded manually", e);
          }
        }}
      />
    </>
  );
}
