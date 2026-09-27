import { useState, useEffect } from 'react';
import { referenceService } from '../services/referenceService';
import type { VenueDto } from '../services/referenceService';

export const useVenues = () => {
  const [venues, setVenues] = useState<VenueDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await referenceService.getVenues();
        setVenues(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch venues');
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  return { venues, loading, error };
};
