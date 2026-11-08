"use client";
import { useEffect, useState } from "react";
export type ListedTeam = { id: string; name: string; members: number };
export default function DiscoverTeams({
  currentTeam,
  onJoin,
}: {
  currentTeam?: string;
  onJoin: (team: ListedTeam) => void;
}) {
  const [query, setQuery] = useState("");
  const [teams, setTeams] = useState<ListedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/game?view=discover&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as {
          teams?: ListedTeam[];
          error?: string;
        };
        if (!response.ok)
          throw new Error(data.error || "Unable to load teams.");
        setTeams(data.teams || []);
      } catch (e) {
        if (!controller.signal.aborted) {
          setTeams([]);
          setError(e instanceof Error ? e.message : "Unable to load teams.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, refresh]);
  return (
    <section className="discover-teams" aria-label="Discover teams">
      <div className="picture-heading">
        <h1>Discover teams</h1>
        <button
          className="button outline compact"
          onClick={() => setRefresh((v) => v + 1)}
        >
          Refresh
        </button>
      </div>
      <label className="team-search">
        Search teams
        <input
          type="search"
          maxLength={40}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Team name"
        />
      </label>
      {currentTeam && (
        <p className="tiny">
          You’re in {currentTeam}. Leave your team in Settings to join another.
        </p>
      )}
      <div role="status">
        {loading
          ? "Loading…"
          : error ||
            (!teams.length
              ? "No teams with open places. Try another name or create a team."
              : "")}
      </div>
      {!loading && !error && (
        <div className="discover-list">
          {teams.map((team) => (
            <article className="discover-card" key={team.id}>
              <div>
                <h2>{team.name}</h2>
                <p>
                  {team.members}/6 members · {6 - team.members}{" "}
                  {team.members === 5 ? "place" : "places"} open
                </p>
              </div>
              <button
                className="button primary compact"
                disabled={!!currentTeam}
                onClick={() => onJoin(team)}
              >
                Join
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
