const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

function readJSON(file, fallback) {
  try {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
  }
  return fallback;
}

function writeJSON(file, data) {
  const fullPath = path.join(__dirname, file);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
}

function generateCustomFontsCSS(fonts) {
  let css = '/* Generated Custom Fonts Stylesheet */\n';
  (fonts || []).forEach(f => {
    let fmt = 'truetype';
    if (f.path.endsWith('.woff2')) fmt = 'woff2';
    else if (f.path.endsWith('.woff')) fmt = 'woff';
    else if (f.path.endsWith('.otf')) fmt = 'opentype';
    else if (f.path.endsWith('.ttf')) fmt = 'truetype';

    css += `
@font-face {
  font-family: '${f.name}';
  src: url('${f.filename}') format('${fmt}'), url('/${f.path}') format('${fmt}');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
`;
  });
  const cssPath = path.join(__dirname, 'assets', 'fonts', 'custom_fonts.css');
  fs.writeFileSync(cssPath, css, 'utf8');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) { // 50MB max upload
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function verifyAuth(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const config = readJSON('admin_config.json', { sessionToken: 'amirali_secure_session_token_2026' });
  return token === config.sessionToken;
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURI(parsedUrl.pathname);

  // --------------------------------------------------------------------------
  // REST API ENDPOINTS FOR HIDDEN DASHBOARD
  // --------------------------------------------------------------------------

  // 1. Login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const { password } = await parseBody(req);
      const config = readJSON('admin_config.json', { password: 'admin', sessionToken: 'amirali_secure_session_token_2026' });
      if (password === config.password) {
        sendJSON(res, 200, { success: true, token: config.sessionToken });
      } else {
        sendJSON(res, 401, { success: false, error: 'رمز عبور اشتباه است.' });
      }
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 2. Change Password
  if (pathname === '/api/auth/change-password' && req.method === 'POST') {
    if (!verifyAuth(req)) return sendJSON(res, 403, { error: 'دسترسی غیرمجاز' });
    try {
      const { oldPassword, newPassword } = await parseBody(req);
      const config = readJSON('admin_config.json', { password: 'admin', sessionToken: 'amirali_secure_session_token_2026' });
      if (oldPassword !== config.password) {
        return sendJSON(res, 400, { success: false, error: 'رمز عبور فعلی نادرست است.' });
      }
      if (!newPassword || newPassword.length < 4) {
        return sendJSON(res, 400, { success: false, error: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد.' });
      }
      config.password = newPassword;
      writeJSON('admin_config.json', config);
      sendJSON(res, 200, { success: true, message: 'رمز عبور با موفقیت به‌روزرسانی شد.' });
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 3. Get Site Data (Projects, Texts, Typography, Custom Fonts, Element Overrides)
  if (pathname === '/api/site-data' && req.method === 'GET') {
    try {
      const projects = readJSON('projects_data.json', []);
      const texts = readJSON('site_texts.json', {});
      const typography = readJSON('typography_config.json', {});
      const fonts = readJSON('custom_fonts.json', []);
      const elementOverrides = readJSON('element_overrides.json', {});
      sendJSON(res, 200, { success: true, projects, texts, typography, fonts, elementOverrides });
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 4. Save Projects (CRUD Persistence)
  if (pathname === '/api/save-projects' && req.method === 'POST') {
    if (!verifyAuth(req)) return sendJSON(res, 403, { error: 'دسترسی غیرمجاز' });
    try {
      const { projects } = await parseBody(req);
      if (!Array.isArray(projects)) {
        return sendJSON(res, 400, { error: 'Invalid projects array' });
      }
      
      // Save projects_data.json
      writeJSON('projects_data.json', projects);

      // Re-generate projects_data.js for direct static script inclusion
      const jsCode = `/**
 * PROJECTS_DATA.JS
 * Centralized, bilingual portfolio projects database
 * Managed via Hidden Admin Dashboard
 */

const PROJECTS_DATA = ${JSON.stringify(projects, null, 2)};

if (typeof module !== 'undefined') {
  module.exports = { PROJECTS_DATA };
}
`;
      fs.writeFileSync(path.join(__dirname, 'projects_data.js'), jsCode, 'utf8');

      sendJSON(res, 200, { success: true, message: 'پروژه‌ها با موفقیت ذخیره شدند.' });
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 5. Save Site Texts
  if (pathname === '/api/save-texts' && req.method === 'POST') {
    if (!verifyAuth(req)) return sendJSON(res, 403, { error: 'دسترسی غیرمجاز' });
    try {
      const { texts } = await parseBody(req);
      if (!texts) return sendJSON(res, 400, { error: 'Missing texts payload' });

      writeJSON('site_texts.json', texts);
      sendJSON(res, 200, { success: true, message: 'متون سایت با موفقیت به‌روزرسانی شدند.' });
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 6. Save Typography & Appearance Config
  if (pathname === '/api/save-typography' && req.method === 'POST') {
    if (!verifyAuth(req)) return sendJSON(res, 403, { error: 'دسترسی غیرمجاز' });
    try {
      const { typography } = await parseBody(req);
      if (!typography) return sendJSON(res, 400, { error: 'Missing typography payload' });

      writeJSON('typography_config.json', typography);
      sendJSON(res, 200, { success: true, message: 'تنظیمات تایپوگرافی با موفقیت اعمال شد.' });
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 7. Save Element Overrides (Granular Click & Edit for any text/color/font/size!)
  if (pathname === '/api/save-element-overrides' && req.method === 'POST') {
    if (!verifyAuth(req)) return sendJSON(res, 403, { error: 'دسترسی غیرمجاز' });
    try {
      const { overrides } = await parseBody(req);
      if (!overrides || typeof overrides !== 'object') {
        return sendJSON(res, 400, { error: 'Missing overrides object' });
      }

      writeJSON('element_overrides.json', overrides);
      sendJSON(res, 200, { success: true, message: 'تغییرات جزئی المان‌ها ذخیره شد.' });
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 8. Upload Custom Font
  if (pathname === '/api/upload-font' && req.method === 'POST') {
    if (!verifyAuth(req)) return sendJSON(res, 403, { error: 'دسترسی غیرمجاز' });
    try {
      const { fontName, filename, base64Data } = await parseBody(req);
      if (!fontName || !filename || !base64Data) {
        return sendJSON(res, 400, { error: 'نام فونت و فایل ارسالی الزامی هستند.' });
      }

      const ext = path.extname(filename).toLowerCase();
      const cleanFilename = fontName.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_') + '_' + Date.now() + ext;
      const fontsDir = path.join(__dirname, 'assets', 'fonts');
      if (!fs.existsSync(fontsDir)) {
        fs.mkdirSync(fontsDir, { recursive: true });
      }

      const filePath = path.join(fontsDir, cleanFilename);
      const cleanBase64 = base64Data.includes(';base64,') ? base64Data.split(';base64,')[1] : base64Data;
      const dataBuffer = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(filePath, dataBuffer);

      const fonts = readJSON('custom_fonts.json', []);
      const relativePath = `assets/fonts/${cleanFilename}`;
      const newFont = {
        name: fontName,
        filename: cleanFilename,
        path: relativePath,
        ext: ext
      };
      // Replace if exists with same name, or append
      const existingIdx = fonts.findIndex(f => f.name.toLowerCase() === fontName.toLowerCase());
      if (existingIdx !== -1) {
        fonts[existingIdx] = newFont;
      } else {
        fonts.push(newFont);
      }

      writeJSON('custom_fonts.json', fonts);
      generateCustomFontsCSS(fonts);

      sendJSON(res, 200, { success: true, font: newFont, message: `فونت ${fontName} با موفقیت نصب و فعال شد!` });
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 9. Delete Custom Font
  if (pathname === '/api/delete-font' && req.method === 'POST') {
    if (!verifyAuth(req)) return sendJSON(res, 403, { error: 'دسترسی غیرمجاز' });
    try {
      const { fontName } = await parseBody(req);
      let fonts = readJSON('custom_fonts.json', []);
      fonts = fonts.filter(f => f.name !== fontName);
      writeJSON('custom_fonts.json', fonts);
      generateCustomFontsCSS(fonts);
      sendJSON(res, 200, { success: true, message: `فونت ${fontName} حذف شد.` });
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // 10. Upload Image
  if (pathname === '/api/upload-image' && req.method === 'POST') {
    if (!verifyAuth(req)) return sendJSON(res, 403, { error: 'دسترسی غیرمجاز' });
    try {
      const { filename, base64Data } = await parseBody(req);
      if (!filename || !base64Data) {
        return sendJSON(res, 400, { error: 'Missing filename or image data' });
      }

      const cleanFilename = Date.now() + '_' + filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetDir = path.join(__dirname, 'assets', 'projects');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, cleanFilename);
      const cleanBase64 = base64Data.includes(';base64,') ? base64Data.split(';base64,')[1] : base64Data;
      const dataBuffer = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(filePath, dataBuffer);

      sendJSON(res, 200, {
        success: true,
        url: `assets/projects/${cleanFilename}`
      });
    } catch (e) {
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // --------------------------------------------------------------------------
  // STATIC ASSET SERVING WITH RANGE REQUEST SUPPORT
  // --------------------------------------------------------------------------
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(__dirname, reqPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const totalSize = stats.size;

    // Handle HTTP Range Requests (Essential for Safari / Chrome video scrubbing)
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize) {
        res.writeHead(416, {
          'Content-Range': `bytes */${totalSize}`
        });
        return res.end();
      }

      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*'
      });

      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Amirali Easy Portfolio Server running at:`);
  console.log(`   ➜ Local:     http://localhost:${PORT}/`);
  console.log(`   ➜ Dashboard: http://localhost:${PORT}/admin.html\n`);
});
