import { getCookies, setCookies } from "@/lib/sessionStore";

interface CasinoAPIResponse {
  balance?: number;
  maxAllowedBet?: number;
  minBet?: number;
  canSpin?: boolean;
  mode?: string;
  isLoggedIn?: boolean;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const real = searchParams.get("real") || "0";

  try {
    const res = await fetch(
      `https://cryptocasino.vegas/win/games-save-play.php?real=${real}&slot_machine=1`,
      {
        method: "GET",
        headers: {
          cookie: getCookies(),
        },
        redirect: "follow",
        cache: "no-store",
      }
    );

    const newCookie = res.headers.get("set-cookie");
    if (newCookie) setCookies(newCookie);

    const contentType = res.headers.get("content-type") || "";
    let data: CasinoAPIResponse;

    if (contentType.includes("application/json")) {
      data = await res.json() as CasinoAPIResponse;
    } else {
      const text = await res.text();
      console.error("Non-JSON response from casino API:", text.slice(0, 500));
      throw new Error("Status API returned HTML instead of JSON");
    }

    return Response.json({
      success: true,
      balance: data.balance ?? 0,
      maxAllowedBet: data.maxAllowedBet ?? 1000,
      minBet: data.minBet ?? 1,
      canSpin: data.canSpin ?? false,
      mode: data.mode ?? "demo",
      isLoggedIn: data.isLoggedIn ?? false,
    });
  } catch (err) {
    console.error("Status API error:", err);
    return Response.json({ success: false, error: "proxy_failed" });
  }
}
