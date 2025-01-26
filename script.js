const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const pixelSizeInput = document.getElementById('pixelSize');
const pixelSizeValue = document.getElementById('pixelSizeValue');
const sliderControls = document.getElementById('sliderControls');
let originalImage = null;
let debounceTimer;

console.log('Script loaded');
console.log('Elements found:', {
    canvas: !!canvas,
    imageInput: !!imageInput,
    pixelSizeInput: !!pixelSizeInput,
    pixelSizeValue: !!pixelSizeValue,
    sliderControls: !!sliderControls
});

imageInput.addEventListener('change', function(e) {
    console.log('File input change event triggered');
    const file = e.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    console.log('File selected:', file.name, file.type);
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        originalImage = new Image();
        originalImage.onload = function() {
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
            canvas.style.display = 'block'; // Show canvas
            sliderControls.style.display = 'block'; // Show slider controls
            pixelateImage(parseInt(pixelSizeInput.value));
        };
        originalImage.onerror = function() {
            console.error('Error loading image');
            alert('Error loading image. Please try another file.');
        };
        originalImage.src = event.target.result;
    };
    
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
});

pixelSizeInput.addEventListener('input', function(e) {
    pixelSizeValue.textContent = e.target.value;
    if (originalImage) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            pixelateImage(parseInt(e.target.value));
        }, 10);
    }
});

pixelSizeInput.addEventListener('change', function(e) {
    pixelSizeValue.textContent = e.target.value;
    if (originalImage) {
        pixelateImage(parseInt(e.target.value));
    }
});

function pixelateImage(pixelSize) {
    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set canvas dimensions
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Draw the original image to the temporary canvas
    tempCtx.drawImage(originalImage, 0, 0);
    
    // Get all pixel data at once
    const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pixelated version
    for (let y = 0; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
            // Get the color from the center of each pixel block
            const centerX = Math.min(x + Math.floor(pixelSize/2), canvas.width - 1);
            const centerY = Math.min(y + Math.floor(pixelSize/2), canvas.height - 1);
            const pos = (centerY * canvas.width + centerX) * 4;
            
            // Get RGB values
            const r = data[pos];
            const g = data[pos + 1];
            const b = data[pos + 2];
            
            // Draw the rectangle
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, y, 
                Math.min(pixelSize, canvas.width - x), 
                Math.min(pixelSize, canvas.height - y));
        }
    }
    
    // Clean up
    tempCanvas.remove();
} 