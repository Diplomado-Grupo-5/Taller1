import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoriasAPI } from "./categorias";

const keys = {
    all: ["categorias"] as const,
};

export function useCategorias() {
    return useQuery({
        queryKey: keys.all,
        queryFn: CategoriasAPI.listar,
    });
}

export function useCreateCategoria() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (nombre: string) => CategoriasAPI.crear(nombre),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useUpdateCategoria() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, nombre }: { id: number; nombre: string }) => CategoriasAPI.actualizar(id, nombre),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useDeleteCategoria() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => CategoriasAPI.eliminar(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}
