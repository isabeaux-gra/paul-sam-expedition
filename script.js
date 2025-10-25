    const tooltip = document.getElementById("tooltip");
    const hoverables = document.querySelectorAll(".marker, .hover-line");
    let activeMarker = null;

    // show tooltip
    function showTooltip(marker, event) {
      tooltip.innerHTML = `<strong>${marker.dataset.title}</strong><br>${marker.dataset.text}`
      tooltip.style.left = (event.pageX + 10) + "px";
      tooltip.style.top = (event.pageY + 10) + "px";
      tooltip.style.display = "block";
      marker.classList.add("active");
      activeMarker = marker;
    }

    // hide tooltip
    function hideTooltip() {
      tooltip.style.display = "none";
      if (activeMarker) {
        activeMarker.classList.remove("active");
        activeMarker = null;
      }
    }

    hoverables.forEach(el => {
      // Desktop: hover events
      el.addEventListener("mouseenter", (e) => {
        if (window.innerWidth > 768) {
          showTooltip(el, e);
        }
      });
      
      el.addEventListener("mouseleave", () => {
        if (window.innerWidth > 768) {
          hideTooltip();
        }
      });

      // Mobile/Desktop: click events
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (activeMarker === el) {
          hideTooltip();
        } else {
          hideTooltip();
          showTooltip(el, e);
        }
      });
      el.addEventListener("mousemove", (e) => {
        if (activeMarker === el) {
          const tooltipRect = tooltip.getBoundingClientRect();
          const padding = 10; // distance from cursor
          let left = e.pageX + padding;
          let top = e.pageY + padding;

          // horizontal flip if too close to right edge
          if (left + tooltipRect.width > window.innerWidth) {
            left = e.pageX - tooltipRect.width - padding;
          }

          // vertical flip if too close to bottom edge
          if (top + tooltipRect.height > window.innerHeight + window.scrollY) {
            top = e.pageY - tooltipRect.height - padding;
          }

          tooltip.style.left = left + "px";
          tooltip.style.top = top + "px";
        }
      });

    });

    

    // hide tooltip when click elsewhere
    document.addEventListener("click", () => {
      hideTooltip();
    });

    const milesEl = document.getElementById("miles");
    const daysEl = document.getElementById("days");
    const statesEl = document.getElementById("states");
    const noteEl = document.getElementById("note");


    const scrollChanges = [
      { y: 0, miles: 1906, days: 32, states: 9, note: "2025" },      // at top
      { y: 500, miles: 4106, days: 55, states: 13, note: "all time" },   // after 500px scroll
      { y: 1700, miles: 1211, days: 15, states: 3, note: "2016" }   // after 1000px scroll
    ];

    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;

      // find the last matching "checkpoint"
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