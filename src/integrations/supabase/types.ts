export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      actividades: {
        Row: {
          autor_id: string
          created_at: string
          detalle: string
          id: string
          prospecto_id: string
          tipo: string
        }
        Insert: {
          autor_id: string
          created_at?: string
          detalle: string
          id?: string
          prospecto_id: string
          tipo?: string
        }
        Update: {
          autor_id?: string
          created_at?: string
          detalle?: string
          id?: string
          prospecto_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "actividades_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
      cafeterias: {
        Row: {
          activacion_estado: Database["public"]["Enums"]["activacion_estado"]
          aprobada_at: string | null
          aprobada_por: string | null
          ciudad: string | null
          contacto_email: string | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          cp: string | null
          created_at: string
          direccion: string | null
          estado_geo: string | null
          horario: string | null
          id: string
          lat: number | null
          lng: number | null
          motivo_rechazo: string | null
          nombre_comercial: string
          notas: string | null
          razon_social: string | null
          registro_estado: Database["public"]["Enums"]["registro_estado"]
          rfc: string | null
          updated_at: string
          vendedor_id: string
        }
        Insert: {
          activacion_estado?: Database["public"]["Enums"]["activacion_estado"]
          aprobada_at?: string | null
          aprobada_por?: string | null
          ciudad?: string | null
          contacto_email?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          cp?: string | null
          created_at?: string
          direccion?: string | null
          estado_geo?: string | null
          horario?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          motivo_rechazo?: string | null
          nombre_comercial: string
          notas?: string | null
          razon_social?: string | null
          registro_estado?: Database["public"]["Enums"]["registro_estado"]
          rfc?: string | null
          updated_at?: string
          vendedor_id: string
        }
        Update: {
          activacion_estado?: Database["public"]["Enums"]["activacion_estado"]
          aprobada_at?: string | null
          aprobada_por?: string | null
          ciudad?: string | null
          contacto_email?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          cp?: string | null
          created_at?: string
          direccion?: string | null
          estado_geo?: string | null
          horario?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          motivo_rechazo?: string | null
          nombre_comercial?: string
          notas?: string | null
          razon_social?: string | null
          registro_estado?: Database["public"]["Enums"]["registro_estado"]
          rfc?: string | null
          updated_at?: string
          vendedor_id?: string
        }
        Relationships: []
      }
      onboarding_pasos: {
        Row: {
          cafeteria_id: string
          clave: string
          completado: boolean
          completado_at: string | null
          completado_por: string | null
          created_at: string
          evidencia_path: string | null
          id: string
          nota: string | null
          orden: number
          titulo: string
        }
        Insert: {
          cafeteria_id: string
          clave: string
          completado?: boolean
          completado_at?: string | null
          completado_por?: string | null
          created_at?: string
          evidencia_path?: string | null
          id?: string
          nota?: string | null
          orden?: number
          titulo: string
        }
        Update: {
          cafeteria_id?: string
          clave?: string
          completado?: boolean
          completado_at?: string | null
          completado_por?: string | null
          created_at?: string
          evidencia_path?: string | null
          id?: string
          nota?: string | null
          orden?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_pasos_cafeteria_id_fkey"
            columns: ["cafeteria_id"]
            isOneToOne: false
            referencedRelation: "cafeterias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nombre: string
          telefono: string | null
          updated_at: string
          zona: string | null
        }
        Insert: {
          created_at?: string
          id: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
          zona?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
          zona?: string | null
        }
        Relationships: []
      }
      prospectos: {
        Row: {
          cafeteria_id: string | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          created_at: string
          etapa: Database["public"]["Enums"]["etapa_pipeline"]
          id: string
          nombre: string
          notas: string | null
          proxima_accion: string | null
          proxima_accion_fecha: string | null
          updated_at: string
          vendedor_id: string
        }
        Insert: {
          cafeteria_id?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string
          etapa?: Database["public"]["Enums"]["etapa_pipeline"]
          id?: string
          nombre: string
          notas?: string | null
          proxima_accion?: string | null
          proxima_accion_fecha?: string | null
          updated_at?: string
          vendedor_id: string
        }
        Update: {
          cafeteria_id?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string
          etapa?: Database["public"]["Enums"]["etapa_pipeline"]
          id?: string
          nombre?: string
          notas?: string | null
          proxima_accion?: string | null
          proxima_accion_fecha?: string | null
          updated_at?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospectos_cafeteria_id_fkey"
            columns: ["cafeteria_id"]
            isOneToOne: false
            referencedRelation: "cafeterias"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_gestor: { Args: never; Returns: boolean }
    }
    Enums: {
      activacion_estado: "sin_iniciar" | "en_proceso" | "activa"
      app_role: "vendedor" | "gestor"
      etapa_pipeline:
        | "prospecto"
        | "contactado"
        | "demo"
        | "negociacion"
        | "ganado"
        | "perdido"
      registro_estado: "borrador" | "enviada" | "aprobada" | "rechazada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activacion_estado: ["sin_iniciar", "en_proceso", "activa"],
      app_role: ["vendedor", "gestor"],
      etapa_pipeline: [
        "prospecto",
        "contactado",
        "demo",
        "negociacion",
        "ganado",
        "perdido",
      ],
      registro_estado: ["borrador", "enviada", "aprobada", "rechazada"],
    },
  },
} as const
