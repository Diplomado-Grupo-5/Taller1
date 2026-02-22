import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IngresosAPI } from "./ingresos";

const keys = {
    all: ["ingresos"] as const,
};

export function useIngresos() {
    return useQuery({
        queryKey: keys.all,
        queryFn: IngresosAPI.listar,
    });
}

export function useCreateIngreso() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => IngresosAPI.crear(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useUpdateIngreso() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            IngresosAPI.actualizar(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useDeleteIngreso() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => IngresosAPI.eliminar(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}
