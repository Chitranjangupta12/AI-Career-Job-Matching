import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const SkillBadge = ({ name, type = 'default', onRemove = null }) => {
  let className = 'skill-tag';
  let icon = null;

  if (type === 'matched') {
    className += ' skill-tag-matched';
    icon = <CheckCircle2 size={13} />;
  } else if (type === 'missing') {
    className += ' skill-tag-missing';
    icon = <AlertCircle size={13} />;
  } else if (type === 'strong') {
    className += ' skill-tag-strong';
    icon = <CheckCircle2 size={13} />;
  } else if (type === 'moderate') {
    className += ' skill-tag-moderate';
    icon = <Sparkles size={13} />;
  }

  return (
    <span className={className}>
      {icon}
      <span>{name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: '0.25rem', color: '#64748b', fontWeight: 'bold' }}
          title="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
