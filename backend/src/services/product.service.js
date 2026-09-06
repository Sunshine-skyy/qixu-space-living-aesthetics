import prisma from '../config/database.js';

const sortMap = {
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  rating_desc: { rating: 'desc' },
  sales_desc: { sales: 'desc' },
  newest: { createdAt: 'desc' }
};

export async function listProducts(query) {
  const { page = 1, pageSize = 20, search, category, style, minPrice, maxPrice, sort = 'newest' } = query;
  const currentPage = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const where = {
    ...(category && category !== 'all' ? { category } : {}),
    ...(style && style !== 'all' ? { style } : {}),
    ...((minPrice !== undefined || maxPrice !== undefined) ? {
      price: {
        ...(minPrice !== undefined ? { gte: Number(minPrice) } : {}),
        ...(maxPrice !== undefined ? { lte: Number(maxPrice) } : {})
      }
    } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { style: { contains: search } }
      ]
    } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy: sortMap[sort] || sortMap.newest, skip: (currentPage - 1) * take, take }),
    prisma.product.count({ where })
  ]);

  return {
    items,
    pagination: { page: currentPage, pageSize: take, total, totalPages: Math.ceil(total / take) }
  };
}

export function getProduct(id) {
  return prisma.product.findUnique({ where: { id: Number(id) } });
}
