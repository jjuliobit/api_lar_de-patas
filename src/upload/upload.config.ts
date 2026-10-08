import { BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { memoryStorage } from 'multer';

/** Raiz de tudo que é enviado pelo usuário. Fica fora de dist/ no deploy. */
export const UPLOAD_ROOT = join(process.cwd(), 'uploads');

/** Prefixo público. O valor gravado em foto começa com isto. */
export const UPLOAD_PUBLIC_PREFIX = '/uploads';

export const PET_PHOTO_SUBDIR = 'pets';
export const PET_PHOTO_DIR = join(UPLOAD_ROOT, PET_PHOTO_SUBDIR);

export const LOST_PET_PHOTO_SUBDIR = 'lost-pets';
export const LOST_PET_PHOTO_DIR = join(UPLOAD_ROOT, LOST_PET_PHOTO_SUBDIR);

const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * A extensão vem do MIME, não do nome enviado. Confiar no nome quebra em dois
 * casos: arquivo sem extensão (que ficaria sem content-type ao ser servido) e
 * extensão mentirosa (malware.txt chegando como image/png).
 */
export const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * A foto fica em memória até o service gravar. O interceptor do Multer roda
 * antes do ValidationPipe: com disco, um body inválido já teria deixado o
 * arquivo em uploads/.
 */
export const imageUploadOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Formato não suportado (${file.mimetype}). Envie JPEG, PNG, WebP ou GIF.`,
        ),
        false,
      );
    }
    return callback(null, true);
  },
};
