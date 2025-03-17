document.addEventListener("DOMContentLoaded", function () {
    var scorm = pipwerks.SCORM;
    scorm.version = "1.2";

    var success = scorm.init();
    if (!success) {
        console.error("SCORM initialization failed. Exiting script.");
        return;
    }

    console.log("SCORM initialized successfully.");

    var savedData = scorm.get("cmi.suspend_data");
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

    function setCourseComplete() {
        console.log("Complete Course button clicked.");
        var currentStatus = scorm.get("cmi.core.lesson_status");
        if (currentStatus === "completed") {
            console.log("Course already marked as completed.");
            return;
        }

        scorm.set("cmi.core.lesson_status", "completed");
        scorm.set("cmi.core.score.raw", 100);
        var saveSuccess = scorm.save();
        if (saveSuccess) {
            console.log("Completion status saved successfully.");
            scorm.quit();
        } else {
            console.error("Failed to save completion status.");
        }
    }

    var completeButton = document.getElementById("completeCourseBtn");
    if (completeButton) {
        completeButton.addEventListener("click", setCourseComplete);
    } else {
        console.error("Complete Course button not found.");
    }

    function checkPassOnView() {
        let elements = document.querySelectorAll("[sr-component='PassOnView_V1']");
        elements.forEach(element => {
            let rect = element.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                console.log("PassOnView_V1 component seen. Marking module as completed.");
                var currentStatus = scorm.get("cmi.core.lesson_status");
                if (currentStatus !== "completed") {
                    scorm.set("cmi.core.lesson_status", "completed");
                    scorm.set("cmi.core.score.raw", 100);
                    var saveSuccess = scorm.save();
                    if (saveSuccess) {
                        console.log("SCORM progress saved: 100% completed.");
                    }
                }
                element.removeEventListener("scroll", checkPassOnView);
            }
        });
    }

    window.addEventListener("scroll", checkPassOnView);

    window.addEventListener("beforeunload", function () {
        console.log("Unloading SCORM session.");
        scorm.quit();
    });
});
