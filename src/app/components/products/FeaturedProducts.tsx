import React from 'react'
import ProductCard from '../common/ProductCard'
import { IExtendedProduct } from '@/lib/interfaces'
import Link from 'next/link'

export default function FeaturedProducts({ products }: { products: IExtendedProduct[] }) {
    
    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold">Featured Products</h2>
                <Link
                    href="/products"
                    className="text-primary hover:text-blue-500 hover:underline transition-colors flex items-center gap-2"
                >
                    View All Products
                    <span aria-hidden="true">→</span>
                </Link>
            </div>
            {
                Array.isArray(products) && products?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products?.map((product, index) =>  {
                            return index < 4 ? <ProductCard key={product.id} product={product} /> : null
                        })}
                    </div>
                ) : <div className="text-xl">Out Of Stock! Sorry For The Inconvenience...</div>
            }
        </section>
    )
}