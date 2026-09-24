import { createFileRoute } from "@tanstack/react-router";
import { addDays, format, startOfDay } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileCheck2,
  FileLock2,
  FileText,
  Globe2,
  HardHat,
  Laptop2,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Employee Onboarding | Letoplast" },
      {
        name: "description",
        content: "Prepare and review personalized Letoplast employee onboarding documents.",
      },
      { property: "og:title", content: "Employee Onboarding | Letoplast" },
      {
        property: "og:description",
        content: "Prepare and review personalized Letoplast employee onboarding documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LANGUAGES = [
  "English",
  "Czech",
  "Slovak",
  "Polish",
  "German",
  "Ukrainian",
  "Romanian",
  "Hungarian",
] as const;

type Language = (typeof LANGUAGES)[number];
type DocumentStatus = "Pending Signature" | "Ready to Download";

type GeneratedDocument = {
  id: number;
  title: string;
  description: string;
  employeeName: string;
  startDate: Date;
  language: Language;
  status: DocumentStatus;
};

const DOCUMENT_TEMPLATES = [
  { title: "Non-Disclosure Agreement (NDA)", description: "Confidentiality and information protection", icon: FileLock2 },
  { title: "Employee Handbook Acknowledgment", description: "Company policies and workplace standards", icon: FileCheck2 },
  { title: "Health & Safety Guidelines", description: "Essential workplace safety procedures", icon: HardHat },
  { title: "IT Equipment & Access Request", description: "Devices, accounts, and system permissions", icon: Laptop2 },
  { title: "Direct Deposit & Tax Forms", description: "Payroll and statutory information", icon: WalletCards },
] as const;

const TRANSLATED_COPY: Record<Language, string> = {
  English: "I confirm that I have read, understood, and agree to follow the policies described in this document.",
  Czech: "Potvrzuji, že jsem si přečetl/a zásady popsané v tomto dokumentu, rozumím jim a souhlasím s jejich dodržováním.",
  Slovak: "Potvrdzujem, že som si prečítal/a zásady uvedené v tomto dokumente, rozumiem im a súhlasím s ich dodržiavaním.",
  Polish: "Potwierdzam, że zapoznałem(-am) się z zasadami opisanymi w tym dokumencie, rozumiem je i zobowiązuję się ich przestrzegać.",
  German: "Ich bestätige, dass ich die in diesem Dokument beschriebenen Richtlinien gelesen und verstanden habe und ihnen zustimme.",
  Ukrainian: "Я підтверджую, що прочитав(-ла), зрозумів(-ла) та погоджуюся дотримуватися правил, описаних у цьому документі.",
  Romanian: "Confirm că am citit, am înțeles și sunt de acord să respect politicile descrise în acest document.",
  Hungarian: "Megerősítem, hogy elolvastam és megértettem a dokumentumban foglalt irányelveket, és vállalom azok betartását.",
};

