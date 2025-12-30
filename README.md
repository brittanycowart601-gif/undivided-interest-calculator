# Undivided Interest Calculator

A React-based application for tracking and calculating fractional ownership interests in property. Designed for title examiners, real estate attorneys, and anyone who needs to trace property ownership through multiple transfers and generations.

## Features

- **Visual Ownership Tree**: Interactive flow chart showing ownership transfers using ReactFlow
- **Fractional Interest Calculation**: Automatically calculates ownership percentages through chain transfers
- **Multiple Transfer Sources**: Supports owners receiving interest from multiple grantors
- **Partial Transfers**: Tracks when owners transfer only part of their interest
- **Person Registry**: Link multiple ownership nodes to the same person (handles name variations/aliases)
- **Document Registry**: Track deeds, instruments, and other transfer documents
- **Subgroups**: Visually organize related nodes
- **Export Options**: PDF export and Excel document registry export
- **Auto-save**: Project data persists in local storage

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:run

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Project Structure

```
src/
├── components/
│   ├── FlowChart.jsx       # Main application component
│   ├── OwnerNode.jsx       # ReactFlow node component
│   ├── modals/             # Modal dialogs
│   │   ├── AddGranteeModal.jsx
│   │   ├── AddTransferModal.jsx
│   │   ├── EditOwnerModal.jsx
│   │   └── ...
│   ├── tables/             # Summary tables
│   │   ├── InterestSummaryTable.jsx
│   │   └── DocumentRegistryTable.jsx
│   └── ui/                 # Reusable UI components
│       ├── Modal.jsx
│       ├── FormField.jsx
│       └── ...
├── hooks/
│   ├── useOwnerCalculations.js  # Core calculation logic
│   └── useAutoLayout.js         # Node positioning
├── utils/
│   ├── formatters.js       # Formatting utilities
│   ├── constants.js        # App constants
│   └── storage.js          # LocalStorage helpers
├── test/
│   ├── setup.js            # Test configuration
│   └── integration.test.js # Integration tests
├── App.jsx                 # App entry point
├── App.css                 # Global styles
└── main.jsx                # React DOM render
```

## Core Concepts

### Owners
An owner represents a node in the ownership tree. Each owner has:
- `id`: Unique identifier
- `name`: Display name
- `nameAsWritten`: Name as it appears in documents
- `personId`: Links to a Person record
- `transfers`: Array of transfers received (from whom and what percentage)
- `notes`: Optional notes
- `originalLevel`: Vertical position in the tree

### Transfers
A transfer represents interest received from another owner:
- `fromId`: The grantor's owner ID
- `percentage`: Percentage of the grantor's interest (not total interest)
- `documentId`: Optional link to a document

### Persons
A person record allows linking multiple owner nodes to the same real person:
- `primaryName`: The main name
- `aliases`: Alternative names/spellings

### Documents
Document records for tracking the source of transfers:
- `instrumentNumber`, `book`, `page`: Recording information
- `documentDate`, `dateRecorded`: Dates
- `grantor`, `documentTitle`, `note`: Additional info

## Calculation Logic

### Total Percentage Calculation
An owner's total percentage is calculated recursively:

```
totalPercentage(owner) = sum of all transfers where:
  each transfer = (transfer.percentage / 100) * totalPercentage(grantor)
```

For example, if A owns 50% and transfers 50% of their interest to B:
- B receives: 50% × 50% = 25% total interest

### Leaf Owners (Current Owners)
A "leaf owner" is anyone who currently owns interest. This includes:
1. Owners with no children (terminal nodes)
2. Owners who transferred only PART of their interest

The Interest Summary table shows all leaf owners and their calculated interests.

## Testing

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run with coverage
npm run test:coverage
```

### Test Files
- `formatters.test.js` - Utility function tests (57 tests)
- `useOwnerCalculations.test.js` - Calculation hook tests (34 tests)
- `OwnerNode.test.jsx` - Component tests (29 tests)
- `storage.test.js` - Storage utility tests (10 tests)
- `integration.test.js` - End-to-end calculation tests (15 tests)

## Deployment

The app is configured for Cloudflare Pages deployment:

```bash
npm run deploy
```

This builds the project and deploys to the `undivided-interest-calculator` Pages project.

## Technologies

- **React 18** - UI framework
- **ReactFlow** - Interactive node-based diagrams
- **Vite** - Build tool
- **Vitest** - Testing framework
- **html2canvas + jsPDF** - PDF export
- **SheetJS (xlsx)** - Excel export

## Browser Support

Modern browsers with ES6+ support:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

Private - All rights reserved.
