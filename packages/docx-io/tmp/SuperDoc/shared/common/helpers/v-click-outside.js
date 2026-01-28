export default {
  mounted(el, binding) {
    const clickOutsideHandler = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };

    document.addEventListener('click', clickOutsideHandler);

    el.__clickOutsideHandler = clickOutsideHandler;
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutsideHandler);
    delete el.__clickOutsideHandler;
  },
};
