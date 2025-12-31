import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

import { OwnerNode } from './OwnerNode';
import { AddGranteeModal } from './modals/AddGranteeModal';
import { AddTransferModal } from './modals/AddTransferModal';
import { EditOwnerModal } from './modals/EditOwnerModal';
import { NotesModal } from './modals/NotesModal';
import { AddNodeModal } from './modals/AddNodeModal';
import { PersonManagerModal } from './modals/PersonManagerModal';
import { DocumentManagerModal } from './modals/DocumentManagerModal';
import { InterestSummaryTable } from './tables/InterestSummaryTable';
import { DocumentRegistryTable } from './tables/DocumentRegistryTable';

import { useOwnerCalculations } from '../hooks/useOwnerCalculations';
import { useAutoLayout } from '../hooks/useAutoLayout';

import { INITIAL_PERSON, INITIAL_OWNER, EMPTY_DOC_FORM } from '../utils/constants';
import { generateId, toTitleCase, parsePercentageInput, formatFraction, getPersonColor, getDocumentLabel } from '../utils/formatters';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const nodeTypes = { ownerNode: OwnerNode };

export function FlowChart() {
  const reactFlowWrapper = useRef(null);
  const { fitView } = useReactFlow();

  // Load saved data or use defaults
  const savedData = loadFromStorage();

  // Core state
  const [persons, setPersons] = useState(savedData?.persons || [INITIAL_PERSON]);
  const [documents, setDocuments] = useState(savedData?.documents || []);
  const [owners, setOwners] = useState(savedData?.owners || [INITIAL_OWNER]);
  const [nodePositions, setNodePositions] = useState(savedData?.nodePositions || {});
  const [projectName, setProjectName] = useState(savedData?.projectName || 'Untitled Project');

  // Modal visibility state
  const [addGranteeParentId, setAddGranteeParentId] = useState(null);
  const [addTransferToId, setAddTransferToId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [viewingNotesId, setViewingNotesId] = useState(null);
  const [showPersonManager, setShowPersonManager] = useState(false);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [showAddNode, setShowAddNode] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Custom hooks for calculations
  const {
    calculateTotalPercentage,
    getChildren,
    getAllocatedPercentage,
    getRemainingPercentage,
    getLeafOwners,
    getNodeLevel
  } = useOwnerCalculations(owners);

  const calculateAutoLayout = useAutoLayout(owners, getChildren);

  // Derived data
  const getDocumentGrantees = useCallback((docId) => {
    return owners.filter(o => o.transfers.some(t => t.documentId === docId));
  }, [owners]);

  const getPersonTotals = useCallback(() => {
    const leaves = getLeafOwners();
    const totals = {};

    leaves.forEach(owner => {
      const pid = owner.personId;
      if (!totals[pid]) {
        totals[pid] = {
          person: persons.find(p => p.id === pid),
          totalInterest: 0,
          nodes: []
        };
      }
      totals[pid].totalInterest += calculateTotalPercentage(owner.id);
      totals[pid].nodes.push(owner);
    });

    return Object.values(totals);
  }, [getLeafOwners, persons, calculateTotalPercentage]);

  // Auto-save effect
  useEffect(() => {
    saveToStorage({ owners, persons, documents, projectName, nodePositions });
  }, [owners, persons, documents, projectName, nodePositions]);

  // Entity management functions
  const addPerson = useCallback((name) => {
    const formatted = toTitleCase(name.trim());
    const newPerson = { id: generateId(), primaryName: formatted, aliases: [] };
    setPersons(prev => [...prev, newPerson]);
    return newPerson.id;
  }, []);

  const addDocument = useCallback((docData) => {
    const newDoc = { id: generateId(), ...docData };
    setDocuments(prev => [...prev, newDoc]);
    return newDoc.id;
  }, []);

  // Node action handlers
  const handleAddGrantee = useCallback((parentId) => {
    setAddGranteeParentId(parentId);
  }, []);

  const handleAddTransfer = useCallback((toId) => {
    setAddTransferToId(toId);
  }, []);

  const handleEdit = useCallback((ownerId) => {
    setEditingId(ownerId);
  }, []);

  const handleDelete = useCallback((ownerId) => {
    setOwners(prev => {
      // Remove transfers pointing to this owner, then remove the owner
      const updated = prev.map(o => ({
        ...o,
        transfers: o.transfers.filter(t => t.fromId !== ownerId)
      }));
      return updated.filter(o => o.id !== ownerId);
    });
    setNodePositions(prev => {
      const updated = { ...prev };
      delete updated[ownerId];
      return updated;
    });
  }, []);

  const handleViewNotes = useCallback((ownerId) => {
    setViewingNotesId(ownerId);
  }, []);

  // Form submission handlers
  const handleSubmitGrantee = useCallback(({ selectedPersonId, newGranteeName, percentage, selectedDocumentId, newDocForm, fillColor, borderColor, lineColor }) => {
    if (!addGranteeParentId || !percentage) return;
    if (selectedPersonId === 'new' && !newGranteeName.trim()) return;

    const pct = parsePercentageInput(percentage);
    if (pct === null) {
      alert('Invalid percentage');
      return;
    }

    const remaining = getRemainingPercentage(addGranteeParentId);
    if (pct <= 0 || pct > remaining + 0.01) {
      alert(`Percentage must be between 0 and ${formatFraction(remaining)}`);
      return;
    }

    const formatted = toTitleCase(newGranteeName.trim());
    let personId = selectedPersonId;
    if (selectedPersonId === 'new') {
      personId = addPerson(formatted);
    }

    // Check for existing node with same person
    const existingNode = owners.find(o => o.personId === personId && o.id !== 'root');

    let docId = selectedDocumentId;
    if (selectedDocumentId === 'new' && (newDocForm.instrumentNumber || newDocForm.book || newDocForm.documentTitle)) {
      docId = addDocument(newDocForm);
    } else if (selectedDocumentId === 'new') {
      docId = null;
    }

    if (existingNode) {
      // Add transfer to existing node (don't change originalLevel - it stays on its original row)
      // Also update colors if provided
      setOwners(prev => prev.map(o =>
        o.id === existingNode.id
          ? {
              ...o,
              transfers: [...o.transfers, { fromId: addGranteeParentId, percentage: pct, documentId: docId }],
              color: fillColor || o.color,
              borderColor: borderColor || o.borderColor,
              lineColor: lineColor || o.lineColor
            }
          : o
      ));
    } else {
      // Create new node with originalLevel based on first (and only) parent
      const parentLevel = getNodeLevel(addGranteeParentId);
      setOwners(prev => [...prev, {
        id: generateId(),
        name: formatted || persons.find(p => p.id === personId)?.primaryName || 'Unknown',
        nameAsWritten: newGranteeName.trim() || formatted,
        personId,
        notes: '',
        transfers: [{ fromId: addGranteeParentId, percentage: pct, documentId: docId }],
        originalLevel: parentLevel + 1,
        color: fillColor || null,
        borderColor: borderColor || null,
        lineColor: lineColor || null
      }]);
    }

    setAddGranteeParentId(null);
  }, [addGranteeParentId, getRemainingPercentage, addPerson, addDocument, owners, persons, getNodeLevel]);

  const handleSubmitTransfer = useCallback(({ fromId, percentage, documentId, newDocForm }) => {
    if (!addTransferToId || !fromId || !percentage) return;

    const pct = parsePercentageInput(percentage);
    if (pct === null) {
      alert('Invalid percentage');
      return;
    }

    const remaining = getRemainingPercentage(fromId);
    if (pct <= 0 || pct > remaining + 0.01) {
      alert(`Percentage must be between 0 and ${formatFraction(remaining)}`);
      return;
    }

    let docId = documentId;
    if (documentId === 'new' && (newDocForm.instrumentNumber || newDocForm.book || newDocForm.documentTitle)) {
      docId = addDocument(newDocForm);
    } else if (documentId === 'new') {
      docId = null;
    }

    setOwners(prev => prev.map(o =>
      o.id === addTransferToId
        ? { ...o, transfers: [...o.transfers, { fromId, percentage: pct, documentId: docId }] }
        : o
    ));

    setAddTransferToId(null);
  }, [addTransferToId, getRemainingPercentage, addDocument]);

  const handleSubmitEdit = useCallback(({ name, nameAsWritten, notes, personId, transfers, fillColor, borderColor, lineColor, relationship }) => {
    const formatted = toTitleCase(name.trim());
    setOwners(prev => prev.map(o => {
      if (o.id !== editingId) return o;

      // Build updated owner object
      const updated = {
        ...o,
        name: formatted,
        nameAsWritten,
        notes,
        personId,
        color: fillColor || null,
        borderColor: borderColor || null,
        lineColor: lineColor || null,
        relationship: relationship || ''
      };

      // If transfers were provided (non-root nodes), update them
      if (transfers !== undefined) {
        updated.transfers = transfers;
      }

      return updated;
    }));
    setEditingId(null);
  }, [editingId]);

  // Handler for adding a standalone node (not connected to any existing node)
  const handleSubmitAddNode = useCallback(({ selectedPersonId, newName, notes, fillColor, borderColor, lineColor, selectedDocumentId, newDocForm }) => {
    const formatted = toTitleCase(newName.trim());
    let personId = selectedPersonId;

    if (selectedPersonId === 'new') {
      personId = addPerson(formatted);
    }

    const personName = selectedPersonId === 'new'
      ? formatted
      : persons.find(p => p.id === personId)?.primaryName || 'Unknown';

    // Handle document creation if needed
    let sourceDocumentId = null;
    if (selectedDocumentId === 'new' && newDocForm && (newDocForm.instrumentNumber || newDocForm.book || newDocForm.documentTitle)) {
      sourceDocumentId = addDocument(newDocForm);
    } else if (selectedDocumentId && selectedDocumentId !== 'none' && selectedDocumentId !== 'new') {
      sourceDocumentId = selectedDocumentId;
    }

    // Create standalone node (no transfers = root-like node)
    const newNode = {
      id: generateId(),
      name: personName,
      nameAsWritten: personName,
      personId,
      notes,
      transfers: [],
      originalLevel: 0,
      color: fillColor || null,
      borderColor: borderColor || null,
      lineColor: lineColor || null,
      sourceDocumentId: sourceDocumentId // Store the source document for this root node
    };

    setOwners(prev => [...prev, newNode]);
    setShowAddNode(false);
  }, [addPerson, addDocument, persons]);

  // Person and document management
  const handleUpdatePerson = useCallback((personId, updates) => {
    setPersons(prev => prev.map(p =>
      p.id === personId ? { ...p, ...updates } : p
    ));
  }, []);

  const handleUpdateDocument = useCallback((docId, updates) => {
    setDocuments(prev => prev.map(d =>
      d.id === docId ? { ...d, ...updates } : d
    ));
  }, []);

  const handleDeleteDocument = useCallback((docId) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    setOwners(prev => prev.map(o => ({
      ...o,
      transfers: o.transfers.map(t =>
        t.documentId === docId ? { ...t, documentId: null } : t
      )
    })));
  }, []);

  // Layout and export functions
  const handleAutoLayout = useCallback(() => {
    setNodePositions(calculateAutoLayout());
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [calculateAutoLayout, fitView]);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Legal paper size in pixels at 72 DPI: 8.5" x 14" = 612 x 1008
      // We use landscape for better graph fit: 14" x 8.5" = 1008 x 612
      const legalWidth = 1008;
      const legalHeight = 612;

      const canvas = await html2canvas(reactFlowWrapper.current, {
        scale: 2,
        backgroundColor: '#fff',
        width: reactFlowWrapper.current.scrollWidth,
        height: reactFlowWrapper.current.scrollHeight,
        windowWidth: reactFlowWrapper.current.scrollWidth,
        windowHeight: reactFlowWrapper.current.scrollHeight
      });

      // Always use legal size landscape
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'legal'
      });

      // Scale image to fit legal page while maintaining aspect ratio
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);

      const imgRatio = canvas.width / canvas.height;
      const pageRatio = availableWidth / availableHeight;

      let imgWidth, imgHeight;
      if (imgRatio > pageRatio) {
        imgWidth = availableWidth;
        imgHeight = availableWidth / imgRatio;
      } else {
        imgHeight = availableHeight;
        imgWidth = availableHeight * imgRatio;
      }

      const x = margin + (availableWidth - imgWidth) / 2;
      const y = margin + (availableHeight - imgHeight) / 2;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`${projectName.replace(/[^a-z0-9]/gi, '_')}_chart.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('Export failed');
    }
    setIsExporting(false);
  };

  const exportDocumentsToExcel = () => {
    if (documents.length === 0) {
      alert('No documents');
      return;
    }

    const data = documents.map(doc => {
      const grantees = getDocumentGrantees(doc.id);
      const names = grantees
        .map(g => persons.find(p => p.id === g.personId)?.primaryName || g.name)
        .join('; ');

      return {
        'Grantor': doc.grantor || '',
        'Grantees': names,
        'Document Title': doc.documentTitle || '',
        'Document Date': doc.documentDate || '',
        'Date Recorded': doc.dateRecorded || '',
        'Book': doc.book || '',
        'Page': doc.page || '',
        'Instrument Number': doc.instrumentNumber || '',
        'Note': doc.note || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documents');
    XLSX.writeFile(wb, `${projectName.replace(/[^a-z0-9]/gi, '_')}_documents.xlsx`);
  };

  const saveProject = () => {
    const data = {
      owners,
      persons,
      documents,
      projectName,
      nodePositions,
      savedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
  };

  const loadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.owners) {
          setOwners(data.owners);
          setPersons(data.persons || []);
          setDocuments(data.documents || []);
          setProjectName(data.projectName || 'Loaded');
          setNodePositions(data.nodePositions || {});
        }
      } catch {
        alert('Failed to load');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearProject = () => {
    if (confirm('Clear project?')) {
      setOwners([INITIAL_OWNER]);
      setPersons([INITIAL_PERSON]);
      setDocuments([]);
      setProjectName('Untitled Project');
      setNodePositions({});
    }
  };

  // Build nodes and edges for ReactFlow
  const nodes = useMemo(() => {
    const autoPos = calculateAutoLayout();
    const personCount = {};
    owners.forEach(o => {
      if (o.personId) {
        personCount[o.personId] = (personCount[o.personId] || 0) + 1;
      }
    });

    return owners.map(owner => {
      const person = persons.find(p => p.id === owner.personId);
      const pos = nodePositions[owner.id] || autoPos[owner.id] || { x: 100, y: 100 };

      const totalReceived = calculateTotalPercentage(owner.id);
      const allocatedOut = getAllocatedPercentage(owner.id);
      // Current ownership = what they received minus what they transferred out
      const currentOwnership = (totalReceived * (100 - allocatedOut)) / 100;

      // Build transfer breakdown for display (e.g., "1/4 of 1/2 = 1/8")
      const transferBreakdown = owner.transfers.map(t => {
        const fromOwner = owners.find(o => o.id === t.fromId);
        const parentTotal = fromOwner ? calculateTotalPercentage(fromOwner.id) : 100;
        const transferredAmount = (parentTotal * t.percentage) / 100;
        return {
          fromName: fromOwner?.name || 'Unknown',
          parentFraction: formatFraction(parentTotal),
          transferPct: t.percentage,
          transferFraction: formatFraction(t.percentage),
          resultFraction: formatFraction(transferredAmount),
          resultPct: transferredAmount
        };
      });

      return {
        id: owner.id,
        type: 'ownerNode',
        position: pos,
        draggable: true,
        data: {
          owner,
          isRoot: owner.transfers.length === 0,
          totalReceived,
          currentOwnership,
          allocatedOut,
          transferBreakdown,
          hasNotes: owner.notes?.trim().length > 0,
          transferCount: owner.transfers.length,
          person,
          personColor: person ? getPersonColor(person.id, persons) : '#666',
          hasSamePersonNodes: personCount[owner.personId] > 1,
          nodeColor: owner.color || null,
          nodeBorderColor: owner.borderColor || null,
          onAddGrantee: handleAddGrantee,
          onAddTransfer: handleAddTransfer,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onViewNotes: handleViewNotes
        }
      };
    });
  }, [
    owners,
    persons,
    nodePositions,
    calculateAutoLayout,
    calculateTotalPercentage,
    getAllocatedPercentage,
    handleAddGrantee,
    handleAddTransfer,
    handleEdit,
    handleDelete,
    handleViewNotes
  ]);

  const edges = useMemo(() => {
    const edgeList = [];

    owners.forEach(owner => {
      owner.transfers.forEach((transfer, idx) => {
        const doc = documents.find(d => d.id === transfer.documentId);
        const sourceOwner = owners.find(o => o.id === transfer.fromId);

        // Use accent colors for edges
        const edgeColor = transfer.edgeColor || sourceOwner?.lineColor || 'var(--accent-primary)';

        // Build label with document info (book/page) and relationship
        let label = getDocumentLabel(doc, owner.relationship) || undefined;

        edgeList.push({
          id: `e-${transfer.fromId}-${owner.id}-${idx}`,
          source: transfer.fromId,
          target: owner.id,
          sourceHandle: null,
          targetHandle: null,
          type: 'smoothstep',
          pathOptions: {
            offset: 40,
            borderRadius: 16
          },
          label: label,
          labelStyle: {
            fill: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: 10,
            fontFamily: 'var(--font-mono)'
          },
          labelBgStyle: {
            fill: 'var(--white)',
            stroke: 'var(--slate-200)',
            strokeWidth: 1,
            rx: 6,
            ry: 6
          },
          labelBgPadding: [6, 8],
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
            width: 14,
            height: 14
          },
          style: {
            stroke: edgeColor,
            strokeWidth: 2
          },
          zIndex: 1000
        });
      });
    });

    return edgeList;
  }, [owners, documents]);

  const onNodeDragStop = useCallback((e, node) => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: { x: node.position.x, y: node.position.y }
    }));
  }, []);

  // Get data for modals
  const parentOwner = addGranteeParentId ? owners.find(o => o.id === addGranteeParentId) : null;
  const targetOwner = addTransferToId ? owners.find(o => o.id === addTransferToId) : null;
  const editingOwner = editingId ? owners.find(o => o.id === editingId) : null;
  const viewingNotes = viewingNotesId ? owners.find(o => o.id === viewingNotesId)?.notes : null;

  const personTotals = getPersonTotals();

  // Icon components
  const IconPlus = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );

  const IconUsers = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M2 14c0-2.5 2-4 4-4s4 1.5 4 4" />
      <circle cx="11" cy="5" r="2" />
      <path d="M11 9c1.5 0 3 1 3 3" />
    </svg>
  );

  const IconFile = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V5L9 1z" />
      <path d="M9 1v4h4M6 8h4M6 11h4" />
    </svg>
  );

  const IconDownload = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v9M4 7l4 4 4-4M2 14h12" />
    </svg>
  );

  const IconUpload = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 11V2M4 6l4-4 4 4M2 14h12" />
    </svg>
  );

  const IconLayout = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );

  const IconTrash = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M6.5 7v5M9.5 7v5" />
      <path d="M3.5 4l.5 9a1 1 0 001 1h6a1 1 0 001-1l.5-9" />
    </svg>
  );

  const IconPDF = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V5L9 1z" />
      <path d="M9 1v4h4" />
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface-base)',
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: 'var(--space-6)',
      }}>
        {/* Header */}
        <header style={{
          background: 'var(--surface-dark)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6) var(--space-8)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gradient accent line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary))',
          }} />

          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--white)',
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-1)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                fontSize: '1rem',
              }}>
                %
              </span>
              Undivided Interest Calculator
            </h1>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name..."
              className="no-print"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--white)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9375rem',
                width: '280px',
                transition: 'all var(--transition-fast)',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.12)';
                e.target.style.borderColor = 'var(--accent-primary)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.08)';
                e.target.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            />
          </div>

          <div className="no-print" style={{
            display: 'flex',
            gap: 'var(--space-2)',
          }}>
            <button
              onClick={() => setShowPersonManager(true)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--white)',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              <IconUsers /> Persons
            </button>
            <button
              onClick={() => setShowDocumentManager(true)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--white)',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              <IconFile /> Documents
            </button>
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              style={{
                background: 'var(--accent-primary)',
                color: 'var(--white)',
                border: 'none',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: isExporting ? 'wait' : 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.background = 'var(--accent-primary-dark)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <IconPDF /> {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="no-print" style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3) var(--space-6)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 'var(--space-2)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--slate-200)',
        }}>
            <button
              onClick={() => setShowAddNode(true)}
              style={{
                background: 'var(--accent-primary)',
                color: 'var(--white)',
                border: 'none',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-primary-dark)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <IconPlus /> Add Origin
            </button>
            <button
              onClick={handleAutoLayout}
              style={{
                background: 'var(--white)',
                color: 'var(--text-primary)',
                border: '1px solid var(--slate-200)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--slate-200)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <IconLayout /> Auto Layout
            </button>
            <button
              onClick={saveProject}
              style={{
                background: 'var(--white)',
                color: 'var(--text-primary)',
                border: '1px solid var(--slate-200)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--slate-200)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <IconDownload /> Save
            </button>
            <label
              style={{
                background: 'var(--white)',
                color: 'var(--text-primary)',
                border: '1px solid var(--slate-200)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--slate-200)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <IconUpload /> Load
              <input type="file" accept=".json" onChange={loadProject} style={{ display: 'none' }} />
            </label>
            <button
              onClick={clearProject}
              style={{
                background: 'var(--white)',
                color: 'var(--text-tertiary)',
                border: '1px solid var(--slate-200)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--error)';
                e.currentTarget.style.color = 'var(--error)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--slate-200)';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <IconTrash /> Clear
            </button>
        </div>

        {/* Canvas */}
        <div
          ref={reactFlowWrapper}
          style={{
            height: '560px',
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeDragStop={onNodeDragStop}
            fitView
            minZoom={0.2}
            maxZoom={2}
          >
            <Background color="var(--slate-200)" gap={24} size={1} />
            <Controls />
          </ReactFlow>
        </div>

        {/* Modals */}
        <AddGranteeModal
          isOpen={!!addGranteeParentId}
          parentOwner={parentOwner}
          remainingPercentage={addGranteeParentId ? getRemainingPercentage(addGranteeParentId) : 0}
          persons={persons}
          documents={documents}
          onSubmit={handleSubmitGrantee}
          onClose={() => setAddGranteeParentId(null)}
        />

        <AddTransferModal
          isOpen={!!addTransferToId}
          targetOwner={targetOwner}
          owners={owners}
          documents={documents}
          getRemainingPercentage={getRemainingPercentage}
          onSubmit={handleSubmitTransfer}
          onClose={() => setAddTransferToId(null)}
        />

        <EditOwnerModal
          isOpen={!!editingId}
          owner={editingOwner}
          persons={persons}
          owners={owners}
          documents={documents}
          onSubmit={handleSubmitEdit}
          onClose={() => setEditingId(null)}
        />

        <NotesModal
          isOpen={!!viewingNotesId}
          notes={viewingNotes}
          onClose={() => setViewingNotesId(null)}
        />

        <AddNodeModal
          isOpen={showAddNode}
          persons={persons}
          documents={documents}
          onSubmit={handleSubmitAddNode}
          onClose={() => setShowAddNode(false)}
        />

        <PersonManagerModal
          isOpen={showPersonManager}
          persons={persons}
          owners={owners}
          onUpdatePerson={handleUpdatePerson}
          onClose={() => setShowPersonManager(false)}
        />

        <DocumentManagerModal
          isOpen={showDocumentManager}
          documents={documents}
          persons={persons}
          getDocumentGrantees={getDocumentGrantees}
          onAddDocument={addDocument}
          onUpdateDocument={handleUpdateDocument}
          onDeleteDocument={handleDeleteDocument}
          onClose={() => setShowDocumentManager(false)}
        />

        {/* Summary Section */}
        <div style={{
          marginTop: 'var(--space-6)',
        }}>
          {/* Interest Summary */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}>
            <div style={{
              height: '1px',
              flex: 1,
              background: 'linear-gradient(90deg, transparent, var(--slate-200), var(--slate-300), var(--slate-200), transparent)',
            }} />
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}>
              Interest Summary
            </h2>
            <div style={{
              height: '1px',
              flex: 1,
              background: 'linear-gradient(90deg, transparent, var(--slate-200), var(--slate-300), var(--slate-200), transparent)',
            }} />
          </div>

          <InterestSummaryTable personTotals={personTotals} persons={persons} />

          {/* Document Registry */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-8)',
            marginBottom: 'var(--space-4)',
          }}>
            <div style={{
              height: '1px',
              flex: 1,
              background: 'linear-gradient(90deg, transparent, var(--slate-200), var(--slate-300), var(--slate-200), transparent)',
            }} />
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}>
              Document Registry
            </h2>
            <div style={{
              height: '1px',
              flex: 1,
              background: 'linear-gradient(90deg, transparent, var(--slate-200), var(--slate-300), var(--slate-200), transparent)',
            }} />
          </div>

          <DocumentRegistryTable
            documents={documents}
            persons={persons}
            getDocumentGrantees={getDocumentGrantees}
            onExportExcel={exportDocumentsToExcel}
          />
        </div>
      </div>
    </div>
  );
}
