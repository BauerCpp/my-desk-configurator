import React from 'react';
import styles from './UI.module.css';

interface MaterialSelectorProps {
    materials: string[];
    selectedMaterial: string;
    onMaterialChange: (material: string) => void;
    materialColors: {[key: string]: string};
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({ materials, selectedMaterial, onMaterialChange, materialColors }) => {
    return (
        <div className={styles.control}>
            <label>Материал:</label>
            <select value={selectedMaterial} onChange={(e) => onMaterialChange(e.target.value)}>
                {materials.map((material) => (
                    <option key={material} value={material}>
                        {material}
                    </option>
                ))}
            </select>
            <div className={styles.colorPreview} style={{ backgroundColor: materialColors[selectedMaterial] }}></div>
        </div>
    );
};

export default MaterialSelector;