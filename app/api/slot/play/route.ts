import { getCookies, setCookies } from "@/lib/sessionStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const real = searchParams.get("real") || "0";
  const betAmount = searchParams.get("bet_amount") || "10";

  const res = await fetch(
    `https://cryptocasino.vegas/win/games-save-play.php?real=${real}&slot_machine=1&bet_amount=${betAmount}`,
    {
      method: "GET",
      headers: {
        cookie: getCookies(),
      },
      redirect: "manual",
      cache: "no-store",
    }
  );

  const newCookie = res.headers.get("set-cookie");
  if (newCookie) setCookies(newCookie);

  const data = await res.json();
  return Response.json(data);
}