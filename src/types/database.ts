export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          id: string
          owner_id: string
          name: string
          position: number
          color: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['pipeline_stages']['Row']> & {
          owner_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['pipeline_stages']['Row']>
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          owner_id: string
          stage_id: string | null
          name: string
          email: string | null
          phone: string | null
          company: string | null
          source: string | null
          value: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['leads']['Row']> & {
          owner_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['leads']['Row']>
        Relationships: []
      }
      lead_activities: {
        Row: {
          id: string
          lead_id: string
          owner_id: string
          type: string
          content: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['lead_activities']['Row']> & {
          lead_id: string
          owner_id: string
          content: string
        }
        Update: Partial<Database['public']['Tables']['lead_activities']['Row']>
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          owner_id: string
          name: string
          platform: 'google' | 'meta'
          objective: string | null
          status: 'draft' | 'active' | 'paused' | 'archived'
          budget: number | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['campaigns']['Row']> & {
          owner_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['campaigns']['Row']>
        Relationships: []
      }
      campaign_copies: {
        Row: {
          id: string
          campaign_id: string | null
          owner_id: string
          platform: 'google' | 'meta'
          headline: string | null
          primary_text: string | null
          description: string | null
          call_to_action: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['campaign_copies']['Row']> & {
          owner_id: string
        }
        Update: Partial<Database['public']['Tables']['campaign_copies']['Row']>
        Relationships: []
      }
      briefings: {
        Row: {
          id: string
          owner_id: string
          title: string
          raw_content: string
          summary: string | null
          target_audience: string | null
          tone: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['briefings']['Row']> & {
          owner_id: string
          title: string
          raw_content: string
        }
        Update: Partial<Database['public']['Tables']['briefings']['Row']>
        Relationships: []
      }
      generated_prompts: {
        Row: {
          id: string
          briefing_id: string | null
          owner_id: string
          kind: 'image' | 'video'
          prompt_text: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['generated_prompts']['Row']> & {
          owner_id: string
          prompt_text: string
        }
        Update: Partial<Database['public']['Tables']['generated_prompts']['Row']>
        Relationships: []
      }
      generated_images: {
        Row: {
          id: string
          owner_id: string
          prompt: string
          image_url: string
          provider: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['generated_images']['Row']> & {
          owner_id: string
          prompt: string
          image_url: string
        }
        Update: Partial<Database['public']['Tables']['generated_images']['Row']>
        Relationships: []
      }
      landing_pages: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          content: Record<string, unknown>
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['landing_pages']['Row']> & {
          owner_id: string
          name: string
          slug: string
        }
        Update: Partial<Database['public']['Tables']['landing_pages']['Row']>
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          id: string
          owner_id: string
          lead_id: string | null
          contact_name: string | null
          contact_phone: string
          last_message_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['whatsapp_conversations']['Row']> & {
          owner_id: string
          contact_phone: string
        }
        Update: Partial<Database['public']['Tables']['whatsapp_conversations']['Row']>
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          id: string
          conversation_id: string
          owner_id: string
          direction: 'inbound' | 'outbound'
          content: string | null
          media_url: string | null
          status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['whatsapp_messages']['Row']> & {
          conversation_id: string
          owner_id: string
          direction: 'inbound' | 'outbound'
        }
        Update: Partial<Database['public']['Tables']['whatsapp_messages']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadActivity = Database['public']['Tables']['lead_activities']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type CampaignCopy = Database['public']['Tables']['campaign_copies']['Row']
export type Briefing = Database['public']['Tables']['briefings']['Row']
export type GeneratedPrompt = Database['public']['Tables']['generated_prompts']['Row']
export type GeneratedImage = Database['public']['Tables']['generated_images']['Row']
export type LandingPage = Database['public']['Tables']['landing_pages']['Row']
export type WhatsappConversation = Database['public']['Tables']['whatsapp_conversations']['Row']
export type WhatsappMessage = Database['public']['Tables']['whatsapp_messages']['Row']
