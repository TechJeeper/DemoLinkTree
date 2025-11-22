import * as THREE from 'three';

// Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(15);

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 200, 100);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light

scene.add(pointLight, ambientLight);

// Helper to create text texture
function createTextTexture(text, color = 'white') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    // Background (optional, can be transparent)
    // context.fillStyle = 'rgba(0,0,0,0.5)';
    // context.fillRect(0, 0, 256, 256);

    context.font = 'Bold 60px Arial';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 128);

    return new THREE.CanvasTexture(canvas);
}

// Social Links Data
const socials = [
    { name: 'Twitch', color: 0x9146FF, url: 'https://twitch.tv/shenanigans3d', position: [-6, 0, 0], icon: 'Twitch' },
    { name: 'YouTube', color: 0xFF0000, url: 'https://www.youtube.com/@Shenanigans3D', position: [-3, 2, -2], icon: 'YouTube' },
    { name: 'Thangs', color: 0x00E676, url: 'https://thangs.com/designer/shenanigans3d', position: [0, 0, 0], icon: 'Thangs' }, // Center
    { name: 'Twitter', color: 0x1DA1F2, url: 'https://twitter.com/shenanigans3d', position: [3, 2, -2], icon: 'Twitter' },
    { name: 'TikTok', color: 0xFF0050, url: 'https://www.tiktok.com/@shenanigans3d', position: [6, 0, 0], icon: 'TikTok' }
];

const objects = [];

// Create Social Objects (Cubes for now)
socials.forEach(social => {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Create materials for each face. We'll put the text on the front face (index 4 or 5 usually, but we can do all sides)
    // Or simpler: mix color with a texture.
    // Let's try creating a texture with the name on it.
    const textTexture = createTextTexture(social.icon);
    
    const material = new THREE.MeshStandardMaterial({ 
        color: social.color,
        roughness: 0.3,
        metalness: 0.7,
        map: textTexture // Apply text texture
    });
    
    const cube = new THREE.Mesh(geometry, material);
    
    cube.position.set(...social.position);
    cube.userData = { url: social.url, name: social.name };
    
    scene.add(cube);
    objects.push(cube);
});

// Stars/Particles Background
function addStar() {
    const geometry = new THREE.SphereGeometry(0.1, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z);
    scene.add(star);
}

Array(200).fill().forEach(addStar);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    objects.forEach(obj => {
        obj.rotation.x += 0.005;
        obj.rotation.y += 0.01;
    });
    
    // Gentle camera movement or scene rotation
    scene.rotation.y += 0.0005;

    renderer.render(scene, camera);
}

animate();

// Interaction
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Use mousemove instead of pointermove for broader compatibility if needed, but pointermove is fine.
function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onClick(event) {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        const target = intersects[0].object;
        if (target.userData.url) {
            window.open(target.userData.url, '_blank');
        }
    }
}

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener( 'click', onClick );

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Hover Effect
let hoveredObject = null;

function updateHover() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        const target = intersects[0].object;
        
        if (hoveredObject !== target) {
             // Reset previous hovered object
            if (hoveredObject) {
                hoveredObject.scale.set(1, 1, 1);
            }
            hoveredObject = target;
            // Scale up
             target.scale.set(1.2, 1.2, 1.2);
        }
       
        document.body.style.cursor = 'pointer';
    } else {
        if (hoveredObject) {
            hoveredObject.scale.set(1, 1, 1);
            hoveredObject = null;
        }
        document.body.style.cursor = 'default';
    }
    requestAnimationFrame(updateHover);
}

updateHover();
