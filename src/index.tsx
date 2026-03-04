import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, verify } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'

type Bindings = {
  R2: R2Bucket;
  ASSETS: Fetcher;
  JWT_SECRET?: string;
  ADMIN_PASSWORD?: string;
}

type Variables = JwtVariables

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// JWT Secret (fallback to default for development)
const getJWTSecret = (c: any) => c.env.JWT_SECRET || 'default-jwt-secret-change-in-production'
const getAdminPassword = (c: any) => c.env.ADMIN_PASSWORD || '1111'

// Enable CORS for all routes
app.use('*', cors())

// ========================================
// Authentication Endpoints
// ========================================

// Login endpoint
app.post('/api/auth/login', async (c) => {
  try {
    const { password } = await c.req.json()
    
    if (!password) {
      return c.json({ error: 'Password is required' }, 400)
    }

    const adminPassword = getAdminPassword(c)
    
    if (password !== adminPassword) {
      return c.json({ error: 'Invalid password' }, 401)
    }

    // Generate JWT token
    const token = await sign(
      {
        sub: 'admin',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
      },
      getJWTSecret(c),
      'HS256'
    )

    return c.json({
      success: true,
      token,
      expiresIn: '24h'
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Verify token endpoint
app.get('/api/auth/verify', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  
  try {
    const payload = await verify(token, getJWTSecret(c), 'HS256')
    
    return c.json({ 
      valid: true,
      user: payload 
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
})

// JWT Middleware for protected routes
const jwtAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  
  try {
    const payload = await verify(token, getJWTSecret(c), 'HS256')
    
    c.set('jwtPayload', payload)
    await next()
  } catch (error) {
    console.error('JWT auth error:', error)
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}

// ========================================
// Image Optimization Helper
// ========================================

async function optimizeImage(file: File): Promise<{ buffer: ArrayBuffer, type: string, extension: string }> {
  // For now, we'll return the original file
  // In production, you would use image processing libraries
  const arrayBuffer = await file.arrayBuffer()
  
  // Determine optimal format
  let outputType = file.type
  let extension = file.name.split('.').pop() || 'jpg'
  
  // Convert JPEG/PNG to WebP for better compression (conceptual - needs actual implementation)
  if (file.type === 'image/jpeg' || file.type === 'image/png') {
    // In a real implementation, you would:
    // 1. Decode the image
    // 2. Resize if needed (e.g., max 1920px width)
    // 3. Convert to WebP format
    // 4. Compress with quality 85
    
    // For now, keep original format
    // outputType = 'image/webp'
    // extension = 'webp'
  }
  
  return {
    buffer: arrayBuffer,
    type: outputType,
    extension
  }
}

// ========================================
// Protected File Upload Endpoints
// ========================================

// File upload endpoint (JWT protected)
app.post('/api/upload', jwtAuth, async (c) => {
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

    // Check if R2 is available
    if (!c.env.R2) {
      return c.json({ 
        error: 'R2 storage not configured. Please bind R2 bucket in Cloudflare dashboard.',
        message: 'To enable file upload, you need to create an R2 bucket and bind it in Cloudflare Pages settings.'
      }, 503)
    }

    // Optimize image if applicable
    let fileData
    let contentType = file.type
    let extension = file.name.split('.').pop()
    
    if (file.type.startsWith('image/') && file.type !== 'image/gif') {
      // Optimize image (resize and/or convert)
      const optimized = await optimizeImage(file)
      fileData = optimized.buffer
      contentType = optimized.type
      extension = optimized.extension
    } else {
      // Use original file for videos and GIFs
      fileData = await file.arrayBuffer()
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const filename = `${timestamp}-${randomStr}.${extension}`
    const key = `uploads/${filename}`

    // Upload to R2 with metadata
    await c.env.R2.put(key, fileData, {
      httpMetadata: {
        contentType
      },
      customMetadata: {
        originalName: file.name,
        originalSize: file.size.toString(),
        uploadedAt: new Date().toISOString()
      }
    })

    // Return public URL
    const url = `/api/files/${key}`
    
    return c.json({ 
      success: true,
      url,
      filename,
      size: fileData.byteLength,
      originalSize: file.size,
      type: contentType,
      optimized: file.size !== fileData.byteLength
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

// File deletion endpoint (JWT protected)
app.delete('/api/files/*', jwtAuth, async (c) => {
  try {
    const key = c.req.path.replace('/api/files/', '')
    await c.env.R2.delete(key)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('File deletion error:', error)
    return c.json({ error: 'Deletion failed' }, 500)
  }
})

// List uploaded files endpoint (JWT protected)
app.get('/api/files', jwtAuth, async (c) => {
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
