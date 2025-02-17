import { useState, useEffect, useRef } from 'react';
import SceneManager from '../ThreeJs/SceneManager';
import { DeskConfiguration, defaultDeskConfiguration } from '../types/DeskConfiguration';

import leg_model_url from '../ThreeJs/models/leg.glb?url'
import ashwood_url from '../ThreeJs/textures/top_ashwood_mat.glb?url';
import cedar_url from '../ThreeJs/textures/top_cedar_mat.glb?url';
import plasticblack_url from '../ThreeJs/textures/top_plastic_black_mat.glb?url';
import plasticwhite_url from '../ThreeJs/textures/top_plastic_white_mat.glb?url';
import walnut_url from '../ThreeJs/textures/top_walnut_mat.glb?url';

import leg_prop_1_url from '../ThreeJs/models/prop_01.glb?url';
import leg_prop_2_url from '../ThreeJs/models/prop_02.glb?url';

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
        const legURL = leg_model_url;
        // const legProp1URL = '/models/prop_01.glb';
        // const legProp2URL = '/models/prop_02.glb';
        const texturesURLs = {
            ashwood: ashwood_url,
            cedar: cedar_url,
            plasticblack: plasticblack_url,
            plasticwhite: plasticwhite_url,
            walnut: walnut_url,
        };
        const legPropURLs = {
            1: leg_prop_1_url,
            2: leg_prop_2_url,
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
            sceneManagerRef.current.resizeTableTop(width, null);
        }
        setConfiguration(prev => ({ ...prev, width }));
    };

    const setDepth = (depth: number) => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current
                .updateLegDepth(depth)
                .then(
                    () => sceneManagerRef.current.resizeTableTop(null, depth)
                );
        }
        setConfiguration(prev => ({ ...prev, depth }));
    };

    const setLegHeight = (legHeight: number) => {
        sceneManagerRef.current.updateLegHeight(legHeight);
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