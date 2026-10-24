import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

interface Team {
  name?: string;
  members?: string[];
}

interface TeamsResponse {
  teams: Team[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getJson<TeamsResponse>('/api/teams')
      .then((data) => {
        if (active) setTeams(data.teams);
      })
      .catch(() => {
        if (active) setError('Unable to load teams. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Teams" description="Manage teams and members.">
      {loading ? (
        <p role="status">Loading teams...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : teams.length === 0 ? (
        <p>No teams yet.</p>
      ) : (
        <ul className="list-unstyled mb-0">
          {teams.map((team, index) => (
            <li className="mb-2" key={`${team.name}-${index}`}>
              <strong>{team.name}</strong>
              {team.members?.length ? ` - ${team.members.join(', ')}` : ''}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
