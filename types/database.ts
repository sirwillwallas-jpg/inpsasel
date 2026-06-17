/**
 * Tipos generados desde el schema de Supabase (proyecto xxvgbdoowdndpojmlfdc).
 * Para regenerar: npm run types:db
 *
 * NOTA: PowerShell redirige con UTF-16. Usar siempre:
 *   npx supabase gen types typescript ... | Out-File -Encoding utf8 types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auditoria: {
        Row: {
          id_auditoria: number
          id_usuario: number | null
          accion: string
          tabla_afectada: string
          fecha_hora: string | null
        }
        Insert: {
          id_auditoria?: number
          id_usuario?: number | null
          accion: string
          tabla_afectada: string
          fecha_hora?: string | null
        }
        Update: {
          id_auditoria?: number
          id_usuario?: number | null
          accion?: string
          tabla_afectada?: string
          fecha_hora?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_auditoria_usuario"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      contactos: {
        Row: {
          id_contacto: number
          cedula_rif: string
          nombre_completo: string | null
          entidad: string | null
          nombre_entidad: string
          telefono: string | null
          tipo_contacto: Database["public"]["Enums"]["tipo_contacto_enum"]
        }
        Insert: {
          id_contacto?: number
          cedula_rif: string
          nombre_completo?: string | null
          entidad?: string | null
          nombre_entidad: string
          telefono?: string | null
          tipo_contacto: Database["public"]["Enums"]["tipo_contacto_enum"]
        }
        Update: {
          id_contacto?: number
          cedula_rif?: string
          nombre_completo?: string | null
          entidad?: string | null
          nombre_entidad?: string
          telefono?: string | null
          tipo_contacto?: Database["public"]["Enums"]["tipo_contacto_enum"]
        }
        Relationships: []
      }
      departamento: {
        Row: {
          id_departamento: number
          id_empresa: number
          nombre_departamento: string
        }
        Insert: {
          id_departamento?: number
          id_empresa: number
          nombre_departamento: string
        }
        Update: {
          id_departamento?: number
          id_empresa?: number
          nombre_departamento?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_departamento_empresa"
            columns: ["id_empresa"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id_empresa"]
          },
        ]
      }
      empleado: {
        Row: {
          id_empleado: number
          id_departamento: number
          cedula: string
          nombres: string
          apellidos: string
          cargo_tecnico: string | null
        }
        Insert: {
          id_empleado?: number
          id_departamento: number
          cedula: string
          nombres: string
          apellidos: string
          cargo_tecnico?: string | null
        }
        Update: {
          id_empleado?: number
          id_departamento?: number
          cedula?: string
          nombres?: string
          apellidos?: string
          cargo_tecnico?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_empleado_departamento"
            columns: ["id_departamento"]
            isOneToOne: false
            referencedRelation: "departamento"
            referencedColumns: ["id_departamento"]
          },
        ]
      }
      empresa: {
        Row: {
          id_empresa: number
          rif: string
          razon_social: string
          direccion_fiscal: string | null
        }
        Insert: {
          id_empresa?: number
          rif: string
          razon_social: string
          direccion_fiscal?: string | null
        }
        Update: {
          id_empresa?: number
          rif?: string
          razon_social?: string
          direccion_fiscal?: string | null
        }
        Relationships: []
      }
      maestra: {
        Row: {
          id_maestra: number
          tabla_referencia: string
          clave_parametro: string
          valor_parametro: string
          activo: boolean | null
        }
        Insert: {
          id_maestra?: number
          tabla_referencia: string
          clave_parametro: string
          valor_parametro: string
          activo?: boolean | null
        }
        Update: {
          id_maestra?: number
          tabla_referencia?: string
          clave_parametro?: string
          valor_parametro?: string
          activo?: boolean | null
        }
        Relationships: []
      }
      ordenes_trabajo: {
        Row: {
          id_orden: number
          codigo_ot: string
          detalle: string | null
        }
        Insert: {
          id_orden?: number
          codigo_ot: string
          detalle?: string | null
        }
        Update: {
          id_orden?: number
          codigo_ot?: string
          detalle?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          id_rol: number
          nombre_rol: string
        }
        Insert: {
          id_rol?: number
          nombre_rol: string
        }
        Update: {
          id_rol?: number
          nombre_rol?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          id_usuario: number
          id_rol: number
          id_empleado: number | null
          nombre_completo: string
          username: string
          password: string
        }
        Insert: {
          id_usuario?: number
          id_rol: number
          id_empleado?: number | null
          nombre_completo: string
          username: string
          password: string
        }
        Update: {
          id_usuario?: number
          id_rol?: number
          id_empleado?: number | null
          nombre_completo?: string
          username?: string
          password?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_usuario_rol"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id_rol"]
          },
          {
            foreignKeyName: "fk_usuario_empleado"
            columns: ["id_empleado"]
            isOneToOne: false
            referencedRelation: "empleado"
            referencedColumns: ["id_empleado"]
          },
        ]
      }
      visitas: {
        Row: {
          id_visita: number
          codigo_visita: string
          fecha: string
          hora: string
          tipo_visita: Database["public"]["Enums"]["tipo_visita_enum"]
          estatus: Database["public"]["Enums"]["estatus_enum"]
          cordinacion_referida: string | null
          observaciones: string | null
          id_contacto: number | null
          id_usuario: number | null
          id_orden: number | null
          sexo: string | null
          edad: number | null
          municipio: string | null
          sector: string | null
          cargo: string | null
          funcion: string | null
          actividad_economica: string | null
          funcionario: string | null
          motivo_visita: string | null
        }
        Insert: {
          id_visita?: number
          codigo_visita: string
          fecha: string
          hora: string
          tipo_visita: Database["public"]["Enums"]["tipo_visita_enum"]
          estatus: Database["public"]["Enums"]["estatus_enum"]
          cordinacion_referida?: string | null
          observaciones?: string | null
          id_contacto?: number | null
          id_usuario?: number | null
          id_orden?: number | null
          sexo?: string | null
          edad?: number | null
          municipio?: string | null
          sector?: string | null
          cargo?: string | null
          funcion?: string | null
          actividad_economica?: string | null
          funcionario?: string | null
          motivo_visita?: string | null
        }
        Update: {
          id_visita?: number
          codigo_visita?: string
          fecha?: string
          hora?: string
          tipo_visita?: Database["public"]["Enums"]["tipo_visita_enum"]
          estatus?: Database["public"]["Enums"]["estatus_enum"]
          cordinacion_referida?: string | null
          observaciones?: string | null
          id_contacto?: number
          id_usuario?: number | null
          id_orden?: number | null
          sexo?: string | null
          edad?: number | null
          municipio?: string | null
          sector?: string | null
          cargo?: string | null
          funcion?: string | null
          actividad_economica?: string | null
          funcionario?: string | null
          motivo_visita?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_visita_contacto"
            columns: ["id_contacto"]
            isOneToOne: false
            referencedRelation: "contactos"
            referencedColumns: ["id_contacto"]
          },
          {
            foreignKeyName: "fk_visita_orden"
            columns: ["id_orden"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id_orden"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      tipo_contacto_enum: "Individual" | "Empresa" | "Organizaci\u00f3n"
      tipo_visita_enum:
        | "T\u00e9cnica"
        | "Comercial"
        | "Soporte"
        | "Inspecci\u00f3n"
        | "Personal"
        | "Administrativa"
        | "Consulta"
      estatus_enum:
        | "Planificada"
        | "En Curso"
        | "Completada"
        | "Revisada"
        | "Cancelada"
        | "No Programada"
        | "Emergencia"
    }
    CompositeTypes: Record<string, never>
  }
}

// Helpers de conveniencia
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
