<?php

namespace App\Services;

use App\Models\ChatAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Stores chat attachments on the private disk and best-effort extracts readable
 * text from documents so the AI can analyze them. Images are stored as-is and
 * embedded to the model as base64 by the controller.
 */
class AttachmentService
{
    public const DISK = 'local';

    /** Hard cap on extracted document text to keep prompt size sane. */
    public const MAX_TEXT_CHARS = 8000;

    public const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    public const DOCUMENT_EXTENSIONS = [
        'pdf', 'txt', 'md', 'csv', 'json', 'log',
        'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    ];

    public function store(UploadedFile $file, User $user): ChatAttachment
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $kind = in_array($extension, self::IMAGE_EXTENSIONS, true) ? 'image' : 'document';

        // Extract before storing while the temp file is guaranteed to exist.
        $extracted = $kind === 'document' ? $this->extractText($file, $extension) : null;

        $path = $file->store('chat-attachments/'.$user->id, self::DISK);

        return ChatAttachment::create([
            'user_id' => $user->id,
            'disk' => self::DISK,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime' => $file->getClientMimeType(),
            'kind' => $kind,
            'size' => (int) $file->getSize(),
            'extracted_text' => $extracted,
        ]);
    }

    private function extractText(UploadedFile $file, string $extension): ?string
    {
        try {
            $text = match (true) {
                in_array($extension, ['txt', 'md', 'csv', 'json', 'log'], true) => (string) file_get_contents($file->getRealPath()),
                $extension === 'pdf' => $this->extractPdf($file->getRealPath()),
                in_array($extension, ['docx', 'xlsx', 'pptx'], true) => $this->extractOoxml($file->getRealPath(), $extension),
                default => null,
            };
        } catch (\Throwable) {
            $text = null;
        }

        if ($text === null) {
            return null;
        }

        $text = trim(preg_replace('/\s+/', ' ', $text) ?? '');

        return $text === '' ? null : Str::limit($text, self::MAX_TEXT_CHARS, ' …');
    }

    /**
     * Uses smalot/pdfparser when it is installed. Returns null otherwise so the
     * controller can gracefully tell the model the PDF could not be read.
     */
    private function extractPdf(string $realPath): ?string
    {
        $parserClass = '\\Smalot\\PdfParser\\Parser';

        if (! class_exists($parserClass)) {
            return null;
        }

        $parser = new $parserClass();
        $pdf = $parser->parseFile($realPath);

        return $pdf->getText();
    }

    /**
     * Best-effort text recovery from OOXML files (docx/xlsx/pptx) by reading the
     * relevant XML parts and stripping tags. No extra dependencies required.
     */
    private function extractOoxml(string $realPath, string $extension): ?string
    {
        if (! class_exists(\ZipArchive::class)) {
            return null;
        }

        $zip = new \ZipArchive();
        if ($zip->open($realPath) !== true) {
            return null;
        }

        $xml = '';

        if ($extension === 'pptx') {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = (string) $zip->getNameIndex($i);
                if (Str::startsWith($name, 'ppt/slides/slide') && Str::endsWith($name, '.xml')) {
                    $xml .= ' '.$zip->getFromName($name);
                }
            }
        } else {
            $targets = $extension === 'docx' ? ['word/document.xml'] : ['xl/sharedStrings.xml'];
            foreach ($targets as $target) {
                $content = $zip->getFromName($target);
                if ($content !== false) {
                    $xml .= ' '.$content;
                }
            }
        }

        $zip->close();

        if ($xml === '') {
            return null;
        }

        $xml = preg_replace('/<[^>]+>/', ' ', $xml) ?? '';

        return html_entity_decode($xml, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }
}
