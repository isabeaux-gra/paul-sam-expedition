    const tooltip = document.getElementById("tooltip");
    const markers = document.querySelectorAll(".marker");
    let activeMarker = null;

    // Function to show tooltip
    function showTooltip(marker, event) {
      tooltip.innerHTML = `<strong>${marker.dataset.title}</strong><br>${marker.dataset.text}`
      tooltip.style.left = (event.pageX + 10) + "px";
      tooltip.style.top = (event.pageY + 10) + "px";
      tooltip.style.display = "block";
      marker.classList.add("active");
      activeMarker = marker;
    }

    // Function to hide tooltip
    function hideTooltip() {
      tooltip.style.display = "none";
      if (activeMarker) {
        activeMarker.classList.remove("active");
        activeMarker = null;
      }
    }

    markers.forEach(marker => {
      // Desktop: hover events
      marker.addEventListener("mouseenter", (e) => {
        if (window.innerWidth > 768) {
          showTooltip(marker, e);
        }
      });
      
      marker.addEventListener("mouseleave", () => {
        if (window.innerWidth > 768) {
          hideTooltip();
        }
      });

      // Mobile/Desktop: click events
      marker.addEventListener("click", (e) => {
        e.stopPropagation();
        if (activeMarker === marker) {
          hideTooltip();
        } else {
          hideTooltip();
          showTooltip(marker, e);
        }
      });
    });

    // Hide tooltip when clicking elsewhere
    document.addEventListener("click", () => {
      hideTooltip();
    });

    const milesEl = document.getElementById("miles");
    const daysEl = document.getElementById("days");
    const statesEl = document.getElementById("states");
    const noteEl = document.getElementById("note");

    // Define the values you want to show at different scroll positions
    const scrollChanges = [
      { y: 0, miles: 893, days: 17, states: 3, note: "2025" },      // at top
      { y: 600, miles: 2094, days: 32, states: 6, note: "all time" },   // after 500px scroll
      { y: 1150, miles: 1201, days: 15, states: 3, note: "2016" }   // after 1000px scroll
    ];

    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;

      // Find the last matching "checkpoint"
      let current = scrollChanges[0];
      for (let i = 0; i < scrollChanges.length; i++) {
        if (scrollY >= scrollChanges[i].y) {
          current = scrollChanges[i];
        }
      }

      // Update DOM
      milesEl.textContent = current.miles;
      daysEl.textContent = current.days;
      statesEl.textContent = current.states;
      noteEl.textContent = current.note;
    });