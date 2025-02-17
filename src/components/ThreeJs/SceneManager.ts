import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
// import { defaultDeskConfiguration } from '../types/DeskConfiguration';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { DeskConfiguration } from '../types/DeskConfiguration';
const HEIGHT = 16;

class SceneManager {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    material: THREE.Material;
    materialName: string;
    tableTop: THREE.Mesh;
    legURL: string;
    legsURLs: { [key: string]: string };
    legsGroup: THREE.Group;
    legHeight: number;
    texturesURLs: { [key: string]: string };
    table: THREE.Group;
    deskWidth: number;
    deskDepth: number;
    deskHeight: number;
    leg_width: number;
    leg_offset_y: number;

    private width: number;
    private height: number;

    constructor(canvas: HTMLCanvasElement,
                legURL: string,
                legURLs: { [key: string]: string },
                texturesURLs: { [key: string]: string }) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.legURL = legURL;
        this.texturesURLs = texturesURLs;
        this.legsURLs = legURLs;
        this.material = new THREE.MeshStandardMaterial({ color: 0x0303030, side: THREE.DoubleSide });
        this.materialName = '';
        this.table = new THREE.Group();
        this.tableTop = new THREE.Mesh();
        this.legsGroup = new THREE.Group();
        this.legHeight = 0;
        this.deskWidth = 0;
        this.deskDepth = 0;
        this.deskHeight = 0;
        this.leg_width = 0;
        this.leg_offset_y = 0;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xeeeeee);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 1.5, 0);  // Adjust initial camera position
        this.scene.add(this.camera);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true; // Enable shadows
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 1000;

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
        directionalLight.position.set(5, 10, 10);
        directionalLight.castShadow = true; // Enable shadow casting
        this.scene.add(directionalLight);


        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            side: THREE.DoubleSide,
            roughness: 0.8,
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        this.scene.add(plane);
    }

    createTable = async (configuration: DeskConfiguration) => {
        const { width, legHeight, depth, material, legType } = configuration;
        const _width = (width) / 1000;
        const _depth = (depth) / 1000;

        this.legHeight = legHeight;
        this.deskWidth = width;
        this.deskDepth = depth;

        await this.createLegs(this.legURL, this.legsURLs[legType], width, legHeight, depth)

        this.tableTop = this.createTableTop(_width, _depth, material)
        this.updateDeskHeight(legHeight)


        this.scene.add(this.table);
        this.table.translateX(-_width / 2)
        // this.camera.position.setZ(_depth * 3)
        return this.table;
    }

    createTableTop(width: number, depth: number, material: string) {
        const geometry = new THREE.BoxGeometry(width, HEIGHT / 1000, depth);
        const _material = this.material;
        const _tableTop = new THREE.Mesh(geometry, _material);

        _tableTop.position.sub(new THREE.Vector3(-width / 2, -(HEIGHT / 1000) / 2, -depth / 2 + 150 / 1000));

        _tableTop.name = 'TableTop'
        _tableTop.castShadow = true; // Important for shadows
        this.table.add(_tableTop);
        this.updateTableTopMaterial(material);
        this.tableTop = _tableTop;
        return _tableTop;
    }

    createLegs = async (legURL: string, legPropURL: string, center_distance: number, height: number, depth: number) => {
        await this.loadMorphedObject(this.legURL, center_distance, height, depth)
    }

    updateTableTopMaterial = async (materialName: string) => {
        const _object = this.table.getObjectByName('TableTop');

        if (_object)
        {
            _object.material.dispose();

            if (this.materialName !== materialName)
            {
                const loader = new GLTFLoader();
                const materialURL = this.texturesURLs[materialName.toLowerCase()]
                const gltf = await loader.loadAsync(materialURL);
                _object.material = gltf.scene.children[0].material;
                this.materialName = materialName;
                this.material = gltf.scene.children[0].material.clone();
            }
            else{
                _object.material = this.material;
            }
        }
    };

    resizeTableTop(width: number, depth: number) {
        if (this.tableTop)
        {
            this.table.remove(this.tableTop);
            this.scene.remove(this.tableTop);
            this.tableTop.geometry.dispose();
            this.tableTop.material.dispose();
        }

        this.tableTop = this.createTableTop(width / 1000, depth / 1000, this.materialName);
        this.updateDeskHeight(this.legHeight)
        this.table.add(this.tableTop);
    }

    async loadMorphedObject(modelURL: string, center_distance: number, height: number, depth: number) {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(
            modelURL
        );

        const model = gltf.scene;
        model.traverse((child: THREE.Object3D) => {
            if ((child as THREE.SkinnedMesh).isSkinnedMesh || (child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.SkinnedMesh | THREE.Mesh; // Type assertion
                if (mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
                    // this.mesh = mesh;
                    // mesh.morphTargetDictionary;
                    console.log(height, (height - 500) / (1200 - 500))
                    // mesh.morphTargetInfluences[0] = 0.5;
                    // mesh.morphTargetInfluences[1] = 0.1;
                    console.log("Mesh with morph targets found:", mesh);
                    // mesh.position.set(-center_distance / 2000, -height / 1000, 0);
                    // mesh.geometry.morphTargetsRelative = t;
                    mesh.castShadow = true;
                    mesh.morphTargetInfluences[1] = 0;
                    mesh.morphTargetInfluences[0] = 0;
                    mesh.material.metalness = 0.8;

                    // 3. Translate *back* along the Z axis to achieve z=0 centering *relative to the morph target deformation*
                    // mesh.translateX(-zOffset);
                    // mesh.rotateY(Math.PI / 2);
                    mesh.geometry.computeBoundingBox()
                }
            }
        });

        model.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

        const box = new THREE.Box3();
        const sizes = new THREE.Vector3();
        this.box3expand(box, model)
        box.getSize(sizes);
        const leg_width = sizes.x;


        this.leg_width = leg_width;
        this.leg_offset_y = box.max.y - 0.5;
        this.deskHeight = box.max.y;
        const prop = await this.loadProps(1);
        this.updatePropsPosition(depth, center_distance)
        model.position.setX(leg_width / 2)
        model.name = 'Leg'

        const model2 = SkeletonUtils.clone(model);

        model2.position.setX((center_distance / 1000) - leg_width / 2);
        model2.scale.set(1, 1, -1)
        this.legsArray = [model, model2]
        // this.legsGroup = new THREE.Group();

        // this.legsGroup.add(...this.legsArray)
        this.table.add(model, model2)

        this.updateLegDepth(depth)

    //     loader.load(
    //     modelURL, // Replace with your model path
    //     (gltf: GLTFResult) => {
    //         this.model = gltf.scene;
    //         // Find the mesh with morph targets (adjust selection logic if needed)
    //         gltf.scene.traverse((child: THREE.Object3D) => {
    //             if ((child as THREE.SkinnedMesh).isSkinnedMesh || (child as THREE.Mesh).isMesh) {
    //                 const mesh = child as THREE.SkinnedMesh | THREE.Mesh; // Type assertion
    //                 if (mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
    //                     this.mesh = mesh;
    //                     this.morphTargetDictionary = mesh.morphTargetDictionary;
    //                     this.morphTargetInfluences = mesh.morphTargetInfluences;

    //                     // mesh.morphTargetInfluences[0] = 0.5;
    //                     // mesh.morphTargetInfluences[1] = 0.1;
    //                     console.log("Mesh with morph targets found:", this.mesh);

    //                     mesh.position.set(center_distance / 2, -height, 0);
    //                     mesh.rotateY(Math.PI / 2);
    //                 }
    //             }
    //         });


    //         if (!this.mesh) {
    //             console.warn("No mesh with morph targets found in the GLB model.");
    //         }
    //     },
    //     (xhr) => {
    //         console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    //     },
    //     (error) => {
    //         console.error('An error happened', error);
    //     }
    // );
    }

    //  Helper function to safely extract geometry.  Handles BufferGeometry and other cases.
    private extractGeometry(scene: THREE.Scene): THREE.BufferGeometry | undefined {
        let geometry: THREE.BufferGeometry | undefined;

        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.geometry instanceof THREE.BufferGeometry) {
                    geometry = mesh.geometry;
                    //Check for morphing attributes and set flag if they exists
                    if ((geometry as THREE.BufferGeometry).morphAttributes && Object.keys((geometry as THREE.BufferGeometry).morphAttributes).length > 0) {
                    geometry.morphTargetsRelative = true;
                    }

                } else if (mesh.geometry instanceof THREE.Geometry) {
                    // Convert THREE.Geometry to THREE.BufferGeometry (deprecated, but handle for compatibility)
                    geometry = new THREE.BufferGeometry().fromGeometry(mesh.geometry);
                    if ((geometry as THREE.BufferGeometry).morphAttributes && Object.keys((geometry as THREE.BufferGeometry).morphAttributes).length > 0) {
                    geometry.morphTargetsRelative = true;
                    }
                }
                if (geometry) {
                    return; // Stop traversing after finding the first suitable geometry.
                }
            }
        });
        return geometry;
    }

    box3expand(box3, object) {
        let geometry = object.geometry;
        object.updateWorldMatrix(geometry ? true : false, false);

        if (geometry) {
            let matrix = object.matrixWorld;
            let position = geometry.attributes.position.clone();
            position.applyMatrix4(new THREE.Matrix4().extractRotation(matrix));
            let bounds = new THREE.Box3().setFromBufferAttribute(position);
            let bt = new THREE.Box3().copy(bounds);
            let m4 = new THREE.Matrix4();
            m4.setPosition(new THREE.Vector3().setFromMatrixPosition(object.matrixWorld));
            bt.applyMatrix4(m4);
            box3.union(bt);
        }

        let children = object.children;
        for (let i = 0, l = children.length; i < l; i++) {
            this.box3expand(box3, children[i]);
        }
    }

    async loadProps(legProp: number)
    {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(this.legsURLs[legProp]);

        const scene = gltf.scene;

        const box = new THREE.Box3().setFromObject(scene);
        const sizes = new THREE.Vector3();

        box.getSize(sizes);
        this.propHeight = sizes.y;
        this.propWidth = sizes.x;

        if (scene && scene.children.length > 0) {
            scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const instancesCount = 4;
                    const geometry = child.geometry;
                    const material = child.material;

                    this.legProps = new THREE.InstancedMesh(geometry, material, instancesCount);
                    this.legProps.castShadow = true;
                    this.legProps.name = "Prop"; // Helpful for debugging and later selection.
                    this.legProps.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Important for updating matrices efficiently.
                    // this.legProps.computeBoundingSphere(); // Compute bounding sphere, helps with frustum culling
                    this.table.attach(this.legProps);
                }
            });
        }

        return this.legProps;
    }

    updatePropsPosition(depth: number, width: number)
    {
        console.log('update position')
        // Initialize instance matrices.  This is where you position, rotate, and scale each legs
        const dummy = new THREE.Object3D(); // Use an Object3D for easier matrix manipulation.
        const _depth = depth / 1000;
        const _width = width / 1000;

        const gltf_obj = this.legProps;
        const bounding_box = new THREE.Box3();

        bounding_box.setFromObject( gltf_obj);
        let size = bounding_box.getSize( new THREE.Vector3() );
        let center = bounding_box.getCenter( new THREE.Vector3() ).multiplyScalar( -1 );
        let sign = -1;
        gltf_obj.position.sub(new THREE.Vector3());
        // Move to the center

        if (center.x !== 0) gltf_obj.translateX( center.x );
        if (center.y !== 0) gltf_obj.translateY( center.y );
        if (center.z !== 0) gltf_obj.translateZ( center.z );

        bounding_box.setFromObject( gltf_obj);
        size = bounding_box.getSize( new THREE.Vector3() );
        center = bounding_box.getCenter( new THREE.Vector3() ).multiplyScalar( -1 );
        sign = -1;
        gltf_obj.position.sub(new THREE.Vector3());
        // Move to the center

        if (center.x !== 0) gltf_obj.translateX( center.x );
        if (center.y !== 0) gltf_obj.translateY( center.y );
        if (center.z !== 0) gltf_obj.translateZ( center.z );

        gltf_obj.position.add(this.table.position);

        let count = 0;

        for (let index = 0; index < 2; index++) {
            let x = center.x + index * ( _width - this.leg_width );
            let z = center.z  - (150 / 1000) + this.propWidth;
            dummy.position.setX(x);
            dummy.position.x = dummy.position.x + this.leg_width / 2;
            for (let index2 = 0; index2 < 2; index2++) {

                z += center.z + index2 *((depth - 75) / 1000 + this.propWidth) ; //


                dummy.position.setZ(z);
                dummy.position.y = center.y + this.propHeight / 2;

                dummy.updateMatrix();
                this.legProps.setMatrixAt(count, dummy.matrix);

                count++;
                sign*=-1;
            }
        }


                // for (let i = 0; i < 2; i++) {
                //     // Calculate position, rotation, and scale for each instance.
                //     const x = (sign * (depth / 2) / 1000) - (sign * _offset); // Example: Random X position between -1 and 1
                //     const z = 0; //
                //     const y = 0; // Set y position, adjust as needed
                //     dummy.position.set(x, y, z);

                //     // Optionally randomize rotation and scale:
                //     // dummy.rotation.y = Math.random() * Math.PI * 2; // Random rotation around Y axis
                //     // dummy.scale.setScalar(0.5 + Math.random() * 0.5); // Scale between 0.5 and 1.0
                //     // dummy.applyMatrix4(this.legsArray[leg_index].matix)
                //     dummy.updateMatrix();
                //     prop.setMatrixAt(i, dummy.matrix);
                //     this.propsMatrix = dummy.matrix;
                //     sign *= -1;
                //     // index++;
                // }
        this.legProps.instanceMatrix.needsUpdate = true;  // Signal that the matrix buffer needs updating.

    }

    updateLegHeight(height: number) {
        this.legsArray?.forEach(
            (elm) =>
            {
                if (elm && elm.children.length > 0) {
                    elm.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh && (child as any).morphTargetInfluences) {
                            console.log('update height')
                            child.morphTargetInfluences[1] = (height - 500) / (1200 - 500); // Assuming height is the second morph target.
                        }
                    });
                }
            }
        )

        this.updateDeskHeight(height);
    }

    updateDeskHeight(height: number)
    {
        if (this.tableTop)
        {
            this.tableTop.position.setY((height  / 1000) + this.leg_offset_y);
            this.tableTop.position.sub(new THREE.Vector3(0, -(HEIGHT / 1000) / 2, 0))
        }
    }

    updateLegsWidth(width: number)
    {
        this.legsArray[1].position.setX((width / 1000) - (this.leg_width / 2))
        this.deskWidth = width;
        this.updatePropsPosition(this.deskDepth, width)
    }

    updateLegDepth(depth: number) {
        return new Promise(
            (resolve) =>
            {
                this.legsArray?.forEach(
                (elm) =>
                {
                    if (elm && elm.children.length > 0) {
                        elm.traverse((child) => {
                            if ((child as THREE.Mesh).isMesh && (child as any).morphTargetInfluences) {

                                (child as any).morphTargetInfluences[0] = (depth - 300) / (1500 - 300); // Assuming length is the first morph target.
                                child.geometry.computeBoundingBox();
                            }
                        });
                    }
                })

                this.deskDepth = depth;
                this.updatePropsPosition(depth, this.deskWidth)
                resolve();
            }
        )

    }

    resizeRendererToDisplaySize() {
        const canvas = this.renderer.domElement;
        const width = canvas.width;
        const height = canvas.height;

        const needResize = width !== this.width || height !== this.height;
        if (needResize) {
            this.width = width;
            this.height = height;
            canvas.width = width;
            canvas.height = height;
            this.renderer.setSize(width, height, false);
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
        }
        return needResize;
    }

    async changeLegProp (propIndex: number) {
        const prop = this.table.getObjectByName('Prop');
        this.table.remove(prop);
        this.legProps = null;
        await this.loadProps(propIndex);
        this.updatePropsPosition(this.deskDepth, this.deskWidth)
    }

    update() {
        this.controls.update();

        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

export default SceneManager;