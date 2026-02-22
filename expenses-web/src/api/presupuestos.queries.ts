import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PresupuestosAPI } from "./presupuestos";

const keys = {
    all: ["presupuestos"] as const,
    filtered: (anio?: number, mes?: number) => ["presupuestos", anio, mes] as const,
};

export function usePresupuestos(anio?: number, mes?: number) {
    return useQuery({
        queryKey: keys.filtered(anio, mes),
        queryFn: () => PresupuestosAPI.listar(anio, mes),
    });
}

export function useCreatePresupuesto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => PresupuestosAPI.crear(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useUpdatePresupuesto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            PresupuestosAPI.actualizar(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useDeletePresupuesto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => PresupuestosAPI.eliminar(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}
