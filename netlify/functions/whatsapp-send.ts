import type { Handler } from '@netlify/functions'
import { getSupabaseAdmin, getUserFromRequest, jsonResponse, HttpError } from './_shared/supabaseAdmin'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' })
  }

  try {
    const user = await getUserFromRequest(event.headers as Record<string, string | undefined>)
    const { conversation_id, contact_phone, contact_name, content } = JSON.parse(
      event.body || '{}',
    ) as {
      conversation_id?: string
      contact_phone?: string
      contact_name?: string
      content?: string
    }

    if (!content || !content.trim()) {
      return jsonResponse(400, { error: 'A mensagem não pode estar vazia.' })
    }

    const admin = getSupabaseAdmin()
    let conversationId = conversation_id

    if (!conversationId) {
      if (!contact_phone) {
        return jsonResponse(400, { error: 'Informe conversation_id ou contact_phone.' })
      }
      const { data: conv, error: convError } = await admin
        .from('whatsapp_conversations')
        .insert({ owner_id: user.id, contact_phone, contact_name: contact_name || null })
        .select()
        .single()
      if (convError || !conv) {
        return jsonResponse(500, { error: convError?.message ?? 'Falha ao criar conversa.' })
      }
      conversationId = conv.id
    }

    const { data: conversation } = await admin
      .from('whatsapp_conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (!conversation) {
      return jsonResponse(404, { error: 'Conversa não encontrada.' })
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    let status: 'sent' | 'failed' | 'queued' = 'queued'

    if (token && phoneNumberId) {
      const metaRes = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: conversation.contact_phone,
            type: 'text',
            text: { body: content },
          }),
        },
      )
      status = metaRes.ok ? 'sent' : 'failed'
    }

    const { data: message, error: msgError } = await admin
      .from('whatsapp_messages')
      .insert({
        conversation_id: conversationId,
        owner_id: user.id,
        direction: 'outbound',
        content,
        status,
      })
      .select()
      .single()

    if (msgError) return jsonResponse(500, { error: msgError.message })

    await admin
      .from('whatsapp_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return jsonResponse(200, { message, conversation_id: conversationId })
  } catch (err) {
    if (err instanceof HttpError) return jsonResponse(err.status, { error: err.message })
    return jsonResponse(500, { error: (err as Error).message })
  }
}
