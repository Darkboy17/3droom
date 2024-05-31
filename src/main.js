import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// create a room of 1000 sq ft.
createRoom(1000);

const numObjects = 50; // Number of random objects to place in the room
const placedObjects = []; // Array to store placed objects' bounding boxes

for (let i = 0; i < numObjects; i++) {
  let object;
  let intersecting;
  let attempts = 0;

  // Limit the number of attempts to find a non-overlapping position
  const maxAttempts = 100;

  do {
    // Create object with random size, position, and color
    const sizeX = Math.random() * 3 + 1; // Random size between 1 and 3
    const sizeY = Math.random() * 3 + 1; // Random size between 1 and 3
    const sizeZ = Math.random() * 3 + 1; // Random size between 1 and 3

    const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
    const material = new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
    });
    object = new THREE.Mesh(geometry, material);

    // Randomly place some objects in the room without overlapping
    const x = (Math.random() - 0.5) * (31.62 - sizeX);
    const z = (Math.random() - 0.5) * (31.62 - sizeZ);
    const y = sizeY / 2; // Position the object on the floor

    object.position.set(x, y, z);

    // Check for intersection with already placed objects
    intersecting = isIntersecting(object, placedObjects);
    attempts++;
  } while (intersecting && attempts < maxAttempts);

  if (attempts < maxAttempts) {
    scene.add(object);
    placedObjects.push(new THREE.Box3().setFromObject(object));
  }
}

// Function to get a random geometry (BoxGeometry, SphereGeometry, CylinderGeometry)
function getRandomGeometry() {
  const geometries = [
    THREE.BoxGeometry,
    THREE.SphereGeometry,
    THREE.CylinderGeometry,
  ];
  const randomIndex = Math.floor(Math.random() * geometries.length);
  return geometries[randomIndex];
}

function createRoom(area) {
  // get the coordinates from the area
  // 1000 sqft = 31.62 ft x 31.62 ft

  let x = Math.sqrt(area),
    y = x;

  // Create the floor
  const floorGeometry = new THREE.PlaneGeometry(x, y);
  const floorMaterial = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  // Create the walls
  const wallMaterial = new THREE.MeshBasicMaterial({
    color: 0xdddddd,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
  });
  const wallHeight = 12;

  const wall1Geometry = new THREE.PlaneGeometry(31.62, wallHeight);
  const wall1 = new THREE.Mesh(wall1Geometry, wallMaterial);
  wall1.position.z = -15.81;
  wall1.position.y = wallHeight / 2;
  scene.add(wall1);

  const wall2 = wall1.clone();
  wall2.rotation.y = Math.PI / 2;
  wall2.position.x = -15.81;
  wall2.position.z = 0;
  scene.add(wall2);

  const wall3 = wall1.clone();
  wall3.position.z = 15.81;
  scene.add(wall3);

  const wall4 = wall2.clone();
  wall4.position.x = 15.81;
  wall4.position.z = 0;
  scene.add(wall4);
}

// Set the default camera position
camera.position.set(38.8156756073594, 23.36994928434071, 21.146838950339102);
camera.lookAt(0, 0, 0);

// Add OrbitControls for zooming in and out and panning
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = true;
controls.minDistance = 20;
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;

// Event listener to log camera coordinates when view is dragged for debugging purpose
/*controls.addEventListener("change", () => {
  console.log(
    "Camera Position:",
    camera.position.x,
    camera.position.y,
    camera.position.z
  );
});*/

// Render loop
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  renderer.render(scene, camera);
}
animate();

// Function to check if a new object intersects with any existing objects
function isIntersecting(newObject, existingObjects) {
  const newBox = new THREE.Box3().setFromObject(newObject);
  for (let i = 0; i < existingObjects.length; i++) {
    const existingBox = existingObjects[i];
    if (newBox.intersectsBox(existingBox)) {
      return true;
    }
  }
  return false;
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});