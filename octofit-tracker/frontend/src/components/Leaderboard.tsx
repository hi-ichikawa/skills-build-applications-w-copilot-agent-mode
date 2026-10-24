import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

interface LeaderboardEntry {
  teamName?: string;
  totalPoints?: number;
  rank?: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then((data) => {
        if (active) setEntries(data.leaderboard);
      })
      .catch(() => {
        if (active) setError('Unable to load leaderboard. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals.">
      {loading ? (
        <p role="status">Loading leaderboard...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : entries.length === 0 ? (
        <p>No leaderboard rankings or scores yet.</p>
      ) : (
        <ol className="mb-0">
          {entries.map((entry, index) => (
            <li key={`${entry.teamName}-${index}`}>
              {entry.teamName} - {entry.totalPoints} points
            </li>
          ))}
        </ol>
      )}
    </CapabilityCard>
  );
}
