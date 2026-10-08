import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'path';
import {
  MIME_TO_EXTENSION,
  UPLOAD_PUBLIC_PREFIX,
  UPLOAD_ROOT,
} from './upload.config';

/** Grava a imagem e devolve o caminho público que vai no campo foto. */
export async function saveUploadedImage(
  subdir: string,
  file: Express.Multer.File,
): Promise<string> {
  const extension = MIME_TO_EXTENSION[file.mimetype];
  if (!extension || !file.buffer?.length) {
    throw new BadRequestException(
      'Arquivo de imagem inválido. Envie JPEG, PNG, WebP ou GIF.',
    );
  }

  const filename = `${randomUUID()}${extension}`;
  const directory = join(UPLOAD_ROOT, subdir);
  const absolute = join(directory, filename);

  await mkdir(directory, { recursive: true });
  try {
    await writeFile(absolute, file.buffer);
  } catch (error) {
    await unlink(absolute).catch(() => undefined);
    throw error;
  }

  return `${UPLOAD_PUBLIC_PREFIX}/${subdir}/${filename}`;
}

/**
 * Apaga a foto apontada por um caminho público. Silencia ENOENT porque o
 * registro pode apontar para um arquivo que já saiu do disco. Um caminho
 * adulterado não pode remover arquivo fora de UPLOAD_ROOT.
 */
export async function deleteUploadedPhoto(publicPath: string | null): Promise<void> {
  const absolute = resolveStoredPhoto(publicPath);
  if (!absolute) return;

  try {
    await unlink(absolute);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') throw error;
  }
}

function resolveStoredPhoto(publicPath: string | null): string | null {
  const prefix = `${UPLOAD_PUBLIC_PREFIX}/`;
  if (!publicPath?.startsWith(prefix)) return null;

  const relativeUrl = publicPath.slice(prefix.length);
  if (!relativeUrl || relativeUrl.includes('\0')) return null;

  const root = resolve(UPLOAD_ROOT);
  const absolute = resolve(root, relativeUrl);
  const fromRoot = relative(root, absolute);

  if (
    fromRoot === '' ||
    fromRoot.startsWith('..') ||
    fromRoot.split(sep).includes('..') ||
    isAbsolute(fromRoot)
  ) {
    return null;
  }

  return absolute;
}
