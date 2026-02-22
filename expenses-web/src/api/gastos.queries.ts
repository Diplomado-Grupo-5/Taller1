import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GastosAPI } from "./gastos";

const keys = {
    all: ["gastos"] as const,
};

export function useGastos() {
    return useQuery({
        queryKey: keys.all,
        queryFn: GastosAPI.listar,
    });
}

export function useCreateGasto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            descripcion: string;
            monto: number;
            fecha: string;
            categoriaId?: number | null;
            cuentaId?: number | null;
            comercio?: string | null;
            usuarioId?: number | null;
        }) => GastosAPI.crear(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useUpdateGasto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            GastosAPI.actualizar(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useDeleteGasto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => GastosAPI.eliminar(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}
