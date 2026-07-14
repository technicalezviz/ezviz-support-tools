// =============================
// KHAI BÁO PHẦN TỬ GIAO DIỆN
// =============================

const cameraModel = document.getElementById("cameraModel");
const resolution = document.getElementById("resolution");
const codec = document.getElementById("codec");
const bitrateInfo = document.getElementById("bitrateInfo");
const cameraImage = document.getElementById("cameraImage");
const cameraImageFallback = document.getElementById(
    "cameraImageFallback"
);

const cameraName = document.getElementById("cameraName");
const cameraDescription = document.getElementById(
    "cameraDescription"
);

const cameraBattery = document.getElementById("cameraBattery");
const cameraNetwork = document.getElementById("cameraNetwork");
const cameraAI = document.getElementById("cameraAI");
const cameraInstallation = document.getElementById(
    "cameraInstallation"
);
const cameraCount = document.getElementById("cameraCount");

const modeArea = document.getElementById("modeArea");
const calculateBtn = document.getElementById("calculateBtn");

const safetyMargin = document.getElementById("safetyMargin");
const showHourly = document.getElementById("showHourly");

const hourResult = document.getElementById("hourResult");
const dayResult = document.getElementById("dayResult");
const monthResult = document.getElementById("monthResult");
const simResult = document.getElementById("simResult");

let cameraList = [];


// =============================
// ĐỌC DỮ LIỆU CAMERA.JSON
// =============================

async function loadCameras() {
    try {
        const response = await fetch("./data/camera.json");

        if (!response.ok) {
            throw new Error("Không thể đọc camera.json");
        }

        cameraList = await response.json();

        cameraModel.innerHTML = "";

        cameraList.forEach((camera) => {
            const option = document.createElement("option");

            option.value = camera.id;
            option.textContent = camera.model;

            cameraModel.appendChild(option);
        });

        updateCameraInfo();

    } catch (error) {
        console.error(error);

        cameraModel.innerHTML = `
            <option>Không tải được dữ liệu Camera</option>
        `;

        resolution.textContent = "--";
        codec.textContent = "--";
        bitrateInfo.textContent = "--";
    }
}


// =============================
// HIỂN THỊ THÔNG TIN CAMERA
// =============================

function getSelectedCamera() {
    return cameraList.find(
        camera => camera.id === cameraModel.value
    );
}


function updateCameraInfo() {
    const camera = getSelectedCamera();

    if (!camera) {
        return;
    }

    resolution.textContent = camera.resolution;
    codec.textContent = camera.codec;
    bitrateInfo.textContent = `${camera.bitrate} Mbps`;

    cameraName.textContent = camera.model;
    cameraDescription.textContent =
        camera.description || "Camera EZVIZ kết nối mạng 4G.";

    cameraBattery.textContent =
        camera.battery || "Không có thông tin";

    cameraNetwork.textContent =
        camera.network || "4G LTE";
cameraImage.src = imagePath;
    cameraAI.textContent =
        camera.ai || "Không có thông tin";

    cameraInstallation.textContent =
        camera.installation || "Không có thông tin";

    showCameraImage(camera.image);
}
function showCameraImage(imagePath) {
    cameraImage.style.display = "none";
    cameraImageFallback.style.display = "flex";

    if (!imagePath) {
        return;
    }

    cameraImage.onload = function () {
        cameraImage.style.display = "block";
        cameraImageFallback.style.display = "none";
    };

    cameraImage.onerror = function () {
        cameraImage.style.display = "none";
        cameraImageFallback.style.display = "flex";
    };
    cameraImage.alt = getSelectedCamera()?.model || "Camera EZVIZ";
    cameraImage.src = `${imagePath}?v=${Date.now()}`;
}


// =============================
// THAY ĐỔI Ô NHẬP THEO CHẾ ĐỘ
// =============================

function getSelectedMode() {
    const selectedMode = document.querySelector(
        'input[name="mode"]:checked'
    );

    return selectedMode ? selectedMode.value : "live";
}


