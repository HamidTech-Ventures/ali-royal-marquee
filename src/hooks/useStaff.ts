import { useState, useEffect } from 'react';
import { referenceService } from '../services/referenceService';
import type { StaffDto } from '../services/referenceService';

export const useStaff = () => {
  const [staff, setStaff] = useState<StaffDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await referenceService.getStaff();
        setStaff(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch staff');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  return { staff, loading, error };
};
