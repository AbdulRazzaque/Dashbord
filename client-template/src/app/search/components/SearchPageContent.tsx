"use client";

import logo from "@/public/logo.png";

import { useEffect, useState } from "react";
import type { ProductData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { searchProductsLanding } from "@/lib/http/api";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";


export default function SearchPageContent() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const params = useSearchParams();
  const queryP = params.get("q");

  const { data, isLoading: productsLoading } = useQuery({
    queryKey: ["searchProductsLanding", queryP],
    queryFn: async () => {
      return await searchProductsLanding(String(queryP)).then(
        (res) => res.data
      );
    },
  });

  // Extract unique brands for filters
  const brands = [
    //@ts-ignore
    ...new Set(products.map((product) => product.brandId?._id)),
  ].filter(Boolean);

  // Get minimum price from variants
  const getMinPrice = (product: ProductData) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return Math.min(...product.variants.map((variant) => variant.rate));
  };

  // Get maximum price from variants
  const getMaxPrice = (product: ProductData) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return Math.max(...product.variants.map((variant) => variant.rate));
  };

  // Get discount percentage
  const getDiscountPercentage = (product: ProductData) => {
    if (!product.variants || product.variants.length === 0) return 0;
    const variant = product.variants[0];
    return variant.discount;
  };

  useEffect(() => {
    if (data) {
      setProducts(data.products);
      setFilteredProducts(data.products);
    }
  }, [data]);

  useEffect(() => {
    if (products.length > 0) {
      let result = [...products];

      // Filter by active status
      if (showActiveOnly) {
        result = result.filter((product) => product.isActive);
      }

      // Filter by featured status
      if (showFeaturedOnly) {
        result = result.filter((product) => product.isFeatured);
      }

      // Apply brand filter
      if (selectedBrands.length > 0) {
        result = result.filter((product) =>
          selectedBrands.includes(product.brandId?._id)
        );
      }

      // Apply price range filter
      if (priceRange.length > 0) {
        result = result.filter((product) => {
          const minPrice = getMinPrice(product);
          if (priceRange.includes("under-50") && minPrice < 50) return true;
          if (
            priceRange.includes("50-100") &&
            minPrice >= 50 &&
            minPrice <= 100
          )
            return true;
          if (
            priceRange.includes("100-200") &&
            minPrice > 100 &&
            minPrice <= 200
          )
            return true;
          if (priceRange.includes("over-200") && minPrice > 200) return true;
          return false;
        });
      }

      // Apply sorting
      if (sortBy === "price-asc") {
        result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
      } else if (sortBy === "price-desc") {
        result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
      } else if (sortBy === "newest") {
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "discount") {
        result.sort(
          (a, b) => getDiscountPercentage(b) - getDiscountPercentage(a)
        );
      } else if (sortBy === "featured") {
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      }

      setFilteredProducts(result);
    }
  }, [
    products,
    sortBy,
    selectedBrands,
    priceRange,
    showFeaturedOnly,
    showActiveOnly,
  ]);

  const handlePriceRangeChange = (value: string) => {
    setPriceRange((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrands((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const resetFilters = () => {
    setPriceRange([]);
    setSelectedBrands([]);
    setSortBy("featured");
    setShowFeaturedOnly(false);
    setShowActiveOnly(true);
  };

  const isLoading = productsLoading;

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        

        <div className="container mx-auto px-4 py-8 flex-grow">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="#" className="hover:text-gray-700">
              Search
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-64 shrink-0">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 sticky top-4">
                <h3 className="font-medium text-lg mb-4">Filters</h3>

                <Accordion
                  type="multiple"
                  defaultValue={["status", "price", "brands"]}
                >
                  <AccordionItem value="status">
                    <AccordionTrigger>Product Status</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="active-only"
                            checked={showActiveOnly}
                            onCheckedChange={() =>
                              setShowActiveOnly(!showActiveOnly)
                            }
                          />
                          <label htmlFor="active-only" className="text-sm">
                            Active Products Only
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="featured-only"
                            checked={showFeaturedOnly}
                            onCheckedChange={() =>
                              setShowFeaturedOnly(!showFeaturedOnly)
                            }
                          />
                          <label htmlFor="featured-only" className="text-sm">
                            Featured Products Only
                          </label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="price">
                    <AccordionTrigger>Price Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="under-50"
                            checked={priceRange.includes("under-50")}
                            onCheckedChange={() =>
                              handlePriceRangeChange("under-50")
                            }
                          />
                          <label htmlFor="under-50" className="text-sm">
                            Under SAR 50
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="50-100"
                            checked={priceRange.includes("50-100")}
                            onCheckedChange={() =>
                              handlePriceRangeChange("50-100")
                            }
                          />
                          <label htmlFor="50-100" className="text-sm">
                            SAR 50 - SAR 100
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="100-200"
                            checked={priceRange.includes("100-200")}
                            onCheckedChange={() =>
                              handlePriceRangeChange("100-200")
                            }
                          />
                          <label htmlFor="100-200" className="text-sm">
                            SAR 100 - SAR 200
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="over-200"
                            checked={priceRange.includes("over-200")}
                            onCheckedChange={() =>
                              handlePriceRangeChange("over-200")
                            }
                          />
                          <label htmlFor="over-200" className="text-sm">
                            Over SAR 200
                          </label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="brands">
                    <AccordionTrigger>Brands</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {brands.map((brandId) => {
                          const brand = products.find(
                            (p) => p.brandId?._id === brandId
                          )?.brandId;
                          return (
                            <div
                              key={brandId}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`brand-${brandId}`}
                                checked={selectedBrands.includes(brandId)}
                                onCheckedChange={() =>
                                  handleBrandChange(brandId)
                                }
                              />
                              <label
                                htmlFor={`brand-${brandId}`}
                                className="text-sm"
                              >
                                {brand?.name || brandId}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort Controls */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  products
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="discount">Highest Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex flex-col">
                      <Skeleton className="h-64 w-full rounded-lg mb-3" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                  <></>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filter criteria
                  </p>
                  <Button onClick={resetFilters}>Clear filters</Button>
                </div>
              )}

              {/* Pagination */}
              {/* {filteredProducts.length > 0 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center gap-1">
                  <Button variant="outline" size="icon" disabled>
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-primary text-primary-foreground"
                  >
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            )} */}
            </div>
          </div>
        </div>

    
      </div>
    </>
  );
}
