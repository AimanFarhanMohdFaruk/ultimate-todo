'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { ingestDocument, queryRag } from '@/services/RAG/rag-actions';
import { IngestResult, QueryResult } from '@/services/RAG/rag-types';
import type { DemoProps } from './registry';

const ACCEPT_TYPES = '.txt,.md,.pdf';
const TEXT_TYPES = ['text/plain', 'text/markdown', 'text/x-markdown'];

function isTextFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'txt' || ext === 'md') return true;
  return TEXT_TYPES.includes(file.type);
}

export default function EnterpriseRagDemo({ slug, title }: DemoProps) {
  const [ingestText, setIngestText] = useState('');
  const [ingestTitle, setIngestTitle] = useState('');
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isIngesting, setIsIngesting] = useState(false);
  const [question, setQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);

  const processFile = useCallback(
    (file: File) => {
      if (isTextFile(file)) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = (reader.result as string) ?? '';
          setIngestText(text);
          if (!ingestTitle) {
            const name = file.name.replace(/\.[^.]+$/, '');
            setIngestTitle(name);
          }
          setDroppedFile(null);
          toast.success(`Loaded "${file.name}"`);
        };
        reader.readAsText(file);
        return;
      }
      if (file.type === 'application/pdf') {
        setDroppedFile(file);
        if (!ingestTitle) {
          const name = file.name.replace(/\.pdf$/i, '');
          setIngestTitle(name);
        }
        toast.info(
          'PDF selected. Add PDF parsing in the ingestion pipeline to extract text.',
        );
        return;
      }
      toast.error('Use .txt, .md, or .pdf');
    },
    [ingestTitle],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processFile(file);
      e.target.value = '';
    },
    [processFile],
  );

  const clearDroppedFile = useCallback(() => {
    setDroppedFile(null);
  }, []);

  const canIngest = ingestText.trim() || droppedFile;

  async function handleIngest() {
    if (!canIngest) return;
    setIsIngesting(true);
    try {
      const result: IngestResult = await ingestDocument(
        ingestText.trim(),
        ingestTitle || undefined,
        droppedFile || null,
      );
      if (result.success) {
        toast.success(result.message);
        setIngestText('');
        setIngestTitle('');
        setDroppedFile(null);
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ingest failed');
    } finally {
      setIsIngesting(false);
    }
  }

  async function handleQuery() {
    if (!question.trim()) return;
    setIsQuerying(true);
    setQueryResult(null);
    try {
      const result = await queryRag(question);
      setQueryResult(result);
      toast.success('Query completed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Query failed');
    } finally {
      setIsQuerying(false);
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-foreground text-xl font-semibold">{title}</h2>

      {/* Phase 1: Add document */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-foreground mb-3 text-sm font-medium uppercase tracking-wider">
          Add document (Phase 1: ingestion)
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Paste text to ingest. Implement chunking, embeddings, and storage in
          the server actions.
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="doc-title">Document title (optional)</Label>
            <Input
              id="doc-title"
              placeholder="My document"
              value={ingestTitle}
              onChange={(e) => setIngestTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* File drop zone */}
          <div>
            <Label className="mb-1 block">Or drop a file</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_TYPES}
              onChange={handleFileInputChange}
              className="hidden"
              aria-hidden
            />
            <div
              role="button"
              tabIndex={0}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-colors
                ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'
                }
              `}
            >
              <p className="text-muted-foreground text-sm">
                Drag and drop .txt, .md, or .pdf here, or click to browse
              </p>
              {droppedFile && (
                <p className="text-foreground mt-2 text-sm font-medium flex items-center justify-center gap-2">
                  <span>{droppedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDroppedFile();
                    }}
                  >
                    Clear
                  </Button>
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="doc-text">Text</Label>
            <Textarea
              id="doc-text"
              placeholder="Paste or type document content..."
              value={ingestText}
              onChange={(e) => setIngestText(e.target.value)}
              rows={5}
              className="mt-1"
            />
          </div>
          <Button onClick={handleIngest} disabled={isIngesting || !canIngest}>
            {isIngesting ? 'Ingesting…' : 'Ingest document'}
          </Button>
        </div>
      </section>

      {/* Phase 2–3: Ask a question */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-foreground mb-3 text-sm font-medium uppercase tracking-wider">
          Ask a question (Phase 2: retrieval, Phase 3: generation)
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Implement query embedding, vector search, context building, and LLM
          call in the server actions.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. What is the main topic?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            className="flex-1"
          />
          <Button
            onClick={handleQuery}
            disabled={isQuerying || !question.trim()}
          >
            {isQuerying ? 'Asking…' : 'Ask'}
          </Button>
        </div>
      </section>

      {/* Answer (Phase 3) */}
      {queryResult && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-foreground mb-3 text-sm font-medium uppercase tracking-wider">
            Answer
          </h3>
          <div className="text-foreground mb-6 whitespace-pre-wrap text-sm">
            {queryResult.answer}
          </div>

          {/* Phase 4: Sources / citations */}
          {queryResult.sources.length > 0 && (
            <>
              <h3 className="text-foreground mb-3 text-sm font-medium uppercase tracking-wider">
                Sources
              </h3>
              <ul className="space-y-2">
                {queryResult.sources.map((src, i) => (
                  <li
                    key={`${src.documentId}-${src.chunkIndex ?? i}`}
                    className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                  >
                    <span className="font-medium">
                      {src.documentTitle ?? src.documentId}
                      {src.chunkIndex != null
                        ? ` (chunk ${src.chunkIndex})`
                        : ''}
                    </span>
                    <p className="text-muted-foreground mt-1 line-clamp-2">
                      {src.text}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}
