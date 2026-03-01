import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CuentasAPI } from "./cuentas";

const keys = {
    all: ["cuentas"] as const,
};

export function useCuentas() {
    return useQuery({
        queryKey: keys.all,
        queryFn: () => CuentasAPI.listar(),
    });
}

export function useCreateCuenta() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { nombre: string }) => CuentasAPI.crear(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useUpdateCuenta() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, nombre }: { id: number; nombre: string }) => CuentasAPI.actualizar(id, nombre),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useDeleteCuenta() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => CuentasAPI.eliminar(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}