function updateModeArea() {
    const mode = getSelectedMode();

    if (mode === "live") {
        modeArea.innerHTML = `
            <label for="minutesPerDay">
                Số phút xem trực tiếp mỗi ngày
            </label>

            <input
                type="number"
                id="minutesPerDay"
                value="30"
                min="0"
                max="1440"
            >
        `;
    }

    if (mode === "ai") {
        modeArea.innerHTML = `
            <label for="detectCount">
                Số lần phát hiện mỗi ngày
            </label>

            <input
                type="number"
                id="detectCount"
                value="50"
                min="0"
            >

            <label for="recordSeconds">
                Số giây ghi hình mỗi lần
            </label>

            <input
                type="number"
                id="recordSeconds"
                value="20"
                min="0"
            >
        `;
    }

    if (mode === "continuous") {
        modeArea.innerHTML = `
            <label for="recordHours">
                Số giờ ghi hình mỗi ngày
            </label>

            <input
                type="number"
                id="recordHours"
                value="24"
                min="0"
                max="24"
                step="0.5"
            >
        `;
    }

    if (mode === "custom") {
        modeArea.innerHTML = `
            <label for="customBitrate">
                Bitrate tùy chỉnh (Mbps)
            </label>

            <input
                type="number"
                id="customBitrate"
                value="1"
                min="0.1"
                step="0.1"
            >

            <label for="customHours">
                Số giờ sử dụng mỗi ngày
            </label>

            <input
                type="number"
                id="customHours"
                value="8"
                min="0"
                max="24"
                step="0.5"
            >
        `;
    }
}


// =============================
// HÀM LẤY GIÁ TRỊ SỐ
// =============================

function getNumber(id, defaultValue = 0) {
    const element = document.getElementById(id);

    if (!element) {
        return defaultValue;
    }

    const value = Number(element.value);

    if (!Number.isFinite(value) || value < 0) {
        return defaultValue;
    }

    return value;
}


// =============================
// ĐỀ XUẤT GÓI SIM
// =============================

function suggestSim(monthlyGB) {
    const packages = [
        5,
        10,
        20,
        30,
        50,
        100,
        150,
        200,
        300,
        500
    ];

    const suitablePackage = packages.find(
        packageSize => packageSize >= monthlyGB
    );

    if (suitablePackage) {
        return `${suitablePackage} GB/tháng`;
    }

    return "Gói doanh nghiệp hoặc không giới hạn";
}


// =============================
// ĐỊNH DẠNG SỐ
// =============================

function formatNumber(number) {
    return number.toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}


// =============================
// TÍNH TOÁN
// =============================

function calculateData() {
    const camera = getSelectedCamera();

    if (!camera) {
        alert("Không tìm thấy thông tin Camera.");
        return;
    }

    const mode = getSelectedMode();

    const quantity = Math.max(
        1,
        getNumber("cameraCount", 1)
    );

    let bitrate = camera.bitrate;
    let activeSecondsPerDay = 0;

    if (mode === "live") {
        const minutes = getNumber("minutesPerDay", 0);
        activeSecondsPerDay = minutes * 60;
    }

    if (mode === "ai") {
        const detectionCount = getNumber("detectCount", 0);
        const secondsPerDetection = getNumber("recordSeconds", 0);

        activeSecondsPerDay =
            detectionCount * secondsPerDetection;
    }

    if (mode === "continuous") {
        const hours = Math.min(
            24,
            getNumber("recordHours", 24)
        );

        activeSecondsPerDay = hours * 3600;
    }

    if (mode === "custom") {
        bitrate = getNumber("customBitrate", 1);

        const hours = Math.min(
            24,
            getNumber("customHours", 0)
        );

        activeSecondsPerDay = hours * 3600;
    }

    /*
        Bitrate: Mbps

        MB = Mbps × số giây ÷ 8
    */

    let hourlyMB =
        bitrate * 3600 / 8 * quantity;

    let dailyMB =
        bitrate * activeSecondsPerDay / 8 * quantity;

    if (safetyMargin.checked) {
        hourlyMB *= 1.2;
        dailyMB *= 1.2;
    }

    const dailyGB = dailyMB / 1024;
    const monthlyGB = dailyGB * 30;

    hourResult.textContent =
        `${formatNumber(hourlyMB)} MB`;

    dayResult.textContent =
        `${formatNumber(dailyGB)} GB`;

    monthResult.textContent =
        `${formatNumber(monthlyGB)} GB`;

    simResult.textContent =
        suggestSim(monthlyGB);

    hourResult.parentElement.style.display =
        showHourly.checked ? "block" : "none";
}


// =============================
// SỰ KIỆN
// =============================

cameraModel.addEventListener(
    "change",
    updateCameraInfo
);


document.querySelectorAll(
    'input[name="mode"]'
).forEach((radio) => {
    radio.addEventListener(
        "change",
        updateModeArea
    );
});


calculateBtn.addEventListener(
    "click",
    calculateData
);


showHourly.addEventListener("change", () => {
    hourResult.parentElement.style.display =
        showHourly.checked ? "block" : "none";
});


// =============================
// KHỞI ĐỘNG WEBSITE
// =============================

updateModeArea();
loadCameras();
