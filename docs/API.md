# API Documentation

## Hooks

### useOwnerCalculations

Core hook for ownership calculations. Provides methods to calculate percentages, find children, and determine current owners.

```javascript
import { useOwnerCalculations } from '../hooks/useOwnerCalculations';

const {
  calculateTotalPercentage,
  getChildren,
  getAllocatedPercentage,
  getRemainingPercentage,
  getLeafOwners,
  getNodeLevel
} = useOwnerCalculations(owners);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `owners` | `Owner[]` | Array of owner objects |

#### Returns

| Method | Signature | Description |
|--------|-----------|-------------|
| `calculateTotalPercentage` | `(ownerId: string) => number` | Calculates total ownership percentage for an owner (0-100) |
| `getChildren` | `(ownerId: string) => Owner[]` | Returns array of owners who received transfers from this owner |
| `getAllocatedPercentage` | `(ownerId: string) => number` | Returns total percentage transferred out to children (0-100) |
| `getRemainingPercentage` | `(ownerId: string) => number` | Returns percentage not yet transferred (100 - allocated) |
| `getLeafOwners` | `() => Owner[]` | Returns all owners who currently hold interest |
| `getNodeLevel` | `(ownerId: string) => number` | Returns the hierarchical level (0 = root) |

#### Example

```javascript
const owners = [
  { id: 'root', name: 'Original', transfers: [] },
  { id: 'a', name: 'Owner A', transfers: [{ fromId: 'root', percentage: 50 }] },
  { id: 'b', name: 'Owner B', transfers: [{ fromId: 'a', percentage: 100 }] }
];

const { calculateTotalPercentage, getLeafOwners } = useOwnerCalculations(owners);

calculateTotalPercentage('a');  // Returns 50
calculateTotalPercentage('b');  // Returns 50 (100% of A's 50%)
getLeafOwners();                // Returns [{ id: 'b', ... }]
```

---

### useAutoLayout

Hook for automatic node positioning in the flow chart.

```javascript
import { useAutoLayout } from '../hooks/useAutoLayout';

const calculateAutoLayout = useAutoLayout(owners, getChildren);
const positions = calculateAutoLayout();
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `owners` | `Owner[]` | Array of owner objects |
| `getChildren` | `Function` | Function to get children of an owner |

#### Returns

| Type | Description |
|------|-------------|
| `() => Record<string, {x: number, y: number}>` | Function that returns position map |

---

## Utility Functions

### formatters.js

#### generateId

Generates a unique identifier string.

```javascript
import { generateId } from '../utils/formatters';

const id = generateId(); // e.g., "x7k2m9p4q"
```

---

#### toTitleCase

Converts a string to title case.

```javascript
import { toTitleCase } from '../utils/formatters';

toTitleCase('john doe');        // "John Doe"
toTitleCase('JANE SMITH');      // "Jane Smith"
toTitleCase('mary-jane watson'); // "Mary-Jane Watson"
```

---

#### formatDateInput

Formats a date string with slashes as the user types.

```javascript
import { formatDateInput } from '../utils/formatters';

formatDateInput('12');       // "12"
formatDateInput('1234');     // "12/34"
formatDateInput('12341999'); // "12/34/1999"
```

---

#### parsePercentageInput

Parses various percentage input formats into a number (0-100).

```javascript
import { parsePercentageInput } from '../utils/formatters';

// Fraction input
parsePercentageInput('1/4');   // 25
parsePercentageInput('1/2');   // 50
parsePercentageInput('3/8');   // 37.5

// Decimal input (0-1 range treated as percentage)
parsePercentageInput('0.25');  // 25
parsePercentageInput('0.5');   // 50

// Whole number input
parsePercentageInput('25');    // 25
parsePercentageInput('100');   // 100

// Invalid input
parsePercentageInput('abc');   // null
parsePercentageInput('1/0');   // null
```

---

#### gcd

Calculates the greatest common divisor of two numbers.

