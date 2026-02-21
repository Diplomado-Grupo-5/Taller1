import { http } from "./http";

export type User = {
  id: number;
  name: string;
  email: string;
  password?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
};

export type UpdateUserDto = Partial<CreateUserDto>;

export const usersApi = {
  list: () => http<User[]>("/users"),
  create: (dto: CreateUserDto) =>
    http<User>("/users", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateUserDto) =>
    http<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  remove: (id: number) => http<void>(`/users/${id}`, { method: "DELETE" }),
};
