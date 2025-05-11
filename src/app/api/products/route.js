import { NextResponse } from 'next/server';
import productsData from '@/data/ProductsData.json';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let products = [...productsData.products];

    // Apply category filter (multiple categories)
    const categories = searchParams.getAll('category');
    if (categories.length > 0) {
      products = products.filter(product =>
        categories.some(category => 
          product.category.toLowerCase() === category.toLowerCase()
        )
      );
    }

    // Apply tags filter
    const tags = searchParams.getAll('tags');
    if (tags.length > 0) {
      products = products.filter(product =>
        tags.some(tag =>
          product.tags.some(productTag =>
            productTag.toLowerCase() === tag.toLowerCase()
          )
        )
      );
    }

    // Apply price range filters
    const priceGte = searchParams.get('price[gte]');
    const priceLte = searchParams.get('price[lte]');
    if (priceGte) {
      products = products.filter(product => product.price >= Number(priceGte));
    }
    if (priceLte) {
      products = products.filter(product => product.price <= Number(priceLte));
    }

    // Apply name search
    const name = searchParams.get('name');
    if (name) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    // Apply sorting
    const sort = searchParams.get('sort');
    if (sort) {
      const [field, order] = sort.startsWith('-') 
        ? [sort.slice(1), 'desc'] 
        : [sort, 'asc'];
      
      products.sort((a, b) => {
        if (order === 'asc') {
          return a[field] > b[field] ? 1 : -1;
        }
        return a[field] < b[field] ? 1 : -1;
      });
    }

    // Get total count before pagination
    const total = products.length;

    // Apply pagination
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 8;
    const skip = (page - 1) * limit;

    products = products.slice(skip, skip + limit);

    return NextResponse.json({
      status: 'success',
      total,
      data: products
    });
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
