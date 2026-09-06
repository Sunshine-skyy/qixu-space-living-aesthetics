import prisma from '../config/database.js';

export function listDesigns(userId) {
  return prisma.design.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
}

export function getDesign(userId, id) {
  return prisma.design.findFirst({ where: { id, userId } });
}

export function createDesign(userId, data) {
  return prisma.design.create({ data: { ...data, userId } });
}

export function updateDesign(userId, id, data) {
  return prisma.design.updateMany({ where: { id, userId }, data });
}

export function deleteDesign(userId, id) {
  return prisma.design.deleteMany({ where: { id, userId } });
}
