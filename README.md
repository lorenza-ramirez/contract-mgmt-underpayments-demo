# Contract management and underpayments demo

A clickable prototype: upload payer contracts (one or many), read them with Claude next to the real PDF pages,
review and publish them to a repository, then see underpaid claims, appeals and analytics.

All payers, patients and amounts are fictional. Do not commit real contracts to this repository.

## Run it

1. Install: `npm install`
2. Add your key: create `.env` containing `ANTHROPIC_API_KEY=your-key` (it is git-ignored)
3. Start with the API function: `npx vercel dev`
   (`npm run dev` starts the UI only, and AI features will show their fallbacks)

## Deploy

Import the repo in Vercel, add the `ANTHROPIC_API_KEY` environment variable, and deploy.

## Notes

- The browser never sees the key. `src/ATI_Demo.jsx` calls `/api/claude`, which forwards to the Anthropic API.
- PDF pages are drawn with pdf.js, loaded from cdnjs when you first open a PDF.
- Claims are synthetic and tied to the Cascadia sample contract.
