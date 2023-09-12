import '../scss/styles.scss'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats-js';
document.addEventListener("DOMContentLoaded", function() {


    /* -------------------------------------------------------------------------- */
    /* Basic Setup */
    /* -------------------------------------------------------------------------- */
    let imgRatio = 640 / 375; //image ratio
    let imgInitSize = 0.2; //image initial size
    let speed = 0.004; //marching stack speed towards the front
    let imgScale = 0.08 //image scale index
    let mouseX = 0,
        mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let imgcnt = 10; //per stack image amount
    let images1 = []; //per stack is a array of 10 images 
    let images2 = []; //per stack is a array of 10 images 
    let images3 = []; //per stack is a array of 10 images 
    let images4 = []; //per stack is a array of 10 images 
    let imgStack = []; // imgStack is the array of 11 layers, per layer has 4 images, 10 of 11 are the marching images and a top layer stay on top

    /* -------------------------- three js scene set up ------------------------- */
    const sizes = {
        width: window.innerWidth,
        height: window.innerWidth * 2.16
    }

    const canvas = document.querySelector('canvas.webgl')
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        1000
    )
    camera.position.z = 2;

    scene.add(camera)
    scene.background = new THREE.Color(0x000000);

    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth
        sizes.height = window.innerWidth * 2.16
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerWidth * 2.16 / 2;
        camera.aspect = sizes.width / sizes
            .height
        camera
            .updateProjectionMatrix()
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // const controls = new OrbitControls(camera, renderer.domElement);


    /* ---------------------------- declare materials --------------------------- */
    let fadeMaterial,
        fadeMesh;
    fadeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000,
        transparent: true,
        opacity: 0.04
    });
    let texture1,
        material1;
    let texture2,
        material2;
    let texture3,
        material3;
    let texture4,
        material4;
    texture1 = new THREE
        .TextureLoader()
        .load('./h1.png');
    material1 = new THREE.MeshBasicMaterial({ map: texture1 });
    texture2 = new THREE
        .TextureLoader()
        .load('./h2.png');
    material2 = new THREE.MeshBasicMaterial({ map: texture2 });
    texture3 = new THREE
        .TextureLoader()
        .load('./h3.png');
    material3 = new THREE.MeshBasicMaterial({ map: texture3 });
    texture4 = new THREE
        .TextureLoader()
        .load('./h4.png');
    material4 = new THREE.MeshBasicMaterial({ map: texture4 });

    /* ------------------------------ image objects ----------------------------- */
    class MarchingImage {
        constructor(material, imgRatio, initialZ, speed, id, x, y, imgScale, positionx, positiony) {
            this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(imgInitSize * imgRatio, imgInitSize), material);
            this.id = id;
            this.mesh.position.z = initialZ;
            this.mesh.position.x = positionx + x * .05 * this.id;
            this.mesh.position.y = positiony + y * .02 * this.id;
            this.speed = speed;
            this.movingForward = true;
            this.imgScale = imgScale;
            this.mesh.scale.set(this.imgScale, this.imgScale, this.imgScale)
        }

        updatePosition(x, y, positionx, positiony) {
            if (this.movingForward) {
                this.mesh.position.z += this.speed;
                this.mesh.position.x += this.speed * x;
                this.mesh.position.y += this.speed / 5 * 2 * y;
                // this.mesh.scale += this.speed / 5 * 
                this.imgScale += this.speed / 5 * 8;
            } else {
                this.mesh.position.z = 0;
                this.mesh.position.x = positionx;
                this.mesh.position.y = positiony;
                this.imgScale = 1;
            }
            this.mesh.scale.set(this.imgScale, this.imgScale, this.imgScale)

            if (this.mesh.position.z >= .5) {
                this.movingForward = false;
            } else {
                this.movingForward = true;
            }
        }

        getPositionZ() {
            return this.mesh.position.z;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                             initialize                                     */
    /* -------------------------------------------------------------------------- */
    function init() {
        // initial position and the style of the moving image stacks
        for (let i = 0; i < imgcnt; i++) {
            let image1 = new MarchingImage(material1, imgRatio, i * 0.05, speed, i, -1, -1, imgScale * i + 1, 0.38, -0.1);
            let image2 = new MarchingImage(material2, imgRatio, i * 0.05, speed, i, 1, -1, imgScale * i + 1, -.38, -.65);
            let image3 = new MarchingImage(material3, imgRatio, i * 0.05, speed, i, -1, 1, imgScale * i + 1, .38, .65);
            let image4 = new MarchingImage(material4, imgRatio, i * 0.05, speed, i, 1, 1, imgScale * i + 1, -.38, .1);
            let imgGroup = new THREE.Group();
            imgGroup.add(image1.mesh);
            imgGroup.add(image2.mesh);
            imgGroup.add(image3.mesh);
            imgGroup.add(image4.mesh);
            scene.add(imgGroup);
            imgStack.push(imgGroup);
            images1.push(image1);
            images2.push(image2);
            images3.push(image3);
            images4.push(image4);
        }

        // initial position and the style of the TOP image stacks
        let front1 = new THREE.Mesh(new THREE.PlaneGeometry(imgInitSize * imgRatio, imgInitSize), material1)
        let front2 = new THREE.Mesh(new THREE.PlaneGeometry(imgInitSize * imgRatio, imgInitSize), material2)
        let front3 = new THREE.Mesh(new THREE.PlaneGeometry(imgInitSize * imgRatio, imgInitSize), material3)
        let front4 = new THREE.Mesh(new THREE.PlaneGeometry(imgInitSize * imgRatio, imgInitSize), material4)
        front1.position.set(-.12, -.3, .51)
        front2.position.set(.12, -.85, .51)
        front3.position.set(-.12, .85, .51)
        front4.position.set(.12, .3, .51)
        let frontScale = 1 + 0.08 * 10;
        front1.scale.set(frontScale, frontScale, frontScale)
        front2.scale.set(frontScale, frontScale, frontScale)
        front3.scale.set(frontScale, frontScale, frontScale)
        front4.scale.set(frontScale, frontScale, frontScale)
        let imgGroup = new THREE.Group();
        imgGroup.add(front1)
        imgGroup.add(front2)
        imgGroup.add(front3)
        imgGroup.add(front4)
        imgStack.push(imgGroup)
        scene.add(imgGroup);
    }

    // initial position and the style of the fading effect
    for (let i = 0; i < imgcnt * 10; i++) {
        fadeMesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), fadeMaterial);
        fadeMesh.position.z = i * .05 / 10 - 0.1;
        scene.add(fadeMesh);
    }

    /* -------------------------------------------------------------------------- */
    /*                          animation and interaction                         */
    /* -------------------------------------------------------------------------- */
    function animate() {
        requestAnimationFrame(animate);
        // update the marching image stacks
        for (let i = 0; i < imgcnt; i++) {
            images1[i].updatePosition(-1, -1, .38, -.1);
            images2[i].updatePosition(1, -1, -.38, -.65);
            images3[i].updatePosition(-1, 1, .38, .65);
            images4[i].updatePosition(1, 1, -.38, .1);
        }
        // update the stacks following the cursor

        renderer.render(scene, camera);
    }
    init();
    animate();


    /* ------------------------ mobile gyroscope function ----------------------- */
    const orientationbtn = document.getElementById("orientationbtn");
    orientationbtn.addEventListener("click", function() {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(permissionState => {
                if (permissionState === "granted") {
                    console.log("3")
                    orientationmove()
                } else {
                    orientationbtn.style.display = "none";
                    console.log("no3")
                        // document.getElementById("restartindication").style.display = "block"
                }
            }).catch(console.error);
        }
    });

    function orientationmove() {
        // if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', handleOrientation, true);

        function handleOrientation(event) {
            // Gyroscope data is available in event object
            // var alpha = event.alpha; // Z-axis rotation
            // var beta = event.beta; // X-axis rotation
            // var gamma = event.gamma; // Y-axis rotation
            mouseY = event.beta - 45;
            mouseX = event.gamma;
            for (let i = 0; i < imgcnt; i++) {
                let a = images1[i].getPositionZ() / .05
                imgStack[i].position.x += (-mouseX / 3000 * a - imgStack[i].position.x) * (.005 * a * a + 0.02);
                imgStack[i].position.y += (mouseY / 3000 * a - imgStack[i].position.y) * (.005 * a * a + 0.02);
            }
            // update the TOP stack following the cursor
            imgStack[10].position.x += (-mouseX / 300 - imgStack[10].position.x) * (.005 * 100 + 0.02);
            imgStack[10].position.y += (mouseY / 300 - imgStack[10].position.y) * (.005 * 100 + 0.02);
            // console.log("mouseX")
            // Use the data for your application
            // For example, update a 3D object's orientation
        }
        // mouseX = (event.clientX - windowHalfX) * 4;
        // mouseY = (event.clientY - windowHalfY) * 4;
        // } else {
        //     document.addEventListener('mousemove', onDocumentMouseMove);

        //     function onDocumentMouseMove(event) {
        //         mouseX = (event.clientX - windowHalfX) * 4;
        //         mouseY = (event.clientY - windowHalfY) * 4;
        //     }
        // }
    }


    /* ----------------------- subpage link to the images ----------------------- */
    const subPage1 = document.getElementById("subPage1");
    const subPage2 = document.getElementById("subPage2");
    const subPage3 = document.getElementById("subPage3");
    const subPage4 = document.getElementById("subPage4");
    const externalLink1 = "https://google.com";
    const externalLink2 = "https://www.bing.com/";
    const externalLink3 = "https://openai.com/";
    const externalLink4 = "https://www.youtube.com/";
    subPage1.addEventListener("click", function() {
        window.open(externalLink1, "_blank");
    });
    subPage2.addEventListener("click", function() {
        window.open(externalLink2, "_blank");
    });
    subPage3.addEventListener("click", function() {
        window.open(externalLink3, "_blank");
    });
    subPage4.addEventListener("click", function() {
        window.open(externalLink4, "_blank");
    });
});