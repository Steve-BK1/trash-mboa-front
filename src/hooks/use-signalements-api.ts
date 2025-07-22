import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api-client';

export const useCreateSignalement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authAPI.createSignalement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signalements'] });
    },
  });
};

export const useUserSignalements = () => {
  return useQuery({
    queryKey: ['signalements'],
    queryFn: async () => {
      const res = await authAPI.getUserSignalements();
      return res;
    },
  });
};

export const useUpdateSignalement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => authAPI.updateSignalement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signalements'] });
    },
  });
};

export const useDeleteSignalement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => authAPI.deleteSignalement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signalements'] });
    },
  });
}; 