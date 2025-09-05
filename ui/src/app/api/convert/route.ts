import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const backendResp = await fetch('http://localhost:8080/convert', {
      method: 'POST',
      body: formData,
    })

    if (!backendResp.ok || !backendResp.body) {
      const text = await backendResp.text().catch(() => '')
      return new Response(
        JSON.stringify({ error: 'Conversion failed', detail: text }),
        { status: backendResp.status || 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const contentDisposition = backendResp.headers.get('content-disposition') || 'inline; filename="converted.pdf"'
    return new Response(backendResp.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Unexpected error', detail: String(err?.message || err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
