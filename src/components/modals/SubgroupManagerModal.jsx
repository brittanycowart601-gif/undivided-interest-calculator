import { useState } from 'react';
import { Modal } from '../ui/Modal';

export function SubgroupManagerModal({ isOpen, subgroups, owners, onAddSubgroup, onUpdateSubgroup, onDeleteSubgroup, onClose }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#517f8c');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddSubgroup({ name: newName.trim(), color: newColor, nodeIds: [] });
    setNewName('');
    setNewColor('#517f8c');
  };

  const handleStartEdit = (subgroup) => {
    setEditingId(subgroup.id);
    setEditName(subgroup.name);
    setEditColor(subgroup.color);
  };

  const handleSave = () => {
    onUpdateSubgroup(editingId, { name: editName, color: editColor });
    setEditingId(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📁 SUBGROUPS" maxWidth="700px">
      {/* Add new subgroup form */}
      <div style={{ background: 'var(--gray-light)', padding: '15px', marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Add New Subgroup</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Subgroup name"
            style={{ flex: 1, padding: '8px', border: '1px solid var(--gray)' }}
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            style={{ width: '50px', height: '36px', padding: '2px', cursor: 'pointer' }}
          />
          <button
            onClick={handleAdd}
            style={{ background: 'var(--teal)', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Subgroup list */}
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        {subgroups.length === 0 ? (
          <p style={{ color: 'var(--gray-medium)', textAlign: 'center', padding: '20px' }}>
            No subgroups yet. Subgroups help you visually organize related nodes.
          </p>
        ) : (
          subgroups.map(subgroup => {
            const isEditing = editingId === subgroup.id;
            const memberCount = owners.filter(o => o.subgroupId === subgroup.id).length;

            return (
              <div
                key={subgroup.id}
                style={{
                  padding: '12px',
                  border: '1px solid var(--gray-light)',
                  marginBottom: '8px',
                  background: isEditing ? 'var(--gray-light)' : 'white',
                  borderLeft: `4px solid ${subgroup.color}`
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid var(--gray)' }}
                    />
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      style={{ width: '50px', height: '36px', padding: '2px', cursor: 'pointer' }}
                    />
                    <button onClick={handleSave} style={{ background: 'var(--teal)', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'var(--gray)', color: 'var(--navy)', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{subgroup.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--gray-medium)', marginLeft: '10px' }}>
                        ({memberCount} node{memberCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleStartEdit(subgroup)} style={{ background: 'var(--navy)', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button onClick={() => { if (confirm('Delete this subgroup?')) onDeleteSubgroup(subgroup.id); }} style={{ background: 'var(--gray)', color: 'var(--navy)', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={onClose}
        style={{ width: '100%', background: 'var(--navy)', color: 'white', border: 'none', padding: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' }}
      >
        Close
      </button>
    </Modal>
  );
}