```javascript
import { gcd } from '../utils/formatters';

gcd(12, 8);   // 4
gcd(100, 25); // 25
gcd(7, 11);   // 1 (coprime)
```

---

#### formatFraction

Converts a percentage (0-100) to a simplified fraction string.

```javascript
import { formatFraction } from '../utils/formatters';

formatFraction(0);     // "0"
formatFraction(25);    // "1/4"
formatFraction(50);    // "1/2"
formatFraction(75);    // "3/4"
formatFraction(100);   // "1/1"
formatFraction(12.5);  // "1/8"
formatFraction(37.5);  // "3/8"
formatFraction(33.33); // "1/3" (approximately)
```

---

#### getPersonColor

Returns a consistent color for a person based on their position in the persons array.

```javascript
import { getPersonColor } from '../utils/formatters';

const persons = [{ id: 'p1' }, { id: 'p2' }];
getPersonColor('p1', persons); // "#517f8c"
getPersonColor('p2', persons); // "#3d6670"
```

---

#### getDocumentLabel

Generates a short label for a document.

```javascript
import { getDocumentLabel } from '../utils/formatters';

// Priority: Instrument # > Book/Page > Title
getDocumentLabel({ instrumentNumber: '12345' });           // "Inst: 12345"
getDocumentLabel({ book: '100', page: '50' });             // "Bk 100 Pg 50"
getDocumentLabel({ documentTitle: 'Warranty Deed' });      // "Warranty Deed"
getDocumentLabel({});                                       // "Doc"
```

---

### storage.js

#### loadFromStorage

Loads project data from localStorage.

```javascript
import { loadFromStorage } from '../utils/storage';

const data = loadFromStorage();
// Returns: { owners, persons, documents, projectName, nodePositions, lastSaved }
// Or null if no data saved
```

---

#### saveToStorage

Saves project data to localStorage.

```javascript
import { saveToStorage } from '../utils/storage';

saveToStorage({
  owners: [...],
  persons: [...],
  documents: [...],
  projectName: 'My Project',
  nodePositions: {...},
  subgroups: [...]
});
// Automatically adds lastSaved timestamp
```

---

## Data Types

### Owner

```typescript
interface Owner {
  id: string;
  name: string;
  nameAsWritten?: string;
  personId: string;
  notes?: string;
  relationship?: string;
  transfers: Transfer[];
  originalLevel?: number;
  color?: string;        // Custom fill color
  borderColor?: string;  // Custom border color
  lineColor?: string;    // Default color for outgoing edges
  subgroupId?: string;
}
```

### Transfer

```typescript
interface Transfer {
  fromId: string;        // Grantor's owner ID
  percentage: number;    // 0-100, percentage OF grantor's interest
  documentId?: string;
  edgeColor?: string;    // Custom color for this edge
}
```

### Person

```typescript
interface Person {
  id: string;
  primaryName: string;
  aliases?: string[];
}
```

### Document

```typescript
interface Document {
  id: string;
  instrumentNumber?: string;
  book?: string;
  page?: string;
  dateRecorded?: string;
  documentDate?: string;
  grantor?: string;
  documentTitle?: string;
  note?: string;
}
```

### Subgroup

```typescript
interface Subgroup {
  id: string;
  name: string;
  color: string;
}
```

---

## Constants

```javascript
import {
  STORAGE_KEY,
  PERSON_COLORS,
  INITIAL_PERSON,
  INITIAL_OWNER,
  EMPTY_DOC_FORM,
  STYLES
} from '../utils/constants';
```

| Constant | Description |
|----------|-------------|
| `STORAGE_KEY` | LocalStorage key for project data |
| `PERSON_COLORS` | Array of colors for person badges |
| `INITIAL_PERSON` | Default person object for new projects |
| `INITIAL_OWNER` | Default root owner for new projects |
| `EMPTY_DOC_FORM` | Empty document form object |
| `STYLES` | Common style objects for modals/buttons |
