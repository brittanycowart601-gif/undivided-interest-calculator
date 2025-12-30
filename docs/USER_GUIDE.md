# User Guide

## Getting Started

The Undivided Interest Calculator helps you trace property ownership through multiple transfers and calculate each owner's fractional interest.

### Basic Workflow

1. Start with the **Original Owner** (root node)
2. Add **grantees** as the property is transferred
3. Link transfers to **documents** for reference
4. View the **Interest Summary** to see current ownership

---

## The Flow Chart

### Understanding Nodes

Each box (node) represents an ownership interest:

```
┌─────────────────────────┐
│ 👤 Person Name          │  ← Person badge (color-coded)
├─────────────────────────┤
│     Owner Name          │  ← Name as written in documents
│   (relationship)        │  ← Optional relationship info
│                         │
│   1/4 of 1/2 = 1/8     │  ← Transfer calculation breakdown
│                         │
│ ┌─────────────────────┐ │
│ │     1/8 Int.        │ │  ← Current ownership (highlighted)
│ └─────────────────────┘ │
│                         │
│ Received: 1/8           │  ← Only shows if they transferred out
│ Transferred out: 0      │
├─────────────────────────┤
│ + Grantee │ + Source    │  ← Action buttons
│   Edit    │   Delete    │
└─────────────────────────┘
```

### Node Colors

- **Navy background**: Root node (original owner)
- **White background**: Regular nodes
- **Teal glow**: Same person appears in multiple nodes
- **Custom colors**: Set via Edit modal

### Lines (Edges)

Lines show the flow of ownership:
- Lines go from **grantor** (top) to **grantee** (bottom)
- Labels show the document reference
- Lines render **above** nodes for visibility

---

## Adding Ownership Transfers

### Adding a Grantee

1. Click **"+ Grantee"** on any node
2. Select an existing person or create new
3. Enter the interest percentage:
   - As a fraction: `1/4`, `1/2`, `3/8`
   - As a decimal: `0.25`, `0.5`
   - As a percentage: `25`, `50`
4. Optionally link to a document
5. Click **"Add Grantee"**

**Important**: The percentage is **of the grantor's interest**, not total interest.

Example: If Owner A has 50% and transfers "1/2" to B:
- B receives 1/2 × 50% = **25% total interest**

### Adding Multiple Sources

When someone receives interest from multiple grantors:

1. Click **"+ Source"** on the receiving node
2. Select the grantor
3. Enter the percentage of the grantor's interest
4. Click **"Add Source"**

Example: Child inherits from both parents:
- From Father: 50% of his 50% = 25%
- From Mother: 50% of her 50% = 25%
- Child's total: **50%**

### Partial Transfers

If someone transfers only part of their interest:
- They remain a current owner with the remainder
- Both the transferor and transferee appear in the Interest Summary

Example: A owns 100%, transfers 50% to B:
- A retains: 50%
- B receives: 50%
- Both are current owners

---

## Managing Data

### Person Registry

Access via **"👥 Persons"** button.

Persons link multiple nodes to the same real person:
- **Primary Name**: Main display name
- **Aliases**: Alternative spellings (comma-separated)

Use cases:
- Same person appears in different documents with different name spellings
- Same person receives interest from multiple sources

### Document Registry

Access via **"📄 Documents"** button.

Track the source documents for transfers:
- **Instrument Number**: Recording reference
- **Book/Page**: Volume and page numbers
- **Dates**: Document date and recording date
- **Grantor**: Who transferred the interest
- **Title**: Type of document (Deed, Will, etc.)
- **Notes**: Additional information

### Subgroups

Access via **"📁 Subgroups"** button.

Organize related nodes visually:
1. Create a subgroup with name and color
2. Edit nodes to assign them to subgroups
3. Use for family branches, time periods, etc.

---

## Editing Nodes

Click **"Edit"** on any node to:

### Basic Information
- **Display Name**: How the name appears
- **Name As Written**: Exact text from documents
- **Relationship**: e.g., "Wife of John Doe"
- **Linked Person**: Connect to person registry

### Transfers
For non-root nodes, edit incoming transfers:
- Change percentage
- Change linked document
- Set custom line color
- Delete transfers (if multiple exist)

### Appearance
- **Fill Color**: Node background
- **Border Color**: Node border
- **Lines Out**: Default color for outgoing edges
- **Subgroup**: Assign to a subgroup

### Notes
Add any relevant notes about this owner.

---

## Interest Summary

The table at the bottom shows current ownership:

| Person | Nodes | Total Interest |
|--------|-------|----------------|
| John Doe | 2 | 1/4 |
| Jane Smith | 1 | 3/4 |
| **TOTAL** | 3 | **1/1** |

- **Person**: The person from the registry
- **Nodes**: How many ownership nodes they have
- **Total Interest**: Sum of all their interests (as fraction)

**Note**: Only "leaf" owners appear—those who currently hold interest.

---

## Import/Export

### Save Project

Click **"💾 Save"** to download a JSON file with all project data.

### Load Project

Click **"📂 Load"** to import a previously saved JSON file.

### Export to PDF

Click **"📄 PDF"** to export the flow chart as a PDF document.

### Export Documents to Excel

In the Document Registry table, click **"📥 Export Excel"** to download a spreadsheet.

---

## Layout Tools

### Auto Layout

Click **"📐 Auto Layout"** to automatically arrange nodes:
- Nodes are organized by generation level
- Horizontal spacing prevents overlap
- Vertical spacing separates generations

### Manual Positioning

Drag any node to reposition it. Custom positions are saved automatically.

### Navigation

- **Scroll/Pan**: Click and drag on empty space
- **Zoom**: Mouse wheel or pinch gesture
- **Minimap**: Bottom-left corner shows overview
- **Controls**: Bottom-left zoom buttons

---

## Tips & Best Practices

### Data Entry

1. **Start with documents**: Enter your documents first, then create transfers
2. **Use fractions**: "1/4" is clearer than "25" for title work
3. **Create persons early**: Set up the person registry before adding nodes
4. **Add relationships**: "Wife of John Doe" helps clarify family trees

### Complex Scenarios

**Multiple Generations**:
- Create the chain from oldest to newest
- Each generation is a new level

**Joint Ownership**:
- Create separate nodes for each joint owner
- Each receives their portion from the same grantor

**Trusts**:
- The trust is an "owner"
- Beneficiaries receive from the trust

**Deaths Without Probate**:
- Create an owner for the decedent
- Transfer to heirs according to intestate laws

### Troubleshooting

**Percentages don't add up to 100%**:
- Check if any owner still has remaining interest
- Verify partial transfers are correct

**Can't find a person**:
- Check the Person Registry for duplicates
- Search by alias

**Lines are hard to follow**:
- Use Auto Layout
- Set custom line colors for different branches
- Drag nodes to separate overlapping lines

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Fit view | Double-click empty space |
| Cancel modal | Escape |
| Zoom in | Ctrl/Cmd + Scroll up |
| Zoom out | Ctrl/Cmd + Scroll down |

---

## Browser Requirements

- Chrome (recommended)
- Firefox
- Safari
- Edge

JavaScript must be enabled. Data is stored in browser localStorage.

---

## Getting Help

If you encounter issues:

1. **Clear and restart**: Use "🗑️ Clear" and re-enter data
2. **Check browser console**: Press F12 for error messages
3. **Export and share**: Save your project file to share for debugging
