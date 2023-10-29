
 const nav = document.querySelector('.main-nav');
 // Function to be called when the action should be fired
 function triggerAction() {
    // console.log('Action triggered!');
    nav.classList.remove('bg-transparent');
    nav.classList.add('theme');
    // You can replace this with your desired action code
  }

  function removeAction(){
    console.log('action removed');
    nav.classList.add('bg-transparent');
    nav.classList.remove('theme');
  }

  // Add a scroll event listener
  window.addEventListener('scroll', () => {
    // Get the scroll position relative to the top of the hero section
    const scrollPosition = window.scrollY;

    // Define a threshold (e.g., 100 pixels) to trigger the action after scrolling past
    const threshold = 100;

    // Check if the scroll position is below the hero section by at least the threshold
    if (scrollPosition >= threshold) {
      triggerAction();
    }
    else{
        removeAction();
    }
  });