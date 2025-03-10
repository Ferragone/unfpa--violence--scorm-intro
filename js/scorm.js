document.addEventListener("DOMContentLoaded", function () {
    var scorm = pipwerks.SCORM;
    scorm.version = "1.2"; // Or "2004" if using SCORM 2004

    // Initialize SCORM
    var success = scorm.init();
    if (!success) {
        console.error("SCORM initialization failed.");
        return;
    }

    console.log("SCORM initialized successfully.");

    // Retrieve previous suspend data
    var savedData = scorm.get("cmi.suspend_data");
    console.log("Retrieved suspend data:", savedData);
    var lastSection = savedData ? JSON.parse(savedData).lastSection : "1";
    console.log("Restoring last section:", lastSection);
    navigateToSection(lastSection);

    function saveProgress(section) {
        var suspendData = JSON.stringify({ lastSection: section });
        scorm.set("cmi.suspend_data", suspendData);
        var saveSuccess = scorm.save();
        if (saveSuccess) {
            console.log("Suspend data saved successfully:", suspendData);
        } else {
            console.error("Failed to save suspend data.");
        }
    }

    function navigateToSection(section) {
        console.log("Navigating to section:", section);
        var sectionElement = document.querySelector(`[data-slide="${section}"]`);
        if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: "smooth" });
        }
    }

    document.querySelectorAll(".section").forEach(section => {
        section.addEventListener("mouseenter", function () {
            var currentSection = this.getAttribute("data-slide");
            saveProgress(currentSection);
        });
    });

    // Function to set the course completion status
    function setCourseComplete() {
        console.log("Complete Course button clicked.");
        scorm.set("cmi.core.lesson_status", "completed");
        scorm.set("cmi.core.score.raw", 100); // Set score to 100%
        var saveSuccess = scorm.save();
        if (saveSuccess) {
            console.log("Completion status saved successfully.");
            scorm.quit(); // Exit SCORM session after completion
        } else {
            console.error("Failed to save completion status.");
        }
    }

    // Add event listener for "Complete Course" button
    var completeButton = document.getElementById("completeCourseBtn");
    if (completeButton) {
        completeButton.addEventListener("click", setCourseComplete);
    } else {
        console.error("Complete Course button not found.");
    }

    // Function to set suspend data
    function setSuspendData() {
        console.log("Set Suspend Data button clicked.");
        var currentSection = document.querySelector(".section:focus, .section:hover");
        var sectionId = currentSection ? currentSection.getAttribute("data-slide") : lastSection;
        saveProgress(sectionId);
    }

    // Add event listener for "Set Suspend Data" button
    var suspendDataButton = document.getElementById("setSuspendDataBtn");
    if (suspendDataButton) {
        suspendDataButton.addEventListener("click", setSuspendData);
    } else {
        console.error("Set Suspend Data button not found.");
    }

    // Add event listener for "Set Suspend Return" button
    var suspendReturnButton = document.getElementById("setSuspendReturnBtn");
    if (suspendReturnButton) {
        suspendReturnButton.addEventListener("click", function () {
            console.log("Returning to previous slide.");
            var prevSection = (parseInt(lastSection) - 1).toString();
            saveProgress(prevSection);
            navigateToSection(prevSection);
        });
    } else {
        console.error("Set Suspend Return button not found.");
    }

    // Ensure SCORM session ends when the user navigates away
    window.addEventListener("beforeunload", function () {
        console.log("Unloading SCORM session.");
        scorm.quit(); // Use scorm.quit() to end the session
    });
});
