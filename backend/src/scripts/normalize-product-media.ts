import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

type ProductImageRecord = {
  id: string;
  url: string | null;
};

type ProductRecord = {
  id: string;
  thumbnail: string | null;
  images?: ProductImageRecord[] | null;
};

type ProductMediaUpdate = {
  id: string;
  thumbnail: string | null;
  images: {
    id: string;
    url: string;
  }[];
};

const getPublicBackendUrl = () =>
  (
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");

const normalizeStaticAssetUrl = (value: string | null | undefined) => {
  const rawValue = String(value || "").trim();
  const publicBackendUrl = getPublicBackendUrl();

  if (!rawValue) {
    return "";
  }

  if (rawValue.startsWith("/static/")) {
    return publicBackendUrl ? `${publicBackendUrl}${rawValue}` : rawValue;
  }

  try {
    const parsedUrl = new URL(rawValue);
    const isLocalStaticAsset =
      parsedUrl.hostname === "localhost" &&
      parsedUrl.pathname.startsWith("/static/");

    if (isLocalStaticAsset && publicBackendUrl) {
      return `${publicBackendUrl}${parsedUrl.pathname}${parsedUrl.search}`;
    }

    return parsedUrl.toString();
  } catch {
    return rawValue;
  }
};

export default async function normalizeProductMedia({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const publicBackendUrl = getPublicBackendUrl();

  if (!publicBackendUrl) {
    logger.info(
      "No public backend URL configured. Product media normalization skipped."
    );
    return;
  }

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "thumbnail", "images.id", "images.url"],
  });

  const products = (data || []) as ProductRecord[];
  const updates = products
    .map((product) => {
      const currentImages = Array.isArray(product.images) ? product.images : [];
      const normalizedImages = currentImages.map((image) => ({
        id: image.id,
        url: normalizeStaticAssetUrl(image.url),
      }));
      const firstImageUrl = normalizedImages[0]?.url || "";
      const normalizedThumbnail = normalizeStaticAssetUrl(product.thumbnail);
      const nextThumbnail = normalizedThumbnail || firstImageUrl || null;
      const imageChanged = normalizedImages.some(
        (image, index) => image.url !== String(currentImages[index]?.url || "").trim()
      );
      const thumbnailChanged = (product.thumbnail || "") !== (nextThumbnail || "");

      if (!imageChanged && !thumbnailChanged) {
        return null;
      }

      return {
        id: product.id,
        thumbnail: nextThumbnail,
        images: normalizedImages,
      };
    })
    .filter((update): update is ProductMediaUpdate => Boolean(update));

  if (!updates.length) {
    logger.info("Product media URLs are already normalized.");
    return;
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: updates,
    },
  });

  logger.info(`Normalized media URLs for ${updates.length} product(s).`);
}
