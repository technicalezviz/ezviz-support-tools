"use strict";

const storageSection =
    document.getElementById("storageCalculator");

if (storageSection) {
    const calculationModeInputs =
        document.querySelectorAll(
            'input[name="storageCalculationMode"]'
        );

    const storageTypeInputs =
        document.querySelectorAll(
            'input[name="storageType"]'
        );

    const recordingMode =
        document.getElementById("storageRecordingMode");

    const hoursPerDay =
        document.getElementById("storageHoursPerDay");

    const resolution =
        document.getElementById("storageResolution");

    const codec =
        document.getElementById("storageCodec");

    const fps =
        document.getElementById("storageFps");

    const cameraCount =
        document.getElementById("storageCameraCount");

    const autoBitrate =
        document.getElementById("autoStorageBitrate");

    const bitrate =
        document.getElementById("storageBitrate");

    const bitrateHint =
        document.getElementById("storageBitrateHint");

    const requiredFields =
        document.getElementById("storageRequiredFields");

    const existingFields =
        document.getElementById("storageExistingFields");

    const retentionDays =
        document.getElementById("storageRetentionDays");

    const existingCapacity =
        document.getElementById("storageExistingCapacity");

    const existingUnit =
        document.getElementById("storageExistingUnit");

    const safetyMargin =
        document.getElementById("storageSafetyMargin");

    const calculateButton =
        document.getElementById("calculateStorageBtn");

    const dailyResult =
        document.getElementById("storageDailyResult");

    const requiredResultItem =
        document.getElementById(
            "storageRequiredResultItem"
        );

    const requiredResult =
        document.getElementById(
            "storageRequiredResult"
        );

    const daysResultItem =
        document.getElementById("storageDaysResultItem");

    const daysResult =
        document.getElementById("storageDaysResult");

    const recommendation =
        document.getElementById(
            "storageRecommendation"
        );

    const recommendationNote =
        document.getElementById(
            "storageRecommendationNote"
        );


    const bitratePresets = {
        h264: {
            "1080p": 2048,
            "2k": 4096,
            "3k": 6144,
            "4k": 8192
        },

        h265: {
            "1080p": 1024,
            "2k": 2048,
            "3k": 3072,
            "4k": 4096
        }
    };


    const microSDOptionsGB = [
        32,
        64,
        128,
        256,
        512,
        1024
    ];


    const hddOptionsTB = [
        1,
        2,
        4,
        6,
        8,
        10,
        12,
        16,
        18,
        20,
        22,
        24
    ];


    function getCheckedValue(name) {
        const checked =
            document.querySelector(
                `input[name="${name}"]:checked`
            );

        return checked ? checked.value : "";
    }


    function formatNumber(value, maximumDigits = 2) {
        return new Intl.NumberFormat("vi-VN", {
            maximumFractionDigits: maximumDigits
        }).format(value);
    }


    function updateSuggestedBitrate() {
        if (!autoBitrate.checked) {
            bitrate.disabled = false;

            bitrateHint.textContent =
                "Nhập bitrate thực tế của Camera.";
            return;
        }

        const selectedCodec = codec.value;
        const selectedResolution = resolution.value;

        let suggested =
            bitratePresets[selectedCodec]?.[
                selectedResolution
            ] || 2048;

        const selectedFps = Number(fps.value);

        if (selectedFps >= 30) {
            suggested *= 1.2;
        } else if (selectedFps <= 15) {
            suggested *= 0.8;
        }

        suggested = Math.round(suggested);

        bitrate.value = suggested;
        bitrate.disabled = true;

        bitrateHint.textContent =
            `Bitrate gợi ý: ${suggested} Kbps. ` +
            "Tắt tùy chọn tự động để nhập thủ công.";
    }


    function updateRecordingMode() {
        if (recordingMode.value === "continuous") {
            hoursPerDay.value = 24;
            hoursPerDay.disabled = true;
        } else {
            hoursPerDay.disabled = false;

            if (Number(hoursPerDay.value) >= 24) {
                hoursPerDay.value = 4;
            }
        }
    }


    function updateCalculationMode() {
        const selectedMode =
            getCheckedValue("storageCalculationMode");

        const isRequired = selectedMode === "required";

        requiredFields.hidden = !isRequired;
        existingFields.hidden = isRequired;

        requiredResultItem.hidden = !isRequired;
        daysResultItem.hidden = isRequired;

        recommendation.textContent = "--";

        recommendationNote.textContent =
            "Nhập thông số rồi bấm tính toán.";
    }


    function getDailyStorageGB() {
        const bitrateKbps = Number(bitrate.value);
        const quantity = Number(cameraCount.value);
        const recordingHours = Number(hoursPerDay.value);

        if (
            !Number.isFinite(bitrateKbps) ||
            bitrateKbps <= 0 ||
            !Number.isFinite(quantity) ||
            quantity <= 0 ||
            !Number.isFinite(recordingHours) ||
            recordingHours <= 0 ||
            recordingHours > 24
        ) {
            throw new Error(
                "Thông số bitrate, số camera hoặc thời gian ghi không hợp lệ."
            );
        }

        const totalBitsPerDay =
            bitrateKbps *
            1000 *
            3600 *
            recordingHours *
            quantity;

        return totalBitsPerDay / 8 / 1024 / 1024 / 1024;
    }


    function recommendStorage(requiredGB, storageType) {
        if (storageType === "microsd") {
            const selectedCapacity =
                microSDOptionsGB.find(
                    capacity => capacity >= requiredGB
                );

            if (selectedCapacity) {
                return {
                    title:
                        selectedCapacity === 1024
                            ? "microSD 1 TB"
                            : `microSD ${selectedCapacity} GB`,

                    note:
                        "Kiểm tra dung lượng microSD tối đa mà Camera hỗ trợ."
                };
            }

            return {
                title: "Nên sử dụng HDD / Đầu ghi",

                note:
                    "Dung lượng yêu cầu vượt quá mức microSD thông dụng 1 TB."
            };
        }

        const requiredTB = requiredGB / 1024;

        const selectedCapacity =
            hddOptionsTB.find(
                capacity => capacity >= requiredTB
            );

        if (selectedCapacity) {
            return {
                title: `HDD ${selectedCapacity} TB`,

                note:
                    "Dung lượng đề xuất đã làm tròn lên mức HDD tiêu chuẩn."
            };
        }

        const diskCount =
            Math.ceil(requiredTB / 24);

        return {
            title: `${diskCount} HDD × 24 TB`,

            note:
                `Tổng dung lượng yêu cầu khoảng ` +
                `${formatNumber(requiredTB)} TB.`
        };
    }


    function calculateStorage() {
        try {
            const dailyGB = getDailyStorageGB();

            dailyResult.textContent =
                `${formatNumber(dailyGB)} GB`;

            const calculationMode =
                getCheckedValue(
                    "storageCalculationMode"
                );

            const storageType =
                getCheckedValue("storageType");

            if (calculationMode === "required") {
                const days = Number(retentionDays.value);

                if (
                    !Number.isFinite(days) ||
                    days <= 0
                ) {
                    throw new Error(
                        "Số ngày lưu phải lớn hơn 0."
                    );
                }

                let requiredGB = dailyGB * days;

                if (safetyMargin.checked) {
                    requiredGB *= 1.2;
                }

                const requiredTB = requiredGB / 1024;

                requiredResult.textContent =
                    requiredGB >= 1024
                        ? `${formatNumber(requiredTB)} TB`
                        : `${formatNumber(requiredGB)} GB`;

                const suggested =
                    recommendStorage(
                        requiredGB,
                        storageType
                    );

                recommendation.textContent =
                    suggested.title;

                recommendationNote.textContent =
                    suggested.note;

            } else {
                let capacityGB =
                    Number(existingCapacity.value);

                if (
                    !Number.isFinite(capacityGB) ||
                    capacityGB <= 0
                ) {
                    throw new Error(
                        "Dung lượng đang có phải lớn hơn 0."
                    );
                }

                if (existingUnit.value === "tb") {
                    capacityGB *= 1024;
                }

                // Trừ khoảng 10% cho dung lượng thực tế,
                // hệ thống file và vùng dự phòng.
                const usableCapacityGB =
                    capacityGB * 0.9;

                const estimatedDays =
                    usableCapacityGB / dailyGB;

                daysResult.textContent =
                    `${formatNumber(estimatedDays, 1)} ngày`;

                recommendation.textContent =
                    `${formatNumber(estimatedDays, 1)} ngày`;

                recommendationNote.textContent =
                    "Ước tính dựa trên khoảng 90% dung lượng khả dụng.";
            }

        } catch (error) {
            console.error(
                "Lỗi tính lưu trữ:",
                error
            );

            recommendation.textContent =
                "Thông số chưa hợp lệ";

            recommendationNote.textContent =
                error.message;
        }
    }


    calculationModeInputs.forEach(input => {
        input.addEventListener(
            "change",
            updateCalculationMode
        );
    });


    storageTypeInputs.forEach(input => {
        input.addEventListener(
            "change",
            calculateStorage
        );
    });


    recordingMode.addEventListener(
        "change",
        updateRecordingMode
    );


    resolution.addEventListener(
        "change",
        updateSuggestedBitrate
    );


    codec.addEventListener(
        "change",
        updateSuggestedBitrate
    );


    fps.addEventListener(
        "change",
        updateSuggestedBitrate
    );


    autoBitrate.addEventListener(
        "change",
        updateSuggestedBitrate
    );


    calculateButton.addEventListener(
        "click",
        calculateStorage
    );


    updateCalculationMode();
    updateRecordingMode();
    updateSuggestedBitrate();
}