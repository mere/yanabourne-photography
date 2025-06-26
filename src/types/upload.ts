export interface UploadWithStatus {
  key: string;
  name: string;
  size: number;
  lastModified: Date;
  type: string;
  isUsed: boolean;
  isThumbnail: boolean;
  metadata?: {
    tileW?: number;
    tileH?: number;
    [key: string]: any;
  };
}

export interface ListResult {
  blobs: Array<{
    key: string;
    metadata?: any;
  }>;
} 