import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { name: '现代简约布艺沙发', category: 'sofa', style: 'modern', price: 3999, originalPrice: 4999, rating: 4.5, sales: 128, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', tags: ['热销', '新品', '限时折扣'], description: '舒适布艺沙发，现代简约设计。' },
  { name: '实木餐桌椅组合', category: 'table', style: 'nordic', price: 2599, originalPrice: 2999, rating: 4.8, sales: 89, image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=600&q=80', tags: ['热销', '包邮'], description: '北欧风格实木餐桌椅组合。' },
  { name: '人体工学办公椅', category: 'seating', style: 'modern', price: 1599, originalPrice: 1999, rating: 4.7, sales: 156, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80', tags: ['热销', '新品'], description: '可调节人体工学办公椅。' },
  { name: '现代简约双人床', category: 'bed', style: 'modern', price: 2899, originalPrice: 3299, rating: 4.6, sales: 67, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80', tags: ['新品'], description: '简约风格实木双人床。' },
  { name: '工业风铁艺书架', category: 'storage', style: 'industrial', price: 899, originalPrice: 1199, rating: 4.3, sales: 42, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80', tags: ['限时折扣'], description: '工业风格铁艺书架。' },
  { name: '北欧创意吊灯', category: 'lighting', style: 'nordic', price: 499, originalPrice: 699, rating: 4.9, sales: 203, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', tags: ['热销', '包邮'], description: '北欧风格创意吊灯。' },
  { name: '传统中式茶几', category: 'table', style: 'traditional', price: 1899, originalPrice: 2299, rating: 4.4, sales: 31, image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=600&q=80', tags: [], description: '传统中式实木茶几。' },
  { name: '现代简约地毯', category: 'decor', style: 'modern', price: 299, originalPrice: 399, rating: 4.2, sales: 78, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', tags: ['包邮'], description: '现代简约风格客厅地毯。' }
];

await prisma.product.deleteMany();
await prisma.product.createMany({ data: products });
await prisma.$disconnect();
