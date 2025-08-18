gsap.set(".intro-card", {
      x: "-300",
      autoAlpha: "0",
    });
    gsap.set(".intro-card01", { 
      x: 0,
      autoAlpha: "1"
    });

    const tl = gsap.timeline({ defaults: { duration: 0.55, ease: "power3.out" } });
    tl.to(".intro-card_list > li:first-child .intro-card", { 
        x: 0,
        autoAlpha: "1" })
      .to(".intro-card_list > li:nth-child(n+2) .intro-card", {
        x: 0,
        autoAlpha: "1",
        stagger: 0.13
      }, 0.01)


      .to(".intro-card--bg02_item01", {
        y: 0,
        opacity: 1,
        duration: 1
      }, "-=0.3")
      .to(".intro-card--bg02_item02", {
        y: 0,
        opacity: 1,
        duration: 1
      }, "<")
      .to(".intro-card--bg03_item01", {
        y: 0,
        opacity: 1,
        duration: 1
      }, "<")
      .to(".intro-card--bg03_item02", {
        y: 0,
        opacity: 1,
        duration: 1
      }, "<")
      .to(".intro-card--bg03_item03", {
        x: 0,
        opacity: 1,
        duration: 1
      }, "<")
      .to(".intro-card--bg04_item01", {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration: 1
      }, "<")
      .to(".intro-card--bg04_item02", {
        x: 0,
        opacity: 1,
        duration: 1
      }, "<")