import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { getPersonColor, toTitleCase } from '../../utils/formatters';

export function PersonManagerModal({ isOpen, persons, owners, onUpdatePerson, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAliases, setEditAliases] = useState('');

  const handleStartEdit = (person) => {
    setEditingId(person.id);
    setEditName(person.primaryName);
    setEditAliases(person.aliases?.join(', ') || '');
  };

  const handleSave = () => {
    onUpdatePerson(editingId, {
      primaryName: toTitleCase(editName.trim()),
      aliases: editAliases.split(',').map(a => a.trim()).filter(a => a)
    });
    setEditingId(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👥 PERSON REGISTRY" maxWidth="700px">
      <div style={{ maxHeight: '400px', overflow: 'auto', marginBottom: '20px' }}>
        {persons.map(person => {
          const nodeCount = owners.filter(o => o.personId === person.id).length;
          const isEditing = editingId === person.id;

          return (
            <div
              key={person.id}
              style={{
                padding: '12px',
                border: '1px solid var(--gray-light)',
                marginBottom: '8px',
                background: isEditing ? 'var(--gray-light)' : 'white'
              }}
            >
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Primary Name"
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid var(--gray)' }}
                  />
                  <input
                    type="text"
                    value={editAliases}
                    onChange={(e) => setEditAliases(e.target.value)}
                    placeholder="Aliases (comma-separated)"
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid var(--gray)' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleSave} style={{ background: 'var(--teal)', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'var(--gray)', color: 'var(--navy)', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getPersonColor(person.id, persons),
                      display: 'inline-block',
                      marginRight: '10px'
                    }} />
                    <strong>{person.primaryName}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--gray)', marginLeft: '10px' }}>
                      ({nodeCount} node{nodeCount !== 1 ? 's' : ''})
                    </span>
                    {person.aliases?.length > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--teal)', marginLeft: '22px' }}>
                        Also: {person.aliases.join(', ')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleStartEdit(person)}
                    style={{ background: 'var(--navy)', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={onClose}
        style={{ width: '100%', background: 'var(--navy)', color: 'white', border: 'none', padding: '12px', fontWeight: '600', cursor: 'pointer' }}
      >
        Close
      </button>
    </Modal>
  );
}
