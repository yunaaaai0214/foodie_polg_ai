import OSS from "ali-oss";

export interface OssConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
  endpoint?: string;
  secure: boolean;
}

function getOssConfig(): OssConfig | null {
  const region = process.env.ALIYUN_OSS_REGION;
  const bucket = process.env.ALIYUN_OSS_BUCKET;
  const accessKeyId = process.env.ALIYUN_OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET;
  const endpoint = process.env.ALIYUN_OSS_ENDPOINT;
  const secure = (process.env.ALIYUN_OSS_SECURE ?? "true").toLowerCase() !== "false";

  if (!region || !bucket || !accessKeyId || !accessKeySecret) {
    return null;
  }

  return {
    region,
    bucket,
    accessKeyId,
    accessKeySecret,
    endpoint,
    secure
  };
}

export function isOssConfigured(): boolean {
  return getOssConfig() !== null;
}

export function createOssClient() {
  const config = getOssConfig();
  if (!config) {
    throw new Error("OSS is not configured. Please set required environment variables.");
  }

  return new OSS({
    region: config.region,
    bucket: config.bucket,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    endpoint: config.endpoint,
    secure: config.secure,
    timeout: "30s"
  });
}

export function buildStateObjectKey(key: string): string {
  const prefix = process.env.ALIYUN_OSS_STATE_PREFIX ?? "foodie-plog/state";
  return `${prefix}/${encodeURIComponent(key)}.json`;
}
