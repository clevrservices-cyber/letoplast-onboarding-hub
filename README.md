# Letoplast Onboarding Hub

You are an expert frontend developer. Your task is to build the frontend ONLY for a new employee onboarding portal for a company called "Letoplast". 

CRITICAL CONSTRAINT: You are building the FRONTEND ONLY. Do not write backend logic, database schemas, or server-side translation scripts. Use mock data and mock API calls to simulate the backend.

Tech Stack: React, Tailwind CSS, shadcn/ui, Lucide React icons.

Design Style: Clean, modern, corporate, and professional (Letoplast brand colors: use a clean white background with deep blue and vibrant orange accents).

### Core Features & UI Requirements:

1. Onboarding Form (Sidebar or Top Card):

   - Input field for "Employee Full Name" (Required).

   - Date picker for "Start Date" (Required, default to today's date or next Monday).

   - Dropdown selector for "Document Language". The options MUST exactly match these languages: [INSERT_LANGUAGES_HERE].

   - A primary button: "Generate Onboarding Pack".

2. Document Dashboard (Main View):

   - Once the user clicks "Generate", display a clean data table or card grid of required Letoplast onboarding documents. 

   - Mock Document List: 

     1. Non-Disclosure Agreement (NDA)

     2. Employee Handbook Acknowledgment

     3. Health & Safety Guidelines

     4. IT Equipment & Access Request

     5. Direct Deposit & Tax Forms

   - Each document card/row must show:

     - Document Title

     - Status badge (e.g., "Pending Signature", "Ready to Download")

     - The Employee's Name injected into the title or subtitle (e.g., "NDA - John Doe")

     - The Start Date displayed clearly.

     - A "Download PDF" button and a "View in [Selected Language]" button.

3. Document Preview Modal:

   - When "View" is clicked, open a modal showing a mock preview of the document.

   - The mock text should show placeholders like `[Employee Name]` already replaced with the actual inputted name.

   - Include a mock "Translated Content" block to simulate that the text is in the selected language.

### State Management:

- Use React state (or Zustand/Context) to hold the `employeeName`, `startDate`, `selectedLanguage`, and `generatedDocuments`.

- When the form is submitted, map the mock documents, inject the `employeeName` and `startDate` into the document metadata, and update the UI.

Please generate the complete, responsive frontend code. Ensure the UI is beautiful, accessible, and provides loading states when "generating" the documents.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/95c4d927-fa78-4ebe-9437-48072c18e98e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
