import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
    try {
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
          throw new BadRequestException(`Failed to upload image: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = this.supabase.getClient().storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        pictureUrl = urlData.publicUrl;
      }

      return await this.prisma.product.create({
        data: {
          ...createProductDto,
          picture: pictureUrl,
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Product with this name already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid category ID');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll(query: ProductQueryDto) {
    try {
      const { categoryId, minPrice, maxPrice, page = 1, limit = 10 } = query;
      
      // Validate pagination parameters
      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }
      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
      
      const skip = (page - 1) * limit;
      const where: any = {};

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) {
          if (minPrice < 0) {
            throw new BadRequestException('Minimum price cannot be negative');
          }
          where.price.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          if (maxPrice < 0) {
            throw new BadRequestException('Maximum price cannot be negative');
          }
          where.price.lte = maxPrice;
        }
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
          throw new BadRequestException('Minimum price cannot be greater than maximum price');
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async findOne(id: string) {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File) {
    try {
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
          throw new BadRequestException(`Failed to upload image: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = this.supabase.getClient().storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        pictureUrl = urlData.publicUrl;
      }

      return await this.prisma.product.update({
        where: { id },
        data: {
          ...updateProductDto,
          picture: pictureUrl,
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Product with this name already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid category ID');
      }
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);

      // Delete image from Supabase Storage if exists
      if (product.picture) {
        const fileName = product.picture.split('/').pop();
        await this.supabase.getClient().storage
          .from('product-images')
          .remove([fileName!]);
      }

      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete product');
    }
  }
}

