import { HomeMatches } from "@/components/home/HomeMatches";
import { listLeagues } from "@/lib/football-service";

export default async function HomePage() {
  const leagues = await listLeagues();
  return <HomeMatches leagues={leagues} />;
}
