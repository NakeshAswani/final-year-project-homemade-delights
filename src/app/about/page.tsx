export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 my-8 py-8 rounded-lg bg-gray-50">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">About HomeMade Delights</h1>
                <p className="text-xl text-gray-600 mb-8">
                    Connecting Food Lovers with Local Culinary Talent
                </p>
            </div>

            <div className="my-16">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Our Story</h2>
                <p className="text-gray-600 text-lg leading-[48px] p-8 pt-0">
                    HomeMade Delights was born from a simple idea: everyone deserves access to delicious,
                    homemade food made with care and passion. We bridge the gap between talented local home chefs
                    and community members who appreciate authentic, homemade meals. Our platform celebrates
                    traditional recipes, culinary creativity, and the warmth of home-cooked food.
                </p>
            </div>

            <div className="mb-16">
                <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6">
                        <div className="text-4xl mb-4">👩🍳</div>
                        <h3 className="text-xl font-semibold mb-3">Discover Local Chefs</h3>
                        <p className="text-gray-600">Explore hidden culinary gems in your neighborhood</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="text-4xl mb-4">📱</div>
                        <h3 className="text-xl font-semibold mb-3">Order Online</h3>
                        <p className="text-gray-600">Browse menus and place orders directly through our platform</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="text-4xl mb-4">🍽️</div>
                        <h3 className="text-xl font-semibold mb-3">Enjoy Homemade Goodness</h3>
                        <p className="text-gray-600">Receive fresh, made-with-love meals right to your door</p>
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-lg">
                <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Why Choose HomeMade Delights</h2>
                <div className="grid gap-6 md:grid-cols-2 p-6">
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">🍯 Authentic Flavors</h3>
                        <p className="text-gray-600">Experience true homemade taste crafted with traditional techniques</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">🤝 Support Local</h3>
                        <p className="text-gray-600">Directly support home chefs and strengthen your community</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">🌱 Quality Ingredients</h3>
                        <p className="text-gray-600">All meals made with fresh, carefully selected ingredients</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">❤️ Made with Love</h3>
                        <p className="text-gray-600">Every dish prepared with passion and attention to detail</p>
                    </div>
                </div>
            </div>
        </div>
    )
}