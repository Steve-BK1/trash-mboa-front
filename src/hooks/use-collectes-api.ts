import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collecteAPI } from '@/lib/api-client';

export const useCollectesEnAttente = () => {
  return useQuery({
    queryKey: ['collectes-en-attente'],
    queryFn: collecteAPI.getCollectesEnAttente,
  });
};

export const useValiderCollecte = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => collecteAPI.validerCollecte(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectes-en-attente'] });
    },
  });
};

export const useCollectesHistorique = () => {
  return useQuery({
    queryKey: ['collectes-historique'],
    queryFn: async () => {
      // Appel des deux statuts pour l'historique
      const [collected, treated] = await Promise.all([
        collecteAPI.getCollectesByStatus('COLLECTE'),
        collecteAPI.getCollectesByStatus('TRAITE'),
      ]);
      // Fusionne et trie par date décroissante
      return [...(collected || []), ...(treated || [])].sort((a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
    },
  });
}; 