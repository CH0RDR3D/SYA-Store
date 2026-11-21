"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const hasSpecs = Boolean(
    product.material ||
    product.origin_country ||
    product.type ||
    product.weight ||
    (product.length && product.width && product.height)
  )

  const description = product.description || product.subtitle

  return (
    <div className="text-small-regular py-4 space-y-6 text-[var(--text-secondary)]">
      {description ? (
        <div className="space-y-1.5">
          <span className="font-semibold text-[var(--text-primary)] text-xs uppercase tracking-wider">
            Description
          </span>
          <p className="whitespace-pre-line leading-relaxed text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
      ) : (
        <div className="py-1 text-sm text-[var(--text-secondary)] italic">
          No additional description provided for this product.
        </div>
      )}

      {hasSpecs && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-[var(--surface-border)]">
          {product.material && (
            <div>
              <span className="font-semibold text-[var(--text-primary)]">Material</span>
              <p>{product.material}</p>
            </div>
          )}
          {product.origin_country && (
            <div>
              <span className="font-semibold text-[var(--text-primary)]">Country of origin</span>
              <p>{product.origin_country}</p>
            </div>
          )}
          {product.type && (
            <div>
              <span className="font-semibold text-[var(--text-primary)]">Type</span>
              <p>{product.type.value}</p>
            </div>
          )}
          {product.weight && (
            <div>
              <span className="font-semibold text-[var(--text-primary)]">Weight</span>
              <p>{product.weight} g</p>
            </div>
          )}
          {product.length && product.width && product.height && (
            <div>
              <span className="font-semibold text-[var(--text-primary)]">Dimensions</span>
              <p>{`${product.length}L x ${product.width}W x ${product.height}H`}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
