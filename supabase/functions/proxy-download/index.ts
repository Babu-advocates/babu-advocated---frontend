const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Disposition, Content-Type'
};

interface BackblazeAuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  accountId: string;
}

interface DownloadRequest {
  bucketId?: string;
  fileName?: string;
  url?: string;
  filename?: string;
}

function getFilenameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    return parts[parts.length - 1] || 'download';
  } catch {
    return 'download';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestData: DownloadRequest = {};
    
    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      requestData = {
        bucketId: searchParams.get('bucketId') ?? undefined,
        fileName: searchParams.get('fileName') ?? undefined,
        url: searchParams.get('url') ?? undefined,
        filename: searchParams.get('filename') ?? undefined,
      };
    } else if (req.method === 'POST') {
      requestData = await req.json().catch(() => ({}));
    } else {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const { bucketId, fileName, url, filename } = requestData;

    // Get Backblaze credentials (optional depending on URL)
    const keyId = Deno.env.get('BACKBLAZE_KEY_ID');
    const applicationKey = Deno.env.get('BACKBLAZE_APPLICATION_KEY');

    const isBackblaze = (!!url && url.includes('backblazeb2.com')) || (!!bucketId && !!fileName);

    let authData: BackblazeAuthResponse | null = null;
    if (isBackblaze && keyId && applicationKey) {
      console.log('Authenticating with Backblaze...');
      const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        method: 'GET',
        headers: { 'Authorization': `Basic ${btoa(`${keyId}:${applicationKey}`)}` },
      });

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        console.error('Backblaze auth failed:', authResponse.status, errorText);
        return new Response(JSON.stringify({ error: 'Failed to authenticate with Backblaze' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      authData = await authResponse.json();
      console.log('✅ Backblaze authentication successful');
    }

    // Download file - support both direct bucket/fileName or URL parsing
    let downloadUrl: string | null = null;
    let finalFileName: string = filename || 'download';

    if (bucketId && fileName) {
      finalFileName = fileName.split('/').pop() || finalFileName;
      if (authData) {
        // Resolve bucketId to bucketName for correct download URL
        let bucketName = bucketId;
        try {
          const listRes = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_buckets`, {
            method: 'POST',
            headers: {
              'Authorization': authData.authorizationToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accountId: authData.accountId, bucketId }),
          });
          if (listRes.ok) {
            const listJson = await listRes.json();
            bucketName = listJson?.buckets?.[0]?.bucketName || bucketId;
          }
        } catch (_) {}

        downloadUrl = `${authData.downloadUrl}/file/${bucketName}/${fileName}`;
        console.log(`Downloading by bucket and file name: ${bucketName}/${fileName}`);
      } else {
        return new Response(JSON.stringify({ 
          error: 'Missing Backblaze credentials for private bucket download (bucketId + fileName provided). Provide url instead or configure secrets.' 
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
    } else if (url) {
      finalFileName = filename || getFilenameFromUrl(url);
      downloadUrl = url;
      console.log(`Downloading from URL: ${url}`);

      // If Backblaze URL with possible bucketId, resolve to bucketName using B2 API
      if (isBackblaze && authData) {
        try {
          const u = new URL(url);
          const parts = u.pathname.split('/').filter(Boolean); // e.g., ['file', '<bucketPart>', 'path', 'to', 'file.pdf']
          if (parts.length >= 3 && parts[0] === 'file') {
            const bucketPart = parts[1];
            const filePath = parts.slice(2).join('/');

            // Try to resolve bucketPart as a bucketId -> bucketName
            const listBucketsUrl = `${authData.apiUrl}/b2api/v2/b2_list_buckets`;
            const listRes = await fetch(listBucketsUrl, {
              method: 'POST',
              headers: {
                'Authorization': authData.authorizationToken,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accountId: authData.accountId,
                bucketId: bucketPart,
              }),
            });

            if (listRes.ok) {
              const listJson = await listRes.json();
              const bucketName = listJson?.buckets?.[0]?.bucketName;
              if (bucketName) {
                downloadUrl = `${authData.downloadUrl}/file/${bucketName}/${filePath}`;
                console.log(`Resolved Backblaze bucketId to name: ${bucketPart} -> ${bucketName}`);
              } else {
                console.log('Bucket resolution returned no name, using original URL');
              }
            } else {
              const errText = await listRes.text();
              console.log('Bucket resolution failed, using original URL:', errText);
            }
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'unknown error';
          console.log('Bucket name resolution skipped due to error:', msg);
        }
      }
    } else {
      return new Response(JSON.stringify({ error: 'Either (bucketId + fileName) or url is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Download the file (add auth only for Backblaze when available)
    const fileResponse = await fetch(downloadUrl!, {
      method: 'GET',
      headers: authData ? { 'Authorization': authData.authorizationToken } : undefined,
    });

    if (!fileResponse.ok || !fileResponse.body) {
      const errorText = await fileResponse.text().catch(() => '');
      console.error('Download failed:', fileResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: 'File download failed', 
        status: fileResponse.status,
        details: errorText 
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('✅ File downloaded successfully');

    // Prepare response headers
    const headers = new Headers(corsHeaders);
    const contentType = fileResponse.headers.get('content-type') ?? 'application/octet-stream';
    const contentLength = fileResponse.headers.get('content-length');
    
    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    
    const displayName = filename || finalFileName;
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(displayName)}`);

    return new Response(fileResponse.body, {
      status: 200,
      headers
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});