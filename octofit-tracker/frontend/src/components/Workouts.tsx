import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

interface WorkoutSuggestion {
  title?: string;
  focus?: string;
  reason?: string;
}

interface WorkoutsResponse {
  suggestions: WorkoutSuggestion[];
}

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getJson<WorkoutsResponse>(
      '/api/workouts/suggestions/mona%40example.com',
    )
      .then((data) => {
        if (active) setSuggestions(data.suggestions);
      })
      .catch(() => {
        if (active) setError('Unable to load workout suggestions. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
    >
      {loading ? (
        <p role="status">Loading workout suggestions...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : suggestions.length === 0 ? (
        <p>No workout suggestions yet.</p>
      ) : (
        <ul className="list-unstyled mb-0">
          {suggestions.map((suggestion, index) => (
            <li className="mb-2" key={`${suggestion.title}-${index}`}>
              <strong>{suggestion.title}</strong>
              {suggestion.reason ? ` - ${suggestion.reason}` : ''}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
