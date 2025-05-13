import React from 'react'
import ProductCard from '../common/ProductCard'
import { IExtendedProduct } from '@/lib/interfaces'

export default function FeaturedProducts({ products }: { products: IExtendedProduct[] }) {
    return (
        <section>
            <h2 className="text-3xl font-semibold mb-6 text-center">Featured Products</h2>
            {
               Array.isArray(products) && products?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : <div className="text-xl">Out Of Stock! Sorry For The Inconvenience...</div>
            }
        </section>
    )
}