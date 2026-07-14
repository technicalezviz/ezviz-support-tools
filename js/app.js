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

let calculatorCameraList = [];
let productList = [];


// =============================
// ĐỌC DỮ LIỆU CAMERA.JSON
// =============================

async function loadCalculatorCameras() {
    try {
        const response = await fetch(
            "./data/calculator.json"
        );

        if (!response.ok) {
            throw new Error(
                "Không thể đọc calculator.json"
            );
        }

        calculatorCameraList = await response.json();

        cameraModel.innerHTML = "";

        calculatorCameraList.forEach((camera) => {
            const option =
                document.createElement("option");

            option.value = camera.id;
            option.textContent = camera.model;

            cameraModel.appendChild(option);
        });

        updateCameraInfo();

    } catch (error) {
        console.error(
            "Lỗi tải dữ liệu tính Data:",
            error
        );

        cameraModel.innerHTML = `
            <option>
                Không tải được danh sách Camera 4G
            </option>
        `;
    }
}
async function loadProducts() {
    try {
        const response = await fetch("./data/products.json");

        if (!response.ok) {
            throw new Error(
                `Không thể đọc products.json: ${response.status}`
            );
        }

        productList = await response.json();

        console.log(
            "Danh sách sản phẩm đã tải:",
            productList
        );

    } catch (error) {
        console.error(
            "Lỗi tải products.json:",
            error
        );

        productList = [];
    }
}

// =============================
// HIỂN THỊ THÔNG TIN CAMERA
// =============================

function getSelectedCamera() {
    return calculatorCameraList.find(
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

async function initializeApp() {
    updateModeArea();

    await Promise.all([
        loadCalculatorCameras(),
        loadProducts()
    ]);
}

initializeApp();
// =============================
// TRA CỨU CAMERA
// =============================

const cameraSearchInput =
    document.getElementById("cameraSearchInput");

const cameraSearchSuggestions =
    document.getElementById("cameraSearchSuggestions");

const cameraLookupEmpty =
    document.getElementById("cameraLookupEmpty");

const cameraLookupResult =
    document.getElementById("cameraLookupResult");

const lookupCameraImage =
    document.getElementById("lookupCameraImage");

const lookupCameraName =
    document.getElementById("lookupCameraName");

const lookupCameraDescription =
    document.getElementById("lookupCameraDescription");

const lookupResolution =
    document.getElementById("lookupResolution");

const lookupCodec =
    document.getElementById("lookupCodec");

const lookupBitrate =
    document.getElementById("lookupBitrate");

const lookupBattery =
    document.getElementById("lookupBattery");

const lookupNetwork =
    document.getElementById("lookupNetwork");

const lookupInstallation =
    document.getElementById("lookupInstallation");

const lookupAI =
    document.getElementById("lookupAI");

const lookupPdfButton =
    document.getElementById("lookupPdfButton");


function normalizeSearchText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


function findCamerasForLookup(keyword) {
    const searchValue = normalizeSearchText(keyword);

    if (!searchValue || productList.length === 0) {
        return [];
    }

    return productList.filter((product) => {
        const searchableText = [
            product.model,
            product.category,
            product.networkType,
            product.description,
            ...(product.keywords || [])
        ]
        .map(normalizeSearchText)
        .join(" ");

        return searchableText.includes(searchValue);
    });
}


function renderCameraSuggestions(cameras) {
    cameraSearchSuggestions.innerHTML = "";

    if (cameras.length === 0) {
        cameraSearchSuggestions.classList.remove("active");
        return;
    }

    cameras.slice(0, 8).forEach((camera) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "search-suggestion-item";

        button.innerHTML = `
            <img
                src="${camera.image}"
                alt="${camera.model}"
            >

            <span>
                <strong>${camera.model}</strong>
                <small>
                    ${camera.resolution} ·
                    ${camera.description}
                </small>
            </span>
        `;

        button.addEventListener("click", () => {
            cameraSearchInput.value = camera.model;
            cameraSearchSuggestions.classList.remove("active");
            showCameraLookupResult(camera);
        });

        cameraSearchSuggestions.appendChild(button);
    });

    cameraSearchSuggestions.classList.add("active");
}


function showCameraLookupResult(camera) {
    cameraLookupEmpty.hidden = true;
    cameraLookupResult.hidden = false;

    lookupCameraImage.src =
        `${camera.image}?v=${Date.now()}`;

    lookupCameraImage.alt = camera.model;

    lookupCameraName.textContent = camera.model;

    lookupCameraDescription.textContent =
        camera.description || "Camera EZVIZ";

    lookupResolution.textContent =
        camera.resolution || "--";

    lookupCodec.textContent =
        camera.codec || "--";

    lookupBitrate.textContent =
        camera.bitrate
            ? `${camera.bitrate} Mbps`
            : "--";

    lookupBattery.textContent =
        camera.battery || "--";

    lookupNetwork.textContent =
        camera.network || "--";

    lookupInstallation.textContent =
        camera.installation || "--";

    lookupAI.textContent =
        camera.ai || "Không có thông tin";

    if (camera.pdf) {
        lookupPdfButton.href = camera.pdf;
        lookupPdfButton.style.display = "inline-flex";
    } else {
        lookupPdfButton.removeAttribute("href");
        lookupPdfButton.style.display = "none";
    }
}


if (cameraSearchInput) {
    cameraSearchInput.addEventListener("input", () => {
        const results =
            findCamerasForLookup(cameraSearchInput.value);

        renderCameraSuggestions(results);
    });

    cameraSearchInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
            return;
        }

        const results =
            findCamerasForLookup(cameraSearchInput.value);

        if (results.length > 0) {
            showCameraLookupResult(results[0]);
            cameraSearchSuggestions.classList.remove("active");
        }
    });
}