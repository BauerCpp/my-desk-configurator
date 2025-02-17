import React from 'react';
import useDeskConfigurator from './useDeskConfigurator';
import SizeControl from '../UI/SizeControl';
import MaterialSelector from '../UI/MaterialSelector';
import LegTypeSelector from '../UI/LegTypeSelector';
import styles from './DeskConfigurator.module.css';
import {materials, materialColors} from "../types/DeskConfiguration";

const DeskConfigurator: React.FC = () => {
    const {
        configuration,
        canvasRef,
        setWidth,
        setDepth,
        setLegHeight,
        setMaterial,
        setLegProp,
    } = useDeskConfigurator();

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <h2>Конфигуратор стола</h2>
                <SizeControl
                    label="Ширина (мм)"
                    value={configuration.width}
                    onChange={setWidth}
                    min={1200}
                    max={2400}
                />
                <SizeControl
                    label="Глубина (мм)"
                    value={configuration.depth}
                    onChange={setDepth}
                    min={250}
                    max={1500}
                />
                <SizeControl
                    label="Высота ножек (мм)"
                    value={configuration.legHeight}
                    onChange={setLegHeight}
                    min={500}
                    max={1200}
                />
                <MaterialSelector
                    materials={materials}
                    selectedMaterial={configuration.material}
                    onMaterialChange={setMaterial}
                    materialColors={materialColors}
                />
                <LegTypeSelector
                    selectedLegType={configuration.legType}
                    onLegTypeChange={setLegProp}
                />
                <p>Текущая конфигурация:</p>
                    <div>
                    {
                        Object.keys(configuration).map(
                            (key, index) => <p key={index}>{`${key}: ${configuration[key]}`}</p>
                        )
                    }
                    </div>
            </div>
            <div className={styles.viewer}>
                <canvas ref={canvasRef} className={styles.canvas} />
            </div>
        </div>
    );
};

export default DeskConfigurator;