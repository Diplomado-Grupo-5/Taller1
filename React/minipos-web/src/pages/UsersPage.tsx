import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";
import type { CreateUserDto } from "../api/users";

const QUERY_KEY = ["users"];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: usersApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateUserDto) => usersApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setName("");
      setEmail("");
      setPassword("");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    createMutation.mutate({ name: name.trim(), email: email.trim(), password });
  }

  function handleDelete(id: number) {
    if (confirm("¿Borrar este usuario?")) removeMutation.mutate(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Reintentar / Refrescar
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Mutation (POST): crea user y luego invalida cache para refrescar
        listado.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-4 rounded border border-gray-200 bg-white p-4"
      >
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !name.trim() || !email.trim() || !password.trim()}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Crear
        </button>
      </form>

      {isLoading && <p className="text-gray-500">Cargando...</p>}
      {isError && (
        <p className="text-red-500">
          Error al cargar. Revisa que el backend esté en ejecución.
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <p className="text-sm text-gray-600">{users.length} registro(s)</p>
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        disabled={removeMutation.isPending}
                        className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
