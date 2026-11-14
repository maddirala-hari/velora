# VÉLORA — Fashion Storefront & DevOps Project

A responsive fashion e-commerce demo built as the application foundation for one end-to-end DevOps learning project.

## Application features
- React + Vite storefront with responsive styling and motion effects
- Express REST API with an in-memory product catalogue
- Product categories and search
- Product details, favourites, shopping bag and quantity controls
- Demo checkout endpoint (no payment is collected)
- API health endpoint

## Technology
- JavaScript / Node.js 24 compatible
- React 18, Vite 6
- Express 4
- Docker and Docker Compose configuration included

## Run locally
Requirements: Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run dev
```

Open http://localhost:5173. Keep the terminal open while using the site.

The API is available at:
- http://localhost:5000/api/health
- http://localhost:5000/api/products

Vite proxies `/api` requests to the Express API on port 5000. This proxy is configured in `vite.config.js` so the storefront can load products during local development.

## Production build

```bash
npm run build
npm start
```

Open http://localhost:5000. In production mode Express serves the compiled frontend and API from one process.

## Docker

```bash
docker compose up --build -d
```

Open http://localhost:5000. Stop with:

```bash
docker compose down
```

## Important project boundaries
- Product records are currently stored in the Express process memory. A persistent database will be introduced in a later project stage.
- Checkout is a demonstration only. It does not collect card details or process payments.
- Product photography and web fonts are loaded from external providers and require internet access.
- Never commit real credentials, access keys, `.env` files, or private keys to GitHub.

## Repository workflow
This folder is ready to initialise as a Git repository. The next learning stage is Git, GitHub repository creation, branches, commits, push, pull requests and merge workflow. Jenkins, Terraform, AWS infrastructure, Kubernetes and monitoring will be added in their planned stages against this same application rather than as unrelated sample projects.
