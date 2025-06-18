# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application for the 東方學デジタル圖書館 (Oriental Studies Digital Library) that serves IIIF (International Image Interoperability Framework) manifests for digitized books. The application is built with Next.js 15, React 19, TypeScript, and Tailwind CSS with DaisyUI components.

## Development Commands

```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture

### Core Components

- **IIIF Manifest Generator** (`src/lib/generate-manifest.ts`): Central class that generates IIIF Presentation API 3.0 compliant manifests from book data
- **API Routes**: 
  - `/api/manifest/[manifestId]/manifest.json` - Serves IIIF manifests for individual books
- **Pages**:
  - Homepage (`src/app/page.tsx`) - Main landing page
  - Viewer (`src/app/viewer/page.tsx`) - Book viewer interface

### Data Structure

- **Book Data**: Large dataset stored in `src/constants/TohoData.ts` (~728KB) containing metadata for Oriental Studies books
- **Available Books**: Curated list in `src/constants/AvailableBook.ts` with book IDs that have associated images
- **Type Definitions**: Comprehensive TypeScript interfaces in `src/types/index.ts` for IIIF and book data structures

### Key Features

- IIIF Presentation API 3.0 compliance for interoperability with IIIF viewers
- Support for multi-volume books with proper page sequencing
- Multilingual metadata (Chinese, Japanese, English)
- Right-to-left viewing direction for East Asian texts
- Image service integration with external IIIF image server
- Book categorization and metadata management

### External Dependencies

- **Image Service**: `https://iiif.toyjack.net/iiif` - External IIIF image server
- **Data Source**: `https://toyjack.github.io/toho-html-data` - Base URL for manifest serving

### Configuration

The application uses minimal configuration with standard Next.js setup. Key settings:
- Language set to Japanese (`ja`) in root layout
- Uses pnpm for package management
- Turbopack enabled for development