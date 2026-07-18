import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin } from './_shared/supabaseAdmin'

interface MetaWebhookPayload {
  entry?: {
    changes?: {
      value?: {
        messages?: {
          from: string
          type: string
          text?: { body: string }
          image?: { id: string }
        }[]
        contacts?: { profile?: { name?: string }; wa_id: string }[]
      }
    }[]
  }[]
}

export const handler: Handler = async (event) => {
  // Verificação do webhook (Meta faz um GET na primeira configuração)
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {}
    const mode = params['hub.mode']
    const token = params['hub.verify_token']
    const challenge = params['hub.challenge']

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return { statusCode: 200, body: challenge || '' }
    }
    return { statusCode: 403, body: 'Token de verificação inválido.' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método não permitido.' }
  }

  try {
    const ownerId = process.env.WHATSAPP_OWNER_USER_ID
    if (!ownerId) {
      console.warn('WHATSAPP_OWNER_USER_ID não configurada — mensagem recebida foi ignorada.')
      return { statusCode: 200, body: 'ok' }
    }

    const payload = JSON.parse(event.body || '{}') as MetaWebhookPayload
    const admin = getSupabaseAdmin()

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const messages = change.value?.messages ?? []
        const contacts = change.value?.contacts ?? []

        for (const msg of messages) {
          const contact = contacts.find((c) => c.wa_id === msg.from)
          const contactPhone = msg.from
          const contactName = contact?.profile?.name ?? null
          const textContent = msg.type === 'text' ? msg.text?.body ?? '' : `[${msg.type}]`

          let { data: conversation } = await admin
            .from('whatsapp_conversations')
            .select('*')
            .eq('owner_id', ownerId)
            .eq('contact_phone', contactPhone)
            .maybeSingle()

          if (!conversation) {
            const { data: newConv } = await admin
              .from('whatsapp_conversations')
              .insert({ owner_id: ownerId, contact_phone: contactPhone, contact_name: contactName })
              .select()
              .single()
            conversation = newConv
          }

          if (!conversation) continue

          await admin.from('whatsapp_messages').insert({
            conversation_id: conversation.id,
            owner_id: ownerId,
            direction: 'inbound',
            content: textContent,
            status: 'delivered',
          })

          await admin
            .from('whatsapp_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversation.id)
        }
      }
    }

    return { statusCode: 200, body: 'ok' }
  } catch (err) {
    console.error('Erro no webhook do WhatsApp:', err)
    // Sempre responder 200 para a Meta não desativar o webhook por falhas transitórias
    return { statusCode: 200, body: 'ok' }
  }
}
