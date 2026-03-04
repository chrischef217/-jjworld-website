import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  R2: R2Bucket;
  ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('*', cors())

// File upload endpoint
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File size exceeds 10MB limit' }, 400)
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM) are allowed' }, 400)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomStr}.${extension}`
    const key = `uploads/${filename}`

    // Check if R2 is available
    if (!c.env.R2) {
      return c.json({ 
        error: 'R2 storage not configured. Please bind R2 bucket in Cloudflare dashboard.',
        message: 'To enable file upload, you need to create an R2 bucket and bind it in Cloudflare Pages settings.'
      }, 503)
    }

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer()
    await c.env.R2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    })

    // Return public URL
    const url = `/api/files/${key}`
    
    return c.json({ 
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Upload failed: ' + (error as Error).message }, 500)
  }
})

// File retrieval endpoint
app.get('/api/files/*', async (c) => {
  try {
    if (!c.env.R2) {
      return c.json({ error: 'R2 storage not configured' }, 503)
    }

    const key = c.req.path.replace('/api/files/', '')
    const object = await c.env.R2.get(key)
    
    if (!object) {
      return c.notFound()
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('File retrieval error:', error)
    return c.notFound()
  }
})

// File deletion endpoint
app.delete('/api/files/*', async (c) => {
  try {
    const key = c.req.path.replace('/api/files/', '')
    await c.env.R2.delete(key)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('File deletion error:', error)
    return c.json({ error: 'Deletion failed' }, 500)
  }
})

// List uploaded files endpoint
app.get('/api/files', async (c) => {
  try {
    const listed = await c.env.R2.list({ prefix: 'uploads/' })
    
    const files = listed.objects.map(obj => ({
      key: obj.key,
      url: `/api/files/${obj.key}`,
      size: obj.size,
      uploaded: obj.uploaded
    }))
    
    return c.json({ files })
  } catch (error) {
    console.error('File listing error:', error)
    return c.json({ error: 'Failed to list files' }, 500)
  }
})

// Fallback to serve static assets
app.get('*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
