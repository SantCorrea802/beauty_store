export type Category = {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  activo?: boolean;
};