<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->


# Initiating Project:
1.npx create-next-app@latest  (version = "next": "15.3.2")
2.npm run dev

# Install dependencies:
1. shadcn





# make header.jsx in components folder 




# convex for databases
npm install convex
npx convex dev("convex": "^1.24.1")
make a convex-client-provider in components



# for authentication
npm install @clerk/nextjs("@clerk/nextjs": "^6.19.4")
The clerkMiddleware helper enables authentication and is where you'll configure your protected routes.
it run before the application and if user is not signed in then i will not allow to go to the protected routes
in the app/layout.jsx directory 





after it we created auth folder for default routing
sign-in/[[...sign-in]]/page.jsx
sign-up/[[...sign-up]]//page.jsx
create a file into auth/layout.jsx  for authentication


in layout.jsx  just modify the page and add a backgroud image.


with the authentication we want to create a schema for user database.

so we crrate a file in convex folder/schema.jsx

after creating this schema , we create afile convex/auth.config.js for setting the issuer URL 
issuer URL in .env NEXT_CLERK_FRONTEND_ALI_URL

create a file into convex/users.js
Mutation for storing current user


create a folder for hooks
hooks/user-store-user.js
Calling the store user mutation from React
You can call this mutation when the user logs in from a useEffect hook. After the mutation succeeds you can update local state to reflect that the user has been stored.
use into components/headers


npm i next-spinners --legacy-peer-deps

# Deployment used by `npx convex dev`



[//]: # (npx inngest-cli@latest dev)
[//]: # (npx convex dev )
[//]: # (npx convex run seed:seedDatabase  )





***DataBase***


1.Phase is Scheme  /convex/schema
2.Phase is How we will communicate to our database means how we query to database and how we updates the values.  /hooks/use-convex-query
3.Phase is how we will store the data in the database..



In Convex, ctx is the context object passed as the first argument to every server function—queries, mutations, and actions. It provides access to services and utilities needed within these functions, such as database access, authentication, file storage, and more.

The exact shape of ctx depends on the function type:

Query functions: ctx includes db (for reading from the database), auth (for authentication), and storage (for file storage) [QueryCtx].
Mutation functions: ctx includes db (for reading and writing), auth, storage, and scheduler (for scheduling future tasks) [MutationCtx].
Action functions: ctx includes runQuery, runMutation, runAction (to call other functions), auth, scheduler, storage, and vectorSearch [ActionCtx].

//seed the data: 


***Backend***
1.convex/user/groups/expenses/settlement/contact/email/inngest/dashboard

2.middlewares