function getNextMonday() {
  const today = startOfDay(new Date());
  const day = today.getDay();
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
  return addDays(today, daysUntilMonday);
}

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createMockPdf(document: GeneratedDocument) {
  const lines = [
    "LETOPLAST | EMPLOYEE ONBOARDING",
    document.title,
    `Employee: ${document.employeeName}`,
    `Start date: ${format(document.startDate, "MMMM d, yyyy")}`,
    `Document language: ${document.language}`,
    "",
    "This preview document has been prepared for the employee named above.",
    "Please review all terms and provide the required acknowledgment.",
  ];
  const textCommands = lines
    .map((line, index) => `BT /F1 ${index < 2 ? 16 : 11} Tf 72 ${735 - index * 34} Td (${escapePdfText(line)}) Tj ET`)
    .join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >> endobj",
    `4 0 obj << /Length ${textCommands.length} >> stream\n${textCommands}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  pdf += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function Index() {
  const [employeeName, setEmployeeName] = useState("");
  const [startDate, setStartDate] = useState<Date>(getNextMonday);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("English");
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [previewDocument, setPreviewDocument] = useState<GeneratedDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nameError, setNameError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const completedCount = useMemo(
    () => generatedDocuments.filter((document) => document.status === "Ready to Download").length,
    [generatedDocuments],
  );

  function generateDocuments(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = employeeName.trim();
    if (!cleanName) {
      setNameError("Enter the employee's full name.");
      return;
    }
    setNameError("");
    setIsGenerating(true);
    window.setTimeout(() => {
      setGeneratedDocuments(
        DOCUMENT_TEMPLATES.map((template, index) => ({
          id: index + 1,
          title: template.title,
          description: template.description,
          employeeName: cleanName,
          startDate,
          language: selectedLanguage,
          status: index === 0 || index === 1 ? "Pending Signature" : "Ready to Download",
        })),
      );
      setIsGenerating(false);
    }, 850);
  }

  function downloadDocument(document: GeneratedDocument) {
    const url = URL.createObjectURL(createMockPdf(document));
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${document.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${document.employeeName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-brand-navy" aria-hidden="true">
              <span className="text-lg font-extrabold text-primary-foreground">L</span>
            </div>
            <div>
              <div className="text-lg font-extrabold text-brand-navy">LETO<span className="text-brand-orange">PLAST</span></div>
              <div className="text-[10px] font-bold uppercase text-muted-foreground">People portal</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground sm:flex">
            <ShieldCheck className="size-4 text-success" />
            HR workspace
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-brand-navy text-primary-foreground">
          <div className="subtle-grid absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-primary-foreground/10 px-3 py-1.5 text-xs font-bold uppercase">
                <span className="size-1.5 rounded-full bg-brand-orange" />
                Employee onboarding
              </div>
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">Prepare a new starter's document pack</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-primary-foreground/75 sm:text-base">
                Create a complete, personalized set of onboarding documents in the employee's preferred language.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-10 lg:py-10">
          <aside>
            <div className="portal-shadow border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-6">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-sky text-brand-blue">
                  <UserRound className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-navy">Employee details</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Add the starter's information to prepare their pack.</p>
                </div>
              </div>

              <form onSubmit={generateDocuments} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="employee-name">Employee Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="employee-name"
                    value={employeeName}
                    onChange={(event) => {
                      setEmployeeName(event.target.value);
                      if (nameError) setNameError("");
                    }}
                    placeholder="e.g. John Doe"
                    autoComplete="name"
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={nameError ? "employee-name-error" : undefined}
                    className="h-11 bg-card"
                  />
                  {nameError && <p id="employee-name-error" className="text-xs font-medium text-destructive">{nameError}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="h-11 w-full justify-between bg-card px-3 font-normal">
                        <span className="flex items-center gap-2"><CalendarDays className="text-brand-blue" />{format(startDate, "MMM d, yyyy")}</span>
                        <ChevronDown className="text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          if (date) setStartDate(date);
                          setCalendarOpen(false);
                        }}
                        disabled={{ before: startOfDay(new Date()) }}
                        className="pointer-events-auto p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-language">Document Language</Label>
                  <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language)}>
                    <SelectTrigger id="document-language" className="h-11 bg-card">
                      <span className="flex items-center gap-2"><Globe2 className="size-4 text-brand-blue" /><SelectValue /></span>
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((language) => <SelectItem key={language} value={language}>{language}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" variant="orange" className="h-12 w-full text-sm font-bold" disabled={isGenerating}>
                  {isGenerating ? <><LoaderCircle className="animate-spin" />Generating pack…</> : <>Generate Onboarding Pack<ArrowRight /></>}
                </Button>
              </form>

              <div className="mt-6 border-t border-border pt-5">
                <div className="flex gap-3 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                  This demo keeps all entered information in your browser only.
                </div>
              </div>
            </div>
          </aside>

          <section aria-labelledby="documents-heading" className="min-w-0">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase text-brand-orange">Document center</p>
                <h2 id="documents-heading" className="mt-1 font-display text-2xl font-extrabold text-brand-navy">Onboarding documents</h2>
              </div>
              {generatedDocuments.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-success" />
                  <span><strong className="text-foreground">{completedCount} of {generatedDocuments.length}</strong> ready to download</span>
                </div>
              )}
            </div>

            {isGenerating ? (
              <div className="portal-shadow flex min-h-[420px] flex-col items-center justify-center border border-border bg-card px-6 text-center" role="status">
                <div className="relative flex size-16 items-center justify-center rounded-full bg-brand-orange-soft text-brand-orange">
                  <FileText className="size-7" />
                  <LoaderCircle className="absolute -inset-2 size-20 animate-spin text-brand-blue" />
                </div>
                <h3 className="mt-8 text-lg font-bold text-brand-navy">Preparing documents</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">Personalizing five documents for {employeeName.trim()} in {selectedLanguage}.</p>
              </div>
            ) : generatedDocuments.length === 0 ? (
              <div className="portal-shadow flex min-h-[420px] flex-col items-center justify-center border border-dashed border-input bg-card px-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-brand-sky text-brand-blue"><FileCheck2 className="size-7" /></div>
                <h3 className="mt-6 text-lg font-bold text-brand-navy">Your document pack will appear here</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Complete the employee details and generate the pack to review, translate, and download every required document.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-success" />5 documents</span>
                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-success" />8 languages</span>
                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-success" />PDF downloads</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {generatedDocuments.map((document) => {
                  const template = DOCUMENT_TEMPLATES[document.id - 1];
                  const Icon = template?.icon ?? FileText;
                  return (
                    <article key={document.id} className="document-shadow border border-border bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                        <div className="flex min-w-0 flex-1 gap-4">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand-sky text-brand-blue"><Icon className="size-5" /></div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-brand-navy">{document.title}</h3>
                              <Badge variant="outline" className={document.status === "Pending Signature" ? "border-brand-orange/30 bg-warning-soft text-brand-navy" : "border-success/25 bg-success-soft text-success"}>{document.status}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{document.description}</p>
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-muted-foreground">
                              <span className="flex items-center gap-1.5"><UserRound className="size-3.5" />{document.employeeName}</span>
                              <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />Starts {format(document.startDate, "MMM d, yyyy")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row xl:shrink-0">
                          <Button type="button" variant="outline" onClick={() => downloadDocument(document)} className="h-10"><Download />Download PDF</Button>
                          <Button type="button" onClick={() => setPreviewDocument(document)} className="h-10"><Eye />View in {document.language}</Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Dialog open={Boolean(previewDocument)} onOpenChange={(open) => { if (!open) setPreviewDocument(null); }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
          {previewDocument && (
            <>
              <DialogHeader className="border-b border-border px-6 py-5 pr-14">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-brand-orange"><FileText className="size-4" />Document preview</div>
                <DialogTitle className="text-xl text-brand-navy">{previewDocument.title}</DialogTitle>
                <DialogDescription>Prepared for {previewDocument.employeeName} · {format(previewDocument.startDate, "MMMM d, yyyy")}</DialogDescription>
              </DialogHeader>
              <div className="bg-muted p-4 sm:p-7">
                <div className="document-shadow mx-auto min-h-[480px] max-w-2xl bg-card p-6 sm:p-10">
                  <div className="flex items-center justify-between border-b border-border pb-5">
                    <div className="text-lg font-extrabold text-brand-navy">LETO<span className="text-brand-orange">PLAST</span></div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Employee document</span>
                  </div>
                  <h4 className="mt-8 text-xl font-bold text-brand-navy">{previewDocument.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    This document is issued to <strong className="text-foreground">{previewDocument.employeeName}</strong>, whose employment with Letoplast begins on <strong className="text-foreground">{format(previewDocument.startDate, "MMMM d, yyyy")}</strong>.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    The employee confirms receipt of this document and agrees to review all applicable company procedures, responsibilities, and workplace requirements.
                  </p>
                  <div className="mt-7 border-l-4 border-brand-orange bg-brand-orange-soft p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-navy"><Globe2 className="size-4 text-brand-orange" />Translated content · {previewDocument.language}</div>
                    <p className="mt-3 text-sm leading-7 text-foreground">{TRANSLATED_COPY[previewDocument.language]}</p>
                  </div>
                  <div className="mt-12 grid gap-8 sm:grid-cols-2">
                    <div className="border-t border-input pt-2 text-xs text-muted-foreground">{previewDocument.employeeName}<br />Employee signature</div>
                    <div className="border-t border-input pt-2 text-xs text-muted-foreground">{format(previewDocument.startDate, "MMMM d, yyyy")}<br />Start date</div>
                  </div>
                </div>
              </div>
              <DialogFooter className="border-t border-border px-6 py-4">
                <Button type="button" onClick={() => downloadDocument(previewDocument)}><Download />Download PDF</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
