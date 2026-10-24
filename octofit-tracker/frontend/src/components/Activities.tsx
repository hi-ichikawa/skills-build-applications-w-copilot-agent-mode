import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

interface Activity {
  type?: string;
  minutes?: number;
  points?: number;
}

interface ActivitiesResponse {
  activities: Activity[];
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getJson<ActivitiesResponse>('/api/activities')
      .then((data) => {
        if (active) setActivities(data.activities);
      })
      .catch(() => {
        if (active) setError('Unable to load activities. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
    >
      {loading ? (
        <p role="status">Loading activities...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : activities.length === 0 ? (
        <p>No activities yet.</p>
      ) : (
        <ul className="list-unstyled mb-0">
          {activities.map((activity, index) => (
            <li className="mb-2" key={`${activity.type}-${index}`}>
              {activity.type} - {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
