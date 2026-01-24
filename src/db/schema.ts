import {
    pgTable,
    serial,
    varchar,
    text,
    timestamp,
    boolean,
    integer,
    decimal,
    json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ===============================================
// Products Table
// Stores synchronized products from Printful
// ===============================================
export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    printfulId: varchar("printful_id", { length: 255 }).unique().notNull(),
    externalId: varchar("external_id", { length: 255 }),
    name: varchar("name", { length: 500 }).notNull(),
    description: text("description"),
    thumbnailUrl: varchar("thumbnail_url", { length: 1000 }),
    variantsCount: integer("variants_count").default(0),
    syncedCount: integer("synced_count").default(0),
    isIgnored: boolean("is_ignored").default(false),
    syncedAt: timestamp("synced_at").defaultNow(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===============================================
// Product Variants Table
// Stores product variants (size, color, price)
// ===============================================
export const productVariants = pgTable("product_variants", {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
        .references(() => products.id, { onDelete: "cascade" })
        .notNull(),
    printfulVariantId: varchar("printful_variant_id", { length: 255 })
        .unique()
        .notNull(),
    externalId: varchar("external_id", { length: 255 }),
    name: varchar("name", { length: 500 }).notNull(),
    size: varchar("size", { length: 100 }),
    color: varchar("color", { length: 100 }),
    retailPrice: decimal("retail_price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("USD"),
    previewUrl: varchar("preview_url", { length: 1000 }),
    files: json("files").default([]),
    options: json("options").default([]),
    inStock: boolean("in_stock").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===============================================
// Categories Table
// Stores synchronized categories from Printful
// ===============================================
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    printfulId: integer("printful_id").unique().notNull(),
    parentId: integer("parent_id"),
    name: varchar("name", { length: 255 }).notNull(),
    imageUrl: varchar("image_url", { length: 1000 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===============================================
// Product Categories Junction Table
// ===============================================
export const productCategories = pgTable("product_categories", {
    productId: integer("product_id")
        .references(() => products.id, { onDelete: "cascade" })
        .notNull(),
    categoryId: integer("category_id")
        .references(() => categories.id, { onDelete: "cascade" })
        .notNull(),
}, (t) => ({
    pk: [t.productId, t.categoryId],
}));

// ===============================================
// Relations
// ===============================================
export const productsRelations = relations(products, ({ many }) => ({
    variants: many(productVariants),
    categories: many(productCategories),
}));

export const productVariantsRelations = relations(
    productVariants,
    ({ one }) => ({
        product: one(products, {
            fields: [productVariants.productId],
            references: [products.id],
        }),
    })
);

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(productCategories),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
    product: one(products, {
        fields: [productCategories.productId],
        references: [products.id],
    }),
    category: one(categories, {
        fields: [productCategories.categoryId],
        references: [categories.id],
    }),
}));

// ===============================================
// Types
// ===============================================
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
