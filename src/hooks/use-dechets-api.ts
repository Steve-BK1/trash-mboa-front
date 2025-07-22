import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { authAPI } from '@/lib/api-client';

export const useCreateDechet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authAPI.createDechet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dechets'] });
    },
  });
};

export const useUserDechets = () => {
  return useQuery({
    queryKey: ['dechets'],
    queryFn: async () => {
      const res = await apiClient.get('/api/dechets');
      return res.data;
    },
  });
};

export const useUpdateDechet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => authAPI.updateDechet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dechets'] });
    },
  });
};

export const useDeleteDechet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => authAPI.deleteDechet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dechets'] });
    },
  });
}; 