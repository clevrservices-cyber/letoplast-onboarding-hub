# Letoplast Employee Onboarding Portal

## What will be built
- A responsive onboarding workspace at the home page using Letoplast’s white, deep-blue, and orange visual identity.
- An employee form with required full name, an accessible calendar date picker, and this exact language list: English, Czech, Slovak, Polish, German, Ukrainian, Romanian, Hungarian.
- A generated document dashboard containing the five requested onboarding documents, with employee details, status labels, and working preview/download actions.
- A document preview dialog that shows personalized mock document text and a clearly marked translated-content sample in the selected language.

## Interaction and states
- Validate required inputs and default the start date to the next Monday.
- Simulate document generation with a visible loading state, then populate the dashboard from mock data.
- Keep employee name, start date, selected language, generated documents, and the open preview in React state only.
- Generate downloadable mock PDF files entirely in the browser; no data is stored or sent to a server.

## Technical details
- Use React, Tailwind CSS, Lucide icons, and accessible shadcn-style controls already compatible with the project.
- Define all brand colors, typography, shadows, and animations as semantic tokens in the global design system.
- Add unique home-page title, description, Open Graph, and Twitter metadata.
- Verify the finished page at desktop and mobile sizes, including generation, preview, language labeling, and download behavior.
