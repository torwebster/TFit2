export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          primary_goal: string;
          experience_level: string;
          age: number | null;
          weight_kg: number | null;
          height_cm: number | null;
          injuries: Json;
          available_equipment: string[];
          available_days: string[];
          minutes_per_session: number;
          training_style: string | null;
          dietary_preferences: string[];
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          primary_goal?: string;
          experience_level?: string;
          age?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          injuries?: Json;
          available_equipment?: string[];
          available_days?: string[];
          minutes_per_session?: number;
          training_style?: string | null;
          dietary_preferences?: string[];
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          primary_goal?: string;
          experience_level?: string;
          age?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          injuries?: Json;
          available_equipment?: string[];
          available_days?: string[];
          minutes_per_session?: number;
          training_style?: string | null;
          dietary_preferences?: string[];
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      daily_metrics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          sleep_score: number | null;
          sleep_hours: number | null;
          hrv: number | null;
          steps: number | null;
          weight_kg: number | null;
          body_battery: number | null;
          subjective_energy: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          sleep_score?: number | null;
          sleep_hours?: number | null;
          hrv?: number | null;
          steps?: number | null;
          weight_kg?: number | null;
          body_battery?: number | null;
          subjective_energy?: number | null;
        };
        Update: {
          sleep_score?: number | null;
          sleep_hours?: number | null;
          hrv?: number | null;
          steps?: number | null;
          weight_kg?: number | null;
          body_battery?: number | null;
          subjective_energy?: number | null;
          updated_at?: string;
        };
      };
      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          items: string;
          calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          confidence: number;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          items: string;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          confidence?: number;
          source?: string;
        };
        Update: {
          items?: string;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          confidence?: number;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          workout_type: string;
          exercises: Json;
          rpe: number | null;
          duration_minutes: number | null;
          calories_burned: number | null;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          workout_type: string;
          exercises?: Json;
          rpe?: number | null;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          source?: string;
        };
        Update: {
          workout_type?: string;
          exercises?: Json;
          rpe?: number | null;
          duration_minutes?: number | null;
          calories_burned?: number | null;
        };
      };
      symptom_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          pain_location: string;
          severity: number;
          notes: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          pain_location: string;
          severity: number;
          notes?: string;
          source?: string;
        };
        Update: {
          pain_location?: string;
          severity?: number;
          notes?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          plan_json: Json;
          rationale: string;
          confidence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          plan_json: Json;
          rationale?: string;
          confidence?: number;
        };
        Update: {
          plan_json?: Json;
          rationale?: string;
          confidence?: number;
          updated_at?: string;
        };
      };
      conversation_threads: {
        Row: {
          id: string;
          user_id: string;
          channel: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          channel?: string;
          title?: string | null;
        };
        Update: {
          title?: string | null;
          updated_at?: string;
        };
      };
      coach_messages: {
        Row: {
          id: string;
          thread_id: string;
          user_id: string;
          role: string;
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          user_id: string;
          role: string;
          content: string;
          metadata?: Json;
        };
        Update: {
          content?: string;
          metadata?: Json;
        };
      };
      memory_items: {
        Row: {
          id: string;
          user_id: string;
          memory_type: string;
          content: string;
          importance: number;
          source: string;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          memory_type: string;
          content: string;
          importance?: number;
          source?: string;
          is_active?: boolean;
          expires_at?: string | null;
        };
        Update: {
          content?: string;
          importance?: number;
          is_active?: boolean;
          expires_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
