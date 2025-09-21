import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Product Management API')
    .setDescription(`
      A comprehensive product management system with user authentication, product catalog, and category management.
      
      ## Features
      - **User Authentication**: Register, login, and logout with JWT tokens
      - **Product Management**: CRUD operations for products with image upload
      - **Category Management**: CRUD operations for product categories
      - **Advanced Filtering**: Filter products by category, price range, and pagination
      - **File Upload**: Support for product images via Supabase Storage
      
      ## Authentication
      Most endpoints require authentication. Use the login endpoint to get a JWT token, then include it in the Authorization header as "Bearer {token}".
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Products', 'Product management endpoints')
    .addTag('Categories', 'Category management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger documentation is available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
