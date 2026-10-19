import { Metadata } from "next"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { getProductsList, getDailyCuratedProductIds, getProductsById } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import CustomHomeLayout from "@modules/home/components/custom-home"
import { shuffle } from "lodash"

export const revalidate = 0


export const metadata: Metadata = {
  title: "SYA Store - Lusaka's Premier Online Shopping Destination",
  description:
    "SYA Store is your one-stop online shop for a wide range of products, from electronics to fashion. Enjoy fast delivery and excellent customer service. Lusaka's Premier Online Shopping Destination. Shop now and experience the convenience of online shopping with SYA Store.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  // Fetch categories, collections and products from Medusa backend
  const categories = await listCategories()
  const [{ collections }, { response: { products: generalProducts } }] =
    await Promise.all([
      listCollections({ limit: 20, fields: "*products" }),
      getProductsList({
        countryCode,
        queryParams: { limit: 100 },
      }),
    ])

  const normalizeCategory = (value?: string | null) =>
    value?.toLowerCase().replace(/[^a-z0-9]/g, "") || ""
  const featuredCategoryTerms = [
    "health",
    "beauty",
    "wellness",
    "skincare",
    "cosmetics",
    "personalcare",
    "solar",
    "renewable",
    "green",
    "greenenergy",
    "cleanenergy",
    "inverter",
    "photovoltaic",
    "offgrid",
  ]
  const spotlightCategories = categories.filter((category) => {
    const categoryText = normalizeCategory(`${category.name} ${category.handle}`)
    return featuredCategoryTerms.some((term) => categoryText.includes(term))
  })
  const spotlightProductResults = await Promise.all(
    spotlightCategories.map(({ id }) =>
      getProductsList({
        countryCode,
        queryParams: { category_id: id, limit: 100 },
      })
    )
  )
  const products = Array.from(
    new Map(
      [
        ...generalProducts,
        ...spotlightProductResults.flatMap(({ response }) => response.products),
      ].map((product) => [product.id, product])
    ).values()
  )

  // Dynamically fetch today's trending "Editor's Pick" products
  const editorsPickIds = await getDailyCuratedProductIds({
    countryCode,
    kind: "editors-pick",
    count: 12,
  })
  const editorsPickProducts = await getProductsById({
    ids: editorsPickIds,
    regionId: region.id,
  })

  return (
    <CustomHomeLayout
      collections={collections || []}
      categories={categories || []}
      products={products || []}
      editorsPickProducts={editorsPickProducts}
      region={region}
    />
  )
}
