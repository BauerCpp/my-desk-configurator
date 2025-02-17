import { useState, useEffect, useRef } from 'react';
import SceneManager from '../ThreeJs/SceneManager';
import { DeskConfiguration, defaultDeskConfiguration } from '../types/DeskConfiguration';

interface UseDeskConfiguratorProps {
    onConfigurationChange?: (config: DeskConfiguration) => void;
    initialConfiguration?: DeskConfiguration;
}

const useDeskConfigurator = (props: UseDeskConfiguratorProps = {}) => {
    const { onConfigurationChange, initialConfiguration } = props;
    // const [configuration, setConfiguration] = useState<DeskConfiguration>(initialConfiguration || defaultDeskConfiguration);
    const [configuration, setConfiguration] = useState<DeskConfiguration>(defaultDeskConfiguration);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);

    useEffect(() => {
        const legURL = '/models/leg.glb';
        // const legProp1URL = '/models/prop_01.glb';
        // const legProp2URL = '/models/prop_02.glb';
        const texturesURLs = {
            ashwood: '/textures/top_ashwood_mat.glb',
            cedar: '/textures/top_cedar_mat.glb',
            plasticblack: '/textures/top_plastic_black_mat.glb',
            plasticwhite: '/textures/top_plastic_white_mat.glb',
            walnut: '/textures/top_walnut_mat.glb',
        };
        const legPropURLs = {
            1: '/models/prop_01.glb',
            2: '/models/prop_02.glb',
        };

        if (canvasRef.current) {
            sceneManagerRef.current = new SceneManager(canvasRef.current, legURL, legPropURLs, texturesURLs);
            // sceneManagerRef.current.updateTableTopMaterial(configuration.material);
            // sceneManagerRef.current.resizeTableTop(configuration.width, configuration.depth);
            // sceneManagerRef.current.updateLegHeight(configuration.legHeight);
            // sceneManagerRef.current.updateLegDepth(configuration.depth);
            sceneManagerRef.current.createTable(configuration);

            const animate = () => {
                requestAnimationFrame(animate);
                sceneManagerRef.current?.update();
            };

            animate();
        }

        return () => {
            // Cleanup function (optional, but good practice)
            if (sceneManagerRef.current) {
                // Dispose of resources to prevent memory leaks
                // sceneManagerRef.current.scene.dispose();
                sceneManagerRef.current.renderer.dispose();
                sceneManagerRef.current.controls.dispose();
                sceneManagerRef.current = null;
            }
        };
    }, []);

    // Effect to handle configuration changes and update the 3D scene

    // useEffect(() => {
    //     if (sceneManagerRef.current) {
    //         sceneManagerRef.current.updateTableTopMaterial(configuration.material);
    //         sceneManagerRef.current.resizeTableTop(configuration.width, configuration.depth);
    //         sceneManagerRef.current.updateLegHeight(configuration.legHeight);
    //         sceneManagerRef.current.updateLegDepth(configuration.depth);
    //     }
    //     if (onConfigurationChange) {
    //         onConfigurationChange(configuration);
    //     }
    // }, [configuration, onConfigurationChange]);

    const setWidth = (width: number) => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.updateLegsWidth(width);
            sceneManagerRef.current.resizeTableTop(width, configuration.depth);
        }
        setConfiguration(prev => ({ ...prev, width }));
    };

    const setDepth = (depth: number) => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current
                .updateLegDepth(configuration.depth)
                .then(
                    () => sceneManagerRef.current.resizeTableTop(configuration.width, depth)
                );
        }
        setConfiguration(prev => ({ ...prev, depth }));
    };

    const setLegHeight = (legHeight: number) => {
        sceneManagerRef.current.updateLegHeight(configuration.legHeight);
        setConfiguration(prev => ({ ...prev, legHeight }));
    };

    const setMaterial = (material: string) => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.updateTableTopMaterial(material);
        }
        setConfiguration(prev => ({ ...prev, material }));
    };

    const setLegProp = (legProp: number) => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.changeLegProp(legProp);
        }
        setConfiguration(prev => ({ ...prev, legType: legProp }));
    };

    return {
        configuration,
        canvasRef,
        setWidth,
        setDepth,
        setLegHeight,
        setMaterial,
        setLegProp,
    };
};

export default useDeskConfigurator;