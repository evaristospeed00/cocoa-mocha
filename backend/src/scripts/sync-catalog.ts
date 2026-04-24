import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

type CatalogProduct = {
  title: string;
  handle: string;
  description: string;
  image: string;
  heroTags: string[];
  weight: number;
  variantTitle: string;
  sku: string;
  prices: {
    amount: number;
    currency_code: string;
  }[];
};

type ProductRecord = {
  id: string;
  handle: string;
  title?: string | null;
  variants?: { id: string }[] | null;
};

type CatalogUpdate = {
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string;
  images: {
    url: string;
  }[];
  weight: number;
  metadata: {
    hero_tags: string[];
  };
  variants: {
    id: string;
    title: string;
    sku: string;
    prices: {
      amount: number;
      currency_code: string;
    }[];
  }[];
};

const catalog: CatalogProduct[] = [
  {
    title: "Ethiopian Yirgacheffe",
    handle: "ethiopian-yirgacheffe",
    description:
      "A lively, fruit-forward coffee with floral aromatics and bright acidity that keeps every sip crisp and expressive.",
    image:
      "https://images.pexels.com/photos/19052799/pexels-photo-19052799.jpeg?auto=compress&cs=tinysrgb&w=1500",
    heroTags: ["Fruity", "Floral", "Bright Acidity"],
    weight: 340,
    variantTitle: "340g",
    sku: "COFFEE-ETHIOPIA-340G",
    prices: [
      {
        amount: 16,
        currency_code: "eur",
      },
      {
        amount: 18,
        currency_code: "usd",
      },
    ],
  },
  {
    title: "Colombian Supremo",
    handle: "colombian-supremo",
    description:
      "Meet the crowd-pleaser! Our Colombian Supremo is perfectly balanced with rich nutty undertones and a velvety smooth body.",
    image:
      "https://images.pexels.com/photos/36343671/pexels-photo-36343671.jpeg?auto=compress&cs=tinysrgb&w=1500",
    heroTags: ["Balanced", "Nutty", "Smooth"],
    weight: 340,
    variantTitle: "340g",
    sku: "COFFEE-COLOMBIA-340G",
    prices: [
      {
        amount: 16,
        currency_code: "eur",
      },
      {
        amount: 18,
        currency_code: "usd",
      },
    ],
  },
  {
    title: "Sumatra Mandheling",
    handle: "sumatra-mandheling",
    description:
      "Earthy, bold, and full of character, Sumatra Mandheling is built for customers who want depth and drama in every sip.",
    image:
      "https://images.pexels.com/photos/6729581/pexels-photo-6729581.jpeg?auto=compress&cs=tinysrgb&w=1500",
    heroTags: ["Earthy", "Bold", "Spicy"],
    weight: 340,
    variantTitle: "340g",
    sku: "COFFEE-SUMATRA-340G",
    prices: [
      {
        amount: 17,
        currency_code: "eur",
      },
      {
        amount: 19,
        currency_code: "usd",
      },
    ],
  },
  {
    title: "Guatemala Antigua",
    handle: "guatemala-antigua",
    description:
      "Guatemala Antigua brings a chocolate-forward profile with a soft smoky edge and a layered finish that feels refined and memorable.",
    image:
      "https://images.pexels.com/photos/15312642/pexels-photo-15312642.jpeg?auto=compress&cs=tinysrgb&w=1500",
    heroTags: ["Chocolate", "Smoky", "Complex"],
    weight: 340,
    variantTitle: "340g",
    sku: "COFFEE-GUATEMALA-340G",
    prices: [
      {
        amount: 17,
        currency_code: "eur",
      },
      {
        amount: 20,
        currency_code: "usd",
      },
    ],
  },
];

export default async function syncCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title", "variants.id"],
  });

  const products = (data || []) as ProductRecord[];
  const productsByHandle = new Map(
    products.map((product) => [product.handle, product])
  );

  const updates = catalog
    .map((item) => {
      const existingProduct = productsByHandle.get(item.handle);
      const primaryVariantId = existingProduct?.variants?.[0]?.id;

      if (!existingProduct?.id || !primaryVariantId) {
        logger.warn(
          `Skipping catalog sync for ${item.handle} because the product or variant is missing.`
        );
        return null;
      }

      return {
        id: existingProduct.id,
        title: item.title,
        handle: item.handle,
        description: item.description,
        thumbnail: item.image,
        images: [
          {
            url: item.image,
          },
        ],
        weight: item.weight,
        metadata: {
          hero_tags: item.heroTags,
        },
        variants: [
          {
            id: primaryVariantId,
            title: item.variantTitle,
            sku: item.sku,
            prices: item.prices,
          },
        ],
      };
    })
    .filter((update): update is CatalogUpdate => Boolean(update));

  if (!updates.length) {
    logger.warn("No matching products were found for catalog sync.");
    return;
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: updates,
    },
  });

  logger.info(`Catalog sync applied to ${updates.length} product(s).`);
}
