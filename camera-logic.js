const video = document.getElementById('video');
const captureButton = document.getElementById('captureButton');
const capturedPhotoContainer = document.getElementById('capturedPhotoContainer');
const downloadButton = document.getElementById('downloadButton');
const retakePicturesButton = document.getElementById('retakePicturesButton');

const photosArray = [];
let photoCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
    captureButton.addEventListener('click', takePhoto)
    downloadButton.addEventListener('click', downloadPhotos);
    openCamera();
})


async function openCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error("Camera error:", err);
        alert("Could not access camera. Make sure you allow permissions.");
    }

    retakePicturesButton.addEventListener('click', () => {
        window.location.reload(true);
    })
}


async function takePhoto () {
if (photoCount >= 4) {
    captureButton.disabled = true;
    return;
  }

  captureButton.disabled = true; 

  const countdownElement = document.createElement('div');
  countdownElement.style.position = 'absolute';
  countdownElement.style.top = '50%';
  countdownElement.style.left = '50%';
  countdownElement.style.transform = 'translate(-50%, -50%)';
  countdownElement.style.fontSize = '80px';
  countdownElement.style.fontWeight = 'bold';
  countdownElement.style.color = 'white';
  countdownElement.style.textShadow = '0 0 15px black';
  countdownElement.style.zIndex = '999';
  document.body.appendChild(countdownElement);

  const takeSinglePhoto = async () => {
    if (photoCount >= 4) {
      captureButton.disabled = true;
      countdownElement.remove();
      return;
    }

    for (let i = 3; i > 0; i--) {
      countdownElement.textContent = i;
      await new Promise((r) => setTimeout(r, 1000));
    }

    countdownElement.textContent = ""; 

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL('image/png');

    photosArray.push(photoData);
    photoCount++;

    console.log(`Photo ${photoCount} captured!`, photosArray);

    const img = document.createElement('img');
    img.src = photoData;
    img.style.width = '150px';
    img.style.margin = '5px';
    capturedPhotoContainer.appendChild(img);
  };


  for (let i = photoCount; i < 4; i++) {
    await takeSinglePhoto();
    await new Promise((r) => setTimeout(r, 1000)); // short pause between photos
  }

  countdownElement.remove();
  captureButton.disabled = true;
}


async function downloadPhotos() {
 if (photosArray.length === 0) {
        alert("No photos to download!");
        return;
    }

    const singleWidth = 300;   
    const singleHeight = 225;  
    const border = 10;         
    const textHeight = 40;    


    const canvas = document.createElement('canvas');
    canvas.width = singleWidth * 2 + border * 3;
    canvas.height = singleHeight * 2 + border * 3 + textHeight;

    const ctx = canvas.getContext('2d');


    ctx.fillStyle = "#aadef2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    for (let i = 0; i < photosArray.length; i++) {
        const img = new Image();
        img.src = photosArray[i];

        await new Promise((resolve) => {
            img.onload = () => {
                const col = i % 2;
                const row = Math.floor(i / 2);

                const x = border + col * (singleWidth + border);
                const y = border + row * (singleHeight + border);

                ctx.drawImage(img, x, y, singleWidth, singleHeight);
                resolve();
            };
        });
    }

 
    ctx.fillStyle = "#000000"; 
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        "Navi Pixels", 
        canvas.width / 2, 
        canvas.height - textHeight / 2
    );


    const finalImage = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = 'photobooth.png';
    link.click();
}