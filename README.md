# Product Application

#### Project Requirements
> Functional
- User Management System with authentication
    * /api/auth/register > Sign Up
    * /api/auth/login > Sign In
    * /api/auth/logout > Sign Out (My Addition)
- Protect the urls
- Product Table
    * /api/products - Create a product - POST
    * /api/products - List them - GET
        - ?categoryId=1 - Hnadle Query Params with category
        - ?minPrice=10&maxPrice=100  - with Price Range
        - ?page=1&limit10 - Pagination
    * /api/products/{id} - Get one of them - Get
    * /api/products/{id} - Update product details - PATCH
    * /api/products/{id} - Delete Product - DELETE
    * Handle Errors such as 404 not foudn
- Category Table
    * /api/catergories - Creat a category: Name must be unique, there has to be a description - POST
    * /api/categories - List all of them - GET
    * /api/categories - Update one - PATCH
    * /api/categories - Delete one - DELETE

> Non-Functional
* Use Solid Principles