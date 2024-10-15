// Scene, Camera, Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// Player variables
let player = {
  velocity: new THREE.Vector3(),
  speed: 0.1,
  turnSpeed: Math.PI * 0.01,
  pitchSpeed: Math.PI * 0.01, // Speed for up and down movement
  maxPitch: Math.PI / 3, // Maximum upward angle (60 degrees)
  minPitch: -Math.PI / 3 // Maximum downward angle (-60 degrees)
};

// Game variables
let score = 0;
let chances = 3;
let gameOver = false;

const scoreElement = document.getElementById('score');
const chancesElement = document.getElementById('chances');
const gameOverElement = document.getElementById('game-over');

// Setup floor and walls
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
scene.add(floor);

const wallGeometry = new THREE.BoxGeometry(10, 5, 0.5);
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
wall1.position.set(0, 2.5, -5);
scene.add(wall1);

// Adding a gun model for player
const gunGeometry = new THREE.BoxGeometry(0.5, 0.2, 1);
const gunMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const gun = new THREE.Mesh(gunGeometry, gunMaterial);
gun.position.set(0, -0.3, -0.5);
camera.add(gun);
scene.add(camera);

// Targets array
let targets = [];

// Function to create a target
function createTarget(x, y, z) {
  const targetGeometry = new THREE.BoxGeometry(1, 1, 1);
  const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const target = new THREE.Mesh(targetGeometry, targetMaterial);
  target.position.set(x, y, z);
  targets.push(target);
  scene.add(target);
}

// Adding multiple targets
createTarget(5, 1.5, -10);
createTarget(-5, 1.5, -10);
createTarget(0, 1.5, -15);

// Controls
let keys = {};
document.addEventListener('keydown', (event) => keys[event.key] = true);
document.addEventListener('keyup', (event) => keys[event.key] = false);

// Shooting mechanism (updated to include vertical aiming)
document.addEventListener('click', () => {
  if (gameOver || chances <= 0) return; // Stop if game is over or no chances left

  // Decrease chances on every shot
  chances--;
  chancesElement.innerText = chances;

  let bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  
  // Set the bullet's initial position to the camera's position
  bullet.position.set(camera.position.x, camera.position.y - 0.3, camera.position.z);
  
  // Calculate the direction based on the camera's current rotation (both x and y axes)
  const direction = new THREE.Vector3(
    -Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x),  // Adjust horizontal and vertical direction
    Math.sin(camera.rotation.x),  // Vertical aiming (pitch)
    -Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x)   // Adjust forward/backward direction
  );
  
  // Set the bullet's velocity by multiplying the direction by a scalar (speed)
  bullet.velocity = direction.multiplyScalar(0.5);
  
  bullets.push(bullet);
  scene.add(bullet);

  // Check if game over after shooting
  if (chances <= 0) {
    gameOver = true;
    gameOverElement.style.display = 'block'; // Show Game Over message
  }
});

// Handle player movement
function movePlayer() {
  if (keys['w']) camera.translateZ(-player.speed);
  if (keys['s']) camera.translateZ(player.speed);
  if (keys['a']) camera.translateX(-player.speed);
  if (keys['d']) camera.translateX(player.speed);
  if (keys['ArrowLeft']) camera.rotation.y += player.turnSpeed;
  if (keys['ArrowRight']) camera.rotation.y -= player.turnSpeed;

  // Look up (pitch up)
  if (keys['ArrowUp']) {
    if (camera.rotation.x > player.minPitch) {
      camera.rotation.x -= player.pitchSpeed;
    }
  }
  
  // Look down (pitch down)
  if (keys['ArrowDown']) {
    if (camera.rotation.x < player.maxPitch) {
      camera.rotation.x += player.pitchSpeed;
    }
  }
}

// Handle bullet movement and target collision
let bullets = [];
function moveBullets() {
  bullets.forEach((bullet, bulletIndex) => {
    bullet.position.add(bullet.velocity);

    // Check for bullet collisions with targets
    targets.forEach((target, targetIndex) => {
      if (bullet.position.distanceTo(target.position) < 1) {
        console.log("Target hit!");
        scene.remove(target); // Remove the target if hit
        targets.splice(targetIndex, 1); // Remove from array

        // Increase score
        score += 10;
        scoreElement.innerText = score;
      }
    });

    // Remove bullets that go out of bounds
    if (bullet.position.z < -50 || bullet.position.z > 50) {
      scene.remove(bullet);
      bullets.splice(bulletIndex, 1);
    }
  });
}

// Game loop
function animate() {
  if (!gameOver) {
    requestAnimationFrame(animate);
    movePlayer();
    moveBullets();
    renderer.render(scene, camera);
  }
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
