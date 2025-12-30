# Component Documentation

## Main Components

### FlowChart

The main application component that orchestrates the entire UI.

**Location**: `src/components/FlowChart.jsx`

**Responsibilities**:
- Manages application state (owners, persons, documents, subgroups)
- Handles all CRUD operations
- Renders the ReactFlow canvas
- Coordinates modals and summary tables
- Handles import/export functionality

**State**:
| State | Type | Description |
|-------|------|-------------|
| `owners` | `Owner[]` | All owner nodes |
| `persons` | `Person[]` | Person registry |
| `documents` | `Document[]` | Document registry |
| `subgroups` | `Subgroup[]` | Subgroup definitions |
| `nodePositions` | `Record<string, Position>` | Custom node positions |
| `projectName` | `string` | Current project name |

**Key Functions**:
- `handleAddGrantee(parentId)` - Opens modal to add grantee to an owner
- `handleAddTransfer(toId)` - Opens modal to add transfer source
- `handleEdit(ownerId)` - Opens edit modal for an owner
- `handleDelete(ownerId)` - Deletes an owner and their transfers
- `handleAutoLayout()` - Recalculates node positions
- `exportToPDF()` - Exports chart to PDF
- `saveProject()` / `loadProject()` - JSON import/export

---

### OwnerNode

Custom ReactFlow node component representing an owner.

**Location**: `src/components/OwnerNode.jsx`

**Props** (via `data`):
| Prop | Type | Description |
|------|------|-------------|
| `owner` | `Owner` | The owner object |
| `isRoot` | `boolean` | Whether this is a root node |
| `totalReceived` | `number` | Total percentage received |
| `currentOwnership` | `number` | Current ownership after transfers out |
| `allocatedOut` | `number` | Percentage transferred to children |
| `transferBreakdown` | `TransferBreakdown[]` | Calculation breakdown for display |
| `hasNotes` | `boolean` | Whether owner has notes |
| `transferCount` | `number` | Number of incoming transfers |
| `person` | `Person` | Linked person record |
| `personColor` | `string` | Color for person badge |
| `hasSamePersonNodes` | `boolean` | Whether person appears in multiple nodes |
| `nodeColor` | `string` | Custom fill color |
| `nodeBorderColor` | `string` | Custom border color |
| `onAddGrantee` | `Function` | Callback for adding grantee |
| `onAddTransfer` | `Function` | Callback for adding transfer source |
| `onEdit` | `Function` | Callback for editing |
| `onDelete` | `Function` | Callback for deleting |
| `onViewNotes` | `Function` | Callback for viewing notes |

**Displays**:
- Person badge with name and alias count
- Owner name (as written)
- Relationship (if set)
- Transfer breakdown calculation (e.g., "1/4 of 1/2 = 1/8")
- Current ownership as fraction
- Received/Transferred amounts (if partially transferred)
- Notes indicator
- Transfer count indicator
- Action buttons (+ Grantee, + Source, Edit, Delete)

---

## Modal Components

### AddGranteeModal

Modal for adding a new grantee (child owner) to an existing owner.

**Location**: `src/components/modals/AddGranteeModal.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `parentOwner` | `Owner` | The owner receiving a grantee |
| `remainingPercentage` | `number` | Available percentage to transfer |
| `persons` | `Person[]` | Available persons |
| `documents` | `Document[]` | Available documents |
| `onSubmit` | `Function` | Callback with form data |
| `onClose` | `Function` | Callback to close modal |

**Form Fields**:
- Person selector (existing or new)
- Name (if new person)
- Interest percentage (accepts fractions, decimals, or whole numbers)
- Document selector (existing or new)

---

### AddTransferModal

Modal for adding an additional transfer source to an existing owner.

**Location**: `src/components/modals/AddTransferModal.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `targetOwner` | `Owner` | The owner receiving additional transfer |
| `owners` | `Owner[]` | Available source owners |
| `documents` | `Document[]` | Available documents |
| `getRemainingPercentage` | `Function` | Function to get remaining % for each owner |
| `onSubmit` | `Function` | Callback with form data |
| `onClose` | `Function` | Callback to close modal |

**Use Case**: When an owner receives interest from multiple grantors (e.g., inheriting from both parents).

---

### EditOwnerModal

Modal for editing an existing owner's properties.

**Location**: `src/components/modals/EditOwnerModal.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `owner` | `Owner` | The owner to edit |
| `persons` | `Person[]` | Available persons |
| `owners` | `Owner[]` | All owners (for transfer editing) |
| `documents` | `Document[]` | Available documents |
| `subgroups` | `Subgroup[]` | Available subgroups |
| `onSubmit` | `Function` | Callback with updated data |
| `onClose` | `Function` | Callback to close modal |

**Editable Fields**:
- Display name
- Name as written
- Relationship
- Linked person
- Transfers (percentage, document, edge color)
- Subgroup
- Node colors (fill, border, outgoing lines)
- Notes

---

### NotesModal

Simple modal for viewing owner notes.

**Location**: `src/components/modals/NotesModal.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `notes` | `string` | Notes content |
| `onClose` | `Function` | Callback to close modal |

