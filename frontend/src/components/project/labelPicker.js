import React, { useState, useEffect, useContext } from 'react';
import styles from '../../css/task.module.css';
import ProjectContext from '../../contexts/ProjectContext';
import axios from 'axios';

// Optional: Separate component for Label Picker
const LabelPicker = ({ show, onClose, onAddLabel }) => {
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('#4ECDC4');
  
  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFC43D', '#7768AE', 
    '#1D7874', '#F38181', '#6A0572', '#6F9A8D', '#FB8B24'
  ];
  
  const handleSubmit = () => {
    if (labelName.trim()) {
      onAddLabel({
        id: `label-${Date.now()}`,
        name: labelName.trim(),
        color: labelColor
      });
      setLabelName('');
      setLabelColor('#4ECDC4');
      onClose();
    }
  };
  
  if (!show) return null;
  
  return (
    <div className={styles.labelPickerOverlay} onClick={onClose}>
      <div className={styles.labelPickerContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.labelPickerTitle}>Add New Label</h3>
        
        <div className={styles.labelField}>
          <label htmlFor="labelName">Label Name</label>
          <input
            id="labelName"
            type="text"
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
            placeholder="Enter label name"
            className={styles.labelNameInput}
            autoFocus
          />
        </div>
        
        <div className={styles.labelField}>
          <label>Label Color</label>
          <div className={styles.colorPicker}>
            {predefinedColors.map(color => (
              <button
                key={color}
                type="button"
                className={`${styles.colorOption} ${labelColor === color ? styles.colorOptionSelected : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setLabelColor(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className={styles.labelPreview} style={{ backgroundColor: labelColor }}>
            {labelName || 'Label Preview'}
          </div>
        </div>
        
        <div className={styles.labelPickerActions}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className={styles.LabelModalAdd} 
            onClick={handleSubmit}
            disabled={!labelName.trim()}
          >
            Add Label
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabelPicker;
