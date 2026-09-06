-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `style` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `originalPrice` INTEGER NOT NULL,
    `rating` DECIMAL(2, 1) NOT NULL,
    `sales` INTEGER NOT NULL DEFAULT 0,
    `image` TEXT NOT NULL,
    `tags` JSON NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `products_category_idx`(`category`),
    INDEX `products_style_idx`(`style`),
    INDEX `products_price_idx`(`price`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
