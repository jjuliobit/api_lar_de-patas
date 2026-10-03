import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { diskStorage } from 'multer';

/** Raiz de tudo que é enviado pelo usuário. Fica fora de dist/ no deploy. */
export const UPLOAD_ROOT = join(process.cwd(), 'uploads');

export const PET_PHOTO_SUBDIR = 'pets';
export const PET_PHOTO_DIR = join(UPLOAD_ROOT, PET_PHOTO_SUBDIR);

/** Caminho público do arquivo já salvo, o que vai no campo foto do banco. */
export const PET_PHOTO_SERVE_ROOT = '/uploads';

export function petPhotoPublicPath(filename: string): string {
  return `${PET_PHOTO_SERVE_ROOT}/${PET_PHOTO_SUBDIR}/${filename}`;
}

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
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const petPhotoMulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, callback) => callback(null, PET_PHOTO_DIR),
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${MIME_TO_EXTENSION[file.mimetype] ?? '.bin'}`);
    },
  }),
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