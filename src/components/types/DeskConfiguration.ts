
export interface DeskConfiguration {
    width: number;      // мм
    depth: number;      // мм
    legHeight: number;  // мм
    material: string;   // Название материала
    legType: number;   // 1 или 2
}

export const defaultDeskConfiguration: DeskConfiguration = {
    width: 1500,
    depth: 300,
    legHeight: 500,
    material: 'Ashwood',
    legType: 1,
};

export const materialColors: {[key: string]: string} = {
    Ashwood: '#c7b299',
    Cedar: '#cd7f32',
    PlasticBlack: '#1c1c1c',
    PlasticWhite: '#f0f0f0',
    Walnut: '#773f1a',
};

export const materials = Object.keys(materialColors);