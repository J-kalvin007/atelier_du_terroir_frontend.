import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | L'Atelier du Terroir`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