---

### AddNodeModal

Modal for adding a standalone node (not connected to any existing owner).

**Location**: `src/components/modals/AddNodeModal.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `persons` | `Person[]` | Available persons |
| `onSubmit` | `Function` | Callback with form data |
| `onClose` | `Function` | Callback to close modal |

**Use Case**: Creating a new root owner or an unconnected node.

---

### PersonManagerModal

Modal for managing the person registry.

**Location**: `src/components/modals/PersonManagerModal.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `persons` | `Person[]` | All persons |
| `owners` | `Owner[]` | All owners (for counting nodes per person) |
| `onUpdatePerson` | `Function` | Callback to update a person |
| `onClose` | `Function` | Callback to close modal |

**Features**:
- List all persons with node count
- Edit primary name
- Edit aliases (comma-separated)
- Color indicator for each person

---

### DocumentManagerModal

Modal for managing the document registry.

**Location**: `src/components/modals/DocumentManagerModal.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `documents` | `Document[]` | All documents |
| `persons` | `Person[]` | All persons |
| `getDocumentGrantees` | `Function` | Returns owners who received via a document |
| `onAddDocument` | `Function` | Callback to add document |
| `onUpdateDocument` | `Function` | Callback to update document |
| `onDeleteDocument` | `Function` | Callback to delete document |
| `onClose` | `Function` | Callback to close modal |

**Features**:
- Add new documents
- Edit existing documents
- View grantees per document
- Delete documents

---

### SubgroupManagerModal

Modal for managing subgroups.

**Location**: `src/components/modals/SubgroupManagerModal.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is visible |
| `subgroups` | `Subgroup[]` | All subgroups |
| `owners` | `Owner[]` | All owners |
| `onAddSubgroup` | `Function` | Callback to add subgroup |
| `onUpdateSubgroup` | `Function` | Callback to update subgroup |
| `onDeleteSubgroup` | `Function` | Callback to delete subgroup |
| `onClose` | `Function` | Callback to close modal |

**Features**:
- Create named subgroups with colors
- Edit subgroup name/color
- View node count per subgroup
- Delete subgroups

---

## Table Components

### InterestSummaryTable

Displays a summary of current ownership by person.

**Location**: `src/components/tables/InterestSummaryTable.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `personTotals` | `PersonTotal[]` | Aggregated ownership data |
| `persons` | `Person[]` | All persons |

**Displays**:
- Person name with color indicator
- Number of nodes
- Total interest (as fraction)
- Grand total row

---

### DocumentRegistryTable

Displays all documents with their details.

**Location**: `src/components/tables/DocumentRegistryTable.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `documents` | `Document[]` | All documents |
| `persons` | `Person[]` | All persons |
| `getDocumentGrantees` | `Function` | Returns grantees for a document |
| `onExportExcel` | `Function` | Callback to export to Excel |

**Columns**:
- Grantor
- Grantees
- Document Title
- Date
- Date Recorded
- Book/Page
- Instrument #

---

## UI Components

### Modal

Reusable modal wrapper component.

**Location**: `src/components/ui/Modal.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Whether modal is visible |
| `onClose` | `Function` | - | Callback to close |
| `title` | `string` | - | Modal title |
| `children` | `ReactNode` | - | Modal content |
| `maxWidth` | `string` | `'550px'` | Maximum width |

---

### FormField

Reusable form field wrapper with label.

**Location**: `src/components/ui/FormField.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Field label |
| `children` | `ReactNode` | Form input |

---

### ModalActions

Button row for modal submit/cancel actions.

**Location**: `src/components/ui/ModalActions.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `Function` | - | Submit callback |
| `onCancel` | `Function` | - | Cancel callback |
| `submitLabel` | `string` | `'Save'` | Submit button text |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |

---

### DocumentSelector

Dropdown for selecting or creating a document.

**Location**: `src/components/ui/DocumentSelector.jsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Selected document ID or 'new' |
| `onChange` | `Function` | Selection change callback |
| `documents` | `Document[]` | Available documents |
| `newDocForm` | `object` | Form state for new document |
| `setNewDocForm` | `Function` | Update form state |
| `showNew` | `boolean` | Whether to show "Add New" option |

---

### DocumentForm

Form fields for document data entry.

**Location**: `src/components/ui/DocumentForm.jsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `docForm` | `object` | - | Form state |
| `setDocForm` | `Function` | - | Update form state |
| `compact` | `boolean` | `false` | Use compact layout |
