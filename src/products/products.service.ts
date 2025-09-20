import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    let pictureUrl: string | null = null;

    // Handle file upload to Supabase Storage if file is provided
    if (file) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const { data, error } = await this.supabase.getClient().storage
        .from('product-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.getClient().storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      pictureUrl = urlData.publicUrl;
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        picture: pictureUrl,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(query: ProductQueryDto) {
    const { categoryId, minPrice, maxPrice, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File) {
    const existingProduct = await this.findOne(id);

    let pictureUrl = existingProduct.picture;

    // Handle file upload to Supabase Storage if new file is provided
    if (file) {
      // Delete old image if exists
      if (existingProduct.picture) {
        const oldFileName = existingProduct.picture.split('/').pop();
        await this.supabase.getClient().storage
          .from('product-images')
          .remove([oldFileName!]);
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const { data, error } = await this.supabase.getClient().storage
        .from('product-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.getClient().storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      pictureUrl = urlData.publicUrl;
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        picture: pictureUrl,
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    // Delete image from Supabase Storage if exists
    if (product.picture) {
      const fileName = product.picture.split('/').pop();
      await this.supabase.getClient().storage
        .from('product-images')
        .remove([fileName!]);
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}

