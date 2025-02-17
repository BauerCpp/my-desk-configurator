import React from 'react';
import styles from './UI.module.css';

interface LegTypeSelectorProps {
    selectedLegType: number;
    onLegTypeChange: (legType: number) => void;
}

const LegTypeSelector: React.FC<LegTypeSelectorProps> = ({ selectedLegType, onLegTypeChange }) => {
    return (
        <div className={styles.control}>
            <label>Тип ножек:</label>
            <select value={selectedLegType} onChange={(e) => onLegTypeChange(Number(e.target.value))}>
                <option value={1}>Вариант 1</option>
                <option value={2}>Вариант 2</option>
            </select>
        </div>
    );
};

export default LegTypeSelector;