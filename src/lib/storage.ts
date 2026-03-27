import { supabase } from '@/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { config } from '@/config';

const JD_BUCKET = 'job_descriptions';

/**
 * Pick a PDF/document and upload it to Supabase Storage.
 * Uses the new expo-file-system File API (SDK 54+).
 * Copies content:// URIs to cache first so they're readable.
 * Returns the storage path on success, null if cancelled.
 */
export async function pickAndUploadJD(applicationId: string): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  console.log(
    '[pickAndUploadJD] asset.uri:',
    asset.uri,
    'name:',
    asset.name,
    'mimeType:',
    asset.mimeType
  );

  const ext = asset.name.split('.').pop() ?? 'pdf';
  const storagePath = `${applicationId}/jd.${ext}`;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Copy to a guaranteed file:// cache path (handles content:// URIs on Android)
  const cacheUri = Paths.join(Paths.cache.uri, `jd_upload_${Date.now()}.${ext}`);
  const cachedFile = new File(cacheUri);
  const sourceFile = new File(asset.uri);
  await sourceFile.copy(cachedFile);

  console.log(
    '[pickAndUploadJD] cachedFile.uri:',
    cachedFile.uri,
    'exists:',
    cachedFile.exists,
    'size:',
    cachedFile.size
  );

  // Read as bytes — passing a File object to fetch body sends 0 bytes in RN
  const bytes = await cachedFile.bytes();
  console.log('[pickAndUploadJD] bytes length:', bytes.byteLength);

  const uploadUrl = `${config.SUPABASE_URL}/storage/v1/object/${JD_BUCKET}/${storagePath}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: config.SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': asset.mimeType ?? 'application/pdf',
      'x-upsert': 'true',
    },
    body: bytes,
  });

  console.log('[pickAndUploadJD] upload status:', response.status);

  // Clean up cache file
  try {
    cachedFile.delete();
  } catch {}

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upload failed (${response.status}): ${body}`);
  }

  return storagePath;
}

/**
 * Get a signed URL for viewing a stored JD document (1 hour expiry).
 */
export async function getJDSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(JD_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/**
 * Delete a JD document from storage.
 */
export async function deleteJD(storagePath: string): Promise<void> {
  await supabase.storage.from(JD_BUCKET).remove([storagePath]);
}
