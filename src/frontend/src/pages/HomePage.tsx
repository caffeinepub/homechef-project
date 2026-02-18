import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Clock, Heart, Calendar } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Authentic Homemade Food, Made with{' '}
                <span className="text-primary">Love</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Experience the taste of home with our chef-prepared sweets, Chinese cuisine, biryani, and more.
                Every dish is made fresh in our home kitchen, just for you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate({ to: '/menu' })}>
                  Browse Menu
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/book-chef' })}>
                  Book Our Chef
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/home-hero.dim_1600x900.png"
                alt="Delicious homemade food"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose HomeChef Kitchen?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We bring the warmth and authenticity of home cooking to your table
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <ChefHat className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Expert Chef</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Prepared by an experienced home chef with passion for authentic flavors
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Fresh & Made to Order</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Every dish is prepared fresh after you place your order
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Home Kitchen Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Made with love in a home kitchen, just like your family would make it
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Event Catering</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Book our chef for your home parties and special events
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Specialties</h2>
            <p className="text-muted-foreground">Explore our diverse menu of homemade delights</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {['Sweets', 'Chinese', 'Biryani'].map((category) => (
              <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/menu' })}>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{category}</CardTitle>
                  <CardDescription>Authentic homemade {category.toLowerCase()}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => navigate({ to: '/menu' })}>
              View Full Menu
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Ready to Order?</CardTitle>
            <CardDescription className="text-lg">
              Browse our menu and enjoy authentic homemade food delivered to your door
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" onClick={() => navigate({ to: '/menu' })}>
              Order Now
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
