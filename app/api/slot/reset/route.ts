import { getCookies, setCookies } from "@/lib/sessionStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const real = searchParams.get("real") || "0";

  const res = await fetch(
    `https://cryptocasino.vegas/win/games-save-play.php?real=${real}&resetbalance=1`,
    {
      method: "GET",
      headers: {
        cookie: getCookies(), // send current cookie
      },
      redirect: "manual",
      cache: "no-store",
    }
  );

  // VERY IMPORTANT: save new cookie returned on reset
  const newCookie = res.headers.get("set-cookie");
  if (newCookie) setCookies(newCookie); // overwrite old cookie

  // Some resets return plain text, some JSON
  const text = await res.text();

  return new Response(text, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
