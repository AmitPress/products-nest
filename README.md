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
- Use SOLID principles and organize code into NestJS modules following best practices.
- Deploy backend and database online (free-tier: Render/Vercel/Railway + Supabase/Neon).
- Write clean, maintainable code with consistent naming.
- Ensure all CRUD operations are efficient and well-optimized
- Use Git with clear, frequent commit messages.

#### Project Overview
Lets understand how the project is supposed to run
- First make sure you have cloned the repo correctly.
- Then just download the dependencies using npm i (use --legacy-peer-deps to resolve the packgages in order to their mutual dependency)
- Then head to the `/auth/signin` to login. Mind you must confirm the gmail.
- Next use the token with the request interceptor (I recommend), and do the rest testing with `/api/docs`
- After that, just make sure you have created the categories first cz it will be need when creating the product.

This way you will get the project running fine.

#### Notes
* This project does not take the testing part into consideration hence the files for testing isn't generated as well.
* This project assumes the scope of the excercise to be limited and can be stretched further if needed in the future.
* All the features are implemented with the constraints.
* Any suggestion will be taken into consideration, thereafter.
