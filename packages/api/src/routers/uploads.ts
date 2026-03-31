import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { z } from "zod";
import sharp from "sharp";
import crypto from "crypto";

import { env } from "@route-pulse/env/server";
import { adminProcedure, router, protectedProcedure } from "../index";
import prisma from "@route-pulse/db";

// Inline R2 client with hardened HTTP handler to resolve EPROTO SSL errors on Windows/Node 18+
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 5000,
    socketTimeout: 5000,
  }),
});

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const ALLOWED_FOLDERS = ["drivers", "complaints", "announcements"] as const;

export const uploadsRouter = router({
  /**
   * Generate a presigned PUT URL for R2 client-side upload (Generic)
   */
  getUploadUrl: adminProcedure
    .input(
      z.object({
        folder: z.enum(ALLOWED_FOLDERS),
        filename: z.string().min(1).max(200),
        contentType: z.string().refine((t) => ALLOWED_TYPES.has(t), {
          message: "Unsupported file type",
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const clean = input.filename.replace(/[^a-z0-9._-]/gi, "_");
      const key = `${input.folder}/${Date.now()}-${clean}`;

      const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        ContentType: input.contentType,
      });

      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 600 });
      return { success: true, data: { signedUrl, key, expiresIn: 600 } };
    }),

  /**
   * Secure, sanitized profile picture upload
   */
  uploadAvatar: protectedProcedure
    .input(z.object({
      base64Image: z.string(), // Image as base64 string
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Remove base64 header if present
        const base64Data = input.base64Image.replace(/^data:image\/\w+;base64,/, "");
        const inputBuffer = Buffer.from(base64Data, 'base64');

        // 2. Validate Size (Max 5MB)
        if (inputBuffer.length > 5 * 1024 * 1024) {
          throw new Error("File too large (Max 5MB)");
        }

        // 3. Sanitize & Re-encode with sharp (Malicious code protection)
        // This strips metadata and forces a clean WebP encoding
        const processedBuffer = await sharp(inputBuffer)
          .resize(400, 400, { fit: 'cover' })
          .webp({ quality: 85 })
          .toBuffer();

        // 4. Unique Filename Hashing
        const hash = crypto.createHash('sha256').update(ctx.user.sub + Date.now()).digest('hex').substring(0, 16);
        const key = `avatars/${ctx.user.sub}-${hash}.webp`;

        // 5. Upload to R2
        await r2.send(new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: key,
          Body: processedBuffer,
          ContentType: "image/webp",
          CacheControl: "max-age=31536000",
        }));

        const publicUrl = `${env.R2_PUBLIC_URL}/${key}?v=${Date.now()}`;

        // 6. Persist to DB
        await prisma.user.update({
          where: { id: ctx.user.sub },
          data: { avatarUrl: publicUrl },
        });

        return { success: true, avatarUrl: publicUrl };
      } catch (error: any) {
        console.error("[R2 Upload Error]", {
          name: error.name,
          message: error.message,
          code: error.code,
          stack: error.stack,
          requestId: error.$metadata?.requestId,
        });
        throw new Error(`Profile update failed: ${error.message}`);
      }
    }),
});
