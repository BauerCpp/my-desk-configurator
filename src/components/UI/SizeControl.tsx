import React, {useState} from 'react';
import styles from './UI.module.css';

interface SizeControlProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
}

const SizeControl: React.FC<SizeControlProps> = ({ label, value, onChange, min, max }) => {
    const [size, setSize] = useState(value)
    return (
        <div className={styles.control}>
            <label htmlFor={label}>{label}:</label>
            <input
                type="number"
                id={label}
                value={size}
                onChange={(e) =>
                    {
                        const _value = Number(e.target.value);
                        if (_value < min || _value > max)
                        {
                            setSize(_value);
                            return;
                        }
                        else
                        {
                            setSize(_value);
                            onChange(_value);
                        }
                    }}
                min={min}
                max={max}
            />
        </div>
    );
};

export default SizeControl;