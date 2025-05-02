// src/types/file-type.d.ts

declare module 'file-type' {
    export function fileTypeFromFile(filePath: string): Promise<{ ext: string; mime: string } | null>;
  }
  